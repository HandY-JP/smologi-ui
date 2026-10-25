// サイズの表。Tailwind は動的クラスを拾えないので、クラス名は静的な文字列で持つ（この src/components 配下は content 対象）。
import type { WidgetSize } from './types';

export const WIDGET_SIZES: readonly WidgetSize[] = ['S', 'M', 'L', 'W'];

export const SIZE_LABEL: Record<WidgetSize, string> = { S: '小', M: '中', L: '大', W: '横長' };

/** 12 列グリッドでの列数。 */
export const SIZE_COLS: Record<WidgetSize, number> = { S: 4, M: 6, L: 8, W: 12 };

/**
 * 小画面は 2 列（S/M=1列、L/W=2列）、さらに狭いと 1 列。L だけ 2 段ぶんの高さ。
 * 481px 未満は 1 列なので col-span-2 を付けない（暗黙の列を作らない）。
 */
export const SIZE_CLASS: Record<WidgetSize, string> = {
  S: 'min-[821px]:col-span-4',
  M: 'min-[821px]:col-span-6',
  L: 'row-span-2 min-[481px]:col-span-2 min-[821px]:col-span-8',
  W: 'min-[481px]:col-span-2 min-[821px]:col-span-12',
};

/** グリッド本体。行の高さは固定（--row）で、中身で伸ばさない。row（dense にしない）。見た目の順＝並び順にして、ドラッグを予測できるようにする。 */
export const GRID_CLASS =
  'grid grid-cols-1 gap-4 auto-rows-[220px] grid-flow-row min-[481px]:grid-cols-2 min-[821px]:grid-cols-12';

/** 行の高さ（px）。L は gap 込みで 2 段ぶん = ROW*2 + gap。 */
export const WIDGET_ROW_HEIGHT_PX = 220;
export const WIDGET_GRID_GAP_PX = 16;
