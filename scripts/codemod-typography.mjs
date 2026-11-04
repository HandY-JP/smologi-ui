#!/usr/bin/env node
// 既存アプリの文字サイズ・太さを共通の決まり（8 段・3 段）へ機械的に置き換える（依存なし）。
//
//   node codemod-typography.mjs <appRoot> [--dry]
//
// <appRoot>/src/**/*.{ts,tsx,js,jsx} を書き換える（node_modules / .next / dist / generated / *.test.* は除く）。
// 対応表は src/lib/typography.ts の TYPE_SIZE_MAP / WEIGHT_MAP と同じ。
//   サイズ: 7〜11.5px→11, 12〜12.5→12, 13〜13.5→13, 14〜14.5→14, 15〜16→15, 17〜19→18, 20〜27→22, 28〜39→28
//           text-xs→12, sm→14, base→15, lg→18, xl/2xl→22, 3xl/4xl→28
//   太さ  : font-bold/extrabold/black→font-semibold, font-thin/extralight/light→font-normal
// 行の高さ: `text-[Npx] leading-[Mpx]` の形にする。同じ接頭辞（sm: など）の leading-* が同じ文字列に既にあれば
//           サイズだけ差し替える。接頭辞つき（md:text-lg など）は leading にも同じ接頭辞を付ける。
// 40px 以上（text-[96px]、text-5xl 以上）・rem 指定は触らず「手作業で確認」として一覧に出す。
// 色の text-*（text-gray-500 / text-[var(--x)] / text-[#fff] / text-center など）は触らない。
// 行に `独自サイズ` があれば触らない。ファイル先頭 5 行に `check-typography: ignore-file` があれば飛ばす。
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const STEPS = {
  meta: [11, 16], note: [12, 18], label: [13, 20], body: [14, 22],
  item: [15, 22], title: [18, 26], heading: [22, 30], figure: [28, 36],
};
const PX_FROM = [[0, 'meta'], [12, 'note'], [13, 'label'], [14, 'body'], [15, 'item'], [17, 'title'], [20, 'heading'], [28, 'figure']];
const TW = { xs: 'note', sm: 'body', base: 'item', lg: 'title', xl: 'heading', '2xl': 'heading', '3xl': 'figure', '4xl': 'figure' };
const TW_MANUAL = new Set(['5xl', '6xl', '7xl', '8xl', '9xl']);
const WEIGHT = { bold: 'semibold', extrabold: 'semibold', black: 'semibold', thin: 'normal', extralight: 'normal', light: 'normal' };
const MANUAL_PX = 40;

export function stepForPx(px) {
  let hit = 'meta';
  for (const [from, step] of PX_FROM) if (px >= from) hit = step;
  return hit;
}

const PREFIX = String.raw`((?:[\w[\]&>*=.-]+:)*)(!?)`;
const RE = new RegExp(
  String.raw`(?<![\w-])${PREFIX}(?:text-\[(\d+(?:\.\d+)?)(px|rem)\]|text-(xs|sm|base|lg|xl|[2-9]xl)(?![\w\-[])|font-(bold|extrabold|black|thin|extralight|light)(?![\w-]))`,
  'g',
);

/** m の位置を含む文字列リテラル（' " `）の範囲を返す。見つからなければその行。 */
function enclosing(text, idx) {
  let s = idx - 1;
  while (s >= 0 && !'\'"`\n'.includes(text[s])) s -= 1;
  if (s >= 0 && text[s] !== '\n') {
    const q = text[s];
    let e = idx;
    while (e < text.length && text[e] !== q && (q === '`' || text[e] !== '\n')) e += 1;
    if (e < text.length && text[e] === q) return [s + 1, e];
  }
  const ls = text.lastIndexOf('\n', idx - 1) + 1;
  let le = text.indexOf('\n', idx);
  if (le < 0) le = text.length;
  return [ls, le];
}

function hasLeading(segment, prefix) {
  return segment.split(/\s+/).some((t) => (prefix ? t.startsWith(`${prefix}leading-`) : /^!?leading-/.test(t)));
}

