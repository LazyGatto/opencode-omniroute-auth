import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ORIGINAL_FETCH = global.fetch;
const DIR = mkdtempSync(join(tmpdir(), 'omniroute-plugin-'));
// Each test file runs in its own process; the module resolves DISK_CACHE_PATH at
// import time, so the override below is in effect for the dynamic imports.
process.env.OMNIROUTE_MODEL_CACHE_FILE = join(DIR, 'models.json');

const models = await import('../dist/src/models.js');
const combos = await import('../dist/src/omniroute-combos.js');

const CONFIG = {
  baseUrl: 'http://localhost:20128/v1',
  apiKey: 'test-key',
  apiMode: 'chat',
  modelCacheTtl: 60000,
};

const json = (body) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

after(() => {
  global.fetch = ORIGINAL_FETCH;
  rmSync(DIR, { recursive: true, force: true });
});

test('cold start + network failure returns the persisted catalog', async () => {
  models.clearModelCache();
  const cacheKey = models.__testing.getCacheKey(CONFIG, CONFIG.apiKey);
  const persisted = [
    { id: 'smart', name: 'smart' },
    { id: 'deepseek/deepseek-flash', name: 'deepseek/deepseek-flash' },
  ];
  writeFileSync(
    process.env.OMNIROUTE_MODEL_CACHE_FILE,
    JSON.stringify({ [cacheKey]: { savedAt: Date.now(), models: persisted } }),
  );

  global.fetch = async () => {
    throw new TypeError('fetch failed: getaddrinfo ENOTFOUND omni.cheburlan.cc');
  };

  const out = await models.fetchModels(CONFIG, CONFIG.apiKey, true);
  assert.deepEqual(
    out.map((m) => m.id),
    ['smart', 'deepseek/deepseek-flash'],
    'pinned models must survive a cold start while the gateway is unreachable',
  );
});

test('a transient DNS failure is retried before falling back', async () => {
  models.clearModelCache();
  let modelCalls = 0;

  global.fetch = async (input) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.includes('/v1/models')) {
      modelCalls += 1;
      if (modelCalls === 1) {
        throw new TypeError('fetch failed: getaddrinfo ENOTFOUND omni.cheburlan.cc');
      }
      return json({ object: 'list', data: [{ id: 'workhorse', name: 'workhorse' }] });
    }
    return json({ data: [] });
  };

  const out = await models.fetchModels(CONFIG, CONFIG.apiKey, true);
  assert.equal(modelCalls, 2, 'the second attempt should have been made');
  assert.ok(
    out.some((m) => m.id === 'workhorse'),
    'the retried response must be used',
  );
});

test('persisted catalog round-trips through the disk cache helpers', () => {
  models.clearModelCache();
  const cacheKey = models.__testing.getCacheKey(CONFIG, CONFIG.apiKey);
  const payload = [{ id: 'bulk', name: 'bulk' }];
  models.__testing.writeDiskCache(cacheKey, payload);
  assert.deepEqual(models.__testing.readDiskCache(cacheKey), payload);
  assert.equal(models.__testing.readDiskCache('missing-key'), null);
});

test('combo resolution warnings are emitted once per key', () => {
  combos.clearComboCache();
  const before = combos.__testing.comboWarnedCount();
  combos.__testing.warnOnce('unresolved:stt', 'Could not resolve stt');
  combos.__testing.warnOnce('unresolved:stt', 'Could not resolve stt');
  combos.__testing.warnOnce('nomatch:stt', 'No models.dev matches for stt');
  assert.equal(combos.__testing.comboWarnedCount(), before + 2);
});
