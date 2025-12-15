// Secure password hashing using PBKDF2-SHA256
// Compatible with Cloudflare Workers (uses Web Crypto API)

const ITERATIONS = 100000;
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16; // 128 bits

// Generate a random salt
function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

// Convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Convert hex string to Uint8Array
function hexToBuffer(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

// Hash password using PBKDF2-SHA256
async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );

    return crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        passwordKey,
        KEY_LENGTH * 8
    );
}

/**
 * Hash a password securely using PBKDF2-SHA256
 * Returns format: $pbkdf2-sha256$iterations$salt$hash
 */
export async function hashPasswordSecure(password: string): Promise<string> {
    const salt = generateSalt();
    const hash = await deriveKey(password, salt);
    const saltHex = bufferToHex(salt.buffer as ArrayBuffer);
    const hashHex = bufferToHex(hash);
    return `$pbkdf2-sha256$${ITERATIONS}$${saltHex}$${hashHex}`;
}

/**
 * Verify a password against a stored hash
 * Supports both new PBKDF2 format and legacy SHA-256 format
 */
export async function verifyPasswordSecure(password: string, storedHash: string): Promise<boolean> {
    // Check if it's the new PBKDF2 format
    if (storedHash.startsWith('$pbkdf2-sha256$')) {
        const parts = storedHash.split('$');
        if (parts.length !== 5) return false;

        const iterations = parseInt(parts[2], 10);
        const salt = hexToBuffer(parts[3]);
        const expectedHash = parts[4];

        const derivedHash = await deriveKey(password, salt);
        const derivedHashHex = bufferToHex(derivedHash);

        // Constant-time comparison
        return timingSafeEqual(derivedHashHex, expectedHash);
    }

    // Legacy SHA-256 format (64 char hex string without prefix)
    if (storedHash.length === 64 && !storedHash.includes('$')) {
        const legacyHash = await hashPasswordLegacy(password);
        return timingSafeEqual(legacyHash, storedHash);
    }

    return false;
}

/**
 * Check if a hash is in the legacy SHA-256 format
 */
export function isLegacyHash(hash: string): boolean {
    return hash.length === 64 && !hash.includes('$');
}

/**
 * Legacy SHA-256 hash function (for backward compatibility during migration)
 */
export async function hashPasswordLegacy(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return bufferToHex(hashBuffer);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}
