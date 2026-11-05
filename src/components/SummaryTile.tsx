'use client';

// 画面上部に並べるサマリータイル。棚ボード発祥の見た目を admin 各画面で共有する。
// 数値は tabular-nums + ja-JP 区切り。文字列を渡せばそのまま出す（「—」や単位付きなど）。

export type SummaryTileTone = 'slate' | 'emerald' | 'sky' | 'amber' | 'rose' | 'gray';

const TONE_CLASS: Record<SummaryTileTone, string> = {
  slate: 'text-[rgb(var(--ink))]',
  emerald: 'text-[rgb(var(--success-ink))]',
  sky: 'text-[rgb(var(--accent-ink))]',
  amber: 'text-[rgb(var(--warning-ink))]',
  rose: 'text-[rgb(var(--danger-ink))]',
  gray: 'text-[rgb(var(--ink-muted))]',
};

export function SummaryTile({
  label,
  sublabel,
  value,
  tone = 'slate',
  variant = 'card',
}: {
  label: string;
  sublabel?: string;
  value: number | string;
  tone?: SummaryTileTone;
  /**
   * 'card'（既定）は従来の枠付き。'flat' は枠なし一覧（ADMIN_FLAT_*）へ載せ替えた画面用で、
   * 一覧と同じく外枠・角丸を持たない（2026-09-23 請求ページから。他画面は据え置き）。
   */
  variant?: 'card' | 'flat';
}) {
  return (
    <div className={variant === 'flat' ? 'bg-[rgb(var(--surface))] px-1 py-1' : 'rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] px-3 py-2'}>
      <p className="text-[11px] leading-[16px] font-medium text-[rgb(var(--ink-muted))]">{label}</p>
      {sublabel && <p className="truncate text-[11px] leading-[16px] text-[rgb(var(--ink-muted))]" title={sublabel}>{sublabel}</p>}
      <p className={`mt-0.5 text-[22px] leading-[30px] font-semibold tabular-nums ${TONE_CLASS[tone]}`}>
        {typeof value === 'number' ? value.toLocaleString('ja-JP') : value}
      </p>
    </div>
  );
}
