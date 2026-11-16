/*
 * Forge official download engine.
 *
 * Single source of truth for release data on the Forge website.
 * - Live data comes from the GitHub Releases API (assets, sizes, sha256 digests).
 * - A verified static snapshot (FALLBACK_RELEASE) ships with the site so the
 *   page stays useful if the API is unreachable. Refresh it from the official
 *   release assets and API response whenever a new version ships.
 * - All download URLs are strictly allow-listed to official GitHub release
 *   asset URLs before they are ever placed in the DOM.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ForgeReleases = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const DEFAULT_REPO = 'lokesh12dev/Forge';
  const ALLOWED_URL_PREFIX = 'https://github.com/lokesh12dev/Forge/releases/download/';

  // The current-release asset details are filled from the release before deploy.
  const FALLBACK_RELEASE = {
    "version": "v10.7.3",
    "versionClean": "10.7.3",
    "name": "Forge v10.7.3",
    "date": "16 Nov 2026",
    "htmlUrl": "https://github.com/lokesh12dev/Forge/releases/tag/v10.7.3",
    "checksumsUrl": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/SHA256SUMS.txt",
    "android": [
      {
        "name": "Forge-v10.7.3-universal.apk",
        "url": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/Forge-v10.7.3-universal.apk",
        "size": 33315636,
        "sizeFormatted": "31.8 MB",
        "sha256": "b9a4547016ffe1a4be6613c55c2e71d78fe7931fe83a0e96480b5485511ce0b9",
        "downloadCount": 2,
        "label": "Universal APK",
        "desc": "Works on Android phones and tablets. The easiest choice for most devices.",
        "arch": "all architectures",
        "recommended": true,
        "type": "universal"
      },
      {
        "name": "Forge-v10.7.3-arm64-v8a.apk",
        "url": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/Forge-v10.7.3-arm64-v8a.apk",
        "size": 13241645,
        "sizeFormatted": "12.6 MB",
        "sha256": "7f26d236f200a0f2620422de8be8d54abd5507210bdf04722abee0af66871f7a",
        "downloadCount": 2,
        "label": "ARM64 APK",
        "desc": "For modern Android devices with a 64-bit ARM processor.",
        "arch": "arm64-v8a",
        "recommended": false,
        "type": "arm64"
      }
    ],
    "ios": [
      {
        "name": "Forge.ipa",
        "url": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/Forge.ipa",
        "size": 12952993,
        "sizeFormatted": "12.4 MB",
        "sha256": "df0d0c1fa460d08eb72c67751898b9935abff4a06c0e8e16a98012b64155e2c8",
        "downloadCount": 0,
        "label": "iPhone App",
        "desc": "Unsigned IPA for installation with your Apple ID.",
        "arch": "iOS 15+",
        "recommended": true,
        "type": "ipa"
      }
    ],
    "macos": [
      {
        "name": "Forge-v10.7.3-macos.dmg",
        "url": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/Forge-v10.7.3-macos.dmg",
        "size": 27131395,
        "sizeFormatted": "25.9 MB",
        "sha256": "32162a8c16f9b37cf1852dcf2d7d68efdf72920d91afb5d31a7a4a601ad03fe2",
        "downloadCount": 0,
        "label": "macOS Disk Image",
        "desc": "Universal build for Apple Silicon and Intel Macs.",
        "arch": "macOS 12.0+",
        "recommended": true,
        "type": "dmg"
      }
    ],
    "windows": [
      {
        "name": "Forge-v10.7.3-windows-setup.exe",
        "url": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/Forge-v10.7.3-windows-setup.exe",
        "size": 18557676,
        "sizeFormatted": "17.7 MB",
        "sha256": "7d8986a2f8cebd4c85f37fa36a35b6ccaba33bb4ec5fcf539ca2f089f500b954",
        "downloadCount": 0,
        "label": "Windows Installer",
        "desc": "Installer with Start menu shortcuts and clean setup.",
        "arch": "x64",
        "recommended": true,
        "type": "installer"
      },
      {
        "name": "Forge-v10.7.3-windows-x64.zip",
        "url": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/Forge-v10.7.3-windows-x64.zip",
        "size": 22903340,
        "sizeFormatted": "21.8 MB",
        "sha256": "e804f388a2df29810663da193119d94c1c1f15e7c5101d7af98084931920ab22",
        "downloadCount": 0,
        "label": "Portable ZIP",
        "desc": "Standalone archive. Extract and run forge.exe without installation.",
        "arch": "x64",
        "recommended": false,
        "type": "portable"
      }
    ],
    "allAssets": [
      {
        "name": "Forge-v10.7.3-arm64-v8a.apk",
        "url": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/Forge-v10.7.3-arm64-v8a.apk",
        "size": 13241645,
        "sizeFormatted": "12.6 MB",
        "sha256": "7f26d236f200a0f2620422de8be8d54abd5507210bdf04722abee0af66871f7a",
        "downloadCount": 2,
        "label": "ARM64 APK",
        "desc": "For modern Android devices with a 64-bit ARM processor.",
        "arch": "arm64-v8a",
        "recommended": false,
        "type": "arm64"
      },
      {
        "name": "Forge-v10.7.3-macos.dmg",
        "url": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/Forge-v10.7.3-macos.dmg",
        "size": 27131395,
        "sizeFormatted": "25.9 MB",
        "sha256": "32162a8c16f9b37cf1852dcf2d7d68efdf72920d91afb5d31a7a4a601ad03fe2",
        "downloadCount": 0,
        "label": "macOS Disk Image",
        "desc": "Universal build for Apple Silicon and Intel Macs.",
        "arch": "macOS 12.0+",
        "recommended": true,
        "type": "dmg"
      },
      {
        "name": "Forge-v10.7.3-universal.apk",
        "url": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/Forge-v10.7.3-universal.apk",
        "size": 33315636,
        "sizeFormatted": "31.8 MB",
        "sha256": "b9a4547016ffe1a4be6613c55c2e71d78fe7931fe83a0e96480b5485511ce0b9",
        "downloadCount": 2,
        "label": "Universal APK",
        "desc": "Works on Android phones and tablets. The easiest choice for most devices.",
        "arch": "all architectures",
        "recommended": true,
        "type": "universal"
      },
      {
        "name": "Forge-v10.7.3-windows-setup.exe",
        "url": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/Forge-v10.7.3-windows-setup.exe",
        "size": 18557676,
        "sizeFormatted": "17.7 MB",
        "sha256": "7d8986a2f8cebd4c85f37fa36a35b6ccaba33bb4ec5fcf539ca2f089f500b954",
        "downloadCount": 0,
        "label": "Windows Installer",
        "desc": "Installer with Start menu shortcuts and clean setup.",
        "arch": "x64",
        "recommended": true,
        "type": "installer"
      },
      {
        "name": "Forge-v10.7.3-windows-x64.zip",
        "url": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/Forge-v10.7.3-windows-x64.zip",
        "size": 22903340,
        "sizeFormatted": "21.8 MB",
        "sha256": "e804f388a2df29810663da193119d94c1c1f15e7c5101d7af98084931920ab22",
        "downloadCount": 0,
        "label": "Portable ZIP",
        "desc": "Standalone archive. Extract and run forge.exe without installation.",
        "arch": "x64",
        "recommended": false,
        "type": "portable"
      },
      {
        "name": "Forge.ipa",
        "url": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/Forge.ipa",
        "size": 12952993,
        "sizeFormatted": "12.4 MB",
        "sha256": "df0d0c1fa460d08eb72c67751898b9935abff4a06c0e8e16a98012b64155e2c8",
        "downloadCount": 0,
        "label": "iPhone App",
        "desc": "Unsigned IPA for installation with your Apple ID.",
        "arch": "iOS 15+",
        "recommended": true,
        "type": "ipa"
      },
      {
        "name": "INSTALL.md",
        "url": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/INSTALL.md",
        "size": 5135,
        "sizeFormatted": "0.0 MB",
        "sha256": "185b156d76be384a91f2da79cd4267a36436b49b221b1d59ce9e21121022b884",
        "downloadCount": 0
      },
      {
        "name": "REPORT.md",
        "url": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/REPORT.md",
        "size": 729,
        "sizeFormatted": "0.0 MB",
        "sha256": "dd61b79b772d2db7624c8dbe2195d388a493a5f63841798f2a8490b9a6278f15",
        "downloadCount": 0
      },
      {
        "name": "SHA256SUMS.txt",
        "url": "https://github.com/lokesh12dev/Forge/releases/download/v10.7.3/SHA256SUMS.txt",
        "size": 548,
        "sizeFormatted": "0.0 MB",
        "sha256": "67d0033b36eed040e75d096f0d11813c274546a1bb461eb1d1e0a490050dda0d",
        "downloadCount": 0
      }
    ],
    "publishedAt": "2026-11-16T03:39:30Z",
    "notes": "Direct UPI launch on mobile with Forge Pay and QR fallbacks. Desktop opens Forge Pay."
  };

  function isValidDownloadUrl(url) {
    if (typeof url !== 'string') return false;
    return url.startsWith(ALLOWED_URL_PREFIX);
  }

  function formatBytes(bytes) {
    if (typeof bytes !== 'number' || isNaN(bytes) || bytes <= 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1) + ' MB';
  }

  function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const day = date.getUTCDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    return `${day} ${month} ${year}`;
  }

  function extractSha256(digest) {
    if (!digest || typeof digest !== 'string') return '';
    if (digest.startsWith('sha256:')) {
      return digest.slice(7).trim();
    }
    return digest.trim();
  }

  function classifyRelease(release) {
    if (!release || release.draft || release.prerelease) {
      return null;
    }

    const version = release.tag_name || '';
    const versionClean = version.replace(/^v/, '');
    const name = release.name || `Forge ${version}`;
    const date = formatDate(release.published_at || release.created_at);
    const htmlUrl = release.html_url || `https://github.com/${DEFAULT_REPO}/releases/tag/${version}`;

    const classified = {
      version,
      versionClean,
      name,
      date,
      htmlUrl,
      checksumsUrl: null,
      android: [],
      ios: [],
      macos: [],
      windows: [],
      allAssets: []
    };

    const assets = Array.isArray(release.assets) ? release.assets : [];

    for (const asset of assets) {
      if (!isValidDownloadUrl(asset.browser_download_url)) {
        continue;
      }

      const assetName = asset.name || '';
      const lowerName = assetName.toLowerCase();
      const digest = extractSha256(asset.digest);
      const sizeFormatted = formatBytes(asset.size);
      const downloadUrl = asset.browser_download_url;

      const item = {
        name: assetName,
        url: downloadUrl,
        size: asset.size,
        sizeFormatted,
        sha256: digest,
        downloadCount: asset.download_count || 0
      };

      classified.allAssets.push(item);

      if (assetName === 'SHA256SUMS.txt') {
        classified.checksumsUrl = downloadUrl;
      } else if (lowerName.endsWith('.apk')) {
        if (lowerName.includes('universal')) {
          item.label = 'Universal APK';
          item.desc = 'Works on Android phones and tablets. The easiest choice for most devices.';
          item.arch = 'all architectures';
          item.recommended = true;
          item.type = 'universal';
        } else if (lowerName.includes('arm64')) {
          item.label = 'ARM64 APK';
          item.desc = 'For modern Android devices with a 64-bit ARM processor.';
          item.arch = 'arm64-v8a';
          item.recommended = false;
          item.type = 'arm64';
        } else {
          item.label = 'Android APK';
          item.desc = 'Install package for Android devices.';
          item.arch = 'apk';
          item.recommended = false;
          item.type = 'standard';
        }
        classified.android.push(item);
      } else if (lowerName.endsWith('.ipa')) {
        item.label = 'iPhone App';
        item.desc = 'Unsigned IPA for installation with your Apple ID.';
        item.arch = 'iOS 15+';
        item.recommended = true;
        item.type = 'ipa';
        classified.ios.push(item);
      } else if (lowerName.endsWith('.dmg') || lowerName.includes('macos')) {
        item.label = 'macOS Disk Image';
        item.desc = 'Universal build for Apple Silicon and Intel Macs.';
        item.arch = 'macOS 12.0+';
        item.recommended = true;
        item.type = 'dmg';
        classified.macos.push(item);
      } else if (lowerName.endsWith('.exe') || (lowerName.includes('windows') && lowerName.endsWith('.zip'))) {
        if (lowerName.endsWith('.exe')) {
          item.label = 'Windows Installer';
          item.desc = 'Installer with Start menu shortcuts and clean setup.';
          item.arch = 'x64';
          item.recommended = true;
          item.type = 'installer';
        } else {
          item.label = 'Portable ZIP';
          item.desc = 'Standalone archive. Extract and run forge.exe without installation.';
          item.arch = 'x64';
          item.recommended = false;
          item.type = 'portable';
        }
        classified.windows.push(item);
      }
    }

    // Sort options: recommended first
    classified.android.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));
    classified.ios.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));
    classified.macos.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));
    classified.windows.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));

    // If windows has no recommended, make first recommended
    if (classified.windows.length > 0 && !classified.windows.some(w => w.recommended)) {
      classified.windows[0].recommended = true;
    }

    return classified;
  }

  async function fetchLatestRelease(apiUrl = `https://api.github.com/repos/${DEFAULT_REPO}/releases/latest`, fetchFn = (typeof fetch !== 'undefined' ? fetch : null)) {
    if (!fetchFn) {
      throw new Error('fetch is not available');
    }
    const response = await fetchFn(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return classifyRelease(data);
  }

  /**
   * Fetches live repository facts (stars, forks, open issues) from the GitHub
   * API. Returns null when anything is unavailable — the UI must hide these
   * numbers rather than guess them.
   */
  async function fetchRepoStats(apiUrl = `https://api.github.com/repos/${DEFAULT_REPO}`, fetchFn = (typeof fetch !== 'undefined' ? fetch : null)) {
    if (!fetchFn) return null;
    try {
      const response = await fetchFn(apiUrl, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (!data || typeof data !== 'object') return null;
      return {
        stars: typeof data.stargazers_count === 'number' ? data.stargazers_count : null,
        forks: typeof data.forks_count === 'number' ? data.forks_count : null,
        issues: typeof data.open_issues_count === 'number' ? data.open_issues_count : null,
        license: data.license && data.license.spdx_id ? data.license.spdx_id : null
      };
    } catch (error) {
      return null;
    }
  }

  function detectPlatform(ua, plat) {
    const raw = [plat, ua].filter(Boolean).join(' ').toLowerCase();
    if (/iphone|ipad|ipod/.test(raw)) return 'ios';
    if (/android/.test(raw)) return 'android';
    if (/windows|win32|win64/.test(raw)) return 'windows';
    if (/macintosh|macintel|mac os x|macos/.test(raw)) return 'macos';
    return '';
  }

  return {
    DEFAULT_REPO,
    ALLOWED_URL_PREFIX,
    FALLBACK_RELEASE,
    isValidDownloadUrl,
    formatBytes,
    formatDate,
    extractSha256,
    classifyRelease,
    fetchLatestRelease,
    fetchRepoStats,
    detectPlatform
  };
});
