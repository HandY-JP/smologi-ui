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
  /** その列だけ既定へ戻す。 */
  resetColumn: (key: string) => void;
  /** 全列を既定へ戻す。 */
  resetAll: () => void;
  /** 既定と違う幅が 1 列でもあるか。 */
  isCustomized: boolean;
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
    setOverrides(parseSavedColumnWidths(raw, specsRef.current));
    hydrated.current = true;
  }, [storageKey, signature]);

  useEffect(() => {
    if (!hydrated.current) return;
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
  const resetColumn = useCallback((key: string) => setOverrides((cur) => withoutColumnWidth(cur, key)), []);
  const resetAll = useCallback(() => setOverrides({}), []);

  return { widths, widthOf, setWidth, resetColumn, resetAll, isCustomized: Object.keys(overrides).length > 0 };
}
