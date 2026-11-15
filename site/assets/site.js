(function () {
  const tabs = Array.from(document.querySelectorAll('[data-os]'));
  const panels = Array.from(document.querySelectorAll('[data-panel]'));
  const status = document.getElementById('device-status');

  const knownPlatforms = ['android', 'macos', 'windows'];
  const requested = new URLSearchParams(window.location.search).get('os');

  const releasesApi = typeof window !== 'undefined' && window.ForgeReleases ? window.ForgeReleases : null;

  function getDetectedPlatform() {
    if (releasesApi && typeof releasesApi.detectPlatform === 'function') {
      const p = releasesApi.detectPlatform(
        navigator.userAgent,
        (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform
      );
      if (p) return p;
    }
    const raw = [
      navigator.userAgentData && navigator.userAgentData.platform,
      navigator.platform,
      navigator.userAgent,
    ].filter(Boolean).join(' ').toLowerCase();

    if (/android/.test(raw)) return 'android';
    if (/windows|win32|win64/.test(raw)) return 'windows';
    if (/macintosh|macintel|mac os x|macos/.test(raw)) return 'macos';
    return '';
  }

  const detected = getDetectedPlatform();
  const initial = knownPlatforms.includes(requested) ? requested : (detected || 'android');

  function updateStatusText(platform, manuallySelected) {
    if (!status) return;
    const labels = {
      android: 'Android · APKs available',
      macos: 'macOS · universal build available',
      windows: 'Windows · installer & zip available',
    };
    status.textContent = manuallySelected || detected ? (labels[platform] || 'Downloads available') : 'Choose a platform to continue';
  }

  function selectPlatform(platform, manuallySelected) {
    tabs.forEach(function (tab) {
      const selected = tab.dataset.os === platform;
      tab.setAttribute('aria-pressed', selected ? 'true' : 'false');
      tab.classList.toggle('device-tab-active', selected);
    });

    panels.forEach(function (panel) {
      const isMatch = panel.dataset.panel === platform;
      panel.hidden = !isMatch;
    });

    updateStatusText(platform, manuallySelected);
  }

  if (tabs.length && panels.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        selectPlatform(tab.dataset.os, true);
      });
    });

    document.querySelectorAll('[data-select-os]').forEach(function (button) {
      button.addEventListener('click', function () {
        selectPlatform(button.dataset.selectOs, true);
        const targetTab = document.querySelector(`[data-os="${button.dataset.selectOs}"]`);
        if (targetTab) targetTab.focus();
      });
    });

    selectPlatform(initial, false);
  }

  // Populate dynamic release data if releases.js is loaded
  if (releasesApi && typeof releasesApi.fetchLatestRelease === 'function') {
    releasesApi.fetchLatestRelease()
      .then(function (release) {
        if (!release) return;

        // Update all version pill text & dates
        document.querySelectorAll('.release-version').forEach(function (el) {
          el.textContent = release.version;
        });
        document.querySelectorAll('.release-date').forEach(function (el) {
          el.textContent = release.date;
        });
        document.querySelectorAll('.release-link').forEach(function (el) {
          el.href = release.htmlUrl;
        });

        // Checksums link
        if (release.checksumsUrl) {
          document.querySelectorAll('.checksum-link').forEach(function (el) {
            el.href = release.checksumsUrl;
          });
        }

        // Android downloads
        if (release.android && release.android.length) {
          const universal = release.android.find(a => a.type === 'universal') || release.android[0];
          if (universal) {
            const sizeEl = document.getElementById('android-universal-size');
            if (sizeEl) sizeEl.innerHTML = `${universal.sizeFormatted} <i>·</i> all architectures`;
            const linkEl = document.getElementById('android-universal-link');
            if (linkEl && releasesApi.isValidDownloadUrl(universal.url)) linkEl.href = universal.url;
            const csEl = document.getElementById('android-universal-checksum');
            if (csEl && universal.sha256) csEl.textContent = universal.sha256;
          }

          const arm64 = release.android.find(a => a.type === 'arm64');
          if (arm64) {
            const sizeEl = document.getElementById('android-arm64-size');
            if (sizeEl) sizeEl.innerHTML = `${arm64.sizeFormatted} <i>·</i> arm64-v8a`;
            const linkEl = document.getElementById('android-arm64-link');
            if (linkEl && releasesApi.isValidDownloadUrl(arm64.url)) linkEl.href = arm64.url;
            const csEl = document.getElementById('android-arm64-checksum');
            if (csEl && arm64.sha256) csEl.textContent = arm64.sha256;
          }
        }

        // macOS downloads
        if (release.macos && release.macos.length) {
          const mac = release.macos[0];
          const sizeEl = document.getElementById('macos-dmg-size');
          if (sizeEl) sizeEl.innerHTML = `${mac.sizeFormatted} <i>·</i> macOS 12.0+`;
          const linkEl = document.getElementById('macos-dmg-link');
          if (linkEl && releasesApi.isValidDownloadUrl(mac.url)) linkEl.href = mac.url;
          const csEl = document.getElementById('macos-dmg-checksum');
          if (csEl && mac.sha256) csEl.textContent = mac.sha256;
        }

        // Windows downloads
        if (release.windows && release.windows.length) {
          const installer = release.windows.find(w => w.type === 'installer');
          const zip = release.windows.find(w => w.type === 'portable') || (installer ? null : release.windows[0]);

          if (installer) {
            const sizeEl = document.getElementById('windows-setup-size');
            if (sizeEl) sizeEl.innerHTML = `${installer.sizeFormatted} <i>·</i> x64`;
            const linkEl = document.getElementById('windows-setup-link');
            if (linkEl && releasesApi.isValidDownloadUrl(installer.url)) linkEl.href = installer.url;
            const csEl = document.getElementById('windows-setup-checksum');
            if (csEl && installer.sha256) csEl.textContent = installer.sha256;
          }

          if (zip) {
            const sizeEl = document.getElementById('windows-zip-size');
            if (sizeEl) sizeEl.innerHTML = `${zip.sizeFormatted} <i>·</i> x64`;
            const linkEl = document.getElementById('windows-zip-link');
            if (linkEl && releasesApi.isValidDownloadUrl(zip.url)) linkEl.href = zip.url;
            const csEl = document.getElementById('windows-zip-checksum');
            if (csEl && zip.sha256) csEl.textContent = zip.sha256;
          }
        }
      })
      .catch(function (err) {
        console.warn('Could not fetch latest release from GitHub API:', err);
        // Fallback: links continue pointing to release defaults
      });
  }
})();
