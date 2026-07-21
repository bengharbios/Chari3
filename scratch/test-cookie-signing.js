const crypto = require('crypto');
const secret = 'fallback_secret_please_change_in_production_12345';
const value = 'some-uuid-token-value';

// Method 1: Node crypto
const nodeHmac = crypto.createHmac('sha256', secret).update(value).digest('base64');
console.log('Node HMAC:', nodeHmac);

// Method 2: Simulate Web Crypto using better-call / better-auth logic
const { getWebcryptoSubtle } = require('@better-auth/utils');
const algorithm = { name: 'HMAC', hash: 'SHA-256' };

async function webCryptoSign() {
  const secretBuf = new TextEncoder().encode(secret);
  const key = await getWebcryptoSubtle().importKey('raw', secretBuf, algorithm, false, ['sign']);
  const signature = await getWebcryptoSubtle().sign(algorithm.name, key, new TextEncoder().encode(value));
  const base64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  console.log('WebCrypto HMAC:', base64);
}

webCryptoSign();
