'use client';

// やり取りの吹き出し一覧（問い合わせ・チャット）。in＝相手、out＝自分側。
// 日付が変わるところに区切りを出す。スクロールは親が持つ（高さは親任せ）。

import type { ReactNode } from 'react';

export type ThreadMessage = {
  id: string;
  direction: 'in' | 'out';
  /** 本文（改行は保つ）。 */
  body: ReactNode;
  /** 送り手の表示名（「お客様」「ご担当」など）。 */
  sender?: string;
  /** ISO 文字列または Date。時刻表示と日付区切りに使う。 */
  at?: string | Date | null;
};

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const toDate = (v: ThreadMessage['at']): Date | null => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const dayLabel = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
const timeLabel = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export function MessageThread({
  messages,
  className = '',
  empty,
}: {
  messages: ThreadMessage[];
  className?: string;
  /** 0 件のときの表示。 */
  empty?: ReactNode;
}) {
  if (messages.length === 0) {
    return <div className={`p-6 text-center text-[14px] leading-[22px] text-gray-400 ${className}`}>{empty ?? 'やり取りはまだありません。'}</div>;
  }
  let prevDay = '';
  return (
    <div className={`flex flex-col gap-3.5 ${className}`}>
      {messages.map((m) => {
        const d = toDate(m.at);
        const key = d ? dayKey(d) : '';
        const showDay = d != null && key !== prevDay;
        if (d) prevDay = key;
        const out = m.direction === 'out';
        return (
          <div key={m.id} className="contents">
            {showDay && d && <div className="self-center text-[11px] leading-[16px] text-gray-400">{dayLabel(d)}</div>}
            <div className={`flex max-w-[86%] flex-col gap-1 md:max-w-[76%] ${out ? 'items-end self-end' : 'items-start self-start'}`}>
              <div
                className={`whitespace-pre-wrap break-words px-3.5 py-2.5 text-[13px] leading-relaxed text-gray-900 ${
                  out
                    ? 'rounded-2xl rounded-tr bg-[var(--accent-subtle)]'
                    : 'rounded-2xl rounded-tl bg-gray-100'
                }`}
              >
                {m.body}
              </div>
              {(m.sender || d) && (
                <span className="text-[11px] leading-[16px] text-gray-400">
                  {m.sender}
                  {m.sender && d ? ' ・ ' : ''}
                  {d ? timeLabel(d) : ''}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
