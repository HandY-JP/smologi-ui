/** 管理画面の実スクローラーの DOM id（ChromeMain）。 */
export declare const ADMIN_SCROLLER_ID = "app-main";
/**
 * `#app-main`（既定）のスクロール量から「畳み状態」を判定する
 * （24pxより下なら畳み／最上部付近まで戻ると通常）。capture フェーズで拾うので、window 自体は
 * スクロールしない構成（#app-main が内側でスクロールする）でも判定できる。
 * `scrollToTop` は同じスクローラーを先頭へ戻す（畳み時の「上へ戻る」用）。
 */
export declare function useTopbarCompaction(scrollerId?: string): {
    compact: boolean;
    scrollToTop: () => void;
};
/**
 * 「/」で検索欄へフォーカス、1〜9で工程を切替える共通キーボードハンドラ。
 * 入力中（input/textarea/select/contentEditable）・修飾キー併用（Cmd/Ctrl/Alt。ブラウザ標準の
 * ショートカットを奪わないため）・モーダル表示中（role="dialog"/"alertdialog"）は横取りしない。
 */
export declare function useTopbarShortcuts({ onFocusSearch, onSelectStageByIndex, stageCount, enabled, }: {
    onFocusSearch: () => void;
    onSelectStageByIndex: (index: number) => void;
    stageCount: number;
    /**
     * false の間はキーを一切横取りしない（「/」の preventDefault もしない）。
     * 同じコンポーネントを新旧UIで共用する画面（商品マスタの管理／お客様）で使う。
     */
    enabled?: boolean;
}): void;
//# sourceMappingURL=useTopbarCompaction.d.ts.map