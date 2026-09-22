'use client';
// トップバー再設計（2026-09）: スクロールで「畳み」を判定するフック。
// 判定そのもの（閾値・スクロール量の解決）は src/lib/topbar-compaction.ts の
// 純粋関数に寄せてあり、ここは DOM 配線だけを担う。
//
// Opus レビュー指摘（重要）: 管理画面の実際のスクローラーは window ではなく
// `#app-main`（ChromeMain, overflow-y-auto）。window.scrollY は常に 0 のままなので、
// window のスクロールだけを見ていると畳みが一切発火しない。ここでは
// `window.addEventListener('scroll', fn, true)`（capture）で #app-main を含む
// 子要素のスクロールも拾い、実際の値は resolveScrollTop 経由で #app-main の scrollTop を読む
// （#app-main が見つからない環境ではフォールバックとして window.scrollY を使う）。
import { useEffect, useRef, useState } from 'react';
import {
  INITIAL_COMPACTION_STATE,
  nextCompactionState,
  resolveScrollTop,
  type CompactionState,
} from '../lib/topbar-compaction';

/** 管理画面の実スクローラーの DOM id（ChromeMain）。 */
export const ADMIN_SCROLLER_ID = 'app-main';

/**
 * `#app-main`（既定）のスクロール量から「畳み状態」を判定する
 * （24pxより下なら畳み／最上部付近まで戻ると通常）。capture フェーズで拾うので、window 自体は
 * スクロールしない構成（#app-main が内側でスクロールする）でも判定できる。
 * `scrollToTop` は同じスクローラーを先頭へ戻す（畳み時の「上へ戻る」用）。
 */
export function useTopbarCompaction(scrollerId: string = ADMIN_SCROLLER_ID): {
  compact: boolean;
  scrollToTop: () => void;
} {
  const [compact, setCompact] = useState(false);
  const stateRef = useRef<CompactionState>(INITIAL_COMPACTION_STATE);
  const rafRef = useRef(0);

  useEffect(() => {
    const measure = () => {
      rafRef.current = 0;
      const scroller = document.getElementById(scrollerId);
      const y = resolveScrollTop(scroller, window.scrollY);
      const next = nextCompactionState(stateRef.current, y);
      if (next !== stateRef.current) {
        stateRef.current = next;
        setCompact(next.compact);
      }
    };
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(measure);
    };
    // capture: true — #app-main（子孫要素）のスクロールは window までバブリングしないため、
    // capture フェーズで window に付けて拾う（target に到達する前に window 側が先に発火する）。
    window.addEventListener('scroll', onScroll, true);
    measure();
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [scrollerId]);

  const scrollToTop = () => {
    const scroller = document.getElementById(scrollerId);
    if (scroller) scroller.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { compact, scrollToTop };
}

/**
 * 「/」で検索欄へフォーカス、1〜9で工程を切替える共通キーボードハンドラ。
 * 入力中（input/textarea/select/contentEditable）・修飾キー併用（Cmd/Ctrl/Alt。ブラウザ標準の
 * ショートカットを奪わないため）・モーダル表示中（role="dialog"/"alertdialog"）は横取りしない。
 */
export function useTopbarShortcuts({
  onFocusSearch,
  onSelectStageByIndex,
  stageCount,
  enabled = true,
}: {
  onFocusSearch: () => void;
  onSelectStageByIndex: (index: number) => void;
  stageCount: number;
  /**
   * false の間はキーを一切横取りしない（「/」の preventDefault もしない）。
   * 同じコンポーネントを新旧UIで共用する画面（商品マスタの管理／お客様）で使う。
   */
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || active?.isContentEditable) return;
      // モーダル表示中（Modal.tsx は role="dialog"/"alertdialog" を必ず持つ）はページのショートカットを止める。
      //
      // 不具合（2026-09-15・商品マスタの実機確認で発覚）: AdminTopBar は ヘルプ／フィードバック／
      // お知らせ の3ドロワーを**常時 DOM に置いたまま**（閉じている間は aria-hidden="true" ＋
      // 画面外へ translate）で持っている。単純な querySelector だと管理画面では常にこの3つが
      // 引っかかり、「/」も 1〜9 も一度も効かない状態になっていた（入荷・出荷も同じ）。
      // 閉じているもの（aria-hidden / inert / hidden / display:none）は数えない。
      const openDialog = Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"]'))
        .some((el) => {
          if (el.getAttribute('aria-hidden') === 'true') return false;
          if (el.hasAttribute('inert') || el.hasAttribute('hidden')) return false;
          return (el as HTMLElement).getClientRects().length > 0;
        });
      if (openDialog) return;
      if (event.key === '/') {
        event.preventDefault();
        onFocusSearch();
        return;
      }
      const n = Number(event.key);
      if (Number.isInteger(n) && n >= 1 && n <= stageCount) {
        onSelectStageByIndex(n - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onFocusSearch, onSelectStageByIndex, stageCount]);
}
