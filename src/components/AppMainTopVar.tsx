'use client';

import { useLayoutEffect } from 'react';

// <main>（ChromeMain, id="app-main"）の実際のコンテンツが始まる位置を
// CSS 変数 --app-main-top として実測して配る。商品マスタの列見出しピル（sticky top-0）のように、
// <main> を縦スクロールの基準にする要素が、自分の max-h / sticky offset をこの値から逆算するために使う。
//
// - AppContentLeftVar と同じ「実測して CSS 変数に流す」流儀（あちらは既存変数からの計算式のみで
//   実測はしないが、置き場所・役割は同じ）。実測そのものは CustomerToolsDrawerViewport の
//   --customer-tools-top と同型（ResizeObserver + resize イベントで再計算）。
// - ImpersonationBanner・OperatorSwitchBanner は fixed 配置のトースト表示で、<main> の位置・高さには
//   影響しない。
//
// Opus レビュー指摘（重大, 2026-09-14）: 以前は「<main> 自身の rect.top + <main> 自身の
// padding-top（pt-8）」を「トップバー h-16 ＋ main の pt-8」の代理値として計算していた
// （admin/logistics/layout.tsx で AdminTopBar が <main> の外側の兄弟にあり、<main> 自身は
// パディングだけを持っていたため成立していた式）。管理画面トップバー再設計で AdminTopBar を
// <main>（#app-main）の内側・先頭の子（sticky）へ移し、本文の px-4 pt-8 sm:px-6 も
// <main> 自身からは外して #app-main-content という内側の div（AdminTopBar の直後）へ移した
// ため、上の式は「AdminTopBar の高さ」を数えなくなり壊れる（常に 0 に近い値になる）。
// ここでは <main> 自身から逆算するのをやめ、#app-main-content の実測 rect.top を
// そのまま使う（＝コンテンツが実際に始まる Y 座標そのもの。AdminTopBar の高さ・畳み状態
// （入荷・出荷のスクロール圧縮）が変わっても自動的に正しい値になる）。
// #app-main-content が無いページ（customer 等・別実装）では、従来どおり <main> 自身の
// rect.top + padding-top にフォールバックする（CustomerTopBar 側は変更していない）。
export function AppMainTopVar() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const main = document.getElementById('app-main');
    if (!main) return;

    const update = () => {
      const content = document.getElementById('app-main-content');
      if (content) {
        const rect = content.getBoundingClientRect();
        root.style.setProperty('--app-main-top', `${Math.round(rect.top)}px`);
        return;
      }
      const rect = main.getBoundingClientRect();
      const paddingTop = parseFloat(getComputedStyle(main).paddingTop) || 0;
      root.style.setProperty('--app-main-top', `${Math.round(rect.top + paddingTop)}px`);
    };

    update();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(main);
    window.addEventListener('resize', update);
    // AdminTopBar の畳み/復帰（position: sticky ⇔ static）や第2行の高さ変化は main 自身の
    // サイズを変えないため、ResizeObserver（main を監視）だけでは拾えないことがある。
    // scroll イベントでも再計算し、実測値が古いままにならないようにする（軽い処理なので
    // rAF での間引きはせず素通し。他の scroll リスナー同様パッシブ）。
    window.addEventListener('scroll', update, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      root.style.removeProperty('--app-main-top');
    };
  }, []);

  return null;
}
