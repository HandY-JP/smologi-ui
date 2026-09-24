#!/usr/bin/env node
// @handy/smologi-ui のビルド。
//
//   src/**/*.{ts,tsx} → dist/**/*.js（+ .js.map）  … 1ファイル→1ファイル（bundle しない）
//   src/**            → dist/**/*.d.ts             … tsc --emitDeclarationOnly
//   src/styles/*.css  → dist/styles/*.css          … そのままコピー
//   src/tokens/*.css  → tokens/*.css               … そのままコピー（package.json の files と対）
//
// bundle しない理由（tsup.config.ts のコメントと同じ）:
//   1. `'use client'` がファイル先頭にそのまま残る。バンドルすると esbuild が先頭ディレクティブを
//      落とし、Next の RSC 境界が壊れる（全部 Server Component 扱いになって useState で落ちる）。
//   2. アプリ側の Tailwind が `content` で dist を走査する前提なので、クラス文字列が
//      ソースの形のまま残っていた方が拾い漏れがない。
//   3. ツリーシェイクはアプリ側のバンドラに任せられる（ESM のみ・sideEffects は CSS だけ）。
//
// tsup が入っていればそれを使う（CI は `npm ci` で tsup が入るのでこちら）。
// 入っていないときは esbuild の変換 API を直接叩く。tsup は bundle:false のとき
// 実質「esbuild.transform をファイルごとに回すだけ」なので出力は同じになる。
// ネットワークが使えない手元の環境（npm install ができない）でも build を通すための逃がし口で、
// そのときは SMOLOGI_UI_FALLBACK_MODULES に esbuild / typescript を持つ node_modules を指す
// （既定は隣の smologi チェックアウト）。
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FALLBACK_MODULES = path.resolve(
  ROOT,
  process.env.SMOLOGI_UI_FALLBACK_MODULES ?? '../smologi/node_modules',
);

const require = createRequire(path.join(ROOT, 'package.json'));
const requireFallback = createRequire(path.join(FALLBACK_MODULES, 'index.js'));

