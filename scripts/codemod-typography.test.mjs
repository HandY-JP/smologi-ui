// scripts/codemod-typography.mjs の動作（サイズの寄せ方・leading の扱い・接頭辞・色は触らない・大きな数字は手作業）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform, stepForPx } from './codemod-typography.mjs';

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'codemod-typography.mjs');
const t = (s) => transform(s).out;

test('px の寄せ方', () => {
  assert.equal(stepForPx(9), 'meta');
  assert.equal(stepForPx(12.5), 'note');
  assert.equal(stepForPx(16), 'item');
  assert.equal(stepForPx(19), 'title');
  assert.equal(stepForPx(27), 'heading');
  assert.equal(stepForPx(32), 'figure');
});

test('サイズと leading を付ける／既存 leading があればサイズだけ', () => {
  assert.equal(t('<p className="text-[10px] text-gray-500">'), '<p className="text-[11px] leading-[16px] text-gray-500">');
  assert.equal(t('<p className="text-sm leading-6">'), '<p className="text-[14px] leading-6">');
  assert.equal(t('<p className="text-xl font-bold">'), '<p className="text-[22px] leading-[30px] font-semibold">');
  assert.equal(t('cn("a", on && "text-base")'), 'cn("a", on && "text-[15px] leading-[22px]")');
});

test('接頭辞は leading にも付ける', () => {
  assert.equal(t('"text-sm md:text-lg hover:font-bold"'), '"text-[14px] leading-[22px] md:text-[18px] md:leading-[26px] hover:font-semibold"');
  assert.equal(t('"md:text-lg md:leading-7"'), '"md:text-[18px] md:leading-7"');
});

test('色・配置・変数は触らない／二度実行しても同じ', () => {
  const keep = '"text-gray-500 text-center text-[var(--x)] text-[#fff] text-white text-left"';
  assert.equal(t(keep), keep);
  const once = t('"text-[13.5px] font-black"');
  assert.equal(once, '"text-[13px] leading-[20px] font-semibold"');
  assert.equal(t(once), once);
});

test('40px 以上・rem・5xl 以上は手作業、独自サイズ行は触らない', () => {
  const r = transform('"text-[96px]" "text-5xl" "text-[2rem]"');
  assert.equal(r.out, '"text-[96px]" "text-5xl" "text-[2rem]"');
  assert.equal(r.manual.length, 3);
  const keep = '<p className="text-sm"> {/* 独自サイズ: 凡例に合わせる */}';
  assert.equal(t(keep), keep);
});

test('CLI: --dry は書かない、通常は書き換え、test と node_modules は飛ばす', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'codemod-typo-'));
  mkdirSync(path.join(dir, 'src', 'node_modules'), { recursive: true });
  const f = path.join(dir, 'src', 'a.tsx');
  writeFileSync(f, 'x = "text-xs font-bold"');
  writeFileSync(path.join(dir, 'src', 'a.test.tsx'), 'x = "text-xs"');
  writeFileSync(path.join(dir, 'src', 'node_modules', 'b.tsx'), 'x = "text-xs"');
  const dry = spawnSync('node', [script, dir, '--dry'], { encoding: 'utf8' });
  assert.equal(dry.status, 0);
  assert.match(dry.stdout, /2 replacements/);
  assert.equal(readFileSync(f, 'utf8'), 'x = "text-xs font-bold"');
  spawnSync('node', [script, dir], { encoding: 'utf8' });
  assert.equal(readFileSync(f, 'utf8'), 'x = "text-[12px] leading-[18px] font-semibold"');
  assert.equal(readFileSync(path.join(dir, 'src', 'a.test.tsx'), 'utf8'), 'x = "text-xs"');
});
