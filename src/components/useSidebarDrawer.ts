'use client';
// md 未満（767px 以下）はサイドバーを常時オーバーレイのドロワーにする（折りたたみの永続状態とは独立）。
// ページ遷移したらドロワーは閉じる（オーバーレイが本文を隠したままにならないように）。
import { useEffect, useState } from 'react';

export function useSidebarDrawer(pathname: string) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  // ルート変更という外部イベントへの同期なので、この setState は意図的。
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  return { isMobile, mobileOpen, setMobileOpen };
}
