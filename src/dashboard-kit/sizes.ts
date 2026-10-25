// サイズの表。Tailwind は動的クラスを拾えないので、クラス名は静的な文字列で持つ（この src/components 配下は content 対象）。
import type { WidgetSize } from './types';

export const WIDGET_SIZES: readonly WidgetSize[] = ['S', 'M', 'L', 'W'];

export const SIZE_LABEL: Record<WidgetSize, string> = { S: '小', M: '中', L: '大', W: '横長' };

/** 12 列グリッドでの列数。 */
export const SIZE_COLS: Record<WidgetSize, number> = { S: 4, M: 6, L: 8, W: 12 };

/**
 * 小画面は 2 列（S/M=1列、L/W=2列）、さらに狭いと 1 列。
 * 行の単位は半分（約 102px）。S/M は 2 段（=従来の 220px）、L は 4 段（=従来の 2 行ぶん）、
 * W は既定 1 段（帯）で、WidgetDef.rows=2 のときだけ 2 段。
 * 481px 未満は 1 列なので col-span-2 を付けない（暗黙の列を作らない）。
 * Tailwind は動的クラスを拾えないので row-span-* は静的な文字列で持つ。
 */
export const SIZE_CLASS: Record<WidgetSize, string> = {
  S: 'row-span-2 min-[821px]:col-span-4',
  M: 'row-span-2 min-[821px]:col-span-6',
  L: 'row-span-4 min-[481px]:col-span-2 min-[821px]:col-span-8',
  W: 'min-[481px]:col-span-2 min-[821px]:col-span-12',
};

const W_ROWS_CLASS: Record<1 | 2, string> = { 1: 'row-span-1', 2: 'row-span-2' };

/** サイズと段数（W のときだけ有効）から class を返す。 */
export function sizeClassFor(size: WidgetSize, rows?: 1 | 2): string {
  return size === 'W' ? `${SIZE_CLASS.W} ${W_ROWS_CLASS[rows ?? 1]}` : SIZE_CLASS[size];
}

/** グリッド本体。行の高さは固定（--row）で、中身で伸ばさない。row（dense にしない）。見た目の順＝並び順にして、ドラッグを予測できるようにする。 */
export const GRID_CLASS =
  'grid grid-cols-1 gap-4 auto-rows-[102px] grid-flow-row min-[481px]:grid-cols-2 min-[821px]:grid-cols-12';

/** 1 段の高さ（px）。S/M は 2 段ぶん = ROW*2 + gap = 220。L は 4 段ぶん = 456。 */
export const WIDGET_ROW_HEIGHT_PX = 102;
export const WIDGET_GRID_GAP_PX = 16;
