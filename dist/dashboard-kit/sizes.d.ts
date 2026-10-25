import type { WidgetSize } from './types';
export declare const WIDGET_SIZES: readonly WidgetSize[];
export declare const SIZE_LABEL: Record<WidgetSize, string>;
/** 12 列グリッドでの列数。 */
export declare const SIZE_COLS: Record<WidgetSize, number>;
/**
 * 小画面は 2 列（S/M=1列、L/W=2列）、さらに狭いと 1 列。
 * 行の単位は半分（約 102px）。S/M は 2 段（=従来の 220px）、L は 4 段（=従来の 2 行ぶん）、
 * W は既定 1 段（帯）で、WidgetDef.rows=2 のときだけ 2 段。
 * 481px 未満は 1 列なので col-span-2 を付けない（暗黙の列を作らない）。
 * Tailwind は動的クラスを拾えないので row-span-* は静的な文字列で持つ。
 */
export declare const SIZE_CLASS: Record<WidgetSize, string>;
/** サイズと段数（W のときだけ有効）から class を返す。 */
export declare function sizeClassFor(size: WidgetSize, rows?: 1 | 2): string;
/** グリッド本体。行の高さは固定（--row）で、中身で伸ばさない。row（dense にしない）。見た目の順＝並び順にして、ドラッグを予測できるようにする。 */
export declare const GRID_CLASS = "grid grid-cols-1 gap-4 auto-rows-[102px] grid-flow-row min-[481px]:grid-cols-2 min-[821px]:grid-cols-12";
/** 1 段の高さ（px）。S/M は 2 段ぶん = ROW*2 + gap = 220。L は 4 段ぶん = 456。 */
export declare const WIDGET_ROW_HEIGHT_PX = 102;
export declare const WIDGET_GRID_GAP_PX = 16;
//# sourceMappingURL=sizes.d.ts.map