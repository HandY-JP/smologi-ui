import { defineConfig } from 'tsup';

/**
 * bundle: false（1ファイル→1ファイルの変換のみ）で出す。
 *
 * 理由:
 *  1. `'use client'` ディレクティブがファイル先頭にそのまま残る。バンドルすると esbuild が
 *     先頭ディレクティブを落とし、Next の RSC 境界が壊れる（全部 Server Component 扱いになる）。
 *  2. アプリ側の Tailwind が `content` でパッケージの dist を走査する前提なので、
 *     クラス文字列がソースの形のまま残っていた方が拾い漏れがない。
 *  3. ツリーシェイクはアプリ側のバンドラに任せられる（ESM のみ・sideEffects は CSS だけ）。
 *
 * 型（.d.ts）は tsup の dts ではなく tsc --emitDeclarationOnly で出す
 * （dts はバンドルを伴うため 1 の制約と噛み合わない）。
 */
export default defineConfig({
  entry: ['src/**/*.ts', 'src/**/*.tsx'],
  outDir: 'dist',
  format: ['esm'],
  bundle: false,
  splitting: false,
  sourcemap: true,
  clean: false,
  dts: false,
  target: 'es2022',
  platform: 'browser',
  external: ['react', 'react-dom'],
});
