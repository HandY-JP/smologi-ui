'use client';

// 状態の小さなピル（未返信・利用中・終了など）。アイコンは任意で左に付ける。
// 名前は TonePill（アプリ側の StatusPill と衝突させないため）。

import type { ReactNode } from 'react';

export type TonePillTone = 'accent' | 'ok' | 'warn' | 'bad' | 'info' | 'mute';

const TONE_CLASS: Record<TonePillTone, string> = {
  accent: 'bg-[var(--accent-subtle)] text-[var(--sb-accent-bg)]',
  ok: 'bg-emerald-50 text-emerald-700',
  warn: 'bg-amber-50 text-amber-700',
  bad: 'bg-rose-50 text-rose-700',
  info: 'bg-sky-50 text-sky-700',
  mute: 'bg-gray-100 text-gray-500',
};

export function TonePill({
  tone = 'mute',
  icon,
  children,
  className = '',
  title,
}: {
  tone?: TonePillTone;
  /** 左に出す小さなアイコン（14px 程度）。 */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-px text-[11px] leading-[16px] font-semibold ${TONE_CLASS[tone]} ${className}`}
    >
      {icon && <span aria-hidden className="inline-flex flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