function load(name) {
  try {
    return { mod: require(name), where: 'local' };
  } catch {
    try {
      return { mod: requireFallback(name), where: FALLBACK_MODULES };
    } catch {
      return null;
    }
  }
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function main() {
  await rm(path.join(ROOT, 'dist'), { recursive: true, force: true });
  await rm(path.join(ROOT, 'tokens'), { recursive: true, force: true });

  const tsup = existsSync(path.join(ROOT, 'node_modules', 'tsup'));
  if (tsup) {
    // tsup.config.ts の設定で走る（entry / bundle:false / format:esm はそちらに書いてある）。
    const r = spawnSync(path.join(ROOT, 'node_modules', '.bin', 'tsup'), [], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    if (r.status !== 0) process.exit(r.status ?? 1);
    console.log('[build] js   : tsup');
  } else {
    const esbuild = load('esbuild');
    if (!esbuild) {
      console.error(
        '[build] esbuild が見つかりません。`npm install` するか、' +
          'SMOLOGI_UI_FALLBACK_MODULES に esbuild を持つ node_modules を指してください。',
      );
      process.exit(1);
    }
    const files = (await walk(path.join(ROOT, 'src'))).filter((f) => /\.tsx?$/.test(f));
    for (const file of files) {
      const rel = path.relative(path.join(ROOT, 'src'), file);
      const outFile = path.join(ROOT, 'dist', rel.replace(/\.tsx?$/, '.js'));
      const source = await readFile(file, 'utf8');
      const res = await esbuild.mod.transform(source, {
        loader: file.endsWith('.tsx') ? 'tsx' : 'ts',
        format: 'esm',
        target: 'es2022',
        jsx: 'automatic',
        sourcemap: true,
        sourcefile: rel,
      });
      await mkdir(path.dirname(outFile), { recursive: true });
      await writeFile(outFile, `${res.code}//# sourceMappingURL=${path.basename(outFile)}.map\n`);
      await writeFile(`${outFile}.map`, res.map);
    }
    console.log(`[build] js   : esbuild ${esbuild.mod.version} (${esbuild.where}) — ${files.length} files`);
  }

  // 相対 import に拡張子を足す（`./Modal` → `./Modal.js`）。
  // esbuild も tsup（bundle:false）も import のパスを書き換えないので、そのままだと
  // 素の Node ESM から読めない（ERR_MODULE_NOT_FOUND）。webpack/turbopack は解決できるが、
  // vitest や node 直実行で踏むので、ここで仕様どおりの ESM にしておく。
  // tsup 経由でも esbuild 経由でも同じ出力になるよう、両方の後に通す。
  {
    const jsFiles = (await walk(path.join(ROOT, 'dist'))).filter((f) => f.endsWith('.js'));
    const rewrite = (code) =>
      code.replace(
        /(\bfrom\s*["'])(\.\.?\/[^"']*?)(["'])/g,
        (all, a, spec, b) => (/\.[a-z0-9]+$/i.test(spec) ? all : `${a}${spec}.js${b}`),
      );
    for (const file of jsFiles) {
      const code = await readFile(file, 'utf8');
      const next = rewrite(code);
      if (next !== code) await writeFile(file, next);
    }
  }

  // 型（.d.ts）は tsup の dts ではなく tsc --emitDeclarationOnly で出す
  // （tsup の dts は rollup-plugin-dts でバンドルを伴い、bundle:false の方針と噛み合わない）。
  const localTsc = path.join(ROOT, 'node_modules', '.bin', 'tsc');
  const tsc = existsSync(localTsc) ? localTsc : path.join(FALLBACK_MODULES, '.bin', 'tsc');
  if (!existsSync(tsc)) {
    console.error('[build] tsc が見つかりません。`npm install` してください。');
    process.exit(1);
  }
  // 手元に node_modules が無い（= フォールバック）ときは react / @types/react の解決先を
  // 一時 tsconfig で教える。CI では node_modules があるのでこの分岐には入らない。
  let project = 'tsconfig.build.json';
  const fallbackProject = path.join(ROOT, 'tsconfig.fallback.json');
  if (tsc !== localTsc) {
    await writeFile(
      fallbackProject,
      `${JSON.stringify(
        {
          extends: './tsconfig.build.json',
          compilerOptions: {
            baseUrl: '.',
            paths: {
              // 型は @types/* を直接指す（`*` の素通しだと JS 実体に当たって any になる）。
              react: [`${FALLBACK_MODULES}/@types/react`],
              'react/*': [`${FALLBACK_MODULES}/@types/react/*`],
              'react-dom': [`${FALLBACK_MODULES}/@types/react-dom`],
              'react-dom/*': [`${FALLBACK_MODULES}/@types/react-dom/*`],
              '*': [`${FALLBACK_MODULES}/*`],
            },
            typeRoots: [`${FALLBACK_MODULES}/@types`],
          },
        },
        null,
        2,
      )}\n`,
    );
    project = 'tsconfig.fallback.json';
  }
  const dts = spawnSync(tsc, ['-p', project], { cwd: ROOT, stdio: 'inherit' });
  if (project !== 'tsconfig.build.json') await rm(fallbackProject, { force: true });
  if (dts.status !== 0) process.exit(dts.status ?? 1);
  console.log(`[build] types: ${tsc === localTsc ? 'tsc' : tsc}`);

  // CSS は変換しない。styles は dist/ の下、tokens は公開パス（package.json の exports）に合わせて
  // リポジトリ直下へ置く。
  await cp(path.join(ROOT, 'src', 'styles'), path.join(ROOT, 'dist', 'styles'), { recursive: true });
  // dark-compat.css = fields → core の連結（v0.1.9 で分割。スモロジ本体は従来どおりこの 1 本を読む）。
  // @import で繋がずに連結するのは、読み込む側のバンドラ（webpack / turbopack）の @import 解決に依存しないため。
  {
    const fields = await readFile(path.join(ROOT, 'src', 'styles', 'dark-compat-fields.css'), 'utf8');
    const core = await readFile(path.join(ROOT, 'src', 'styles', 'dark-compat-core.css'), 'utf8');
    await writeFile(
      path.join(ROOT, 'dist', 'styles', 'dark-compat.css'),
      `/* 生成物（scripts/build.mjs）: dark-compat-fields.css → dark-compat-core.css の連結。直接編集しないこと。 */\n${fields}\n${core}`,
    );
  }
  await cp(path.join(ROOT, 'src', 'tokens'), path.join(ROOT, 'tokens'), { recursive: true });
  console.log('[build] css  : dist/styles, tokens');

  // 'use client' が dist に残っているかの自己点検（バンドルすると落ちる ＝ 本番で壊れる）。
  const built = (await walk(path.join(ROOT, 'dist'))).filter((f) => f.endsWith('.js'));
  const srcClient = (await walk(path.join(ROOT, 'src'))).filter((f) => /\.tsx?$/.test(f));
  let missing = 0;
  for (const file of srcClient) {
    const head = (await readFile(file, 'utf8')).split('\n', 1)[0].trim();
    if (head !== "'use client';" && head !== '"use client";') continue;
    const rel = path.relative(path.join(ROOT, 'src'), file).replace(/\.tsx?$/, '.js');
    const outHead = (await readFile(path.join(ROOT, 'dist', rel), 'utf8')).split('\n', 1)[0].trim();
    if (outHead !== '"use client";' && outHead !== "'use client';") {
      console.error(`[build] 'use client' が落ちている: dist/${rel}`);
      missing += 1;
    }
  }
  if (missing > 0) process.exit(1);
  console.log(`[build] ok   : ${built.length} js files, 'use client' 保持を確認`);
}

await main();
