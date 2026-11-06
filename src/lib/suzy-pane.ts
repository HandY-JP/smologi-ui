'use client';

/**
 * スージーの右ペイン（v0.21.0）。広い画面（既定 1440px 以上）ではチャットをポップオーバーで重ねず、
 * 右に 380px のペインとして並べ、本文を縮める。それより狭い画面・スマホは従来どおりポップオーバー／シート。
 *
 * 使い方（アプリ側は 3 か所だけ）:
 * 1. チャット本体で `const { isPane } = useSuzyPane({ open })`。isPane が true の間は className を
 *    `suzy-pane` 系（components.css）にして、ポップオーバーの位置指定をやめる
 * 2. 本文を包む要素（サイドバーの右・トップバーの下の領域）に `className="suzy-pane-pad"` を付ける
 *    （= `margin-right: var(--suzy-pane-w, 0px)`。ペインが開いている間だけ --suzy-pane-w が 380px になる）
 * 3. 本文側で「ペインが開いたら閉じたい右ペイン（商品詳細など）」は `useSuzyPaneActive()` を見る
 *
 * 状態は <html> の CSS 変数 --suzy-pane-w（開いている間だけ 380px、それ以外は 0px）と
 * data-suzy-pane="open" 属性に出る。変数を使えば React 以外（素の CSS）からも参照できる。
 */
import { useEffect, useState, useSyncExternalStore } from 'react';

export const SUZY_PANE_BREAKPOINT = 1440;
export const SUZY_PANE_WIDTH = 380;

let active = false;
const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
function setActive(next: boolean) {
  if (active === next) return;
  active = next;
  listeners.forEach((fn) => fn());
}

/** 右ペインとして開いているか。ペインが開いたら閉じたい別の右ペインを持つ画面が見る。 */
export function useSuzyPaneActive(): boolean {
  return useSyncExternalStore(subscribe, () => active, () => false);
}

export interface UseSuzyPaneOptions {
  /** チャットが開いているか。 */
  open: boolean;
  /** ペインにする最小の画面幅（px）。既定 1440。 */
  breakpoint?: number;
  /** ペインの幅（px）。既定 380。 */
  width?: number;
}

export function useSuzyPane({ open, breakpoint = SUZY_PANE_BREAKPOINT, width = SUZY_PANE_WIDTH }: UseSuzyPaneOptions): { isPane: boolean; active: boolean } {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const read = () => setWide(mq.matches);
    read();
    mq.addEventListener('change', read);
    return () => mq.removeEventListener('change', read);
  }, [breakpoint]);

  const on = wide && open;
  useEffect(() => {
    const root = document.documentElement;
    if (on) {
      root.style.setProperty('--suzy-pane-w', `${width}px`);
      root.setAttribute('data-suzy-pane', 'open');
    } else {
      root.style.setProperty('--suzy-pane-w', '0px');
      root.removeAttribute('data-suzy-pane');
    }
    setActive(on);
    return () => {
      root.style.removeProperty('--suzy-pane-w');
      root.removeAttribute('data-suzy-pane');
      setActive(false);
    };
  }, [on, width]);

  return { isPane: wide, active: on };
}
