export const LATEST_RELEASE_API =
  'https://api.github.com/repos/Zecruu/ZecruAgentsHive/releases/latest';
export const LATEST_RELEASE_URL = 'https://github.com/Zecruu/ZecruAgentsHive/releases/latest';
export const RELEASE_CACHE_KEY = 'zecruai.latestRelease.v1';

export type Platform = 'windows' | 'macos' | 'other';

export type GitHubReleaseAsset = {
  name: string;
  browser_download_url: string;
};

export type GitHubRelease = {
  tag_name: string;
  html_url?: string;
  assets: GitHubReleaseAsset[];
};

export type DownloadLink = {
  platform: Platform;
  label: string;
  href: string;
  version?: string;
  isDirectAsset: boolean;
};

export function detectPlatform(userAgent: string): Platform {
  const ua = userAgent.toLowerCase();
  if (ua.includes('windows')) return 'windows';
  if (ua.includes('macintosh') || ua.includes('mac os x')) return 'macos';
  return 'other';
}

export function displayVersion(tagName: string): string {
  return tagName.replace(/^v/i, '');
}

export function pickReleaseAsset(
  release: GitHubRelease,
  platform: Platform,
): GitHubReleaseAsset | undefined {
  if (platform === 'windows') {
    return release.assets.find((asset) => /^ZecruAI-Setup-.+\.exe$/i.test(asset.name));
  }
  if (platform === 'macos') {
    return release.assets.find((asset) => /^ZecruAI-.+\.dmg$/i.test(asset.name));
  }
  return undefined;
}

export function makeDownloadLink(
  release: GitHubRelease | null,
  platform: Platform,
): DownloadLink {
  const version = release ? displayVersion(release.tag_name) : undefined;
  const asset = release ? pickReleaseAsset(release, platform) : undefined;

  if (asset && platform === 'windows') {
    return {
      platform,
      label: `Download ZecruAI ${version} for Windows`,
      href: asset.browser_download_url,
      version,
      isDirectAsset: true,
    };
  }

  if (asset && platform === 'macos') {
    return {
      platform,
      label: `Download ZecruAI ${version} for macOS`,
      href: asset.browser_download_url,
      version,
      isDirectAsset: true,
    };
  }

  const label = version ? `View ZecruAI ${version} releases` : 'View latest ZecruAI release';
  return {
    platform,
    label,
    href: release?.html_url || LATEST_RELEASE_URL,
    version,
    isDirectAsset: false,
  };
}

export function readCachedRelease(storage: Storage): GitHubRelease | null {
  const raw = storage.getItem(RELEASE_CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as GitHubRelease;
    if (!parsed.tag_name || !Array.isArray(parsed.assets)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCachedRelease(storage: Storage, release: GitHubRelease): void {
  storage.setItem(RELEASE_CACHE_KEY, JSON.stringify(release));
}

export async function fetchLatestRelease(signal?: AbortSignal): Promise<GitHubRelease> {
  const response = await fetch(LATEST_RELEASE_API, {
    headers: { Accept: 'application/vnd.github+json' },
    signal,
  });
  if (!response.ok) {
    throw new Error(`GitHub release fetch failed: ${response.status}`);
  }
  return (await response.json()) as GitHubRelease;
}
