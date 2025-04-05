export const API_CONFIG = {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    endpoints: {
      scrape: '/api/scrape',
      mockScrape: '/api/mock/scrape',
    },
    cache: {
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 100, // maximum number of cached items
    },
  };