(function () {
  const tabs = Array.from(document.querySelectorAll("[data-os]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      nav.classList.toggle("is-open", open);
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
      }
    });
  }

  if (!tabs.length || !panels.length) return;

  const ownerRepo = "lokesh12dev/Forge";
  const apiUrl = "https://api.github.com/repos/" + ownerRepo + "/releases?per_page=100";
  const requested = new URLSearchParams(window.location.search).get("os");
  const platformString = [
    navigator.userAgentData && navigator.userAgentData.platform,
    navigator.platform,
    navigator.userAgent,
  ].filter(Boolean).join(" ").toLowerCase();

  function detectPlatform() {
    if (/android/.test(platformString)) return "android";
    if (/windows/.test(platformString)) return "windows";
    if (/macintosh|macintel|mac os x|macos/.test(platformString)) return "macos";
    if (/linux|x11/.test(platformString)) return "linux";
    return "";
  }

  const detected = detectPlatform();
  const initial = tabs.some(function (tab) { return tab.dataset.os === requested; })
    ? requested
    : (detected || "android");
  const status = document.getElementById("device-status");
  const platformNames = { android: "Android", macos: "Mac", windows: "Windows", linux: "Linux" };

  function selectPlatform(platform) {
    tabs.forEach(function (tab) {
      const selected = tab.dataset.os === platform;
      tab.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    panels.forEach(function (panel) { panel.hidden = panel.dataset.panel !== platform; });
    if (status) {
      status.textContent = detected
        ? "Detected " + (platformNames[detected] || "your device")
        : "Choose a platform";
    }
    const url = new URL(window.location.href);
    url.searchParams.set("os", platform);
    window.history.replaceState({}, "", url);
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () { selectPlatform(tab.dataset.os); });
  });
  selectPlatform(initial);

  function formatSize(bytes) {
    if (!bytes || !Number.isFinite(Number(bytes))) return "Official release file";
    const megabytes = Number(bytes) / (1024 * 1024);
    return megabytes < 10 ? megabytes.toFixed(1) + " MB" : Math.round(megabytes) + " MB";
  }

  function setAssetList(platform, release, version) {
    const container = document.querySelector('.desktop-assets[data-platform="' + platform + '"]');
    const statusLabel = document.querySelector('[data-panel="' + platform + '"] [data-platform-status]');
    if (!container) return;
    const map = {
      macos: [
        ["macos-arm64", "Apple silicon", "Forge-v" + version + "-macos-arm64.dmg"],
        ["macos-x64", "Intel", "Forge-v" + version + "-macos-x64.dmg"],
      ],
      windows: [["windows-x64", "64-bit · x64", "Forge-v" + version + "-windows-x64-setup.exe"]],
      linux: [["linux-x64", "64-bit · x86", "Forge-v" + version + "-linux-x64.tar.gz"]],
    }[platform];
    const found = map.map(function (item) {
      return { label: item[1], asset: (release.assets || []).find(function (asset) { return asset.name === item[2]; }) };
    }).filter(function (item) { return item.asset && item.asset.browser_download_url; });

    if (!found.length) {
      if (statusLabel) {
        statusLabel.textContent = "NO " + platformNames[platform].toUpperCase() + " BUILD PUBLISHED";
        statusLabel.dataset.state = "unavailable";
      }
      const empty = document.createElement("div");
      empty.className = "asset-empty";
      const heading = document.createElement("b");
      heading.textContent = "No " + platformNames[platform] + " installer in this release yet.";
      const link = document.createElement("a");
      link.href = "https://github.com/" + ownerRepo + "/releases";
      link.textContent = "Browse official releases ↗";
      link.target = "_blank";
      link.rel = "noreferrer";
      empty.append(heading, document.createTextNode("Downloads appear here only when a release includes the matching installer."), link);
      container.replaceChildren(empty);
      return;
    }
    if (statusLabel) {
      statusLabel.textContent = "DESKTOP PREVIEW · " + (release.tag_name || "").replace(/^desktop-/, "").toUpperCase();
      statusLabel.dataset.state = "available";
    }
    container.replaceChildren();
    found.forEach(function (item) {
      const card = document.createElement("div");
      card.className = "asset-card";
      const info = document.createElement("div");
      const title = document.createElement("p");
      title.className = "asset-title";
      title.textContent = item.label;
      const detail = document.createElement("p");
      detail.className = "asset-detail";
      detail.textContent = formatSize(item.asset.size) + " · Forge desktop preview";
      const link = document.createElement("a");
      link.className = "asset-download";
      link.href = item.asset.browser_download_url;
      link.textContent = platform === "linux" ? "Download bundle ↓" : "Download ↓";
      link.setAttribute("aria-label", "Download Forge for " + item.label);
      info.append(title, detail);
      card.append(info, link);
      container.append(card);
    });
    const checksum = (release.assets || []).find(function (asset) { return asset.name === "SHA256SUMS.txt" && asset.browser_download_url; });
    const checksumContainer = document.querySelector('[data-checksum-platform="' + platform + '"]');
    if (checksumContainer && checksum) {
      const label = document.createElement("span");
      label.textContent = "SHA-256 checksums";
      const link = document.createElement("a");
      link.href = checksum.browser_download_url;
      link.textContent = "Open the published checksum file ↗";
      checksumContainer.replaceChildren(label, link);
    }
  }

  function setAndroidRelease(release) {
    if (!release || !Array.isArray(release.assets)) return;
    const universal = release.assets.find(function (asset) { return /-universal\.apk$/i.test(asset.name); });
    const arm64 = release.assets.find(function (asset) { return /-arm64-v8a\.apk$/i.test(asset.name); });
    const versionNode = document.querySelector("[data-release-version]");
    const notes = document.querySelector("[data-release-notes]");
    if (versionNode) versionNode.textContent = release.tag_name;
    if (notes) notes.href = release.html_url;
    const releaseDate = document.querySelector("[data-release-date]");
    if (releaseDate && release.published_at) {
      releaseDate.textContent = " · " + new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(release.published_at));
    }
    const checksum = release.assets.find(function (asset) { return /SHA256SUMS\.txt$/i.test(asset.name); });
    const checksumLink = document.querySelector("[data-checksum]");
    if (checksum && checksumLink) checksumLink.href = checksum.browser_download_url;
    if (release.tag_name !== "v10.6.1") {
      document.querySelectorAll("[data-checksum-value]").forEach(function (value) {
        const row = value.closest(".checksum-line");
        if (row) row.remove();
      });
    }
    [[universal, "universal"], [arm64, "arm64-v8a"]].forEach(function (entry) {
      const asset = entry[0];
      if (!asset) return;
      const link = document.querySelector('[data-asset="' + asset.name + '"]');
      if (link) link.href = asset.browser_download_url;
      const size = document.querySelector('[data-size-for="' + entry[1] + '"]');
      if (size) size.textContent = formatSize(asset.size);
    });
  }

  function showReleaseFallback(platform, message) {
    const statusLabel = document.querySelector('[data-panel="' + platform + '"] [data-platform-status]');
    const container = document.querySelector('.desktop-assets[data-platform="' + platform + '"]');
    if (statusLabel) {
      statusLabel.textContent = message;
      statusLabel.dataset.state = "unavailable";
    }
    if (!container) return;
    const empty = document.createElement("div");
    empty.className = "asset-empty";
    const heading = document.createElement("b");
    heading.textContent = "Desktop preview files are checked against official releases.";
    const link = document.createElement("a");
    link.href = "https://github.com/" + ownerRepo + "/releases";
    link.textContent = "Browse official releases ↗";
    link.target = "_blank";
    link.rel = "noreferrer";
    empty.append(heading, document.createTextNode("If this list does not load, check the project’s release page directly."), link);
    container.replaceChildren(empty);
  }

  fetch(apiUrl, { headers: { Accept: "application/vnd.github+json" } })
    .then(function (response) {
      if (!response.ok) throw new Error("Release listing is not available");
      return response.json();
    })
    .then(function (releases) {
      if (!Array.isArray(releases)) return;
      const stable = releases.find(function (release) {
        return !release.draft && !release.prerelease && /^v\d+\.\d+\.\d+/.test(release.tag_name || "");
      });
      setAndroidRelease(stable);
      const desktop = releases.filter(function (release) {
        return !release.draft && release.prerelease && /^desktop-v\d+\.\d+\.\d+-preview\./.test(release.tag_name || "");
      }).sort(function (a, b) { return new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at); })[0];
      if (!desktop) {
        ["macos", "windows", "linux"].forEach(function (platform) { showReleaseFallback(platform, "NO DESKTOP PREVIEW PUBLISHED"); });
        return;
      }
      const versionMatch = desktop.tag_name.match(/^desktop-v(\d+\.\d+\.\d+)-preview\./);
      if (!versionMatch) return;
      ["macos", "windows", "linux"].forEach(function (platform) {
        setAssetList(platform, desktop, versionMatch[1]);
      });
    })
    .catch(function () {
      ["macos", "windows", "linux"].forEach(function (platform) { showReleaseFallback(platform, "COULDN’T CHECK RELEASES"); });
      // Known, verified Android v10.6.1 links stay available. Desktop stays unlinked until GitHub confirms actual assets.
    });
})();
