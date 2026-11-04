'use client';

// 返信欄。上に道具スロット（テンプレ・AI 下書きなど）、本文の textarea、
// 下に補足スロット＋送信ボタン。文面の中身や送信処理はアプリ側。

import type { ReactNode } from 'react';

export function ReplyComposer({
  value,
  onChange,
  onSend,
  id,
  tools,
  footer,
  label = '送信',
  busy = false,
  disabled = false,
  placeholder,
  rows = 4,
  className = '',
}: {
  value: string;
  onChange: (next: string) => void;
  onSend: () => void;
  /** textarea の id（ラベルとの関連付け用）。 */
  id?: string;
  /** textarea の上。ボタン類を並べる。 */
  tools?: ReactNode;
  /** 送信ボタンの左。文字数・注意書きなど。 */
  footer?: ReactNode;
  /** 送信ボタンの文言。 */
  label?: string;
  /** 送信中。ボタンは押せず、textarea も触れない。 */
  busy?: boolean;
  /** 送信を許可しない（本文が空など）。 */
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm ${className}`}>
      {tools && <div className="flex flex-wrap items-center gap-1.5">{tools}</div>}
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        disabled={busy}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[84px] w-full resize-y rounded-md border-0 bg-transparent p-0 text-[13px] leading-[20px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 disabled:opacity-60"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 text-[12px] leading-[18px] text-gray-500">{footer}</div>
        <button
          type="button"
          onClick={onSend}
          disabled={busy || disabled}
          aria-busy={busy}
          className="inline-flex h-8 flex-shrink-0 items-center rounded-full bg-[var(--sb-accent-bg)] px-4 text-[14px] leading-[22px] font-semibold text-[var(--accent-on)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? '送信中…' : label}
        </button>
      </div>
    </div>
  );
}
