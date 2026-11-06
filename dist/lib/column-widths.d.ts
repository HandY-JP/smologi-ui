export interface ColumnWidthSpec {
    key: string;
    /** 既定の幅(px)。null＝固定幅を持たない伸縮列（残りを取る）。 */
    defaultWidth: number | null;
    /** 最小幅(px)。省略時は COLUMN_WIDTH_DEFAULT_MIN。 */
    minWidth?: number;
    /** false で幅を変えられない列（既定 true）。 */
    resizable?: boolean;
}
/** 列ごとの最小幅の既定値(px)。 */
export declare const COLUMN_WIDTH_DEFAULT_MIN = 48;
/** 保存値の上限（壊れたデータで巨大な幅にならないための安全弁。操作上の上限ではない）。 */
export declare const COLUMN_WIDTH_SANITY_MAX = 4000;
export type ColumnWidthOverrides = Record<string, number>;
export declare function columnMinWidth(spec: Pick<ColumnWidthSpec, 'minWidth'>): number;
export declare function isColumnResizable(spec: ColumnWidthSpec): boolean;
/** 最小幅以上の整数(px)に丸める。数値でなければ最小幅。 */
export declare function clampColumnWidth(px: number, minWidth?: number): number;
/** 保存文字列を読む。壊れていたら {}。知らない列・幅を変えられない列は捨て、最小幅未満は最小幅へ。 */
export declare function parseSavedColumnWidths(raw: string | null | undefined, specs: readonly ColumnWidthSpec[]): ColumnWidthOverrides;
/** 既定と同じ値・知らない列を落として、変えた列だけにする。 */
export declare function diffColumnWidthsFromDefaults(widths: Readonly<Record<string, number>>, specs: readonly ColumnWidthSpec[]): ColumnWidthOverrides;
export declare function serializeColumnWidths(overrides: Readonly<Record<string, number>>, specs: readonly ColumnWidthSpec[]): string;
/** 実際に使う幅。変えた列は保存値、それ以外は既定（null＝伸縮）。 */
export declare function resolveColumnWidths(specs: readonly ColumnWidthSpec[], overrides: Readonly<Record<string, number>>): Record<string, number | null>;
/** 1 列ぶんを更新した overrides を返す（最小幅へ丸め、既定と同じなら消す）。知らない列・固定列は据え置き。 */
export declare function withColumnWidth(overrides: Readonly<Record<string, number>>, specs: readonly ColumnWidthSpec[], key: string, px: number): ColumnWidthOverrides;
export declare function withoutColumnWidth(overrides: Readonly<Record<string, number>>, key: string): ColumnWidthOverrides;
//# sourceMappingURL=column-widths.d.ts.map