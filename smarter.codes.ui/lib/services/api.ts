import { API_CONFIG } from '@/lib/config/api';
import { Cache } from '@/lib/utils/cache';
import type { ApiResponse, ScrapeRequest, ScrapeResponse } from '@/lib/types/api';

class ApiService {
  private cache: Cache<ScrapeResponse>;
  private controller: AbortController;

  constructor() {
    this.cache = new Cache<ScrapeResponse>(
      API_CONFIG.cache.ttl,
      API_CONFIG.cache.maxSize
    );
    this.controller = new AbortController();
  }

  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        signal: this.controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      if (retryCount < API_CONFIG.retryAttempts) {
        await new Promise(resolve => 
          setTimeout(resolve, API_CONFIG.retryDelay * (retryCount + 1))
        );
        return this.fetchWithRetry<T>(url, options, retryCount + 1);
      }

      return {
        error: {
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          status: 500,
        },
      };
    }
  }

  private getCacheKey(request: ScrapeRequest, isMock: boolean): string {
    return `${isMock ? 'mock' : 'live'}-${request.url}-${request.query || ''}`;
  }

  async scrapeWebsite(
    request: ScrapeRequest,
    isMock = false
  ): Promise<ApiResponse<ScrapeResponse>> {
    const cacheKey = this.getCacheKey(request, isMock);
    const cachedData = this.cache.get(cacheKey);
    
    if (cachedData) {
      console.log('Cache hit:', cacheKey);
      return { data: cachedData };
    }

    const endpoint = isMock ? API_CONFIG.endpoints.mockScrape : API_CONFIG.endpoints.scrape;
    
    const response = await this.fetchWithRetry<ScrapeResponse>(
      endpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    if (response.data) {
      this.cache.set(cacheKey, response.data);
    }

    return response;
  }

  cancelRequests(): void {
    this.controller.abort();
    this.controller = new AbortController();
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const apiService = new ApiService();