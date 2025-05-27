import crypto from 'crypto';

export function verifySignature(secret: string, payload: Buffer, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(digest), 
    Buffer.from(signature)
  );
}