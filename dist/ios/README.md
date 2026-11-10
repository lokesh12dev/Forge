# Forge — iOS Distribution

This folder holds the **actual, verified iPhone application artifacts**.

| File | What it is | Status |
|---|---|---|
| `Forge.ipa` | Real device build (arm64, iPhone) — built by GitHub Actions macOS runner with full Xcode | ✔ downloaded & inspected |
| `BUILD_REPORT.md` | Bundle inspection + signing notes | ✔ generated |

Download page: **https://github.com/lokesh12dev/Forge/releases**

Install guide: see `docs/ios/INSTALL.md` in the repository (also attached to the release).

> This IPA is unsigned — Apple signing requires your own Apple ID at install
> time (free option: AltStore/Sideloadly on this Mac; documented in the guide).
