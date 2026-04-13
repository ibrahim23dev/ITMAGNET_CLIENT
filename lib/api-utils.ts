/**
 * API Rate Limiting and Throttling utilities
 * Helps prevent excessive API calls and improves performance
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (args: any) => string;
}

interface ThrottleConfig {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
}

/**
 * Simple in-memory rate limiter
 * Tracks requests per key within a time window
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(key: string = 'default'): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get or initialize request timestamps for this key
    let timestamps = this.requests.get(key) || [];

    // Filter out old requests outside the window
    timestamps = timestamps.filter((ts) => ts > windowStart);

    // Check if we're under the limit
    if (timestamps.length < this.config.maxRequests) {
      timestamps.push(now);
      this.requests.set(key, timestamps);
      return true;
    }

    return false;
  }

  reset(key: string = 'default'): void {
    this.requests.delete(key);
  }

  resetAll(): void {
    this.requests.clear();
  }
}

/**
 * Throttle function calls
 * Only allows function to execute once per specified delay
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  config: ThrottleConfig
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let lastRun = 0;
  let lastArgs: Parameters<T> | null = null;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (config.leading && now - lastRun >= config.delay && !timeout) {
      func(...args);
      lastRun = now;
    } else {
      lastArgs = args;

      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        if (config.trailing && lastArgs) {
          func(...lastArgs);
          lastRun = Date.now();
        }
        timeout = null;
        lastArgs = null;
      }, config.delay);
    }
  };
}

/**
 * Debounce function calls
 * Delays execution until calls stop for specified time
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options?: { leading?: boolean; trailing?: boolean; maxWait?: number }
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let maxTimeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function (...args: Parameters<T>) {
    lastArgs = args;

    if (timeout) clearTimeout(timeout);
    if (maxTimeout) clearTimeout(maxTimeout);

    if (options?.leading && !timeout) {
      func(...args);
    }

    timeout = setTimeout(() => {
      if (options?.trailing !== false) {
        func(...lastArgs!);
      }
      timeout = null;
      lastArgs = null;
    }, delay);

    if (options?.maxWait) {
      maxTimeout = setTimeout(() => {
        if (options?.trailing !== false && lastArgs) {
          func(...lastArgs);
        }
        timeout = null;
        maxTimeout = null;
        lastArgs = null;
      }, options.maxWait);
    }
  };
}

/**
 * Retry with exponential backoff
 * Useful for transient failures
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  }
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
  } = options || {};

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) break;

      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Create a singleton rate limiter for API calls
 */
const apiRateLimiter = new RateLimiter({
  maxRequests: parseInt(process.env.NEXT_PUBLIC_API_RATE_LIMIT || '100'),
  windowMs: parseInt(process.env.NEXT_PUBLIC_API_RATE_LIMIT_WINDOW || '60000'),
});

export function canMakeApiCall(endpoint: string): boolean {
  return apiRateLimiter.isAllowed(endpoint);
}

export function resetApiRateLimit(endpoint?: string): void {
  if (endpoint) {
    apiRateLimiter.reset(endpoint);
  } else {
    apiRateLimiter.resetAll();
  }
}
