# Forge for iPhone — Installation Guide

**App:** Forge (`com.lokesh.forge`) · **Version:** 10.6.0+186 · **Minimum iOS:** 15.0 · **iPhone 6s and newer**

---

## 1. Where to download

The app is published on this repository's GitHub Releases page:

**https://github.com/lokesh12dev/Forge/releases**

Download **`Forge.ipa`** from the latest *Forge for iPhone* release.
Open the link in any browser on your computer or on the iPhone itself.

> **Honesty note:** because no Apple Developer Program membership is used, this
> IPA is **unsigned**. Apple does not allow a Home-Screen app to run on an
> iPhone unless it is signed — by Apple (App Store), by a paid developer
> certificate, or by **your own free Apple ID** on your own device. The next
> section signs it with your own Apple ID for free, on your own Mac, in under
> 10 minutes. This is the standard, legitimate path for personal distribution.

---

## 2. Install with your free Apple ID (recommended — AltStore)

### What you need
- A **Mac or Windows PC** (your Mac works — no Xcode required!)
- A **free Apple ID** (any email + password you use for iCloud/App Store)
- An **iPhone** on iOS 15 or newer
- The downloaded `Forge.ipa`
- A USB cable (first install) and later the same Wi-Fi network

### Steps (Mac)
1. Download **AltServer** from https://altstore.io and install it; it lives in your Mac's menu bar.
2. In AltServer's menu: **Install AltStore → iPhone** and sign in with your Apple ID once.
3. Plug the iPhone in with a cable; unlock it and tap **Trust**.
4. On the iPhone: open **AltStore**, then install `Forge.ipa`:
   - AirDrop the file, or open it from Files → share → AltStore.
   - Wait for "Forge" to appear on the Home Screen.
5. IF the app refuses to open: **Settings → General → VPN & Device Management** → find your Apple ID → **Trust**.

### Steps (Windows)
1. Install **Sideloadly** (https://sideloadly.io) or AltServer for Windows.
2. Connect the iPhone by cable, load `Forge.ipa` into it, enter your Apple ID.
3. Wait for the signing and install to finish; trust the developer profile above if asked.

### After install
- 7-day validity timer (AltStore shows it and refreshes it automatically).
- Phone restart does NOT delete the app, but if the certificate expired first, the app won't open until the next refresh.

## 3. Install directly with Xcode (Skip if you don't have Xcode)

For reference only: the full iOS project lives in `ios/` on master; after installing Xcode:
`open ios/Runner.xcworkspace → Run` with your iPhone connected (automatic signing).

---

## 4. Requirements & Restrictions

| Question | Answer |
|---|---|
| Apple account needed | Any **free** Apple ID — never share it anywhere |
| Computer needed | Mac or Windows PC for the first install (AltServer/Sideloadly) |
| App Store account use | Certificate only — app installed via your Mac, not the store |
| iPhone requirement | iOS 15.0+ · iPhone 6s and newer (all modern iPhones) |
| Validity | Free Apple ID = **7 days**, then re-sign is required (AltStore auto-refreshes over Wi-Fi) |
| Works after iPhone restart | Yes, **if** refreshed before expiration |
| Expires | Every 7 days; keep AltStore/AltServer on the same Wi-Fi; tap Refresh in AltStore |
| Max apps at once | 2 or 3 apps per free Apple ID (Apple limit) |
| Data loss on refresh | No — data stays when refreshing; deleting the app deletes local music metadata |

## 5. Updating the app

1. Get any new `Forge.ipa` from Releases.
2. Repeat the same AltStore/Sideloadly steps with the new file (or Refresh-in-AltStore with the updated file).
3. Reinstalls over an existing app preserve library, favourites and settings; deleting removes them.

## 6. Permanent / wider distribution

The free 7-day cycle exists because Apple requires a **$99/year Apple Developer Program** membership for:
- **TestFlight** builds (~90-day installations; up to 10,000 testers)
- **App Store** — permanent installs for anyone
- **Ad-Hoc** signed distributions (90 days per certificate)

This repository's CI (`.github/workflows/ios-release.yml`) can be extended, once paid
Apple credentials exist, to export a proper signed distribution IPA using repository
secrets — without ever handling any password in chat.

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| "Untrusted Enterprise Developer" | Settings → General → VPN & Device Management → trust your Apple ID |
| Installation hangs | Sign out/in of Apple ID in AltServer; different Apple ID; check cable |
| "App install failed" (free Apple ID limit) | Remove one sideloaded app; free Apple IDs can only have a couple of active apps |
| 7-day expiry at inconvenient time | Open AltStore with your Mac running AltServer; press refresh |
| Music won't play | Server URL and extraction sources must be reachable — Settings ▸ platform music endpoints |
| Background playback stops | Settings ▸ enable background audio; keep the Control Centre audio widget visible |

---

*This guide never asks for your Apple ID password in any chat — AltServer/Sideloadly use standard Apple ID sign-in dialogs on your own machine.*
