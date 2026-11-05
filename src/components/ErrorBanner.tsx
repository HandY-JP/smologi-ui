'use client';

// エラー表示の共通バナー。読み上げのために role="alert" を必ず付ける。
//
// フェーズ1では「新しく書くときの受け皿」として置いてある。既存の個別実装
// （`rounded-md border border-red-200 bg-red-50 …` の手書き）を一括で置き換えるのはフェーズ2。
// 新規のエラー表示はこれを使うこと。

import type { ReactNode } from 'react';

export type ErrorBannerSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<ErrorBannerSize, string> = {
  sm: 'px-3 py-2 text-[12px] leading-[18px]',
  md: 'px-3 py-2 text-[14px] leading-[22px]',
  lg: 'p-4 text-[14px] leading-[22px]',
};

export function ErrorBanner({
  message,
  size = 'md',
  className = '',
  onRetry,
  retryLabel = '再試行',
  children,
}: {
  /** null / 空文字なら何も描画しない（呼び出し側で && を書かなくてよい）。 */
  message?: ReactNode;
  size?: ErrorBannerSize;
  className?: string;
  /** 渡すと再試行ボタンを出す（size 'sm' は文中の下線リンク、それ以外は本文の下のボタン）。 */
  onRetry?: () => void;
  retryLabel?: string;
  /** 再試行ボタンなど、本文の下に足したいもの。 */
  children?: ReactNode;
}) {
  if (message == null || message === '') return null;
  return (
    <div
      role="alert"
      className={`rounded-md border border-[rgb(var(--danger-ink)/0.25)] bg-[rgb(var(--danger-soft))] text-[rgb(var(--danger-ink))] ${SIZE_CLASS[size]} ${className}`}
    >
      {onRetry && size !== 'sm' ? <p>{message}</p> : message}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={size === 'sm'
            ? 'ml-2 font-semibold underline'
            : 'mt-3 h-10 rounded-lg border border-[rgb(var(--danger-ink)/0.5)] bg-[rgb(var(--surface))] px-4 text-[14px] leading-[22px] font-semibold text-[rgb(var(--danger-ink))] active:bg-[rgb(var(--danger-soft))]'}
        >
          {retryLabel}
        </button>
      )}
      {children}
    </div>
  );
}
