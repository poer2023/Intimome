// Simple rate limiting using Cloudflare KV
// Implements sliding window counter algorithm

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

interface RateLimitConfig {
    limit: number;      // Max requests allowed
    windowSeconds: number; // Time window in seconds
}

/**
 * Check if a request is allowed based on rate limiting
 * @param env Environment with KV namespace
 * @param key Unique identifier (e.g., IP address, user ID)
 * @param config Rate limit configuration
 */
export async function checkRateLimit(
    env: { SESSIONS: KVNamespace },
    key: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const kvKey = `ratelimit:${key}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - config.windowSeconds;

    try {
        // Get current count data
        const data = await env.SESSIONS.get(kvKey);
        let requests: number[] = [];

        if (data) {
            try {
                requests = JSON.parse(data) as number[];
            } catch {
                requests = [];
            }
        }

        // Filter out old requests outside the window
        requests = requests.filter(timestamp => timestamp > windowStart);

        // Check if limit exceeded
        if (requests.length >= config.limit) {
            const oldestRequest = Math.min(...requests);
            const resetAt = oldestRequest + config.windowSeconds;
            return {
                allowed: false,
                remaining: 0,
                resetAt
            };
        }

        // Add current request
        requests.push(now);

        // Store updated count with TTL
        await env.SESSIONS.put(kvKey, JSON.stringify(requests), {
            expirationTtl: config.windowSeconds + 60 // Add buffer
        });

        return {
            allowed: true,
            remaining: config.limit - requests.length,
            resetAt: now + config.windowSeconds
        };
    } catch (error) {
        console.error('Rate limit check failed:', error);
        // On error, allow the request (fail open)
        return {
            allowed: true,
            remaining: config.limit,
            resetAt: now + config.windowSeconds
        };
    }
}

/**
 * Get client IP from request (handles Cloudflare headers)
 */
export function getClientIP(request: Request): string {
    return (
        request.headers.get('CF-Connecting-IP') ||
        request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
        request.headers.get('X-Real-IP') ||
        'unknown'
    );
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
    login: { limit: 5, windowSeconds: 60 },           // 5 per minute
    register: { limit: 10, windowSeconds: 3600 },     // 10 per hour
    insights: { limit: 3, windowSeconds: 60 },        // 3 per minute
    api: { limit: 100, windowSeconds: 60 },           // 100 per minute (general)
} as const;
