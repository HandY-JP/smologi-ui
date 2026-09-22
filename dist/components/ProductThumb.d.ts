type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'header';
/**
 * 商品マスタの画像から小さなサムネを表示する共有コンポーネント。
 *
 * - `thumbnailUrl` があれば**それ**を出す（取込時に生成した 96px webp。240px は規約で導出し srcSet の 2x へ）
 * - 無ければ従来どおり `src`（原寸の外部画像）へフォールバックする
 *   → サムネ生成前・生成失敗時も表示は壊れない
 * - URL が空 / 読み込み失敗時はプレースホルダーアイコン
 * - 画面外の画像は loading="lazy" で遅延読み込み・固定 width/height で CLS を防ぐ
 * - 画像クリックで全画面のライトボックスに拡大表示（ESC・背景クリックで閉じる）。
 *   拡大は原寸（`src`）を出す — サムネを引き伸ばすとぼやけるため
 *
 * なぜサムネを持つのか（性能棚卸し #549 の改善 #1）:
 * 一覧が原寸の外部画像をそのまま出していて、100 行スクロールで 10〜100MB 落ちていた。
 */
export declare function ProductThumb({ src, thumbnailUrl, alt, size, enlargeOnClick, fill, boxClassName, boxPixels, placeholder, }: {
    src: string | null | undefined;
    /** 生成済みサムネ（96px webp）のURL。空 / 未指定なら src にフォールバックする */
    thumbnailUrl?: string | null;
    alt: string;
    size?: Size;
    /** クリックで拡大表示する。false にすると静的なサムネだけ */
    enlargeOnClick?: boolean;
    /** 親要素の幅いっぱい（正方形）に広げる。一覧セルの余白を使って画像だけ大きく見せる用途。 */
    fill?: boolean;
    /**
     * size の代わりに使う寸法・配置クラス（`h-11 w-11` や grid の `row-span-2` など）。
     * 一覧セルごとに寸法が違う既存の生 <img> をここへ寄せるための逃がし口。
     */
    boxClassName?: string;
    /** boxClassName を使うときの実ピクセル（width/height 属性。CLS 防止用） */
    boxPixels?: number;
    /** プレースホルダーの絵柄。'box' は入荷・出荷の一覧で使っている箱アイコン。 */
    placeholder?: 'image' | 'box';
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=ProductThumb.d.ts.map