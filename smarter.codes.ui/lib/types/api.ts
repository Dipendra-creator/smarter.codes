export interface ScrapeRequest {
    url: string;
    query?: string;
  }
  
  export interface ContentChunk {
    id: number;
    content: string;
  }
  
  export interface ScrapeResponse {
    chunks: ContentChunk[];
  }
  
  export interface ApiError {
    error: string;
    status: number;
  }
  
  export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
  }