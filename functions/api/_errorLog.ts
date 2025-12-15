// Error logging to R2 for debugging and monitoring

interface ErrorLogEntry {
    timestamp: string;
    endpoint: string;
    method: string;
    error: {
        name: string;
        message: string;
        stack?: string;
    };
    context?: {
        userId?: number;
        requestId?: string;
        userAgent?: string;
        ip?: string;
    };
}

/**
 * Log an error to R2 for later analysis
 */
export async function logError(
    env: { BACKUPS?: R2Bucket },
    endpoint: string,
    method: string,
    error: Error,
    context?: ErrorLogEntry['context']
): Promise<void> {
    if (!env.BACKUPS) {
        console.error('[ERROR LOG] R2 not configured, logging to console only');
        console.error({
            endpoint,
            method,
            error: { name: error.name, message: error.message },
            context
        });
        return;
    }

    try {
        const entry: ErrorLogEntry = {
            timestamp: new Date().toISOString(),
            endpoint,
            method,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            context
        };

        const date = new Date().toISOString().split('T')[0];
        const id = crypto.randomUUID();
        const key = `errors/${date}/${id}.json`;

        await env.BACKUPS.put(key, JSON.stringify(entry, null, 2), {
            httpMetadata: {
                contentType: 'application/json'
            }
        });

        console.log(`[ERROR LOG] Logged to R2: ${key}`);
    } catch (logError) {
        // Don't let error logging break the app
        console.error('[ERROR LOG] Failed to log error to R2:', logError);
        console.error('Original error:', error);
    }
}

/**
 * Create an error logging wrapper for API handlers
 */
export function withErrorLogging(
    env: { BACKUPS?: R2Bucket },
    endpoint: string,
    method: string,
    context?: ErrorLogEntry['context']
) {
    return async (error: Error): Promise<void> => {
        await logError(env, endpoint, method, error, context);
    };
}

/**
 * Helper to extract context from request for error logging
 */
export function extractErrorContext(
    request: Request,
    userId?: number
): ErrorLogEntry['context'] {
    return {
        userId,
        requestId: request.headers.get('CF-Ray') || undefined,
        userAgent: request.headers.get('User-Agent') || undefined,
        ip: request.headers.get('CF-Connecting-IP') || undefined
    };
}
