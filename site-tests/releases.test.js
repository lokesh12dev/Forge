const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  ALLOWED_URL_PREFIX,
  isValidDownloadUrl,
  formatBytes,
  formatDate,
  extractSha256,
  classifyRelease,
  fetchLatestRelease,
  detectPlatform
} = require('../site/assets/releases.js');

test('isValidDownloadUrl validates official GitHub release URLs strictly', () => {
  assert.equal(
    isValidDownloadUrl('https://github.com/lokesh12dev/Forge/releases/download/v10.6.1/Forge-v10.6.1-universal.apk'),
    true
  );
  assert.equal(
    isValidDownloadUrl('https://github.com/lokesh12dev/Forge/releases/download/v10.6.1/Forge-v10.6.1-macos.dmg'),
    true
  );
  assert.equal(
    isValidDownloadUrl('https://github.com/lokesh12dev/Forge/releases/download/v10.6.1/Forge-v10.6.1-windows-x64.zip'),
    true
  );

  // Reject invalid, phishing, or non-GitHub URLs
  assert.equal(isValidDownloadUrl('https://malicious.site/Forge.apk'), false);
  assert.equal(isValidDownloadUrl('https://github.com/attacker/Forge/releases/download/v10.6.1/Forge.apk'), false);
  assert.equal(isValidDownloadUrl('http://github.com/lokesh12dev/Forge/releases/download/v10.6.1/Forge.apk'), false);
  assert.equal(isValidDownloadUrl('javascript:alert(1)'), false);
  assert.equal(isValidDownloadUrl(null), false);
  assert.equal(isValidDownloadUrl(undefined), false);
  assert.equal(isValidDownloadUrl(123), false);
});

test('formatBytes formats bytes to readable megabytes', () => {
  assert.equal(formatBytes(13007188), '12.4 MB');
  assert.equal(formatBytes(32961083), '31.4 MB');
  assert.equal(formatBytes(0), '0 MB');
  assert.equal(formatBytes(null), '0 MB');
});

test('formatDate formats ISO dates to "DD Mon YYYY"', () => {
  assert.equal(formatDate('2026-11-10T10:31:41Z'), '10 Nov 2026');
  assert.equal(formatDate('2026-01-05T00:00:00Z'), '5 Jan 2026');
  assert.equal(formatDate('invalid-date'), '');
});

test('extractSha256 extracts digest value correctly', () => {
  assert.equal(
    extractSha256('sha256:c7a10d7b6fffba00d8b4ffbc462d783fbeae0cd8274822de37d561bc2b2518c3'),
    'c7a10d7b6fffba00d8b4ffbc462d783fbeae0cd8274822de37d561bc2b2518c3'
  );
  assert.equal(
    extractSha256('c7a10d7b6fffba00d8b4ffbc462d783fbeae0cd8274822de37d561bc2b2518c3'),
    'c7a10d7b6fffba00d8b4ffbc462d783fbeae0cd8274822de37d561bc2b2518c3'
  );
  assert.equal(extractSha256(null), '');
});

test('classifyRelease correctly parses the real v10.6.1 release fixture', () => {
  const fixturePath = path.resolve(__dirname, 'fixtures/v10.6.1.json');
  const raw = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

  const result = classifyRelease(raw);
  assert.ok(result);
  assert.equal(result.version, 'v10.6.1');
  assert.equal(result.versionClean, '10.6.1');
  assert.equal(result.date, '10 Nov 2026');
  assert.equal(result.android.length, 2);
  assert.equal(result.macos.length, 0);
  assert.equal(result.windows.length, 0);

  const universal = result.android.find(a => a.type === 'universal');
  assert.ok(universal);
  assert.equal(universal.recommended, true);
  assert.equal(universal.sha256, '494c78ab890e948c8c7f86d2081c68a645dda375087b06b50e8543a0b0382bbb');
  assert.equal(universal.url, 'https://github.com/lokesh12dev/Forge/releases/download/v10.6.1/Forge-v10.6.1-universal.apk');

  const arm64 = result.android.find(a => a.type === 'arm64');
  assert.ok(arm64);
  assert.equal(arm64.sha256, 'c7a10d7b6fffba00d8b4ffbc462d783fbeae0cd8274822de37d561bc2b2518c3');
  assert.equal(arm64.url, 'https://github.com/lokesh12dev/Forge/releases/download/v10.6.1/Forge-v10.6.1-arm64-v8a.apk');

  assert.equal(result.checksumsUrl, 'https://github.com/lokesh12dev/Forge/releases/download/v10.6.1/SHA256SUMS.txt');
});

