export type LabelOrder = 'row' | 'column';
export type SheetGroup = '21' | '24' | '40' | '44' | 'roll';
export interface SheetDef {
    id: string;
    group: SheetGroup;
    /** 画面に出す名前（寸法つき）。 */
    label: string;
    kind: 'sheet' | 'roll';
    cols: number;
    rows: number;
    /** 1 枚あたりの面数（ロール紙は 1）。 */
    faces: number;
    pageW: number;
    pageH: number;
    labelW: number;
    labelH: number;
    /** 隣のラベルの左端までの距離（ラベル幅＋すき間）。 */
    pitchX: number;
    pitchY: number;
    marginLeft: number;
    marginTop: number;
}
export declare const SHEETS: readonly SheetDef[];
export declare const DEFAULT_SHEET_ID = "A4_40_52x29";
export declare const SHEET_GROUP_LABELS: Record<SheetGroup, string>;
export declare const SHEET_GROUP_ORDER: readonly SheetGroup[];
export declare function getSheet(id: string | null | undefined): SheetDef | null;
export declare function sheetOrDefault(id: string | null | undefined): SheetDef;
/** 面数ごとにまとめた選択肢（optgroup 用）。 */
export declare function groupedSheets(): {
    group: SheetGroup;
    label: string;
    sheets: SheetDef[];
}[];
/** 1 枚の中の n 番目（0 始まり）のセルの行・列。横=左→右へ、縦=上→下へ番号が進む。 */
export declare function cellOfIndex(def: SheetDef, order: LabelOrder, index: number): {
    row: number;
    col: number;
};
/** セル（行・列）の番号（1 始まり）。cellOfIndex の逆。 */
export declare function numberOfCell(def: SheetDef, order: LabelOrder, row: number, col: number): number;
export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}
/** セルの矩形（mm）。offset は「印刷位置の微調整」。 */
export declare function cellRect(def: SheetDef, row: number, col: number, offsetXmm?: number, offsetYmm?: number): Rect;
export declare function clampStart(def: SheetDef, start: number): number;
export interface Placement {
    /** 0 始まりの出力ページ。 */
    page: number;
    row: number;
    col: number;
}
/**
 * count 枚のラベルを start 番（1 始まり）から並べたときの配置。
 * 開始位置は最初の 1 枚にだけ効き、2 枚目以降は先頭の面から使う。
 */
export declare function layoutLabels(def: SheetDef, order: LabelOrder, start: number, count: number): Placement[];
export interface LabelSummary {
    labels: number;
    start: number;
    /** 使う用紙の枚数。 */
    pages: number;
    /** 最後の用紙の余り面数。 */
    leftover: number;
}
export declare function summarizeLabels(def: SheetDef, start: number, count: number): LabelSummary;
/** 面数の短い名前。「40面」「ロール紙」。 */
export declare function sheetFacesName(def: SheetDef): string;
/**
 * Seller が保存した pageType（Smologi の用紙 ID、または Seller 側の短い名前 A4_40）を用紙 ID にする。
 * 知らない値・文字以外は null（元 PDF の面数を推測で埋めない）。
 */
export declare function resolveSourceSheetId(pageType: unknown): string | null;
/** 元 PDF の面数の言い方。「24面」。用紙 ID が無い・知らないときは null。 */
export declare function sourceFacesName(sheetId: string | null | undefined): string | null;
//# sourceMappingURL=sheets.d.ts.map