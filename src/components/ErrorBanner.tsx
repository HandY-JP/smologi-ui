'use client';

// エラー表示の共通バナー。読み上げのために role="alert" を必ず付ける。
//
// フェーズ1では「新しく書くときの受け皿」として置いてある。既存の個別実装
// （`rounded-md border border-red-200 bg-red-50 …` の手書き）を一括で置き換えるのはフェーズ2。
// 新規のエラー表示はこれを使うこと。

import type { ReactNode } from 'react';

export type ErrorBannerSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<ErrorBannerSize, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'p-4 text-sm',
};

export function ErrorBanner({
  message,
  size = 'md',
  className = '',
  children,
}: {
  /** null / 空文字なら何も描画しない（呼び出し側で && を書かなくてよい）。 */
  message?: ReactNode;
  size?: ErrorBannerSize;
  className?: string;
  /** 再試行ボタンなど、本文の下に足したいもの。 */
  children?: ReactNode;
}) {
  if (message == null || message === '') return null;
  return (
    <div
      role="alert"
      className={`rounded-md border border-red-200 bg-red-50 text-red-700 ${SIZE_CLASS[size]} ${className}`}
    >
      {message}
      {children}
    </div>
  );
}
