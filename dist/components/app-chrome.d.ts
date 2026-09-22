export type ChromePanel = null | 'feedback' | 'help';
/**
 * ヘルプドロワー（HelpDrawer/HelpCenterDrawer）の DOM id。
 * サイドバー最上部の開閉ドック（SidebarToggleDock）のトリガーボタンから `aria-controls` で
 * 参照する（トリガーとドロワー本体は別コンポーネント・別の親に描画されるため、id で結ぶ）。
 * admin/customer で別の実装（HelpDrawer / HelpCenterDrawer）を使うが、同時にマウントされる
 * ことは無いので同じ id を共用してよい。
 */
export declare const HELP_DRAWER_ID = "smologi-help-drawer";
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
export declare const DEFAULT_TOP_BAR_FIT: TopBarFit;
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
export declare function ChromeProvider({ children }: {
    children: React.ReactNode;
}): import("react").JSX.Element;
export declare function useChrome(): ChromeValue;
export declare function useChromeOptional(): ChromeValue | null;
export declare function ChromeMain({ className, children, }: {
    className?: string;
    children: React.ReactNode;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=app-chrome.d.ts.map