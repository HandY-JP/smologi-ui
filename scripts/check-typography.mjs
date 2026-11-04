#!/usr/bin/env node
// 文字クラスが 8 段・3 段の外に出ていないかを調べる（どのアプリからでも使える）。
//
//   npx smologi-check-typography                 # 既定: src/**/*.{ts,tsx}
//   npx smologi-check-typography "app/**/*.tsx" "components/**/*.tsx"
//   npx smologi-check-typography --report        # 見つけても終了コード 0（件数を見るだけ）
//
// 見つけるもの
//   text-[<数字>px]                              … 任意サイズ（8 段の値 11/12/13/14/15/18/22/28px だけは TEXT の中身なので通す）
//   text-xs/sm/base/lg/xl/2xl/3xl/4xl            … Tailwind 標準サイズ
//   font-bold/extrabold/black/light/thin         … 太さは normal / medium / strong の 3 段だけ
// 例外: 行に `独自サイズ` が書いてあれば無視（例: `// 独自サイズ: 地図の凡例に合わせる`）。
//        ファイル先頭 5 行に `check-typography: ignore-file` があればそのファイルを無視。
// 引数の glob は `**` `*` `{a,b}` に対応（依存なし）。ディレクトリを渡すと配下の ts/tsx を見る。
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const PATTERNS = [
  { name: 'text-[Npx]', re: /(?<![\w-])(?:[\w[\]&>*=.-]+:)*text-\[(?!(?:11|12|13|14|15|18|22|28)px\])\d+(?:\.\d+)?px\]/g },
  { name: 'text-xs…4xl', re: /(?<![\w-])(?:[\w[\]&>*=.-]+:)*text-(?:xs|sm|base|lg|xl|[2-9]xl)(?![\w-[])/g },
  { name: 'font-bold…thin', re: /(?<![\w-])(?:[\w[\]&>*=.-]+:)*font-(?:bold|extrabold|black|light|thin)(?![\w-])/g },
];
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', '.next', 'build', 'coverage']);

function globToRegExp(glob) {
  let out = '';
  for (let i = 0; i < glob.length; i += 1) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        i += 1;
        if (glob[i + 1] === '/') { i += 1; out += '(?:.*/)?'; } else out += '.*';
      } else out += '[^/]*';
    } else if (c === '{') {
      const end = glob.indexOf('}', i);
      out += `(?:${glob.slice(i + 1, end).split(',').map((s) => s.replace(/[.+^$()|[\]\\]/g, '\\$&')).join('|')})`;
      i = end;
    } else if (c === '?') out += '[^/]';
    else out += c.replace(/[.+^$()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${out}$`);
}

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!IGNORE_DIRS.has(e.name)) yield* walk(path.join(dir, e.name));
    } else yield path.join(dir, e.name);
  }
}

const args = process.argv.slice(2);
const reportOnly = args.includes('--report');
const inputs = args.filter((a) => !a.startsWith('--'));
if (inputs.length === 0) inputs.push('src/**/*.{ts,tsx}');

const cwd = process.cwd();
const files = new Set();
for (const input of inputs) {
  let st = null;
  try { st = statSync(input); } catch { /* glob として扱う */ }
  if (st?.isDirectory()) {
    for (const f of walk(input)) if (/\.(tsx?|jsx?)$/.test(f)) files.add(path.relative(cwd, f));
  } else if (st?.isFile()) {
    files.add(path.relative(cwd, input));
  } else {
    const re = globToRegExp(input.replace(/^\.\//, ''));
    const base = input.split(/[*{?]/)[0];
    const root = base.includes('/') ? base.slice(0, base.lastIndexOf('/')) || '.' : '.';
    let rootStat = null;
    try { rootStat = statSync(root); } catch { /* なし */ }
    if (!rootStat?.isDirectory()) continue;
    for (const f of walk(root)) {
      const rel = path.relative(cwd, f).split(path.sep).join('/');
      if (re.test(rel)) files.add(rel);
    }
  }
}

let total = 0;
const perFile = new Map();
for (const file of [...files].sort()) {
  const lines = readFileSync(file, 'utf8').split('\n');
  if (lines.slice(0, 5).some((l) => l.includes('check-typography: ignore-file'))) continue;
  lines.forEach((line, i) => {
    if (line.includes('独自サイズ')) return;
    const hits = [];
    for (const p of PATTERNS) for (const m of line.matchAll(p.re)) hits.push(m[0]);
    if (hits.length === 0) return;
    total += hits.length;
    perFile.set(file, (perFile.get(file) ?? 0) + hits.length);
    console.log(`${file}:${i + 1}  ${hits.join(' ')}`);
  });
}

if (perFile.size > 0) {
  console.log('\n--- ファイル別 ---');
  for (const [f, n] of perFile) console.log(`${String(n).padStart(4)}  ${f}`);
}
console.log(`[check-typography] ${files.size} files, ${total} 件`);
if (total > 0 && !reportOnly) {
  console.log('8 段（TEXT）・3 段（WEIGHT）に置き換えるか、理由を `// 独自サイズ: …` で添えてください。');
  process.exit(1);
}
