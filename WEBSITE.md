# Forge website

The standalone, responsive project website lives in `site/`. It is plain HTML, CSS, and JavaScript, so it needs no package installation or build step. The Android download buttons point to the actual v10.6.3 APK release assets. The page also shows the checksums published with that release. macOS and Windows are detected and shown as unavailable because the current official release has no installers for those platforms.

## Preview locally

From the repository root, run:

    python3 -m http.server 4173 --directory site

Then open `http://localhost:4173/` or `http://localhost:4173/download/`.

## Publish on GitHub Pages

The workflow in `.github/workflows/deploy-site.yml` uploads only `site/` and publishes it when website files are pushed to the repository's `master` branch. It can also be run manually from the Actions tab.

1. Push the website files and workflow to `master`.
2. In the GitHub repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
3. Open **Actions → Deploy Forge website** and wait for the run to finish. GitHub Pages will publish the site at `https://lokesh12dev.github.io/Forge/` for this repository.
4. To use a custom domain, add it in **Settings → Pages** and configure the matching DNS records with the domain provider.

The website has no custom domain configured, and it is not live until these repository settings are enabled and the changes are pushed. GitHub Pages requires a public repository on the current owner's GitHub plan, which this public Forge repository supports.

## Release upkeep

The download page is intentionally static. When a new release is published, update its version, release date, asset links, displayed file sizes, minimum Android version if it changes, checksum values, and release notes link in `site/download/index.html`. Copy SHA-256 values directly from that release's `SHA256SUMS.txt`; do not calculate them from an unverified local build. Keep macOS or Windows marked unavailable until an official installer is attached to a Forge release. Then add its verified release URL, version, architecture, file size, checksum, and installation steps.

The screenshots in `site/assets/screenshots/` are the app screenshots already in `docs/screenshots/`. The artwork displayed inside them belongs to the respective rights holders.
