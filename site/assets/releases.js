/*
 * Forge official download engine.
 *
 * Single source of truth for release data on the Forge website.
 * - Live data comes from the GitHub Releases API (assets, sizes, sha256 digests).
 * - A verified static snapshot (FALLBACK_RELEASE) ships with the site so the
 *   page is correct even if the API is unreachable. Every value in the
 *   snapshot is copied from the official v10.7.0 release (SHA256SUMS.txt and
 *   the release API response) — never edited by hand.
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

  /*
   * VERIFIED static snapshot of Forge v10.7.0 (published 2026-11-15).
   * Sizes are exact byte counts from the release API; checksums are copied
   * verbatim from the release's official SHA256SUMS.txt.
   * Update this object only by re-verifying a newly published release.
   */
  const FALLBACK_RELEASE = {
    version: 'v10.7.0',
    versionClean: '10.7.0',
    name: 'Forge v10.7.0',
    date: '15 Nov 2026',
    publishedAt: '2026-11-15T17:50:00Z',
    htmlUrl: 'https://github.com/lokesh12dev/Forge/releases/tag/v10.7.0',
    checksumsUrl: 'https://github.com/lokesh12dev/Forge/releases/download/v10.7.0/SHA256SUMS.txt',
    notes:
      'One-click UPI payment on Android (opens Google Pay / PhonePe directly). One-click Forge Pay portal on macOS & Windows. GitHub shortcut in Settings. macOS: right-click Forge.app → Open to bypass Gatekeeper on first launch.',
    android: [
      {
        name: 'Forge-v10.7.0-universal.apk',
        label: 'Universal APK',
        desc: 'Works on Android phones and tablets. The easiest choice for most devices.',
        arch: 'all architectures',
        type: 'universal',
        recommended: true,
        size: 33603968,
        sizeFormatted: '32.0 MB',
        sha256: 'bb6c8a3dcf9318750cedf805eab7b7fc59906b0f3b3471d22495a7a42f2e5852',
        url: 'https://github.com/lokesh12dev/Forge/releases/download/v10.7.0/Forge-v10.7.0-universal.apk'
      },
      {
        name: 'Forge-v10.7.0-arm64-v8a.apk',
        label: 'ARM64 APK',
        desc: 'For modern Android devices with a 64-bit ARM processor.',
        arch: 'arm64-v8a',
        type: 'arm64',
        recommended: false,
        size: 13334885,
        sizeFormatted: '12.7 MB',
        sha256: 'fc18e2619f13c6ea3c5a5047e066ece4a5adfd3b6353df5e31e4422867269f48',
        url: 'https://github.com/lokesh12dev/Forge/releases/download/v10.7.0/Forge-v10.7.0-arm64-v8a.apk'
      }
    ],
    macos: [
      {
        name: 'Forge-v10.7.0-macos.dmg',
        label: 'macOS Disk Image',
        desc: 'Universal build for Apple Silicon and Intel Macs.',
        arch: 'macOS 12.0+',
        type: 'dmg',
        recommended: true,
        size: 27336803,
        sizeFormatted: '26.1 MB',
        sha256: 'dec1128b0d51dc0438e7f33c3172c47d41d44249a3c84fcd2e671effb3dc0fa3',
        url: 'https://github.com/lokesh12dev/Forge/releases/download/v10.7.0/Forge-v10.7.0-macos.dmg'
      }
    ],
    windows: [
      {
        name: 'Forge-v10.7.0-windows-setup.exe',
        label: 'Windows Installer',
        desc: 'Standard setup wizard with Start menu shortcuts and clean desktop integration.',
        arch: 'x64',
        type: 'installer',
        recommended: true,
        size: 18614190,
        sizeFormatted: '17.8 MB',
        sha256: 'b54998e34a2a48f76d7580695569dea18870137c395b3519f20d4ea318fc851e',
        url: 'https://github.com/lokesh12dev/Forge/releases/download/v10.7.0/Forge-v10.7.0-windows-setup.exe'
      },
      {
        name: 'Forge-v10.7.0-windows-x64.zip',
        label: 'Portable ZIP',
        desc: 'Standalone archive. Extract anywhere and run forge.exe directly without installation.',
        arch: 'x64',
        type: 'portable',
        recommended: false,
        size: 23003199,
        sizeFormatted: '21.9 MB',
        sha256: 'b808080e0b687b71b97027fa08699a3fe1c28f480f5827dbed0b96b8ad351193',
        url: 'https://github.com/lokesh12dev/Forge/releases/download/v10.7.0/Forge-v10.7.0-windows-x64.zip'
      }
    ]
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
