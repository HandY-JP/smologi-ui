'use client';

// 状態の小さなピル（未返信・利用中・終了など）。アイコンは任意で左に付ける。
// 名前は TonePill（アプリ側の StatusPill と衝突させないため）。

import type { ReactNode } from 'react';

export type TonePillTone = 'accent' | 'solid' | 'ok' | 'warn' | 'bad' | 'info' | 'mute';
export type TonePillSize = 'sm' | 'md';

const TONE_CLASS: Record<TonePillTone, string> = {
  accent: 'bg-[var(--accent-subtle)] text-[var(--sb-accent-bg)]',
  // 選択行など、淡い地に溶けないよう塗りで出す
  solid: 'bg-[var(--sb-accent-bg)] text-white',
  ok: 'bg-emerald-50 text-emerald-700',
  warn: 'bg-amber-50 text-amber-700',
  bad: 'bg-rose-50 text-rose-700',
  info: 'bg-sky-50 text-sky-700',
  mute: 'bg-gray-100 text-gray-500',
};

// sm: 文中の小さなピル。md: 件数などの丸バッジ（22px・中央寄せ）。
const SIZE_CLASS: Record<TonePillSize, string> = {
  sm: 'px-2 py-px text-[11px] leading-[16px]',
  md: 'h-[22px] min-w-[22px] justify-center px-1.5 text-[12px] leading-[22px] tabular-nums',
};

export function TonePill({
  tone = 'mute',
  size = 'sm',
  icon,
  children,
  className = '',
  title,
  ariaLabel,
}: {
  tone?: TonePillTone;
  size?: TonePillSize;
  /** 左に出す小さなアイコン（14px 程度）。 */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  title?: string;
  /** 読み上げ用の文言（件数バッジの「3件」など）。 */
  ariaLabel?: string;
}) {
  return (
    <span
      title={title}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full font-semibold ${SIZE_CLASS[size]} ${TONE_CLASS[tone]} ${className}`}
    >
      {icon && <span aria-hidden className="inline-flex flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
