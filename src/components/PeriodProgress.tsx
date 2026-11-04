'use client';

// 期間の進み具合の細い線＋文言（「あと3日」「3日後に開始」「終了」）。
// 計算は lib/period.ts の computePeriodState。now を渡せば描画が決まる（テスト・SSR 用）。

import { computePeriodState, type PeriodInput } from '../lib/period';

export function PeriodProgress({
  start,
  end,
  now,
  showLabel = true,
  className = '',
}: {
  start?: PeriodInput;
  end?: PeriodInput;
  /** 現在時刻。省略すると描画時の現在時刻。 */
  now?: PeriodInput;
  /** 線の右に文言を出す。 */
  showLabel?: boolean;
  className?: string;
}) {
  const s = computePeriodState({ start, end, now });
  const pct = Math.round(s.ratio * 100);
  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={s.label}
        className="h-1 min-w-[48px] flex-1 overflow-hidden rounded-full bg-gray-100"
      >
        <div
          className={`h-full rounded-full ${s.phase === 'active' ? 'bg-[var(--sb-accent-bg)]' : 'bg-gray-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="flex-shrink-0 text-[11px] leading-[16px] text-gray-500">{s.label}</span>}
    </div>
  );
}
