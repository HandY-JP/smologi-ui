'use client';
// その場編集の下書きを持つフック。編集中は保存せず、完了で commit を 1 回だけ呼ぶ。
// 下書きはここ（コンポーネント状態）にだけ持つので、編集中に画面を離れると捨てられる。
import { useCallback, useEffect, useRef, useState } from 'react';
import { appendItem, cycleItemSize, draftFor, removeItem, reorderItems } from './layout';
import type { LayoutItem, WidgetDef } from './types';

export function useLayoutEditor<T extends LayoutItem>({
  layout,
  defs,
  commit,
  onStart,
  onCancel,
  resetKey,
}: {
  layout: T[];
  defs: readonly WidgetDef[];
  /** 完了時に 1 回だけ呼ぶ（保存）。 */
  commit: (next: T[]) => void;
  /** 編集開始時に呼ぶ（遅れて届いたサーバー応答で土台が変わらないようにする等）。 */
  onStart?: () => void;
  /** 保存せずに編集を終えたとき（やめる・変更なしの完了・resetKey の変化）に呼ぶ。 */
  onCancel?: () => void;
  /** 変わったら下書きを捨てる（アカウント切替など。旧キーの下書きを新しい対象に保存しない）。 */
  resetKey?: string;
}) {
  const [state, setState] = useState<{ key: string | undefined; items: T[] } | null>(null);
  const draft = draftFor(state, resetKey);
  const setDraft = useCallback(
    (fn: (d: T[] | null) => T[] | null) =>
      setState((s) => {
        const cur = draftFor(s, resetKey);
        const next = fn(cur);
        return next ? { key: resetKey, items: next } : null;
      }),
    [resetKey],
  );
  const editing = draft !== null;
  // 編集中に resetKey が変わったら、下書きを捨てて呼び出し側にも知らせる。
  const staleRef = useRef(false);
  useEffect(() => {
    if (state && state.key !== resetKey) {
      if (!staleRef.current) { staleRef.current = true; onCancel?.(); }
      setState(null); // 旧キーの下書きを捨てる（A→B→A で復活させない）
    } else {
      staleRef.current = false;
    }
  }, [state, resetKey, onCancel]);

  const start = useCallback(() => {
    onStart?.();
    setDraft(() => layout); // 編集開始時のスナップショット
  }, [layout, onStart, setDraft]);
  const done = useCallback(() => {
    if (draft && draft !== layout) commit(draft);
    else onCancel?.();
    setDraft(() => null);
  }, [draft, layout, commit, onCancel, setDraft]);
  const cancel = useCallback(() => {
    onCancel?.();
    setDraft(() => null);
  }, [onCancel, setDraft]);

  const reorder = useCallback((a: string, o: string) => setDraft((d) => (d ? reorderItems(d, a, o) : d)), [setDraft]);
  const remove = useCallback((id: string) => setDraft((d) => (d ? removeItem(d, id) : d)), [setDraft]);
  const cycleSize = useCallback((id: string) => setDraft((d) => (d ? cycleItemSize(d, id, defs) : d)), [defs, setDraft]);
  const add = useCallback((id: string) => setDraft((d) => (d ? appendItem(d, id) : d)), [setDraft]);

  return { editing, current: draft ?? layout, start, done, cancel, reorder, remove, cycleSize, add };
}
