(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ForgeReleases = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const ALLOWED_URL_PREFIX = 'https://github.com/lokesh12dev/Forge/releases/download/';
  const DEFAULT_REPO = 'lokesh12dev/Forge';

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

  function detectPlatform(ua, plat) {
    const raw = [plat, ua].filter(Boolean).join(' ').toLowerCase();
    if (/android/.test(raw)) return 'android';
    if (/windows|win32|win64/.test(raw)) return 'windows';
    if (/macintosh|macintel|mac os x|macos/.test(raw)) return 'macos';
    return '';
  }

  return {
    ALLOWED_URL_PREFIX,
    isValidDownloadUrl,
    formatBytes,
    formatDate,
    extractSha256,
    classifyRelease,
    fetchLatestRelease,
    detectPlatform
  };
});
