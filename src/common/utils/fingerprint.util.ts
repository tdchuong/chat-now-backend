import { createHash } from 'crypto';

export function hashFingerprint(fp: any): string {
  const normalized = {
    canvas: fp.canvas || '',
    webgl: fp.webgl || '',
    audio: fp.audio || '',
    screen: fp.screen || '',
    timezone: fp.timezone || '',
    languages: fp.languages || '',
    platform: fp.platform || '',
    fonts: (fp.fonts || []).sort().join('|'),
    hardwareConcurrency: fp.hardwareConcurrency || 0,
    deviceMemory: fp.deviceMemory || 0,
  };

  const str = JSON.stringify(normalized);
  return createHash('sha256').update(str).digest('hex');
}
