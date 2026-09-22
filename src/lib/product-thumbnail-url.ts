// 商品サムネの「URL 規約」だけを持つ、**ブラウザでも読める**モジュール。
//
// ProductThumb（クライアントコンポーネント）が 96px の URL から 240px（2x）の URL を導出するので、
// node:crypto を使う生成側（product-thumbnail-path.ts）とは分けてある。混ぜるとクライアント
// バンドルが node:crypto を引き込んで壊れる。
//
// 方針（性能棚卸し #549 の改善 #1・2026-09 ユーザー決定）:
// 一覧が原寸の外部画像（img.next-engine.com が 9,001 件・m.media-amazon.com が 109 件）を
// そのまま表示していて、100 行スクロールで 10〜100MB 落ちていた。Vercel の画像最適化ではなく
// **取込時に自前で生成して Blob に置く**。

/** 生成するサイズ（正方形の一辺 px）。96 = 一覧の等倍、240 = 2x（Retina）と少し大きめの表示用。 */
export const THUMBNAIL_SIZES = [96, 240] as const;

export type ThumbnailSize = (typeof THUMBNAIL_SIZES)[number];

/** DB の thumbnail_url に入れるサイズ。240 はここから規約で導出する（列は増やさない）。 */
export const PRIMARY_THUMBNAIL_SIZE: ThumbnailSize = 96;

/** Blob 上のサムネ置き場の接頭辞。孤児掃除（prune）はこの下だけを走査する。 */
export const THUMBNAIL_PATH_PREFIX = 'thumbs/';

/**
 * 96px の URL から別サイズの URL を導出する（DB には 96px しか持たない規約）。
 *
 * 末尾の `-96.webp` だけを置き換える。形が合わない URL（他所の画像・将来の形式変更で残った古い値）は
 * null を返し、呼び出し側が srcSet を諦めて 1x だけ出せるようにする。
 */
export function derivedThumbnailUrl(
  primaryUrl: string | null | undefined,
  size: ThumbnailSize,
): string | null {
  const url = String(primaryUrl ?? '').trim();
  if (!url) return null;
  if (size === PRIMARY_THUMBNAIL_SIZE) return url;
  const suffix = `-${PRIMARY_THUMBNAIL_SIZE}.webp`;
  if (!url.endsWith(suffix)) return null;
  return `${url.slice(0, -suffix.length)}-${size}.webp`;
}

/**
 * Blob の公開URLからパス名（先頭の / を落としたもの）を取り出す。
 * URL として読めないものは null（list の結果と照合するだけなので握りつぶしてよい）。
 */
export function blobPathnameOf(url: string): string | null {
  try {
    return new URL(url).pathname.replace(/^\/+/, '') || null;
  } catch {
    return null;
  }
}
