import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';
function key() {
  const value=Buffer.from(process.env.BOOKING_ENCRYPTION_KEY || '', 'base64');
  if(value.length!==32) throw new Error('Server encryption is not configured.');
  return value;
}
export const digest=value=>createHash('sha256').update(value).digest('hex');
export function seal(value) {
  const iv=randomBytes(12), cipher=createCipheriv('aes-256-gcm',key(),iv);
  const body=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),body]).toString('base64');
}
export function unseal(value) {
  const b=Buffer.from(value,'base64'), cipher=createDecipheriv('aes-256-gcm',key(),b.subarray(0,12));
  cipher.setAuthTag(b.subarray(12,28)); return Buffer.concat([cipher.update(b.subarray(28)),cipher.final()]).toString('utf8');
}
