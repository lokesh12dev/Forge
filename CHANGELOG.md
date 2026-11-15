# Changelog

All notable changes to Forge are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [10.7.0] — 2026-11-15

### Added

- **One-click UPI payment on Android**: tapping "Sponsor the project" in
  Settings now launches Google Pay / PhonePe / any UPI app directly — no extra
  steps required.
- **One-click payment portal on macOS & Windows**: tapping the same button on
  desktop instantly opens the Forge Pay website in your default browser.
- **GitHub Repository shortcut** added to Settings → Others for fast access to
  the source code.
- **Support & GitHub links** added to the navigation bar on the Forge website
  and Download Center.

### Fixed

- `url_launcher` on macOS no longer silently fails; external links now try
  `LaunchMode.externalApplication` and fall back automatically.
- Horizontal overflow on the website fixed at all viewport sizes (320 px –
  1 920 px), verified by Playwright.
- `body::before` atmosphere gradient no longer causes a 14 px scrollbar
  bleed on desktop browsers.

### macOS Install Note

> macOS will show a security warning on first launch because Forge is
> ad-hoc signed (not notarized). To open it:
>
> 1. Right-click **Forge.app** in Applications → choose **Open**.
> 2. Click **Open** in the dialog that appears.
> 3. Forge opens normally from then on — no repeat prompt.
>
> Alternatively: **System Settings → Privacy & Security → Open Anyway**.

## [10.6.0] — 2026-11-05

### Added

- Spotify-inspired dark UI built on Material 3, with an accent-green palette
  and neutral dark surfaces.
- Responsive desktop shell for windows and tablets at widths ≥ 900 px,
  including a sidebar and now-playing bar.
- Pure black theme option for OLED displays.
- Theme mode, accent color, audio quality, and equalizer controls in Settings.
- Arm64 and universal signed APK releases served from GitHub Releases.
- `SHA256SUMS.txt` checksums published with every release.
- In-app update check that reads GitHub Releases and picks the build that
  matches the device architecture.

### Changed

- Fluent icon usage on the main navigation and Settings screens replaced with
  Material icons.
- Dark theme is now the default for new installs.
- Startup work overlaps app-directory resolution with audio-service setup,
  and dynamic color is only queried when the option is enabled.
- Release builds are signed with the Forge release key; unsigned local
  builds fall back to debug signing for testing only.

### Fixed

- Update checks now point at the correct repository and no longer require the
  legacy `check.json` endpoint.
- Proxy fallback attempts are bounded so a failed stream resolution no longer
  leaves the player stuck for an extended period.

## [10.5.0] and earlier

See the commit history and the GitHub Releases page for notes on earlier
versions.
