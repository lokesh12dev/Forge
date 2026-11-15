/*
 * Forge official download engine.
 *
 * Single source of truth for release data on the Forge website.
 * - Live data comes from the GitHub Releases API (assets, sizes, sha256 digests).
 * - A verified static snapshot (FALLBACK_RELEASE) ships with the site so the
 *   page is correct even if the API is unreachable. Every value in the
 *   snapshot is copied from the official v10.6.4 release (SHA256SUMS.txt and
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
   * VERIFIED static snapshot of Forge v10.6.4 (published 2026-11-15).
   * Sizes are exact byte counts from the release API; checksums are copied
   * verbatim from the release's official SHA256SUMS.txt.
   * Update this object only by re-verifying a newly published release.
   */
  const FALLBACK_RELEASE = {
    version: 'v10.6.4',
    versionClean: '10.6.4',
    name: 'Forge v10.6.4',
    date: '15 Nov 2026',
    publishedAt: '2026-11-15T08:15:42Z',
    htmlUrl: 'https://github.com/lokesh12dev/Forge/releases/tag/v10.6.4',
    checksumsUrl: 'https://github.com/lokesh12dev/Forge/releases/download/v10.6.4/SHA256SUMS.txt',
    notes:
      'Sporty green top bar across the app. The Forge icon replaces the generic music-note placeholders. Update prompts now open the Forge download page on every platform. Fixed the invisible "forge" wordmark and removed the "Build Up Myself" section from About. Android APKs keep the same signing key, so updates install in place.',
    android: [
      {
        name: 'Forge-v10.6.4-universal.apk',
        label: 'Universal APK',
        desc: 'Works on Android phones and tablets. The easiest choice for most devices.',
        arch: 'all architectures',
        type: 'universal',
        recommended: true,
        size: 33143191,
        sizeFormatted: '31.6 MB',
        sha256: '20208fd2814a2cc0d9d33e76303d9bb4ebb48ce5e4a14786f2bb46962bb79b3a',
        url: 'https://github.com/lokesh12dev/Forge/releases/download/v10.6.4/Forge-v10.6.4-universal.apk'
      },
      {
        name: 'Forge-v10.6.4-arm64-v8a.apk',
        label: 'ARM64 APK',
        desc: 'For modern Android devices with a 64-bit ARM processor.',
        arch: 'arm64-v8a',
        type: 'arm64',
        recommended: false,
        size: 13066172,
        sizeFormatted: '12.5 MB',
        sha256: '73359f3af5dfd2d0b7f0fe259ad657cdd4117651602210d5c6b5c0d5c4f0faa4',
        url: 'https://github.com/lokesh12dev/Forge/releases/download/v10.6.4/Forge-v10.6.4-arm64-v8a.apk'
      }
    ],
    macos: [
      {
        name: 'Forge-v10.6.4-macos.dmg',
        label: 'macOS Disk Image',
        desc: 'Universal build for Apple Silicon and Intel Macs.',
        arch: 'macOS 12.0+',
        type: 'dmg',
        recommended: true,
        size: 26943388,
        sizeFormatted: '25.7 MB',
        sha256: 'b0f64e503d0d010a6d70e16f72a296091377d5bf9407c0a18792994383f3ae81',
        url: 'https://github.com/lokesh12dev/Forge/releases/download/v10.6.4/Forge-v10.6.4-macos.dmg'
      }
    ],
    windows: [
      {
        name: 'Forge-v10.6.4-windows-setup.exe',
        label: 'Windows Installer',
        desc: 'Standard setup wizard with Start menu shortcuts and clean desktop integration.',
        arch: 'x64',
        type: 'installer',
        recommended: true,
        size: 18406274,
        sizeFormatted: '17.6 MB',
        sha256: 'e6ac3400dfdbd35e4e3a5dbbde4ae95d870b1d550bcb12bed2326e1da64eebe0',
        url: 'https://github.com/lokesh12dev/Forge/releases/download/v10.6.4/Forge-v10.6.4-windows-setup.exe'
      },
      {
        name: 'Forge-v10.6.4-windows-x64.zip',
        label: 'Portable ZIP',
        desc: 'Standalone archive. Extract anywhere and run forge.exe directly without installation.',
        arch: 'x64',
        type: 'portable',
        recommended: false,
        size: 22744264,
        sizeFormatted: '21.7 MB',
        sha256: '235cac8aa57ea82821f59da0a55dbb71d9b219b542c183b7174535ce59a95dfb',
        url: 'https://github.com/lokesh12dev/Forge/releases/download/v10.6.4/Forge-v10.6.4-windows-x64.zip'
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
