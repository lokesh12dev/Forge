# Forge website

The official website lives in `site/`. It is plain HTML, CSS, and JavaScript with no build step and no runtime dependencies. It consists of two pages:

- `site/index.html` — the landing page: hero, three platform editions, feature highlights, authentic app screenshots, open-source promise.
- `site/download/index.html` — the download portal: platform selector with automatic OS detection, per-platform build lists with verified download links, SHA-256 checksum drawers, platform-specific installation guides, FAQ.

All download links point to official GitHub release assets under `https://github.com/lokesh12dev/Forge/releases/download/`. Checksums are the official values published in each release's `SHA256SUMS.txt`. File sizes are shown in binary megabytes (as computed from the exact release asset byte sizes).

## Design system

- Obsidian graphite background with soft-white text and a single accent green (`#29e08c`) shared with the app's Material 3 theme.
- Self-hosted fonts in `site/assets/fonts/`: Paytone One (the app's wordmark font, OFL licensed) for brand headings and Inter Variable for body text. No external font CDN requests.
- Platform icons are inline SVGs (Apple, Windows, Android) so they render identically on every operating system.
- Scroll-reveal animations use `IntersectionObserver`; they are disabled under `prefers-reduced-motion`, and page content is never hidden if JavaScript fails to load (the `html.js` class gates the initial hidden state).

## Release data

`site/assets/releases.js` is the download engine. It exposes a small UMD API (`ForgeReleases`) used by `site/assets/site.js` and pinned by `site-tests/releases.test.js`:

- `FALLBACK_RELEASE` — a verified static snapshot of the current release (version, date, asset URLs, byte sizes, SHA-256 checksums). The page hydrates from this instantly, so it is complete even if the GitHub API is unreachable.
- `fetchLatestRelease()` — fetches `https://api.github.com/repos/lokesh12dev/Forge/releases/latest` and, on success, re-hydrates the page so future releases appear automatically without a site change. Drafts, prereleases, and assets with non-official download URLs are rejected; API failures fall back silently to the static snapshot.
- `classifyRelease()`, `isValidDownloadUrl()`, `formatBytes()`, `formatDate()`, `extractSha256()`, `detectPlatform()` — parsing and platform-detection helpers, all unit-tested.

## Preview locally

From the repository root, run:

    python3 -m http.server 4173 --directory site

Then open `http://localhost:4173/` or `http://localhost:4173/download/`.

## Quality checks

`site-tests/` contains the test suites. With Node.js installed (Playwright uses the system Chrome):

    cd site-tests
    node --test

This runs the Playwright smoke tests (platform detection per simulated OS, download link integrity, graceful API-failure fallback, zero horizontal overflow at desktop/tablet/phone/320px widths) and the `releases.js` unit tests against recorded release fixtures.

For a fast static check (link targets, local asset paths, required meta tags):

    python3 site-tests/check_site.py

## Publish on GitHub Pages

The workflow in `.github/workflows/deploy-site.yml` uploads only `site/` and publishes it when website files are pushed to the repository's `master` branch. It can also be run manually from the Actions tab.

1. Push the website files to `master`.
2. In the GitHub repository, confirm **Settings → Pages → Build and deployment → Source** is set to **GitHub Actions**.
3. Open **Actions → Deploy Forge website** and wait for the run to finish. The site publishes at `https://lokesh12dev.github.io/Forge/`.

## Release upkeep

The download portal hydrates from the GitHub API at view time, so new releases appear automatically once published. To keep the no-JavaScript/API-offline experience accurate, also refresh the static snapshot in `site/assets/releases.js` (`FALLBACK_RELEASE`) when a release ships:

1. Copy the asset names, `browser_download_url`s, byte sizes, and SHA-256 digests from the release and its official `SHA256SUMS.txt` — never compute checksums from an unverified local build.
2. Update `FALLBACK_RELEASE` (version, ISO date, per-platform assets, `checksumsUrl`) and the initial size/version/date text in `site/download/index.html`.
3. Run the checks above; `classifyRelease` tests pin the parsing behavior.

Platform facts (minimum OS versions, architectures, signing/Gatekeeper/SmartScreen guidance) should match the release notes and the README installation guides.

## Assets

- `site/assets/screenshots/` — the two authentic Android app screenshots (also in `docs/screenshots/`). `home.jpeg` shows the Home feed and `player.jpeg` shows the Now Playing screen. Artwork displayed inside the screenshots belongs to the respective rights holders.
- `site/assets/social-card.jpg` — the 1200×630 open-graph/social card referenced by both pages' `og:image` and `twitter:image` meta tags.
- `site/assets/forge-icon.png` — the app icon, used as the favicon and (via CSS mask) the nav brand mark.
