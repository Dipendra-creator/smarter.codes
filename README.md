# Website Content Scraper

A modern, responsive web application built with Next.js and FastAPI that allows users to extract and analyze content from any website. The application features a clean, intuitive interface and provides both card and table views for displaying the extracted content.

## Requirements

### Backend Requirements
- Python 3.11 or later
- Docker Desktop (for running Milvus)
- FastAPI
- Milvus vector database
- BeautifulSoup4 for HTML parsing
- Sentence Transformers for text embeddings

### Frontend Requirements
- Node.js LTS or later
- npm or yarn package manager
- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS

## Setup Instructions

### Backend Setup

1. **Install pip dependency**
   ```bash
   pip install fastapi uvicorn requests beautifulsoup4 pymilvus transformers sentence-transformers
   ```

2. **Setup and Run Mivlus**
   ```bash
   .\standalone.bat start
   ```

3. **Run Backend**
   ```bash
   python main.py
   ```

### Frontend Setup

1. **Navigate to the UI directory**
   ```bash
   cd smarter.codes.ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

## Project Structure

```
├── smarter.codes.backend/    # Backend FastAPI application
│   ├── main.py              # Main FastAPI application
│   └── standalone.bat       # Windows startup script
│
└── smarter.codes.ui/        # Frontend Next.js application
    ├── app/                 # Next.js app directory
    ├── components/          # React components
    ├── lib/                 # Utility functions and services
    └── public/              # Static assets
```

## Features

- Website content extraction
- Semantic search using Milvus
- Responsive design with dark/light mode
- Card and table view options
- Real-time content updates

## Development

### Backend Development
- The backend uses FastAPI for the REST API
- Milvus for vector storage and similarity search
- Sentence Transformers for text embeddings

### Frontend Development
- Built with Next.js and React
- Styled using Tailwind CSS
- Uses shadcn/ui components
- TypeScript for type safety


"# smarter.codes" 
