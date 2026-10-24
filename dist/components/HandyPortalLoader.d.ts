import type { ReactNode } from 'react';
export type LoaderVariant = 'page' | 'screen' | 'inline';
export type LoaderSize = 'sm' | 'md' | 'lg';
export declare function DualRingLoader({ size, className, label, }: {
    size?: LoaderSize;
    className?: string;
    label?: string;
}): import("react").JSX.Element;
/**
 * リング + "loading..." の跳ねる文字。
 * `mark` を渡すとリングの代わりにそのノード（アプリ独自のブランドマークなど）を出す。
 */
export declare function LoadingIndicator({ size, className, label, mark, }: {
    size?: LoaderSize;
    className?: string;
    label?: string;
    mark?: ReactNode;
}): import("react").JSX.Element;
/**
 * アプリ共通のローディング表示。
 * page / inline は skeleton、処理中オーバーレイ用の screen は二重逆回転リングを使う。
 * `mark` でリングを別のノード（ブランドマーク等）に差し替えられる。
 * 色は `--sb-accent-bg`、枠・背景は `--hp-*`（components.css の先頭コメント参照）。
 */
export declare function HandyPortalLoader({ label, variant, mark, }: {
    label?: string;
    variant?: LoaderVariant;
    mark?: ReactNode;
}): import("react").JSX.Element;
//# sourceMappingURL=HandyPortalLoader.d.ts.map