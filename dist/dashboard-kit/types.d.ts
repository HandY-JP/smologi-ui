/** 小=4列・中=6列・大=8列×2段・横長=12列（12 列グリッド）。 */
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
}
export interface LayoutItem<Id extends string = string> {
    id: Id;
    on: boolean;
    size: WidgetSize;
}
//# sourceMappingURL=types.d.ts.map