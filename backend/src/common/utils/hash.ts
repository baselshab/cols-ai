import { createHash, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  const hashBuffer = Buffer.from(hash, 'hex');
  const suppliedHash = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(hashBuffer, suppliedHash);
}

export function hashString(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function generateToken(length = 32): string {
  return randomBytes(length).toString('hex');
}
