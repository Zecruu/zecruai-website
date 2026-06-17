import type { Platform } from './download';

export const CONVERSION_ENDPOINT =
  'https://agentshive-production.up.railway.app/web/x-conversion';
export const TWCLID_STORAGE_KEY = 'zecruai.twclid.v1';

export function rememberTwclid(locationLike: Pick<Location, 'search'>, storage: Storage): string | null {
  const params = new URLSearchParams(locationLike.search || '');
  const twclid = params.get('twclid');
  if (twclid && /^[A-Za-z0-9_.:-]{1,256}$/.test(twclid)) {
    storage.setItem(TWCLID_STORAGE_KEY, twclid);
    return twclid;
  }
  return storage.getItem(TWCLID_STORAGE_KEY);
}

export function makeConversionId(platform: Platform): string {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `download-${platform}-${suffix}`;
}

export function buildDownloadConversionPayload(platform: Platform, eventSourceUrl: string, twclid: string | null) {
  return {
    event: `download_${platform}`,
    event_source_url: eventSourceUrl,
    conversion_id: makeConversionId(platform),
    ...(twclid ? { twclid } : {}),
  };
}

export function trackDownload(platform: Platform): void {
  if (typeof window === 'undefined') return;
  if (platform !== 'windows' && platform !== 'macos') return;
  const twclid = rememberTwclid(window.location, window.localStorage);
  const payload = buildDownloadConversionPayload(platform, window.location.href, twclid);
  try {
    fetch(CONVERSION_ENDPOINT, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // Never block the download for analytics.
  }
}
