from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests, time
from bs4 import BeautifulSoup
from transformers import AutoTokenizer
from sentence_transformers import SentenceTransformer
from pymilvus import (
    connections, FieldSchema, CollectionSchema, DataType, Collection, utility
)
import uvicorn

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SearchRequest(BaseModel):
    url: str
    query: str


# Configuration variables
TOKENIZER_MODEL = "bert-base-uncased"  # For tokenizing text
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"  # For generating embeddings
MAX_TOKENS_PER_CHUNK = 500
EMBEDDING_DIM = 384  # Dimension for all-MiniLM-L6-v2
COLLECTION_NAME = "html_chunks"

# Initialize tokenizer and embedding model
tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_MODEL)
embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)


def extract_text_chunks_from_url(url: str):
    """
    Fetch HTML from URL and extract multiple text chunks from DOM elements.
    This function collects text from paragraphs, headings, and list items.
    """
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to fetch URL. Status code: {response.status_code}")
        html = response.text
        soup = BeautifulSoup(html, "html.parser")

        # Remove unwanted tags
        for script in soup(["script", "style"]):
            script.decompose()

        # Extract texts from multiple elements
        elements = soup.find_all(['p', 'h1', 'h2', 'h3', 'li'])
        chunks = []
        for element in elements:
            text = element.get_text(separator=" ", strip=True)
            if text:
                # Tokenize this text to check length
                tokens = tokenizer.encode(text, add_special_tokens=False)
                # If the element text is longer than MAX_TOKENS_PER_CHUNK, split it further
                if len(tokens) > MAX_TOKENS_PER_CHUNK:
                    subchunks = split_tokens_into_chunks(tokens)
                    chunks.extend(subchunks)
                else:
                    chunks.append(text)
        # Fallback: if no chunks found, return full text as one chunk
        if not chunks:
            full_text = soup.get_text(separator=" ", strip=True)
            chunks = split_tokens_into_chunks(tokenizer.encode(full_text, add_special_tokens=False))
        return chunks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def tokenize_text(text: str):
    """Tokenizes text using the specified tokenizer."""
    tokens = tokenizer.encode(text, add_special_tokens=False)
    return tokens


def split_tokens_into_chunks(tokens, max_tokens=MAX_TOKENS_PER_CHUNK):
    """Splits tokenized text into chunks of a maximum number of tokens."""
    chunks = []
    for i in range(0, len(tokens), max_tokens):
        chunk_tokens = tokens[i:i + max_tokens]
        chunk_text = tokenizer.decode(chunk_tokens, skip_special_tokens=True)
        chunks.append(chunk_text)
    return chunks


def setup_milvus_collection():
    """Connects to Milvus and returns existing or new collection"""
    retries = 3
    for attempt in range(retries):
        try:
            connections.connect(alias="default", host="localhost", port="19530", timeout=10)
            break
        except Exception as e:
            if attempt == retries - 1:
                raise HTTPException(
                    status_code=500,
                    detail=f"""Milvus connection failed after {retries} attempts. 
                    Verify: 1. Docker is running 2. Port 19530 is open 3. Run 'docker logs milvus'. Error: {str(e)}"""
                )
            continue

    if not utility.has_collection(COLLECTION_NAME):
        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM),
            FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=5000)
        ]
        schema = CollectionSchema(fields, description="HTML chunk embeddings")
        collection = Collection(name=COLLECTION_NAME, schema=schema)
        # After collection creation
        index_params = {
            "index_type": "IVF_FLAT",
            "metric_type": "IP",
            "params": {"nlist": 128}
        }
        collection.create_index("embedding", index_params)
        collection.load()
    else:
        collection = Collection(COLLECTION_NAME)
        if not collection.has_index():
            index_params = {
                "index_type": "IVF_FLAT",
                "metric_type": "IP",
                "params": {"nlist": 128}
            }
            collection.create_index("embedding", index_params)
        collection.load()

    return collection


@app.post("/search")
def search_backend(request: SearchRequest):
    # Step 1: Extract multiple text chunks from the URL
    chunks = extract_text_chunks_from_url(request.url)

    if not chunks:
        raise HTTPException(status_code=400, detail="No text chunks found at the provided URL.")

    # Step 2: Compute embeddings for each chunk
    chunk_embeddings = embedding_model.encode(chunks, show_progress_bar=False)

    # Step 3: Get the existing collection (or create it if it doesn't exist)
    collection = setup_milvus_collection()

    # Clear existing data from the collection to avoid duplicates
    collection.delete(expr="id >= 0")
    collection.flush()

    # Insert chunks with embeddings
    data = [chunk_embeddings.tolist(), chunks]
    collection.insert(data)
    collection.flush()

    # Step 4: Compute embedding for the search query
    query_embedding = embedding_model.encode([request.query])[0]

    # Step 5: Perform vector search in Milvus for the top 10 matches, returning the "text" field.
    search_params = {"metric_type": "IP", "params": {"nprobe": 10}}
    results = collection.search(
        data=[query_embedding.tolist()],
        anns_field="embedding",
        param=search_params,
        limit=10,
        expr=None,
        output_fields=["text"]
    )

    # Prepare and return search results
    top_matches = []
    for hits in results:
        for hit in hits:
            top_matches.append({
                "text": hit.entity.get("text"),
                "score": hit.distance  # Note: score meaning depends on the metric type used
            })

    return {"results": top_matches}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
