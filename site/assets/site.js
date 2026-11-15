(function () {
  const tabs = Array.from(document.querySelectorAll("[data-os]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));
  if (!tabs.length || !panels.length) return;

  const knownPlatforms = ["android", "macos", "windows"];
  const requested = new URLSearchParams(window.location.search).get("os");
  const browserPlatform = [
    navigator.userAgentData && navigator.userAgentData.platform,
    navigator.platform,
    navigator.userAgent,
  ].filter(Boolean).join(" ").toLowerCase();

  function detectPlatform() {
    if (/android/.test(browserPlatform)) return "android";
    if (/windows/.test(browserPlatform)) return "windows";
    if (/macintosh|macintel|mac os x|macos/.test(browserPlatform)) return "macos";
    return "";
  }

  const detected = detectPlatform();
  const initial = knownPlatforms.includes(requested) ? requested : (detected || "android");
  const status = document.getElementById("device-status");

  function selectPlatform(platform, manuallySelected) {
    tabs.forEach(function (tab) {
      const selected = tab.dataset.os === platform;
      tab.setAttribute("aria-pressed", selected ? "true" : "false");
      tab.classList.toggle("device-tab-active", selected);
    });

    panels.forEach(function (panel) {
      panel.hidden = panel.dataset.panel !== platform;
    });

    if (status) {
      const labels = {
        android: "Android · APKs available",
        macos: "macOS · no installer published yet",
        windows: "Windows · no installer published yet",
      };
      status.textContent = manuallySelected || detected ? labels[platform] : "Choose a platform to continue";
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      selectPlatform(tab.dataset.os, true);
    });
  });

  document.querySelectorAll("[data-select-os]").forEach(function (button) {
    button.addEventListener("click", function () {
      selectPlatform(button.dataset.selectOs, true);
      const androidTab = document.querySelector('[data-os="android"]');
      if (androidTab) androidTab.focus();
    });
  });

  selectPlatform(initial, false);
})();
