// dist/index.js が Node でそのまま読み込めること（相対参照の拡張子・ディレクトリ抜けの回帰防止）。
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('dist/index.js を import できる', async () => {
  const m = await import('../dist/index.js');
  assert.equal(typeof m.IntegrationHeader, 'function');
  assert.equal(typeof m.ProviderPicker, 'function');
});
