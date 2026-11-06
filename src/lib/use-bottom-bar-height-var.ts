'use client';
// 画面下の固定/sticky の操作バー（一括操作ピル・作成ページの下部バー・ページ送りなど。`data-bottom-bar` を付けた要素）が
// 画面下端にあるとき、その高さ（＋すき間）を <html> の CSS 変数 --bottom-bar-h に立てる。
// 下に出る浮いた部品（トースト・サポートの起動ボタンなど）は bottom にこの変数を使って、バーと重ならないよう上へよける。
// 複数の場所で呼んでも、測る値は同じなので問題ない。
import { useEffect } from 'react';

const BAR_GAP = 8;

export function useBottomBarHeightVar(enabled = true): void {
  useEffect(() => {
    if (!enabled) return undefined;
    const root = document.documentElement;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const vh = window.innerHeight;
      let h = 0;
      document.querySelectorAll<HTMLElement>('[data-bottom-bar]').forEach((el) => {
        const r = el.getBoundingClientRect();
        // 見えていて、下端が画面の下 80px 以内にあるものだけ（本文の途中にあるものは対象外）。
        if (r.height < 1 || r.width < 1 || r.top >= vh || r.bottom < vh - 80) return;
        h = Math.max(h, vh - r.top);
      });
      root.style.setProperty('--bottom-bar-h', h > 0 ? `${Math.round(h + BAR_GAP)}px` : '0px');
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    window.addEventListener('resize', schedule);
    // 本文のスクロール（#app-main）も拾う。sticky のバーは位置が変わるため。
    window.addEventListener('scroll', schedule, { capture: true, passive: true });
    schedule();
    return () => {
      mo.disconnect();
      ro.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, { capture: true });
      if (frame) window.cancelAnimationFrame(frame);
      root.style.removeProperty('--bottom-bar-h');
    };
  }, [enabled]);
}
