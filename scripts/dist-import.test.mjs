// dist/index.js が Node でそのまま読み込めること（相対参照の拡張子・ディレクトリ抜けの回帰防止）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('dist/index.js を import できる', async () => {
  const m = await import('../dist/index.js');
  assert.equal(typeof m.IntegrationHeader, 'function');
  assert.equal(typeof m.ProviderPicker, 'function');
});

test('integration.css が dist にあり exports と components.css から参照される', () => {
  assert.ok(existsSync(new URL('../dist/styles/integration.css', import.meta.url)));
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.exports['./integration.css'], './dist/styles/integration.css');
  assert.match(readFileSync(new URL('../dist/styles/components.css', import.meta.url), 'utf8'), /@import '\.\/integration\.css'/);
  assert.match(readFileSync(new URL('../dist/styles/integration.css', import.meta.url), 'utf8'), /\.sb-int-tile--bad/);
});
