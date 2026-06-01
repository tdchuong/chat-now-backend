import { createHash } from 'crypto';

export function hashFingerprint(fp: string): string {
  return createHash('sha256').update(fp).digest('hex');
}
