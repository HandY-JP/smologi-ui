'use client';

// 画面上部に並べるサマリータイル。棚ボード発祥の見た目を admin 各画面で共有する。
// 数値は tabular-nums + ja-JP 区切り。文字列を渡せばそのまま出す（「—」や単位付きなど）。

export type SummaryTileTone = 'slate' | 'emerald' | 'sky' | 'amber' | 'rose' | 'gray';

const TONE_CLASS: Record<SummaryTileTone, string> = {
  slate: 'text-gray-900',
  emerald: 'text-emerald-600',
  sky: 'text-sky-600',
  amber: 'text-amber-600',
  rose: 'text-rose-600',
  gray: 'text-gray-400',
};

export function SummaryTile({
  label,
  sublabel,
  value,
  tone = 'slate',
}: {
  label: string;
  sublabel?: string;
  value: number | string;
  tone?: SummaryTileTone;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      {sublabel && <p className="truncate text-[10px] text-gray-400" title={sublabel}>{sublabel}</p>}
      <p className={`mt-0.5 text-2xl font-bold tabular-nums ${TONE_CLASS[tone]}`}>
        {typeof value === 'number' ? value.toLocaleString('ja-JP') : value}
      </p>
    </div>
  );
}
