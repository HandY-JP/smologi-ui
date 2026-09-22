'use client';
// アプリ共通の「クローム」状態（右からドッキングするパネルの開閉）を共有するコンテキスト。
// お客様画面（CustomerTopBar）と管理画面（AdminTopBar）の両方で使う。
// パネルの開閉ボタン/ドロワー本体はトップバー、メイン領域の押しのけ（右マージン）は ChromeMain が、
// 同じ state を参照する必要があるためレイアウト直下で provider を張る。
import { createContext, useContext, useState } from 'react';

export type ChromePanel = null | 'feedback' | 'help';

/**
 * ヘルプドロワー（HelpDrawer/HelpCenterDrawer）の DOM id。
 * サイドバー最上部の開閉ドック（SidebarToggleDock）のトリガーボタンから `aria-controls` で
 * 参照する（トリガーとドロワー本体は別コンポーネント・別の親に描画されるため、id で結ぶ）。
 * admin/customer で別の実装（HelpDrawer / HelpCenterDrawer）を使うが、同時にマウントされる
 * ことは無いので同じ id を共用してよい。
 */
export const HELP_DRAWER_ID = 'smologi-help-drawer';

/**
 * ヘルプの開閉トリガーは2026-09にサイドバー最上部の開閉ドック（SidebarToggleDock）へ
 * 移設した。当初はドックが ChromeProvider の外（<aside> の外・layout.tsx でサイドバーが
 * ChromeProvider の兄弟として描画されていた）にあり、panel state を直接共有できなかったため、
 * カスタムイベント（旧 OPEN_HELP_EVENT 等）で疎結合に繋いでいたが、レビュー指摘を受けて
 * ChromeProvider をサイドバーごと包むようレイアウト（admin/logistics/layout.tsx・
 * customer/layout.tsx）を直した。ChromeProvider は DOM を描画しない（Context.Provider の
 * children をそのまま返す）ので、この持ち上げでレイアウトは変わらない。
 * これにより SidebarToggleDock からも useChrome() を直接呼べるようになり、
 * イベントブリッジは不要になった（削除済み）。ドロワー本体（HelpDrawer/HelpCenterDrawer）の
 * 所有権は従来どおりトップバー（AdminTopBar/CustomerTopBar）側に残す。
 * 通知ベル（NotificationDrawer）は 2026-09-22 に廃止した（要対応ドットへ置き換え）。
 */

/**
 * 本番崩れ修正（2026-09-14・Opus 実物レビュー）: 幅約1230px（本文幅≈980px）だと、
 * 第1行の「道具バー＋工程セグメント＋検索ピル」の合計実測幅がその幅を超え、
 * 工程セグメントが道具バーへ重なって隠れていた（flex-shrink-0 同士は縮まないため）。
 * AdminTopBar 自身が第1行の実際の描画幅（ResizeObserver 実測）から必要幅を計算し、
 * 入りきらないときはこの値を書き換える。ページ側（入荷・出荷）はこれを読んで
 * 工程セグメントの描画先（第1行中央スロット／第2行の左端）と検索ピルの確定幅を切り替える。
 * 計測前（初回描画・幅0）は pillWidthPx=null・processInRow2=false（従来どおり第1行）が既定。
 */
export type TopBarFit = {
  /** 検索ピルの確定幅（px）。null のときはページ側の既定 clamp をそのまま使う。 */
  pillWidthPx: number | null;
  /** true のとき、通常時の工程セグメントは第1行ではなく第2行の左端へ回す（ページ側が描画）。 */
  processInRow2: boolean;
};

export const DEFAULT_TOP_BAR_FIT: TopBarFit = { pillWidthPx: null, processInRow2: false };

type ChromeValue = {
  panel: ChromePanel;
  setPanel: React.Dispatch<React.SetStateAction<ChromePanel>>;
  /**
   * トップバー再設計（2026-09、入荷・出荷から順次適用）: ページ側がスクロールで「畳み」判定した
   * ときに true にし、AdminTopBar（sticky 64px+ヘッダー）をそのページの表示中だけ高さ0へ畳む。
   * 畳んだ間はページ側が別途 fixed の浮遊ガラスカプセル（FloatingGlassDock）を出す。
   * 既定は false ＝ 他の全ページは今までどおり常時表示（このフラグを触らないページは無関係）。
   */
  topBarCollapsed: boolean;
  setTopBarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  /** 上記 TopBarFit 参照。AdminTopBar が書き込み、ページ側（入荷・出荷）が読む。 */
  topBarFit: TopBarFit;
  setTopBarFit: React.Dispatch<React.SetStateAction<TopBarFit>>;
};

const ChromeCtx = createContext<ChromeValue | null>(null);

export function ChromeProvider({ children }: { children: React.ReactNode }) {
  const [panel, setPanel] = useState<ChromePanel>(null);
  const [topBarCollapsed, setTopBarCollapsed] = useState(false);
  const [topBarFit, setTopBarFit] = useState<TopBarFit>(DEFAULT_TOP_BAR_FIT);
  return (
    <ChromeCtx.Provider value={{ panel, setPanel, topBarCollapsed, setTopBarCollapsed, topBarFit, setTopBarFit }}>
      {children}
    </ChromeCtx.Provider>
  );
}

export function useChrome() {
  const ctx = useContext(ChromeCtx);
  if (!ctx) throw new Error('useChrome must be used within ChromeProvider');
  return ctx;
}

// Provider 外でも安全に使える版（無ければ null）。ヘルプ連動の項目ガイドなど、
// クロームが無い文脈でも壊れないようにしたいコンポーネント向け。
export function useChromeOptional() {
  return useContext(ChromeCtx);
}

// パネルを開くとメイン領域を縮め、現れたグレー地（＝トップバー色）の中に
// 白いパネルカードが並ぶ「押しのけ式」。共通パネルは context、ページ固有パネルは
// ページ固有パネルは --chrome-right-panel-width / --chrome-left-panel-width で
// 左右どちらのレイアウトにも参加できる。
// モバイル（< sm）はパネルが全幅オーバーレイのため押しのけない。
export function ChromeMain({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { panel } = useChrome();
  return (
    // ドロワー（Help/HelpCenter）の開閉アニメーションを撤去したのに合わせ、
    // 押しのけ側のマージン遷移も外して即時に揃える（レビュー指摘）。
    <main
      id="app-main"
      className={`${className} min-w-0 ${panel ? 'sm:ml-0 sm:mr-[384px]' : 'sm:ml-[var(--chrome-left-panel-width,0px)] sm:mr-[var(--chrome-right-panel-width,0px)]'}`}
    >
      {children}
    </main>
  );
}
