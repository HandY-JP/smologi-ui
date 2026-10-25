import type { LayoutItem, WidgetDef, WidgetSize } from './types';
export declare function isWidgetSize(value: unknown): value is WidgetSize;
/** 旧形式（列数 w）→ サイズ。4→S, 6→M, 8→L, 12→W。それ以外は null。 */
export declare function legacyWidthToSize(w: unknown): WidgetSize | null;
/** 選べるサイズの中で、列数がいちばん近いもの。同点なら大きい方。 */
export declare function snapSize(allowed: readonly WidgetSize[], desired: WidgetSize): WidgetSize;
export declare function defaultLayoutFor(defs: readonly WidgetDef[]): LayoutItem[];
/**
 * 保存値（壊れていてもよい）を定義に合わせる。
 * 未知 id は捨てる／重複は最初のものだけ／足りない id は既定で末尾／on が真偽値でなければ既定／
 * size と旧 w の両方を読む（size 優先）。選べないサイズは snapSize で寄せる。
 */
export declare function normalizeItems(defs: readonly WidgetDef[], raw: unknown): LayoutItem[];
export declare function visibleItems<T extends LayoutItem>(layout: readonly T[]): T[];
/** active を over のいる位置へ移す（非表示を含む全体の並びの中で）。 */
export declare function reorderItems<T extends LayoutItem>(layout: T[], activeId: string, overId: string): T[];
/** サイズを選べる順に 1 つ進める。選べるサイズが 1 つなら変えない。 */
export declare function cycleItemSize<T extends LayoutItem>(layout: T[], id: string, defs: readonly WidgetDef[]): T[];
export declare function removeItem<T extends LayoutItem>(layout: T[], id: string): T[];
/** 表示にする。表示中の末尾（非表示の手前）に足す。 */
export declare function appendItem<T extends LayoutItem>(layout: T[], id: string): T[];
/** 下書き状態が今の resetKey のものなら items、違う（別アカウントの）ものや無しなら null。 */
export declare function draftFor<T>(state: {
    key: string | undefined;
    items: T[];
} | null, key: string | undefined): T[] | null;
//# sourceMappingURL=layout.d.ts.map