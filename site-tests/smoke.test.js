const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const { chromium } = require('playwright');

const SITE_DIR = path.resolve(__dirname, '../site');
const FIXTURE_RELEASE = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'fixtures/desktop_release.json'), 'utf8')
);

// Simple local static file server for clean http:// testing
let server;
let baseUrl;

function startServer() {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/') reqPath = '/index.html';
      if (reqPath.endsWith('/')) reqPath += 'index.html';

      const filePath = path.join(SITE_DIR, reqPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.jpeg': 'image/jpeg',
        '.jpg': 'image/jpeg'
      };

      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (server) server.close(resolve);
    else resolve();
  });
}

test.before(async () => {
  await startServer();
});

test.after(async () => {
  await stopServer();
});

const launchBrowser = async () => {
  return await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });
};

test('Playwright: macOS visitor detects macOS and displays DMG download', async () => {
  const browser = await launchBrowser();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Mock GitHub release API
  await page.route('https://api.github.com/repos/lokesh12dev/Forge/releases/latest', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FIXTURE_RELEASE)
    });
  });

  await page.goto(`${baseUrl}/download/`);
  await page.waitForLoadState('networkidle');

  // Verify macOS tab is selected
  const macTab = page.locator('.device-tab[data-os="macos"]');
  await assert.equal(await macTab.getAttribute('aria-pressed'), 'true');

  // Verify macOS panel is visible
  const macPanel = page.locator('.platform-panel[data-panel="macos"]');
  assert.equal(await macPanel.isVisible(), true);

  // Verify DMG download link and checksum
  const dmgLink = page.locator('#macos-dmg-link');
  assert.equal(
    await dmgLink.getAttribute('href'),
    'https://github.com/lokesh12dev/Forge/releases/download/v10.6.1/Forge-v10.6.1-macos.dmg'
  );

  const checksumText = await page.locator('#macos-dmg-checksum').textContent();
  assert.ok(checksumText.includes('c3d4e5f67890123456789abcdef'));

  await browser.close();
});

test('Playwright: Windows visitor detects Windows and displays installer & zip', async () => {
  const browser = await launchBrowser();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  await page.route('https://api.github.com/repos/lokesh12dev/Forge/releases/latest', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FIXTURE_RELEASE)
    });
  });

  await page.goto(`${baseUrl}/download/`);
  await page.waitForLoadState('networkidle');

  // Verify Windows tab is selected
  const winTab = page.locator('.device-tab[data-os="windows"]');
  assert.equal(await winTab.getAttribute('aria-pressed'), 'true');

  // Verify Windows panel is visible
  const winPanel = page.locator('.platform-panel[data-panel="windows"]');
  assert.equal(await winPanel.isVisible(), true);

  // Verify installer & zip links
  const setupLink = page.locator('#windows-setup-link');
  assert.equal(
    await setupLink.getAttribute('href'),
    'https://github.com/lokesh12dev/Forge/releases/download/v10.6.1/Forge-v10.6.1-windows-setup.exe'
  );

  const zipLink = page.locator('#windows-zip-link');
  assert.equal(
    await zipLink.getAttribute('href'),
    'https://github.com/lokesh12dev/Forge/releases/download/v10.6.1/Forge-v10.6.1-windows-x64.zip'
  );

  await browser.close();
});

test('Playwright: Android visitor detects Android and displays APK downloads', async () => {
  const browser = await launchBrowser();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
  });
  const page = await context.newPage();

  await page.route('https://api.github.com/repos/lokesh12dev/Forge/releases/latest', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FIXTURE_RELEASE)
    });
  });

  await page.goto(`${baseUrl}/download/`);
  await page.waitForLoadState('networkidle');

  // Verify Android tab is selected
  const androidTab = page.locator('.device-tab[data-os="android"]');
  assert.equal(await androidTab.getAttribute('aria-pressed'), 'true');

  const androidPanel = page.locator('.platform-panel[data-panel="android"]');
  assert.equal(await androidPanel.isVisible(), true);

  const universalLink = page.locator('#android-universal-link');
  assert.equal(
    await universalLink.getAttribute('href'),
    'https://github.com/lokesh12dev/Forge/releases/download/v10.6.1/Forge-v10.6.1-universal.apk'
  );

  await browser.close();
});

test('Playwright: API failure degrades gracefully to fallback links', async () => {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  // Mock API returning 500 error
  await page.route('https://api.github.com/repos/lokesh12dev/Forge/releases/latest', async (route) => {
    await route.fulfill({
      status: 500,
      body: 'Internal Server Error'
    });
  });

  await page.goto(`${baseUrl}/download/`);
  await page.waitForLoadState('networkidle');

  // Verify the page still renders properly
  const downloadCard = page.locator('.build-option').first();
  assert.equal(await downloadCard.isVisible(), true);

  // Tab clicking still works
  await page.click('.device-tab[data-os="windows"]');
  const winPanel = page.locator('.platform-panel[data-panel="windows"]');
  assert.equal(await winPanel.isVisible(), true);

  // Fallback release link is intact
  const releaseLink = page.locator('.platform-panel[data-panel="windows"] .release-link');
  assert.ok((await releaseLink.getAttribute('href')).includes('github.com/lokesh12dev/Forge'));

  await browser.close();
});

test('Playwright: responsive layout has 0 horizontal overflow at desktop, tablet, phone', async () => {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  const viewports = [
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'phone', width: 375, height: 667 },
    { name: 'small-phone', width: 320, height: 568 }
  ];

  for (const url of [`${baseUrl}/`, `${baseUrl}/download/`]) {
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth - doc.clientWidth;
      });

      assert.equal(
        overflow,
        0,
        `Expected 0 horizontal overflow on ${url} at ${vp.name} (${vp.width}px), got ${overflow}px`
      );
    }
  }

  await browser.close();
});
