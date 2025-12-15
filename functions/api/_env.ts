// Environment variable validation for Cloudflare Workers

interface EnvConfig {
    // Required bindings
    DB: D1Database;
    SESSIONS: KVNamespace;

    // Optional bindings
    BACKUPS?: R2Bucket;

    // Required secrets for features
    OPENROUTER_API_KEY?: string;
    GOOGLE_CLIENT_ID?: string;
    BACKUP_SECRET?: string;

    // Optional configuration
    OPENROUTER_MODEL?: string;
}

interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validate environment bindings at startup
 * Returns validation result with errors and warnings
 */
export function validateEnv(env: Partial<EnvConfig>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required bindings
    if (!env.DB) {
        errors.push('D1 database binding (DB) is missing');
    }

    if (!env.SESSIONS) {
        errors.push('KV namespace binding (SESSIONS) is missing');
    }

    // Check optional but recommended bindings
    if (!env.BACKUPS) {
        warnings.push('R2 bucket binding (BACKUPS) is missing - backup feature will not work');
    }

    // Check secrets for features
    if (!env.OPENROUTER_API_KEY) {
        warnings.push('OPENROUTER_API_KEY is missing - AI insights feature will not work');
    }

    if (!env.GOOGLE_CLIENT_ID) {
        warnings.push('GOOGLE_CLIENT_ID is missing - Google login will not be available');
    }

    if (!env.BACKUP_SECRET) {
        warnings.push('BACKUP_SECRET is missing - backup API will reject all requests');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Check environment and log validation results
 * Throws an error if required bindings are missing
 */
export function ensureEnv(env: Partial<EnvConfig>): void {
    const result = validateEnv(env);

    // Log warnings
    result.warnings.forEach(w => console.warn(`[ENV WARNING] ${w}`));

    // Throw on errors
    if (!result.valid) {
        const errorMsg = `Environment validation failed:\n${result.errors.map(e => `  - ${e}`).join('\n')}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
}

/**
 * Get environment info for health check (safe to expose)
 */
export function getEnvInfo(env: Partial<EnvConfig>): Record<string, string> {
    return {
        d1: env.DB ? 'configured' : 'missing',
        kv: env.SESSIONS ? 'configured' : 'missing',
        r2: env.BACKUPS ? 'configured' : 'missing',
        openrouter: env.OPENROUTER_API_KEY ? 'configured' : 'missing',
        googleAuth: env.GOOGLE_CLIENT_ID ? 'configured' : 'missing',
    };
}
