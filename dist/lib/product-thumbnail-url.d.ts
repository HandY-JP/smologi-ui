/** 生成するサイズ（正方形の一辺 px）。96 = 一覧の等倍、240 = 2x（Retina）と少し大きめの表示用。 */
export declare const THUMBNAIL_SIZES: readonly [96, 240];
export type ThumbnailSize = (typeof THUMBNAIL_SIZES)[number];
/** DB の thumbnail_url に入れるサイズ。240 はここから規約で導出する（列は増やさない）。 */
export declare const PRIMARY_THUMBNAIL_SIZE: ThumbnailSize;
/** Blob 上のサムネ置き場の接頭辞。孤児掃除（prune）はこの下だけを走査する。 */
export declare const THUMBNAIL_PATH_PREFIX = "thumbs/";
/**
 * 96px の URL から別サイズの URL を導出する（DB には 96px しか持たない規約）。
 *
 * 末尾の `-96.webp` だけを置き換える。形が合わない URL（他所の画像・将来の形式変更で残った古い値）は
 * null を返し、呼び出し側が srcSet を諦めて 1x だけ出せるようにする。
 */
export declare function derivedThumbnailUrl(primaryUrl: string | null | undefined, size: ThumbnailSize): string | null;
/**
 * Blob の公開URLからパス名（先頭の / を落としたもの）を取り出す。
 * URL として読めないものは null（list の結果と照合するだけなので握りつぶしてよい）。
 */
export declare function blobPathnameOf(url: string): string | null;
//# sourceMappingURL=product-thumbnail-url.d.ts.map