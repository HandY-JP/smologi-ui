// ダッシュボード編集キット共通の型。特定のアプリ（Amazon 等）には依存しない。

/** 小=4列・中=6列・大=8列×2倍の高さ・横長=12列（段数は WidgetDef.rows）（12 列グリッド）。 */
export type WidgetSize = 'S' | 'M' | 'L' | 'W';

export interface WidgetDef {
  id: string;
  title: string;
  /** 追加シートに出す一言説明。 */
  description?: string;
  /** そのウィジェットが取れるサイズ（切り替えはこの並びの順）。 */
  sizes: readonly WidgetSize[];
  defaultSize: WidgetSize;
  defaultOn: boolean;
  /** 横長（W）のときの段数。1=帯（既定）、2=約 220px の高さ。S/M/L では無視。 */
  rows?: 1 | 2;
}

export interface LayoutItem<Id extends string = string> {
  id: Id;
  on: boolean;
  size: WidgetSize;
}
