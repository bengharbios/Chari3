import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'chariday_logistics_default_secure_secret_key_32bytes!';

function getDerivedKey(): Buffer {
  return crypto.scryptSync(SECRET_KEY, 'chariday_salt', 32);
}

export function encryptKeys(data: object | string): string {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const iv = crypto.randomBytes(16);
  const key = getDerivedKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return JSON.stringify({
    iv: iv.toString('hex'),
    content: encrypted,
    tag: authTag,
  });
}

export function decryptKeys(encryptedString: string): any {
  try {
    const { iv, content, tag } = JSON.parse(encryptedString);
    const key = getDerivedKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (err) {
    console.error('Failed to decrypt API keys', err);
    return null;
  }
}
