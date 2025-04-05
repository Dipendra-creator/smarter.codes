interface CacheItem<T> {
    data: T;
    timestamp: number;
  }
  
  export class Cache<T> {
    private cache: Map<string, CacheItem<T>>;
    private ttl: number;
    private maxSize: number;
  
    constructor(ttl: number, maxSize: number) {
      this.cache = new Map();
      this.ttl = ttl;
      this.maxSize = maxSize;
    }
  
    set(key: string, value: T): void {
      if (this.cache.size >= this.maxSize) {
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey !== undefined) {
          this.cache.delete(oldestKey);
        }
      }
  
      this.cache.set(key, {
        data: value,
        timestamp: Date.now(),
      });
    }
  
    get(key: string): T | null {
      const item = this.cache.get(key);
      if (!item) return null;
  
      if (Date.now() - item.timestamp > this.ttl) {
        this.cache.delete(key);
        return null;
      }
  
      return item.data;
    }
  
    clear(): void {
      this.cache.clear();
    }
  }