/** 「すべてのページ」パネルの既定 id（ボタンの aria-controls と、アプリ側のパネルの id を合わせる）。 */
export declare const ALL_PAGES_PANEL_ID = "all-pages-panel";
/**
 * ドック（▶・ホームの右）の「すべてのページ」アイコンボタン。
 * 開閉の状態とパネル本体はアプリが持つ（open / onToggle で受ける）。
 *
 * - `data-all-pages-trigger`: パネルを閉じたときのフォーカス戻し先、外側クリック判定の除外対象を
 *   アプリ側が探すための目印。落とさないこと。
 * - 開いているときだけ aria-controls でパネル（id=panelId）を指す。
 */
export declare function AllPagesDockButton({ open, onToggle, panelId, }: {
    open: boolean;
    onToggle: () => void;
    panelId?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=AllPagesDockButton.d.ts.map