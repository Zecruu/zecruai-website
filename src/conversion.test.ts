import { describe, expect, it, vi } from 'vitest';
import {
  buildDownloadConversionPayload,
  makeConversionId,
  rememberTwclid,
  TWCLID_STORAGE_KEY,
} from './conversion';

function storage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => { map.set(k, v); },
    removeItem: (k) => { map.delete(k); },
    clear: () => { map.clear(); },
    key: (i) => Array.from(map.keys())[i] ?? null,
    get length() { return map.size; },
  };
}

describe('conversion helpers', () => {
  it('remembers a valid twclid from the URL', () => {
    const s = storage();
    expect(rememberTwclid({ search: '?twclid=abc-123_X' } as Location, s)).toBe('abc-123_X');
    expect(s.getItem(TWCLID_STORAGE_KEY)).toBe('abc-123_X');
  });

  it('falls back to stored twclid when the URL has none', () => {
    const s = storage();
    s.setItem(TWCLID_STORAGE_KEY, 'stored-1');
    expect(rememberTwclid({ search: '' } as Location, s)).toBe('stored-1');
  });

  it('ignores invalid twclid values', () => {
    const s = storage();
    expect(rememberTwclid({ search: '?twclid=<script>' } as Location, s)).toBeNull();
  });

  it('builds download conversion payloads with a dedupe id', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000001');
    expect(makeConversionId('windows')).toBe('download-windows-00000000-0000-4000-8000-000000000001');
    const payload = buildDownloadConversionPayload('macos', 'https://zecruai.com/', 'tw-1');
    expect(payload.event).toBe('download_macos');
    expect(payload.event_source_url).toBe('https://zecruai.com/');
    expect(payload.conversion_id).toBe('download-macos-00000000-0000-4000-8000-000000000001');
    expect(payload.twclid).toBe('tw-1');
  });
});
