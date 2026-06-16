import { describe, expect, it } from 'vitest';
import {
  detectPlatform,
  displayVersion,
  makeDownloadLink,
  pickReleaseAsset,
  type GitHubRelease,
} from './download';

const release: GitHubRelease = {
  tag_name: 'v2.7.0',
  html_url: 'https://github.com/Zecruu/ZecruAI-Releases/releases/tag/v2.7.0',
  assets: [
    {
      name: 'latest.yml',
      browser_download_url: 'https://example.invalid/latest.yml',
    },
    {
      name: 'ZecruAI-Setup-2.7.0.exe',
      browser_download_url: 'https://example.invalid/ZecruAI-Setup-2.7.0.exe',
    },
    {
      name: 'ZecruAI-2.7.0.dmg',
      browser_download_url: 'https://example.invalid/ZecruAI-2.7.0.dmg',
    },
  ],
};

describe('download helpers', () => {
  it('detects supported desktop platforms from user agents', () => {
    expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('windows');
    expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5)')).toBe('macos');
    expect(detectPlatform('Mozilla/5.0 (X11; Linux x86_64)')).toBe('other');
  });

  it('formats release tags for display', () => {
    expect(displayVersion('v2.7.0')).toBe('2.7.0');
    expect(displayVersion('2.8.0')).toBe('2.8.0');
  });

  it('picks direct Windows and macOS release assets', () => {
    expect(pickReleaseAsset(release, 'windows')?.name).toBe('ZecruAI-Setup-2.7.0.exe');
    expect(pickReleaseAsset(release, 'macos')?.name).toBe('ZecruAI-2.7.0.dmg');
    expect(pickReleaseAsset(release, 'other')).toBeUndefined();
  });

  it('creates platform-specific direct download links when assets exist', () => {
    const windows = makeDownloadLink(release, 'windows');
    const macos = makeDownloadLink(release, 'macos');

    expect(windows.label).toBe('Download for Windows');
    expect(windows.href).toContain('.exe');
    expect(windows.isDirectAsset).toBe(true);
    expect(macos.label).toBe('Download for macOS');
    expect(macos.href).toContain('.dmg');
    expect(macos.isDirectAsset).toBe(true);
  });

  it('falls back to releases when the API or matching asset is unavailable', () => {
    expect(makeDownloadLink(null, 'windows')).toEqual({
      platform: 'windows',
      label: 'Download for Windows',
      href: 'https://github.com/Zecruu/ZecruAI-Releases/releases/latest',
      version: undefined,
      isDirectAsset: false,
    });

    const linux = makeDownloadLink(release, 'other');
    expect(linux.href).toBe(release.html_url);
    expect(linux.label).toBe('View latest release');
    expect(linux.isDirectAsset).toBe(false);
  });
});
