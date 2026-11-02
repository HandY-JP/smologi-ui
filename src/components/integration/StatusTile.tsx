'use client';

import type { StatusTileModel } from './types';

export function StatusTile({ label, tone, value, sub, lastSuccessAt }: StatusTileModel) {
  const note = sub ?? (lastSuccessAt ? `最終成功 ${lastSuccessAt}` : undefined);
  return (
    <div className={`sb-int sb-int-tile sb-int-tile--${tone} flex flex-col gap-0.5 rounded-[10px] px-3.5 py-3`} data-tone={tone}>
      <span className="sb-int-muted text-xs">{label}</span>
      <span className="sb-int-tile-value flex items-center gap-1.5 font-semibold">
        <span aria-hidden className={`sb-int-dot sb-int-dot--${tone} h-2 w-2 flex-none rounded-full`} />
        {value}
      </span>
      {note && <span className="sb-int-muted text-xs tabular-nums">{note}</span>}
    </div>
  );
}

/** 状態タイルの並び。幅に応じて折り返す（スマホは 1 列）。 */
export function StatusTileGrid({ tiles }: { tiles: StatusTileModel[] }) {
  if (tiles.length === 0) return null;
  return (
    <div className="mb-1.5 mt-5 grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(170px, 100%), 1fr))' }}>
      {tiles.map((t) => (
        <StatusTile key={t.label} {...t} />
      ))}
    </div>
  );
}
