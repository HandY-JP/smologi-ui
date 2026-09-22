'use client';
// 一覧に複数の StickySectionHeader（グループ／日付の見出し）が並ぶとき、スクロールの仕方次第では
// 複数のセクションが同時に「stuck」（見出しのラインを通り過ぎた）状態になり得る。すべてを
// そのままガラス表示にすると、同じ画面位置（sticky の固定 top）にテキストが重なって表示されて
// しまう（StickySectionHeader.tsx が position:fixed で描画する都合上、CSS の sticky と違って
// 「後ろに隠れる」ができない）。
//
// この調停役は、各 StickySectionHeader の onStuckChange から stuck 状態を報告してもらい、
// 並び順（＝スクロール順）でいちばん後ろ（＝いちばん最近通り過ぎた）セクションの key だけを
// 「表示してよい（visuallyActive）」として返す。それ以外は stuck 中でも通常表示（＝画面外へ
// 素通りして見えなくなる）のままにする。
//
// 本番不具合修正（2026-09-15「200件表示でスクロールすると一覧が揺れる」）:
// 以前は報告のたびに stuck キーの Set を state に持ち直していたため、**どのセクションの
// 出入りでもページ全体（最大200行）が再レンダー**されていた。表示に効くのは「いちばん後ろの
// stuck キー」だけなので、Set は ref に置き、**勝者が変わったときだけ** state を更新する。
// これでスクロール中の再レンダーは「ガラス帯が別の見出しへ移る瞬間」だけになる。
import { useCallback, useEffect, useRef, useState } from 'react';

export function useLastStuckSection(orderedKeys: readonly string[]): {
  /** 現在ガラス表示してよいセクションの key。無ければ null。 */
  activeStuckKey: string | null;
  /** 各 StickySectionHeader の onStuckChange にそのまま渡す（key を bind して使う）。 */
  reportStuck: (key: string, stuck: boolean) => void;
} {
  const [activeStuckKey, setActiveStuckKey] = useState<string | null>(null);
  const stuckRef = useRef<Set<string>>(new Set());
  const orderedRef = useRef<readonly string[]>(orderedKeys);

  const recompute = useCallback(() => {
    const keys = orderedRef.current;
    let next: string | null = null;
    for (let i = keys.length - 1; i >= 0; i -= 1) {
      if (stuckRef.current.has(keys[i])) { next = keys[i]; break; }
    }
    setActiveStuckKey((prev) => (prev === next ? prev : next));
  }, []);

  const reportStuck = useCallback((key: string, stuck: boolean) => {
    if (stuckRef.current.has(key) === stuck) return;
    if (stuck) stuckRef.current.add(key);
    else stuckRef.current.delete(key);
    recompute();
  }, [recompute]);

  // 一覧が入れ替わった（ページ送り・絞り込み・タブ切替）とき: 消えたセクションの報告を捨て、
  // 並び順が変わったぶんの勝者を計算し直す。
  useEffect(() => {
    orderedRef.current = orderedKeys;
    if (stuckRef.current.size > 0) {
      const alive = new Set(orderedKeys);
      for (const key of [...stuckRef.current]) if (!alive.has(key)) stuckRef.current.delete(key);
    }
    recompute();
  }, [orderedKeys, recompute]);

  return { activeStuckKey, reportStuck };
}
