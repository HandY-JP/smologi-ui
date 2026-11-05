import type { ReactNode } from 'react';
export type ErrorBannerSize = 'sm' | 'md' | 'lg';
export declare function ErrorBanner({ message, size, className, onRetry, retryLabel, children, }: {
    /** null / 空文字なら何も描画しない（呼び出し側で && を書かなくてよい）。 */
    message?: ReactNode;
    size?: ErrorBannerSize;
    className?: string;
    /** 渡すと再試行ボタンを出す（size 'sm' は文中の下線リンク、それ以外は本文の下のボタン）。 */
    onRetry?: () => void;
    retryLabel?: string;
    /** 再試行ボタンなど、本文の下に足したいもの。 */
    children?: ReactNode;
}): import("react").JSX.Element | null;
//# sourceMappingURL=ErrorBanner.d.ts.map