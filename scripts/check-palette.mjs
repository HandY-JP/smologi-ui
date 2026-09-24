#!/usr/bin/env node
// 最小パレット（src/tokens/palette.css）の検証。`npm test` と `npm run build` の両方で走る。
//
//   1. 各テーマのブロックが全トークン（意味名 22 + カテゴリ 8×3）を `r g b` の 3 値で持つ
//   2. src/lib/palette.ts の PALETTE_THEMES と CSS のテーマが 1 対 1
//   3. WCAG 2.x のコントラスト比（本文サイズ AA = 4.5:1）
//
// テーマを足したら `node scripts/check-palette.mjs` で確認する（--verbose で全ペアの比を表示）。
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERBOSE = process.argv.includes('--verbose');

export const SEMANTIC_TOKENS = [
  'canvas', 'surface', 'surface-subtle', 'surface-muted',
  'ink', 'ink-muted', 'ink-faint',
  'line', 'line-strong',
  'accent', 'accent-soft', 'accent-ink', 'on-accent',
  'success-soft', 'success-ink', 'success-solid',
  'warning-soft', 'warning-ink', 'warning-solid',
  'danger-soft', 'danger-ink', 'danger-solid',
];
export const CATEGORY_TOKENS = Array.from({ length: 8 }, (_, i) =>
  ['soft', 'ink', 'solid'].map((s) => `cat-${i + 1}-${s}`),
).flat();
const ALL = [...SEMANTIC_TOKENS, ...CATEGORY_TOKENS];

/** [前景, 背景, 最小比] — 文字として読ませる組み合わせだけ。 */
const PAIRS = [
  ['ink', 'surface', 4.5],
  ['ink', 'canvas', 4.5],
  ['ink', 'surface-subtle', 4.5],
  ['ink-muted', 'surface', 4.5],
  ['ink-muted', 'canvas', 4.5],
  ['ink-muted', 'surface-subtle', 4.5],
  ['on-accent', 'accent', 4.5],
  ['accent-ink', 'accent-soft', 4.5],
  ['accent-ink', 'surface', 4.5],
  ...['success', 'warning', 'danger'].flatMap((s) => [
    [`${s}-ink`, `${s}-soft`, 4.5],
    [`${s}-ink`, 'surface', 4.5],
  ]),
  ...Array.from({ length: 8 }, (_, i) => [`cat-${i + 1}-ink`, `cat-${i + 1}-soft`, 4.5]),
];
/** ハイコントラストは AAA（7:1）を本文・状態に要求する。 */
const STRICT = { contrast: 7 };

function lum([r, g, b]) {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrast(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

function selectorToKey(sel) {
  const keys = sel
    .split(',')
    .map((s) => s.trim())
    .map((s) => (s === ':root' ? 'light' : (s.match(/^html\.theme-([a-z0-9-]+)$/) ?? [])[1]))
    .filter(Boolean);
  return keys;
}

async function main() {
  const css = (await readFile(path.join(ROOT, 'src/tokens/palette.css'), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
  const ts = await readFile(path.join(ROOT, 'src/lib/palette.ts'), 'utf8');
  const errors = [];
  const themes = new Map();

  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const keys = selectorToKey(m[1]);
    if (!keys.length) continue;
    const vars = {};
    for (const d of m[2].matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) vars[d[1]] = d[2].trim();
    const key = keys.includes('light') ? 'light' : keys[0];
    if (themes.has(key)) errors.push(`${key}: ブロックが重複`);
    themes.set(key, vars);
  }

  for (const [key, vars] of themes) {
    for (const t of ALL) {
      const v = vars[t];
      if (v == null) { errors.push(`${key}: --${t} が未定義`); continue; }
      if (!/^\d{1,3} \d{1,3} \d{1,3}$/.test(v) || v.split(' ').some((n) => +n > 255))
        errors.push(`${key}: --${t} は "r g b"（0〜255 の 3 値）で書く（今: ${v}）`);
    }
    for (const t of Object.keys(vars)) if (!ALL.includes(t)) errors.push(`${key}: 未知のトークン --${t}`);
  }

  const tsKeys = [...ts.matchAll(/^\s*key:\s*'([a-z0-9-]+)'/gm)].map((m) => m[1]);
  for (const k of tsKeys) if (!themes.has(k)) errors.push(`PALETTE_THEMES の ${k} に対応する CSS ブロックが無い`);
  for (const k of themes.keys()) if (!tsKeys.includes(k)) errors.push(`CSS の ${k} が PALETTE_THEMES に無い`);

  const rgb = (v) => v.split(' ').map(Number);
  const rows = [];
  for (const [key, vars] of themes) {
    let worst = Infinity;
    for (const [fg, bg, min0] of PAIRS) {
      if (!vars[fg] || !vars[bg]) continue;
      const min = STRICT[key] && !fg.startsWith('cat-') ? Math.max(min0, STRICT[key]) : min0;
      const r = contrast(rgb(vars[fg]), rgb(vars[bg]));
      worst = Math.min(worst, r);
      if (r < min) errors.push(`${key}: ${fg} / ${bg} = ${r.toFixed(2)}:1（${min}:1 未満）`);
      if (VERBOSE) console.log(`  ${key.padEnd(10)} ${`${fg} / ${bg}`.padEnd(32)} ${r.toFixed(2)}`);
    }
    rows.push(`${key.padEnd(10)} 最小 ${worst.toFixed(2)}:1`);
  }

  if (errors.length) {
    console.error(`[palette] NG ${errors.length} 件`);
    for (const e of errors) console.error('  - ' + e);
    process.exit(1);
  }
  console.log(`[palette] ok  : ${themes.size} テーマ × ${ALL.length} トークン、AA ${PAIRS.length} ペア`);
  for (const r of rows) console.log('  ' + r);
}

await main();
