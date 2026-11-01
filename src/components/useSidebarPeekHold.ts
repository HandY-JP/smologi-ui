'use client';
// 開いている間はサイドバーの一時展開（ピーク）を閉じさせない。アカウントメニュー・ストア切り替えなど
// 「ピーク中に押して開く」ものへ付ける。smologi / amazon-app の use-sidebar-peek-hold と同じ挙動。
import { useEffect, useId } from 'react';
import { holdSidebarPeek, releaseSidebarPeek } from '../lib/sidebar-peek';

export function useSidebarPeekHold(active: boolean): void {
  const id = useId();
  useEffect(() => {
    if (!active) return;
    holdSidebarPeek(id);
    return () => releaseSidebarPeek(id);
  }, [active, id]);
}
