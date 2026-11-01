/** ピークを開いたままにする領域の目印。 */
export declare const SIDEBAR_PEEK_REGION_ATTR = "data-sidebar-peek-region";
/**
 * 領域にする要素へそのまま spread する属性。
 * キーは SIDEBAR_PEEK_REGION_ATTR と同じ文字列（型を素直に保つためリテラルで書く。ずらさないこと）。
 */
export declare const sidebarPeekRegionProps: {
    'data-sidebar-peek-region': string;
};
/**
 * 領域の「すぐ外」と見なす余白（px）。
 * ドックとポップオーバーの間など、見た目の隙間をポインターが通過するだけで閉じないようにする。
 */
export declare const SIDEBAR_PEEK_NEAR_PX = 32;
/** いま登録されているピーク領域（＝目印の付いた要素）。 */
export declare function sidebarPeekRegions(): HTMLElement[];
/** node（イベントの target やフォーカス中の要素）がピーク領域の中にあるか。 */
export declare function isInsideSidebarPeekRegion(node: Node | null | undefined): boolean;
/** 矩形と点の距離（px）。点が矩形の中なら 0。distanceToSidebarPeekRegion の中身。 */
export declare function rectDistanceFromPoint(rect: {
    left: number;
    right: number;
    top: number;
    bottom: number;
}, x: number, y: number): number;
/**
 * 座標がピーク領域の矩形からどれだけ離れているか（px）。中にいれば 0。
 * 領域が1つも無ければ Infinity（＝閉じてよい）。
 * elementFromPoint ではなく矩形で測るのは、上に別の要素（モーダル等）が載っていても
 * 「サイドバーの上にいる」と判定したいから＋隙間の距離を測りたいため。
 */
export declare function distanceToSidebarPeekRegion(x: number, y: number): number;
/** 座標がピーク領域の中か。 */
export declare function isPointInsideSidebarPeekRegion(x: number, y: number): boolean;
/**
 * キーボード操作でピーク領域にフォーカスがあるか（Tab で入ってきた状態）。
 *
 * :focus-visible で見るのが肝。単に activeElement が領域内かで見ると、
 * マウスでサイドバーのリンクを押した直後（クリックした <a> にフォーカスが残る）まで
 * 「使用中」と見なされ、マウスを離してもサイドバーが引っ込まなくなる。
 */
export declare function isKeyboardFocusInsideSidebarPeekRegion(): boolean;
export declare function holdSidebarPeek(id: string): void;
export declare function releaseSidebarPeek(id: string): void;
export declare function hasSidebarPeekHold(): boolean;
/** 保持の増減を購読する（解除された瞬間に閉じ判定をやり直すため）。 */
export declare function onSidebarPeekHoldChange(listener: () => void): () => void;
/** テスト用。保持を全部落とす。 */
export declare function resetSidebarPeekHolds(): void;
//# sourceMappingURL=sidebar-peek.d.ts.map