/** 1 ファイル分。{ out, counts, manual } を返す。 */
export function transform(text) {
  const edits = [];
  const counts = new Map();
  const manual = [];
  const inserted = new Set();
  const bump = (k) => counts.set(k, (counts.get(k) ?? 0) + 1);
  const lineOf = (i) => text.slice(0, i).split('\n').length;
  for (const m of text.matchAll(RE)) {
    const [whole, prefix, bang, num, unit, tw, wt] = m;
    const start = m.index;
    const ls = text.lastIndexOf('\n', start - 1) + 1;
    let le = text.indexOf('\n', start);
    if (le < 0) le = text.length;
    if (text.slice(ls, le).includes('独自サイズ')) continue;
    if (wt) {
      const to = `${prefix}${bang}font-${WEIGHT[wt]}`;
      edits.push([start, start + whole.length, to]);
      bump(`font-${wt} -> font-${WEIGHT[wt]}`);
      continue;
    }
    let step;
    let label;
    if (num !== undefined) {
      if (unit === 'rem') { manual.push({ line: lineOf(start), token: whole, why: 'rem 指定' }); continue; }
      const px = Number(num);
      if (px >= MANUAL_PX) { manual.push({ line: lineOf(start), token: whole, why: `${MANUAL_PX}px 以上` }); continue; }
      step = stepForPx(px);
      label = `text-[${num}px] -> ${step}(${STEPS[step][0]}px)`;
    } else if (TW_MANUAL.has(tw)) {
      manual.push({ line: lineOf(start), token: whole, why: 'text-5xl 以上' });
      continue;
    } else {
      step = TW[tw];
      label = `text-${tw} -> ${step}(${STEPS[step][0]}px)`;
    }
    const [size, lh] = STEPS[step];
    const [ss, se] = enclosing(text, start);
    const seg = text.slice(ss, se);
    const key = `${ss}|${prefix}${bang}`;
    let to = `${prefix}${bang}text-[${size}px]`;
    if (!hasLeading(seg, prefix) && !inserted.has(key)) {
      to += ` ${prefix}${bang}leading-[${lh}px]`;
      inserted.add(key);
    }
    if (to !== whole) { edits.push([start, start + whole.length, to]); bump(label); }
  }
  let out = text;
  for (const [s, e, to] of edits.reverse()) out = out.slice(0, s) + to + out.slice(e);
  return { out, counts, manual };
}

const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'generated', '.git', 'build', 'coverage']);
function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) yield* walk(path.join(dir, e.name));
    } else if (/\.(tsx?|jsx?)$/.test(e.name) && !/\.test\./.test(e.name)) yield path.join(dir, e.name);
  }
}

function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const root = args.find((a) => !a.startsWith('--'));
  if (!root) { console.error('usage: node codemod-typography.mjs <appRoot> [--dry]'); process.exit(2); }
  const src = path.join(root, 'src');
  const total = new Map();
  const manual = [];
  let changedFiles = 0;
  let scanned = 0;
  for (const file of walk(src)) {
    const text = readFileSync(file, 'utf8');
    if (text.split('\n').slice(0, 5).some((l) => l.includes('check-typography: ignore-file'))) continue;
    scanned += 1;
    const { out, counts, manual: mm } = transform(text);
    for (const [k, v] of counts) total.set(k, (total.get(k) ?? 0) + v);
    for (const x of mm) manual.push({ file: path.relative(root, file), ...x });
    if (out !== text) {
      changedFiles += 1;
      if (!dry) writeFileSync(file, out);
    }
  }
  const sum = [...total.values()].reduce((a, b) => a + b, 0);
  for (const [k, v] of [...total].sort()) console.log(`${String(v).padStart(5)}  ${k}`);
  console.log(`[codemod-typography] ${scanned} files scanned, ${changedFiles} ${dry ? 'would change' : 'changed'}, ${sum} replacements${dry ? ' (dry)' : ''}`);
  if (manual.length) {
    console.log('\n--- 手作業で確認（触っていません）---');
    for (const x of manual) console.log(`${x.file}:${x.line}  ${x.token}  (${x.why})`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
