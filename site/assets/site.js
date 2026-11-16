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

    if (/iphone|ipad|ipod/.test(raw)) return 'ios';
    if (/android/.test(raw)) return 'android';
    if (/windows|win32|win64/.test(raw)) return 'windows';
    if (/macintosh|macintel|mac os x|macos/.test(raw)) return 'macos';
    return '';
  }

  const detected = getDetectedPlatform();
  const knownPlatforms = ['ios', 'macos', 'windows', 'android'];
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
          ios: 'iPhone edition selected',
          macos: 'macOS edition selected',
          windows: 'Windows edition selected',
          android: 'Android edition selected'
        };
        pill.innerHTML = `<span class="dot"></span> ${labels[platform] || 'Platform selected'}`;
      } else if (detected) {
        const labels = {
          ios: 'Detected iPhone — IPA available',
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

    // Hydrate iOS asset
    if (release.ios && release.ios.length) {
      const ipa = release.ios[0];
      const linkEl = document.getElementById('ios-ipa-link');
      if (linkEl && releasesApi.isValidDownloadUrl(ipa.url)) linkEl.href = ipa.url;
      const sizeEl = document.getElementById('ios-ipa-size');
      if (sizeEl) sizeEl.innerHTML = `${ipa.sizeFormatted} <i>·</i> iOS 15+`;
      const csEl = document.getElementById('ios-ipa-checksum');
      if (csEl && ipa.sha256) csEl.textContent = ipa.sha256;
    }

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
  // ---------- Luxury Interactive Micro-Interactions ----------
  // 1. Specular Spotlight Mouse Tracking
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-spotlight]').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // 2. Click-to-Copy Checksums with Haptic Feedback UI
  document.querySelectorAll('code[id$="-checksum"]').forEach(function (codeEl) {
    codeEl.style.cursor = 'pointer';
    codeEl.title = 'Click to copy SHA-256 checksum';
    codeEl.addEventListener('click', function () {
      const text = codeEl.textContent.trim();
      if (!text || text === '...') return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          const original = codeEl.textContent;
          codeEl.textContent = '✓ Copied SHA-256 to clipboard!';
          codeEl.style.color = '#00F59B';
          setTimeout(function () {
            codeEl.textContent = original;
            codeEl.style.color = '';
          }, 2400);
        });
      }
    });
  });

  // 3. Audio Equalizer Live Physics Simulation
  const eqBars = document.querySelectorAll('.eq-bar');
  if (eqBars.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let animFrame;
    function pulseBars() {
      eqBars.forEach(function (bar, i) {
        // Subtle natural audio wave modulation
        const base = Math.sin(Date.now() * 0.003 + i * 0.45);
        const height = Math.max(12, Math.min(74, Math.floor(40 + base * 28 + Math.random() * 8)));
        bar.style.height = `${height}px`;
      });
      animFrame = setTimeout(function () {
        requestAnimationFrame(pulseBars);
      }, 100);
    }
    pulseBars();
  }
  // 4. Interactive Acoustic Studio Audio Synthesizer
  let audioCtx = null;
  let synthGain = null;
  let isSoundActive = false;

  function toggleStudioSound(triggerBtn) {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isSoundActive = !isSoundActive;
    document.body.classList.toggle('is-playing', isSoundActive);

    const playButtons = document.querySelectorAll('.stage-note-play, .wave-play');
    playButtons.forEach(function (btn) {
      btn.textContent = isSoundActive ? '❚❚' : '▶';
    });

    if (isSoundActive) {
      // Warm pentatonic ambient harmonic chord (F#3, A#3, C#4, F#4)
      const freqs = [185.00, 233.08, 277.18, 369.99];
      synthGain = audioCtx.createGain();
      synthGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      synthGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.8);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 1.2);

      synthGain.connect(filter);
      filter.connect(audioCtx.destination);

      freqs.forEach(function (freq, idx) {
        const osc = audioCtx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        // Slight detune for warm analog chorus width
        osc.detune.setValueAtTime((idx - 1.5) * 6, audioCtx.currentTime);

        const oscGain = audioCtx.createGain();
        oscGain.gain.value = 1 / freqs.length;
        osc.connect(oscGain);
        oscGain.connect(synthGain);

        osc.start();
        osc.stop(audioCtx.currentTime + 3.8);
      });

      // Smooth auto fade out
      synthGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.6);
      setTimeout(function () {
        if (isSoundActive) {
          isSoundActive = false;
          document.body.classList.remove('is-playing');
          playButtons.forEach(function (btn) { btn.textContent = '▶'; });
        }
      }, 3800);
    } else {
      if (synthGain) {
        try {
          synthGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        } catch (_) {}
      }
    }
  }

  document.querySelectorAll('.stage-note-play, .wave-play').forEach(function (btn) {
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', 'Listen to sample studio sound');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleStudioSound(btn);
    });
  });
})();
