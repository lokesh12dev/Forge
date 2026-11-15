/*
 * Forge official website interaction and release hydration module.
 */
(function () {
  'use strict';

  const releasesApi = typeof window !== 'undefined' && window.ForgeReleases ? window.ForgeReleases : null;

  // ---------- Navigation & Sticky Header ----------
  const siteNav = document.querySelector('.site-nav');
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (siteNav) {
    const handleScroll = function () {
      if (window.scrollY > 12) {
        siteNav.classList.add('is-scrolled');
      } else {
        siteNav.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !expanded);
      mobileMenu.hidden = expanded;
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.hidden = true;
      });
    });
  }

  // ---------- Scroll Reveal Animations ----------
  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // ---------- Platform Detection & Download Selector ----------
  const tabs = Array.from(document.querySelectorAll('.device-tab'));
  const panels = Array.from(document.querySelectorAll('.platform-panel'));
  const detectPills = document.querySelectorAll('[data-detect-pill]');

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
      navigator.userAgent
    ].filter(Boolean).join(' ').toLowerCase();

    if (/android/.test(raw)) return 'android';
    if (/windows|win32|win64/.test(raw)) return 'windows';
    if (/macintosh|macintel|mac os x|macos/.test(raw)) return 'macos';
    return '';
  }

  const detected = getDetectedPlatform();
  const knownPlatforms = ['macos', 'windows', 'android'];
  const urlParam = new URLSearchParams(window.location.search).get('os');
  const initialPlatform = knownPlatforms.includes(urlParam) ? urlParam : (detected || 'macos');

  function selectPlatform(platform, userInitiated) {
    tabs.forEach(function (tab) {
      const isSelected = tab.dataset.os === platform;
      tab.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      tab.classList.toggle('is-active', isSelected);
    });

    panels.forEach(function (panel) {
      const isMatch = panel.dataset.panel === platform;
      panel.hidden = !isMatch;
    });

    detectPills.forEach(function (pill) {
      if (userInitiated) {
        const labels = {
          macos: 'macOS edition selected',
          windows: 'Windows edition selected',
          android: 'Android edition selected'
        };
        pill.innerHTML = `<span class="dot"></span> ${labels[platform] || 'Platform selected'}`;
      } else if (detected) {
        const labels = {
          macos: 'Detected macOS — universal build ready',
          windows: 'Detected Windows — setup & zip ready',
          android: 'Detected Android — universal & arm64 ready'
        };
        pill.innerHTML = `<span class="dot"></span> ${labels[detected] || 'Select your OS below'}`;
      } else {
        pill.innerHTML = '<span class="dot"></span> Choose your OS below';
      }
    });
  }

  if (tabs.length && panels.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        selectPlatform(tab.dataset.os, true);
      });
    });

    document.querySelectorAll('[data-select-os]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const target = btn.dataset.selectOs;
        selectPlatform(target, true);
        const targetTab = document.querySelector(`.device-tab[data-os="${target}"]`);
        if (targetTab) {
          targetTab.focus();
          targetTab.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });

    selectPlatform(initialPlatform, false);
  }

  // ---------- Release Data Hydration ----------
  function hydrateReleaseUI(release) {
    if (!release) return;

    // Version text and release links
    document.querySelectorAll('.release-version').forEach(function (el) {
      el.textContent = release.version;
    });
    document.querySelectorAll('.release-date').forEach(function (el) {
      el.textContent = release.date;
    });
    document.querySelectorAll('.release-notes-link').forEach(function (el) {
      el.href = release.htmlUrl;
    });

    if (release.checksumsUrl) {
      document.querySelectorAll('.checksum-file-link').forEach(function (el) {
        el.href = release.checksumsUrl;
      });
    }

    // Hydrate macOS asset
    if (release.macos && release.macos.length) {
      const mac = release.macos[0];
      const linkEl = document.getElementById('macos-dmg-link');
      if (linkEl && releasesApi.isValidDownloadUrl(mac.url)) linkEl.href = mac.url;
      const sizeEl = document.getElementById('macos-dmg-size');
      if (sizeEl) sizeEl.innerHTML = `${mac.sizeFormatted} <i>·</i> universal (Apple Silicon & Intel)`;
      const csEl = document.getElementById('macos-dmg-checksum');
      if (csEl && mac.sha256) csEl.textContent = mac.sha256;
    }

    // Hydrate Windows assets
    if (release.windows && release.windows.length) {
      const installer = release.windows.find(w => w.type === 'installer');
      const zip = release.windows.find(w => w.type === 'portable') || (installer ? null : release.windows[0]);

      if (installer) {
        const linkEl = document.getElementById('windows-setup-link');
        if (linkEl && releasesApi.isValidDownloadUrl(installer.url)) linkEl.href = installer.url;
        const sizeEl = document.getElementById('windows-setup-size');
        if (sizeEl) sizeEl.innerHTML = `${installer.sizeFormatted} <i>·</i> x64 setup`;
        const csEl = document.getElementById('windows-setup-checksum');
        if (csEl && installer.sha256) csEl.textContent = installer.sha256;
      }

      if (zip) {
        const linkEl = document.getElementById('windows-zip-link');
        if (linkEl && releasesApi.isValidDownloadUrl(zip.url)) linkEl.href = zip.url;
        const sizeEl = document.getElementById('windows-zip-size');
        if (sizeEl) sizeEl.innerHTML = `${zip.sizeFormatted} <i>·</i> x64 portable zip`;
        const csEl = document.getElementById('windows-zip-checksum');
        if (csEl && zip.sha256) csEl.textContent = zip.sha256;
      }
    }

    // Hydrate Android assets
    if (release.android && release.android.length) {
      const universal = release.android.find(a => a.type === 'universal') || release.android[0];
      if (universal) {
        const linkEl = document.getElementById('android-universal-link');
        if (linkEl && releasesApi.isValidDownloadUrl(universal.url)) linkEl.href = universal.url;
        const sizeEl = document.getElementById('android-universal-size');
        if (sizeEl) sizeEl.innerHTML = `${universal.sizeFormatted} <i>·</i> all architectures`;
        const csEl = document.getElementById('android-universal-checksum');
        if (csEl && universal.sha256) csEl.textContent = universal.sha256;
      }

      const arm64 = release.android.find(a => a.type === 'arm64');
      if (arm64) {
        const linkEl = document.getElementById('android-arm64-link');
        if (linkEl && releasesApi.isValidDownloadUrl(arm64.url)) linkEl.href = arm64.url;
        const sizeEl = document.getElementById('android-arm64-size');
        if (sizeEl) sizeEl.innerHTML = `${arm64.sizeFormatted} <i>·</i> arm64-v8a`;
        const csEl = document.getElementById('android-arm64-checksum');
        if (csEl && arm64.sha256) csEl.textContent = arm64.sha256;
      }
    }
  }

  // Hydrate with verified fallback snapshot immediately so the page is instant and complete
  if (releasesApi && releasesApi.FALLBACK_RELEASE) {
    hydrateReleaseUI(releasesApi.FALLBACK_RELEASE);
  }

  // Live API fetch to pick up future releases automatically
  if (releasesApi && typeof releasesApi.fetchLatestRelease === 'function') {
    releasesApi.fetchLatestRelease()
      .then(function (liveRelease) {
        if (liveRelease) {
          hydrateReleaseUI(liveRelease);
        }
      })
      .catch(function (err) {
        console.info('Forge download portal: serving static fallback release.', err && err.message);
      });
  }

  // Live GitHub repo stats (stars, forks, open issues)
  if (releasesApi && typeof releasesApi.fetchRepoStats === 'function') {
    releasesApi.fetchRepoStats()
      .then(function (stats) {
        if (!stats) return;
        const starsEl = document.getElementById('gh-stars-count');
        const forksEl = document.getElementById('gh-forks-count');
        const issuesEl = document.getElementById('gh-issues-count');
        if (starsEl && typeof stats.stars === 'number') starsEl.textContent = stats.stars.toLocaleString();
        if (forksEl && typeof stats.forks === 'number') forksEl.textContent = stats.forks.toLocaleString();
        if (issuesEl && typeof stats.issues === 'number') issuesEl.textContent = stats.issues.toLocaleString();
      })
      .catch(function () {
        // Silent fallback — static values in HTML remain
      });
  }
})();