test('classifyRelease correctly parses desktop release fixture with Mac & Windows', () => {
  const fixturePath = path.resolve(__dirname, 'fixtures/desktop_release.json');
  const raw = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

  const result = classifyRelease(raw);
  assert.ok(result);
  assert.equal(result.version, 'v10.6.1');
  assert.equal(result.android.length, 2);
  assert.equal(result.macos.length, 1);
  assert.equal(result.windows.length, 2);

  const macAsset = result.macos[0];
  assert.equal(macAsset.name, 'Forge-v10.6.1-macos.dmg');
  assert.equal(macAsset.type, 'dmg');
  assert.equal(macAsset.recommended, true);
  assert.equal(macAsset.url, 'https://github.com/lokesh12dev/Forge/releases/download/v10.6.1/Forge-v10.6.1-macos.dmg');
  assert.equal(macAsset.sha256, 'c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef012');

  const winInstaller = result.windows.find(w => w.type === 'installer');
  assert.ok(winInstaller);
  assert.equal(winInstaller.name, 'Forge-v10.6.1-windows-setup.exe');
  assert.equal(winInstaller.recommended, true);
  assert.equal(winInstaller.sha256, 'b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01');

  const winZip = result.windows.find(w => w.type === 'portable');
  assert.ok(winZip);
  assert.equal(winZip.name, 'Forge-v10.6.1-windows-x64.zip');
  assert.equal(winZip.sha256, 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0');
});

test('classifyRelease ignores drafts and prereleases', () => {
  assert.equal(classifyRelease({ draft: true, tag_name: 'v1.0.0', assets: [] }), null);
  assert.equal(classifyRelease({ prerelease: true, tag_name: 'v1.0.0', assets: [] }), null);
});

test('classifyRelease ignores non-GitHub download URLs in assets', () => {
  const fakeRelease = {
    tag_name: 'v1.0.0',
    assets: [
      {
        name: 'evil.exe',
        browser_download_url: 'https://evil.com/download/evil.exe',
        size: 1000,
        digest: 'sha256:123456'
      },
      {
        name: 'Forge-v1.0.0-windows-x64.zip',
        browser_download_url: 'https://github.com/lokesh12dev/Forge/releases/download/v1.0.0/Forge-v1.0.0-windows-x64.zip',
        size: 2000,
        digest: 'sha256:abcdef'
      }
    ]
  };

  const classified = classifyRelease(fakeRelease);
  assert.equal(classified.windows.length, 1);
  assert.equal(classified.windows[0].name, 'Forge-v1.0.0-windows-x64.zip');
});

test('detectPlatform detects Mac, Windows, Android, and defaults properly', () => {
  assert.equal(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel'), 'macos');
  assert.equal(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Win32'), 'windows');
  assert.equal(detectPlatform('Mozilla/5.0 (Linux; Android 14)', 'Linux armv8l'), 'android');
  assert.equal(detectPlatform('Unknown', 'Unknown'), '');
});

test('fetchLatestRelease calls fetch and parses the payload', async () => {
  const fakePayload = {
    tag_name: 'v10.6.1',
    assets: [
      {
        name: 'Forge-v10.6.1-universal.apk',
        browser_download_url: 'https://github.com/lokesh12dev/Forge/releases/download/v10.6.1/Forge-v10.6.1-universal.apk',
        size: 30000000,
        digest: 'sha256:111111'
      }
    ]
  };

  const fakeFetch = async (url) => ({
    ok: true,
    json: async () => fakePayload
  });

  const res = await fetchLatestRelease('https://fake-api', fakeFetch);
  assert.equal(res.version, 'v10.6.1');
  assert.equal(res.android.length, 1);
});
