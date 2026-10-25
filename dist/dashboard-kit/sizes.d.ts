import type { WidgetSize } from './types';
export declare const WIDGET_SIZES: readonly WidgetSize[];
export declare const SIZE_LABEL: Record<WidgetSize, string>;
/** 12 列グリッドでの列数。 */
export declare const SIZE_COLS: Record<WidgetSize, number>;
/**
 * 小画面は 2 列（S/M=1列、L/W=2列）、さらに狭いと 1 列。L だけ 2 段ぶんの高さ。
 * 481px 未満は 1 列なので col-span-2 を付けない（暗黙の列を作らない）。
 */
export declare const SIZE_CLASS: Record<WidgetSize, string>;
/** グリッド本体。行の高さは固定（--row）で、中身で伸ばさない。row（dense にしない）。見た目の順＝並び順にして、ドラッグを予測できるようにする。 */
export declare const GRID_CLASS = "grid grid-cols-1 gap-4 auto-rows-[220px] grid-flow-row min-[481px]:grid-cols-2 min-[821px]:grid-cols-12";
/** 行の高さ（px）。L は gap 込みで 2 段ぶん = ROW*2 + gap。 */
export declare const WIDGET_ROW_HEIGHT_PX = 220;
export declare const WIDGET_GRID_GAP_PX = 16;
//# sourceMappingURL=sizes.d.ts.map