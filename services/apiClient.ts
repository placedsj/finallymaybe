import { cacheService } from './cache';

interface RequestConfig extends RequestInit {
  retries?: number;
  retryDelay?: number;
  useCache?: boolean;
  ttl?: number;
  params?: Record<string, string | number | boolean>;
}

const BASE_URL = 'http://localhost:5000';
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

class APIClient {
  private pendingRequests = new Map<string, Promise<any>>();

  private getCacheKey(url: string, config?: RequestConfig): string {
    const method = config?.method || 'GET';
    const body = config?.body ? JSON.stringify(config.body) : '';
    const params = config?.params ? JSON.stringify(config.params) : '';
    return `${method}:${url}:${params}:${body}`;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = this.buildUrl(endpoint, config.params);
    const key = this.getCacheKey(url, config);

    // 1. Check Cache
    if (config.useCache !== false && (config.method === 'GET' || !config.method)) {
      const cached = await cacheService.get<T>(key);
      if (cached) {
        console.debug(`[API] Cache hit for ${url}`);
        return cached;
      }
    }

    // 2. Request Deduplication
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    const requestPromise = this.executeRequest<T>(url, config);
    this.pendingRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;

      // 3. Cache Successful Response
      if (config.useCache !== false && (config.method === 'GET' || !config.method)) {
        await cacheService.set(key, result, config.ttl);
      }

      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  private async executeRequest<T>(url: string, config: RequestConfig): Promise<T> {
    let attempts = 0;
    const maxRetries = config.retries ?? DEFAULT_RETRIES;
    let currentDelay = config.retryDelay ?? DEFAULT_RETRY_DELAY;

    while (attempts <= maxRetries) {
      try {
        const response = await fetch(url, {
          ...config,
          headers: {
            'Content-Type': 'application/json',
            ...(config.headers || {}),
          },
        });

        if (!response.ok) {
          // Don't retry client errors (4xx) unless it's 429 (Too Many Requests)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }
          throw new Error(`Request failed with status ${response.status}`);
        }

        return await response.json();
      } catch (error: any) {
        attempts++;
        if (attempts > maxRetries) {
          throw error;
        }

        console.warn(`[API] Attempt ${attempts} failed for ${url}. Retrying in ${currentDelay}ms...`);
        await this.delay(currentDelay);
        currentDelay *= 2; // Exponential backoff
      }
    }

    throw new Error('Unreachable code');
  }

  get<T>(url: string, config?: RequestConfig) {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  post<T>(url: string, data?: any, config?: RequestConfig) {
    return this.request<T>(url, { ...config, method: 'POST', body: JSON.stringify(data) });
  }

  put<T>(url: string, data?: any, config?: RequestConfig) {
    return this.request<T>(url, { ...config, method: 'PUT', body: JSON.stringify(data) });
  }

  delete<T>(url: string, config?: RequestConfig) {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }
}

export const apiClient = new APIClient();
