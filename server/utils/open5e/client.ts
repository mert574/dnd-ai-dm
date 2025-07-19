import { ofetch } from 'ofetch';
import {
  OPEN5E_BASE_URL,
  Endpoint,
  Open5eError,
  type Open5eClientConfig,
  type RateLimitState,
  type ApiResponse
} from './types';
import ms from 'ms';

const DEFAULT_CONFIG: Required<Open5eClientConfig> = {
  baseUrl: OPEN5E_BASE_URL,
  cacheEnabled: true,
  cacheTTL: ms('1d'),
  rateLimit: {
    maxRequests: 100,
    windowMs: ms('1m')
  },
  retryConfig: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000
  }
};

export class Open5eClient {
  private config: Required<Open5eClientConfig>;
  private rateLimitState: RateLimitState;
  private fetch: typeof ofetch;

  constructor(config: Partial<Open5eClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rateLimitState = {
      requests: 0,
      windowStart: Date.now()
    };

    // Initialize ofetch instance with interceptors
    this.fetch = ofetch.create({
      baseURL: this.config.baseUrl,
      onRequest: this.handleRequest.bind(this),
      onResponse: this.handleResponse.bind(this),
      onResponseError: this.handleError.bind(this)
    });
  }

  /**
   * Fetch data from an Open5e endpoint with pagination support
   */
  async fetchAll<T>(
    endpoint: Endpoint,
    params: Record<string, string> = {}
  ): Promise<T[]> {
    let url = `/${endpoint}`;
    const results: T[] = [];

    try {
      while (url) {
        const response = await this.get<ApiResponse<T>>(url, params);
        results.push(...response.results);
        url = response.next ?? '';
      }

      return results;
    } catch (error) {
      throw this.normalizeError(error, endpoint);
    }
  }

  /**
   * Fetch a single item by slug
   */
  async fetchBySlug<T>(
    endpoint: Endpoint,
    slug: string
  ): Promise<T> {
    try {
      const url = `/${endpoint}/${slug}`;
      return await this.get<T>(url);
    } catch (error) {
      throw this.normalizeError(error, endpoint);
    }
  }

  /**
   * Search items in an endpoint
   */
  async search<T>(
    endpoint: Endpoint,
    query: string,
    params: Record<string, string> = {}
  ): Promise<T[]> {
    try {
      const searchParams = { ...params, search: query };
      return this.fetchAll<T>(endpoint, searchParams);
    } catch (error) {
      throw this.normalizeError(error, endpoint);
    }
  }

  private async get<T>(
    url: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    return this.withRetry(() => this.fetch(url, { params }));
  }

  private async withRetry<T>(
    fn: () => Promise<T>,
    attempt = 1
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (
        attempt < this.config.retryConfig.maxRetries &&
        this.shouldRetry(error)
      ) {
        const delay = Math.min(
          this.config.retryConfig.initialDelayMs * Math.pow(2, attempt - 1),
          this.config.retryConfig.maxDelayMs
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, attempt + 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: unknown): boolean {
    // Retry on network errors or 5xx responses
    if (error && typeof error === 'object' && 'response' in error) {
      const e = error as { response?: { status?: number } };
      return (
        !e.response ||
        (e.response?.status !== undefined && e.response.status >= 500 && e.response.status < 600)
      );
    }
    return true;
  }

  private async handleRequest(_request: unknown) {
    await this.checkRateLimit();
    this.rateLimitState.requests++;
  }

  private handleResponse(_response: unknown) {
    // Reset rate limit window if needed
    const now = Date.now();
    if (now - this.rateLimitState.windowStart >= this.config.rateLimit.windowMs) {
      this.rateLimitState = {
        requests: 0,
        windowStart: now
      };
    }
  }

  private handleError(error: unknown) {
    throw this.normalizeError(error);
  }

  private async checkRateLimit() {
    const now = Date.now();
    const windowElapsed = now - this.rateLimitState.windowStart;

    if (windowElapsed >= this.config.rateLimit.windowMs) {
      // Reset window
      this.rateLimitState = {
        requests: 0,
        windowStart: now
      };
    } else if (this.rateLimitState.requests >= this.config.rateLimit.maxRequests) {
      // Wait for the current window to expire
      const waitTime = this.config.rateLimit.windowMs - windowElapsed;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Reset window
      this.rateLimitState = {
        requests: 0,
        windowStart: Date.now()
      };
    }
  }

  private normalizeError(error: unknown, endpoint?: string): Open5eError {
    if (error instanceof Open5eError) {
      return error;
    }

    let statusCode: number | undefined;
    let message = 'Unknown error';
    
    if (error && typeof error === 'object') {
      const e = error as { response?: { status?: number; data?: { detail?: string } }; message?: string };
      statusCode = e.response?.status;
      message = e.response?.data?.detail ?? e.message ?? message;
    }

    let context: unknown = undefined;
    if (error && typeof error === 'object') {
      const e = error as { request?: { url?: string }; response?: { data?: unknown } };
      context = {
        url: e.request?.url,
        data: e.response?.data
      };
    }
    
    return new Open5eError(message, statusCode, endpoint, context);
  }
} 