/**
 * AES-256-GCM encryption utility for sensitive data (e.g., IBAN).
 * Server-side only — uses Node.js crypto module.
 */

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

// Ensure the encryption key is exactly 32 bytes (256 bits) for AES-256.
// In production, ENCRYPTION_KEY should be a 32-byte hex string set in env vars.
// For development, we derive a deterministic key from a default phrase.
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;

  if (envKey) {
    // If the env key is 64 hex chars (32 bytes), use it directly
    if (/^[0-9a-fA-F]{64}$/.test(envKey)) {
      return Buffer.from(envKey, 'hex');
    }
    // Otherwise, hash the env key to get 32 bytes
    return createHash('sha256').update(envKey).digest();
  }

  // Development fallback — NOT for production use
  return createHash('sha256').update('charyday-platform-dev-key-2025').digest();
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 12 bytes for GCM is standard, but 16 also works
const TAG_LENGTH = 16; // Auth tag length for GCM

export interface EncryptedPayload {
  iv: string; // hex-encoded IV
  encrypted: string; // hex-encoded ciphertext + auth tag
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 *
 * @param plaintext - The string to encrypt
 * @returns EncryptedPayload containing the IV and encrypted data (both hex-encoded)
 */
export function encrypt(plaintext: string): EncryptedPayload {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  // Prepend auth tag to ciphertext for storage
  const combined = Buffer.concat([
    Buffer.from(authTag),
    Buffer.from(encrypted, 'hex'),
  ]);

  return {
    iv: iv.toString('hex'),
    encrypted: combined.toString('hex'),
  };
}

/**
 * Decrypt data that was encrypted using AES-256-GCM.
 *
 * @param iv - Hex-encoded initialization vector
 * @param encrypted - Hex-encoded ciphertext (with prepended auth tag)
 * @returns Decrypted plaintext string
 */
export function decrypt(iv: string, encrypted: string): string {
  const key = getEncryptionKey();
  const ivBuffer = Buffer.from(iv, 'hex');
  const combined = Buffer.from(encrypted, 'hex');

  // First 16 bytes are the auth tag, rest is ciphertext
  const authTag = combined.subarray(0, TAG_LENGTH);
  const ciphertext = combined.subarray(TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, ivBuffer, {
    authTagLength: TAG_LENGTH,
  });

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
