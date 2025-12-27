/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Time window in milliseconds */
  window: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier Unique identifier (e.g., IP address)
 * @param config Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 5, window: 60000 } // Default: 5 requests per minute
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // First request or expired window
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.window;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });
    return {
      success: true,
      remaining: config.limit - 1,
      resetTime,
    };
  }

  // Within rate limit
  if (entry.count < config.limit) {
    entry.count++;
    return {
      success: true,
      remaining: config.limit - entry.count,
      resetTime: entry.resetTime,
    };
  }

  // Exceeded rate limit
  return {
    success: false,
    remaining: 0,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP address from request headers
 * Handles various proxy headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'unknown';
}
