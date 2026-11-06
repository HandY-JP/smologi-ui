'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  parseSavedColumnWidths,
  resolveColumnWidths,
  serializeColumnWidths,
  withColumnWidth,
  withoutColumnWidth,
  type ColumnWidthOverrides,
  type ColumnWidthSpec,
} from '../lib/column-widths';

export interface UseColumnWidthsResult {
  /** 実際に使う幅(px)。null＝伸縮列（固定幅なし）。 */
  widths: Record<string, number | null>;
  widthOf: (key: string) => number | null;
  setWidth: (key: string, px: number) => void;
  /** 複数列の幅をまとめて設定（各列の最小幅へ丸め、setWidth と同じく保存）。auto レイアウトの表を最初のドラッグで固定化するときに使う。 */
  seedWidths: (widths: Record<string, number>) => void;
  /** その列だけ既定へ戻す。 */
  resetColumn: (key: string) => void;
  /** 全列を既定へ戻す。 */
  resetAll: () => void;
  /** 既定と違う幅が 1 列でもあるか。 */
  isCustomized: boolean;
}

/**
 * 表の最初の見出し行（thead の最初の tr）から、`th[attr]` の実寸(px, 四捨五入)を { 列キー: 幅 } で返す。
 * auto レイアウトの表を「最初のドラッグで固定化」するときの `seedWidths` の入力に使う。table が null なら {}。
 */
export function measureColumnWidths(table: HTMLTableElement | null, attr = 'data-col-key'): Record<string, number> {
  const out: Record<string, number> = {};
  const row = table?.tHead?.rows[0];
  if (!row) return out;
  for (const th of Array.from(row.querySelectorAll<HTMLElement>(`th[${attr}]`))) {
    const key = th.getAttribute(attr);
    if (key) out[key] = Math.round(th.getBoundingClientRect().width);
  }
  return out;
}

/**
 * 列幅の状態＋端末ごとの保存（localStorage）。
 * - 保存するのは既定から変えた列だけ。保存時の通知（トースト等）は出さない。
 * - SSR 安全: 描画中は window に触らず、マウント後の effect で読み込む（初回は既定幅）。
 * - localStorage の読み書きはすべて try/catch（プライベートモード等で失敗しても動く）。
 */
export function useColumnWidths(storageKey: string, specs: readonly ColumnWidthSpec[]): UseColumnWidthsResult {
  const [overrides, setOverrides] = useState<ColumnWidthOverrides>({});
  const hydrated = useRef(false);
  const loaded = useRef<ColumnWidthOverrides | null>(null);
  const specsRef = useRef(specs);
  specsRef.current = specs;
  // specs は毎回新しい配列で渡されがちなので、中身の署名で変化を見る。
  const signature = specs.map((s) => `${s.key}:${s.defaultWidth ?? 'auto'}:${s.minWidth ?? ''}:${s.resizable === false ? 0 : 1}`).join('|');

  useEffect(() => {
    hydrated.current = false;
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(storageKey);
    } catch {
      raw = null;
    }
    // 読み込んだ値が state に反映されるまで保存 effect は何もしない（マウント直後の removeItem→setItem を避ける）。
    const parsed = parseSavedColumnWidths(raw, specsRef.current);
    loaded.current = parsed;
    setOverrides(parsed);
  }, [storageKey, signature]);

  useEffect(() => {
    if (!hydrated.current) {
      if (overrides === loaded.current) hydrated.current = true;
      return;
    }
    try {
      const json = serializeColumnWidths(overrides, specsRef.current);
      if (json === '{}') window.localStorage.removeItem(storageKey);
      else window.localStorage.setItem(storageKey, json);
    } catch {
      // 保存できなくても画面内の操作は続ける。
    }
  }, [overrides, storageKey]);

  const widths = useMemo(() => resolveColumnWidths(specsRef.current, overrides), [overrides, signature]); // eslint-disable-line react-hooks/exhaustive-deps
  const widthOf = useCallback((key: string) => widths[key] ?? null, [widths]);
  const setWidth = useCallback((key: string, px: number) => {
    setOverrides((cur) => withColumnWidth(cur, specsRef.current, key, px));
  }, []);
  const seedWidths = useCallback((next: Record<string, number>) => {
    setOverrides((cur) => {
      let out: ColumnWidthOverrides = cur;
      for (const [key, px] of Object.entries(next)) out = withColumnWidth(out, specsRef.current, key, px);
      return out;
    });
  }, []);
  const resetColumn = useCallback((key: string) => setOverrides((cur) => withoutColumnWidth(cur, key)), []);
  const resetAll = useCallback(() => setOverrides({}), []);

  return { widths, widthOf, setWidth, seedWidths, resetColumn, resetAll, isCustomized: Object.keys(overrides).length > 0 };
}
