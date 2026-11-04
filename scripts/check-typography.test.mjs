// scripts/check-typography.mjs の動作（8 段の値は通す・外れた値と例外コメントの扱い・--report）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'check-typography.mjs');
function run(files, args = []) {
  const dir = mkdtempSync(path.join(tmpdir(), 'chk-typo-'));
  mkdirSync(path.join(dir, 'src'));
  for (const [name, body] of Object.entries(files)) writeFileSync(path.join(dir, 'src', name), body);
  return spawnSync('node', [script, ...args], { cwd: dir, encoding: 'utf8' });
}

test('8 段の値と semibold は通る', () => {
  const r = run({ 'a.tsx': 'const c = "text-[14px] leading-[22px] font-semibold sm:text-[11px] text-[var(--x)]";\n' });
  assert.equal(r.status, 0, r.stdout);
});

test('外れたサイズ・標準サイズ・bold を見つけて 1 で終わる', () => {
  const r = run({ 'a.tsx': 'x("text-[10px]");\ny("md:text-sm font-bold");\nz("text-[13.5px] font-light");\n' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /src\/a\.tsx:1/);
  assert.match(r.stdout, /src\/a\.tsx:2 {2}md:text-sm font-bold/);
  assert.match(r.stdout, /5 件/);
});

test('独自サイズの行は無視・--report は 0 で終わる', () => {
  const ok = run({ 'a.tsx': 'x("text-[10px]"); // 独自サイズ: 地図の凡例\n' });
  assert.equal(ok.status, 0);
  const rep = run({ 'a.tsx': 'x("text-xl");\n' }, ['--report']);
  assert.equal(rep.status, 0);
  assert.match(rep.stdout, /1 件/);
});
