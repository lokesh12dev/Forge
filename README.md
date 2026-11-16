<div align="center">

<img src="assets/icons/forge_icon.png" width="130" alt="Forge App Icon" />

# 🎵 Forge

### The High-Fidelity, Ad-Free Music Player for Android, iOS, macOS & Windows

**Crafted with passion, precision, and modern software engineering by Lokesh.**

[![Release](https://img.shields.io/github/v/release/lokesh12dev/Forge?color=1DB954&label=Latest%20Release&style=for-the-badge)](https://github.com/lokesh12dev/Forge/releases/latest)
[![Website](https://img.shields.io/badge/Landing%20%26%20Download%20Page-Online-1DB954?style=for-the-badge&logo=googlechrome&logoColor=white)](https://lokesh12dev.github.io/Forge/download/)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge)](LICENSE)
[![Platforms](https://img.shields.io/badge/Platforms-Android%20%7C%20iOS%20%7C%20macOS%20%7C%20Windows-lightgrey?style=for-the-badge)](https://lokesh12dev.github.io/Forge/download/)
[![Flutter](https://img.shields.io/badge/Built%20With-Flutter%20%26%20Dart-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev)

<br />

### 🚀 [**👉 Open Official Landing & Download Portal**](https://lokesh12dev.github.io/Forge/download/)

[**Download Center**](https://lokesh12dev.github.io/Forge/download/) • [**Live Releases**](https://github.com/lokesh12dev/Forge/releases/latest) • [**Report an Issue**](https://github.com/lokesh12dev/Forge/issues) • [**Portfolio**](https://lokesh-online-three.vercel.app/pro) • [**GitHub**](https://github.com/lokesh12dev)

</div>

---

## ⚡ Quick Download Links

Click below to visit the official landing and download portal or download release files directly:

> 🌐 **Interactive Download Portal:** **[https://lokesh12dev.github.io/Forge/download/](https://lokesh12dev.github.io/Forge/download/)**  
> *(Automatically detects your operating system, provides SHA-256 verification hashes, and guides your installation)*

| Platform | Format | Latest download |
| :--- | :--- | :--- |
| 📱 **iOS** | Unsigned iPhone app (`.ipa`) | [Download Forge for iPhone](https://github.com/lokesh12dev/Forge/releases/latest/download/Forge.ipa) · [installation guide](docs/ios/INSTALL.md) |
| 🍏 **macOS** | Universal Disk Image (`.dmg`) · macOS 12.0+ | [Download Forge for macOS](https://github.com/lokesh12dev/Forge/releases/latest/download/Forge-v10.7.3-macos.dmg) |
| 🪟 **Windows** | Setup installer (`.exe`) · x64 | [Download Forge installer](https://github.com/lokesh12dev/Forge/releases/latest/download/Forge-v10.7.3-windows-setup.exe) |
| 🪟 **Windows** | Portable archive (`.zip`) · x64 | [Download portable Forge](https://github.com/lokesh12dev/Forge/releases/latest/download/Forge-v10.7.3-windows-x64.zip) |
| 🤖 **Android** | Universal APK | [Download Forge for Android](https://github.com/lokesh12dev/Forge/releases/latest/download/Forge-v10.7.3-universal.apk) |
| 🤖 **Android** | ARM64 APK | [Download the smaller ARM64 APK](https://github.com/lokesh12dev/Forge/releases/latest/download/Forge-v10.7.3-arm64-v8a.apk) |
| 🔐 **Checksums** | SHA-256 for release files | [Download SHA256SUMS.txt](https://github.com/lokesh12dev/Forge/releases/latest/download/SHA256SUMS.txt) |

---

## 🛠️ Complete Installation Instructions

<details open>
<summary><b>🍏 macOS Installation Guide</b></summary>

1. Download [the latest Forge macOS disk image](https://github.com/lokesh12dev/Forge/releases/latest/download/Forge-v10.7.3-macos.dmg).
2. Double-click the `.dmg` file to open it.
3. Drag **Forge.app** into your **Applications** folder.
4. **First Launch Note:** Because Forge is built independently and unsigned, macOS Gatekeeper may show an untrusted developer prompt. To open:
   - **Right-click** (or `Control + click`) on **Forge.app** in Finder.
   - Select **Open** from the context menu.
   - Click **Open** on the confirmation dialog. Subsequent launches open directly.
</details>

<details open>
<summary><b>📱 iPhone Installation Guide</b></summary>

1. Download the [latest Forge IPA](https://github.com/lokesh12dev/Forge/releases/latest/download/Forge.ipa).
2. Follow the [iPhone installation guide](docs/ios/INSTALL.md) to sign and install it with your Apple ID using AltStore/AltServer or Sideloadly.

The downloadable IPA is unsigned; it is not presented as an App Store-ready install.
</details>

<details open>
<summary><b>🪟 Windows Installation Guide</b></summary>

1. Download the [latest Windows installer](https://github.com/lokesh12dev/Forge/releases/latest/download/Forge-v10.7.3-windows-setup.exe) or [portable ZIP](https://github.com/lokesh12dev/Forge/releases/latest/download/Forge-v10.7.3-windows-x64.zip).
2. Launch the installer or extract the `.zip` archive to your desired directory.
3. **SmartScreen Note:** Windows Defender SmartScreen may display an *"Unknown Publisher"* warning. Click **More info**, then click **Run anyway**.
4. Enjoy high-performance native audio with libmpv integration!
</details>

<details open>
<summary><b>🤖 Android Installation Guide</b></summary>

1. Download the [latest universal Android APK](https://github.com/lokesh12dev/Forge/releases/latest/download/Forge-v10.7.3-universal.apk) on your device.
2. Open the downloaded `.apk` file.
3. If prompted by Android, enable **Install from unknown sources** for your browser or file manager.
4. Tap **Install** and launch Forge.
</details>

---

## 🛡️ Verify Your Download (SHA-256)

Every release publishes verified SHA-256 checksums in `SHA256SUMS.txt`.

**On macOS / Linux:**
```bash
shasum -a 256 -c SHA256SUMS.txt
```

**On Windows (PowerShell):**
```powershell
Invoke-WebRequest https://github.com/lokesh12dev/Forge/releases/latest/download/SHA256SUMS.txt -OutFile SHA256SUMS.txt
Get-Content .\SHA256SUMS.txt
```

---

## 📸 Screenshots

<div align="center">
  <img src="docs/screenshots/home.jpeg" width="380" alt="Forge Home Feed" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/screenshots/now_playing.jpeg" width="380" alt="Forge Now Playing Screen" />
</div>

---

## 🌟 Top-Tier Features

### 🎧 High-Fidelity Audio Architecture
- Native low-latency audio playback pipeline with gapless playback, lock-screen controls, and system media integration across Android, macOS, and Windows.
- Intelligent multi-stream caching ensures smooth playback even under unstable network conditions.

### 🖥️ Pinned "Forge" Desktop Chrome
- **Permanent Top Bar Visibility:** The centered **Forge** brand heading remains razor-sharp and visible when scrolling down, scrolling up, or expanding into full-screen and maximized views.
- **Fluid Multi-View Adaptation:** Side view, minimized view, and maximized full-screen modes dynamically adjust grid cards, spacing, and album textures.

### 🔍 Music-Focused Search Engine
- Powered by official YouTube Music search suggestion endpoints, providing pure song names, artist profiles, and album queries.
- Strict search sanitization automatically filters out generic web search clutter (*download*, *lyrics*, *ringtone*, *whatsapp status*), ensuring clean, music-only discovery.

### 📻 Dynamic Home Feed Experience
- **Quick Access Chips:** Instant one-click playback for Liked Songs, Tamil Hits, Trending Global, and Offline Downloads.
- **New Release Spotlight:** Dedicated artist spotlight featuring cover art, track credits, and instant playback.
- **Albums Featuring Songs You Like:** Textured album cards with smooth hover elevation and circular play buttons.
- **Recents Carousel:** Live personal listening history connected to local storage.
- **Curated Trending Tracks:** Hand-picked trending collections spanning Tamil hits and international releases.

### 📝 Real-Time Synchronized Lyrics
- Accurate real-time LRC synchronized scrolling lyrics with smooth timing and active line highlighting.

### 🔒 Privacy-First & Local Storage
- **100% Local-First:** Playlists, listening history, and downloaded songs reside safely on your device.
- **Zero Tracking:** No telemetry bloat, no mandatory user accounts, and zero third-party tracking scripts.

---

## 🏗️ Architecture & Technologies

Forge is engineered with a modular, reactive architecture:

```
lib/
├── constants/        Design tokens, clients, and app-wide constants
├── database/         Hive-backed local databases (playlists, albums, radio)
├── models/           Strongly-typed immutable data models
├── screens/          Feature screens (Home, About, Search, Library, Now Playing)
├── services/         Playback coordinator, router, lyrics, audio services
├── theme/            Material 3 theme configuration and dark palette tokens
├── utilities/        Formatters, URL launchers, and image caching utilities
└── widgets/          Reusable desktop chrome, cards, bars, and lyric visualizers
```

### 💻 Languages & Frameworks Used
- **Dart & Flutter:** Cross-platform reactive UI, declarative state routing, and multi-platform rendering.
- **C++ & libmpv:** High-performance native audio backend, stream decoding, and Windows runtime bridge.
- **Swift & Objective-C:** macOS native runner, ad-hoc codesigning configuration, and system audio integration.
- **JavaScript, HTML & CSS:** Official Forge release portal, release API integration, responsive layout design, and Playwright verification.
- **Python:** Desktop startup performance analysis, automated icon verification, and static link checking.
- **GitHub Actions & CI/CD:** Automated multi-platform build matrices (macOS & Windows runners), Inno Setup installer compilation, and DMG packaging.

---

## 👨‍💻 Creator & Engineering Journey

<div align="center">

### Built with Passion & Relentless Dedication by **Lokesh**

[![Portfolio](https://img.shields.io/badge/Portfolio-Lokesh%20Online-1DB954?style=for-the-badge&logo=googlechrome&logoColor=white)](https://lokesh-online-three.vercel.app/pro)
[![GitHub](https://img.shields.io/badge/GitHub-lokesh12dev-24292E?style=for-the-badge&logo=github&logoColor=white)](https://github.com/lokesh12dev)

</div>

> *"Building Forge has been an intense, relentless journey of personal dedication, passion, and countless hours of deep focus. What started as an ambitious vision evolved through endless nights of debugging complex native audio pipelines, optimizing platform-specific rendering, and solving challenging cross-platform audio hurdles across Linux, macOS, and Windows.*  
>  
> *Every single line of code, every UI animation, every CI/CD workflow, and every asset packaging pipeline was shaped by patience, persistence, and continuous self-learning. All work in this application was designed and engineered by Lokesh, fueled by an uncompromising standard for craft and an enduring belief in building software that people truly love to use."*

---

## 🔨 Building From Source

### Prerequisites
- Flutter 3.47.7+ (stable channel)
- Dart 3.13+
- Java 17+ & Android SDK 36 (for Android)
- Xcode 15+ (for macOS)
- Visual Studio 2022 with C++ Desktop Workload (for Windows)

```bash
# Clone the repository
git clone https://github.com/lokesh12dev/Forge.git
cd Forge

# Fetch dependencies
flutter pub get

# Run static analysis
flutter analyze --no-fatal-infos

# Run unit tests
flutter test

# Build for your platform
flutter build macos --release       # macOS
flutter build windows --release     # Windows
flutter build apk --release         # Android
```

---

## 🆕 Changelog

### v10.7.5 — Header banner is now colorless with a green Forge wordmark only.*
- Header banner is now colorless with a green Forge wordmark only.

### v10.7.3 — UPI sponsorship repair *(Latest)*
- Opens the in-app sponsor dialog with bundled Google Pay and PhonePe QR codes.
- Mobile taps launch the standard UPI payment intent after the dialog is visible.
- macOS and Windows open the Forge Pay portal once while keeping the QR dialog available.
- Removed the unrelated external fundraising profile and its announcement handling.
- Removed machine-specific QR image fallback paths so the bundled images work on every install.

---

## 📄 License

Forge is licensed under the [GNU General Public License v3.0](LICENSE).  
Engineered with ❤️ by **Lokesh**.
