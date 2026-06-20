import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Retrieve a 32-byte key from environment, or use a fallback for development ONLY.
// In production, PAYMENT_ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters).
const ENCRYPTION_KEY = process.env.PAYMENT_ENCRYPTION_KEY 
  ? Buffer.from(process.env.PAYMENT_ENCRYPTION_KEY, 'hex') 
  : crypto.scryptSync(process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev', 'salt', 32);

export class SecurityService {
  /**
   * Encrypts a JSON payload using AES-256-GCM.
   * Returns a base64 encoded string containing IV, AuthTag, and the encrypted data.
   */
  static encryptConfig(payload: Record<string, any>): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    const textToEncrypt = JSON.stringify(payload);
    let encrypted = cipher.update(textToEncrypt, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    // Format: base64(iv:authTag:encrypted)
    const combined = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    return Buffer.from(combined).toString('base64');
  }

  /**
   * Decrypts an encrypted configuration string back to its JSON object.
   */
  static decryptConfig(encryptedData: string): Record<string, any> {
    try {
      const decoded = Buffer.from(encryptedData, 'base64').toString('utf8');
      const parts = decoded.split(':');
      
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encryptedText = parts[2];

      const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt payment configuration');
    }
  }
}
