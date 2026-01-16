import { createHash } from 'crypto';

export function hashStringSHA256(str: string): string {
  return createHash('sha256').update(str).digest('hex');
}

