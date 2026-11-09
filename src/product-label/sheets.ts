// 商品ラベル用紙の定義と、番号・開始位置・枚数の計算（純粋関数。UI とサーバーで共有する）。
//
// 単位は mm、原点は用紙の左上。
// 選べる用紙は「日本で売っていて寸法が確認できたもの」だけ。
//   21面・40面: Amazon 純正 PDF から実測 ／ 24面（66×33.9mm）: エーワン 72224・エレコム EDT-FBA24100 と同寸法
//   44面（48.3×25.4mm）: エーワン 31516 ／ ロール紙 3 種。
// ID は Smologi 独自（A4_24 は 24 面 66×33.9mm）。保存済みの既定で消えた ID が選ばれていたら 40 面に戻す（getSheet が null を返す）。

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

const A4_W = 210;
const A4_H = 297;

function sheet(def: Omit<SheetDef, 'kind' | 'faces' | 'pageW' | 'pageH'>): SheetDef {
  return { ...def, kind: 'sheet', faces: def.cols * def.rows, pageW: A4_W, pageH: A4_H };
}

function roll(id: string, w: number, h: number): SheetDef {
  return {
    id,
    group: 'roll',
    label: `ロール紙 ${w}×${h}mm`,
    kind: 'roll',
    cols: 1,
    rows: 1,
    faces: 1,
    pageW: w,
    pageH: h,
    labelW: w,
    labelH: h,
    pitchX: w,
    pitchY: h,
    marginLeft: 0,
    marginTop: 0,
  };
}

export const SHEETS: readonly SheetDef[] = [
  // A4_21: Amazon の PDF で x ピッチ 66.63mm・y ピッチ 38.1mm、バーコード中心から余白を逆算。
  sheet({ id: 'A4_21', group: '21', label: '21面（63.5×38.1mm）', cols: 3, rows: 7, labelW: 63.5, labelH: 38.1, pitchX: 66.63, pitchY: 38.1, marginLeft: 3.35, marginTop: 16.3 }),
  // A4_24: エーワン 72224／エレコム EDT-FBA24100（66×33.9mm、上余白 12.9・左余白 6）。
  sheet({ id: 'A4_24', group: '24', label: '24面（66×33.9mm）', cols: 3, rows: 8, labelW: 66, labelH: 33.9, pitchX: 66, pitchY: 33.9, marginLeft: 6, marginTop: 12.9 }),
  // A4_40: Amazon の PDF で x ピッチ 52.5mm・y ピッチ 29.46mm。
  sheet({ id: 'A4_40_52x29', group: '40', label: '40面（52.5×29mm）', cols: 4, rows: 10, labelW: 52.5, labelH: 29.46, pitchX: 52.5, pitchY: 29.46, marginLeft: 0, marginTop: 0.34 }),
  // A4_44: エーワン 31516（48.3×25.4mm、隙間なし、上余白 8.8・左余白 8.4）。
  sheet({ id: 'A4_44_48x25', group: '44', label: '44面（48.3×25.4mm）', cols: 4, rows: 11, labelW: 48.3, labelH: 25.4, pitchX: 48.3, pitchY: 25.4, marginLeft: 8.4, marginTop: 8.8 }),
  roll('ROLL_50x30', 50, 30),
  roll('ROLL_62x29', 62, 29),
  roll('ROLL_50.8x25.4', 50.8, 25.4),
];

export const DEFAULT_SHEET_ID = 'A4_40_52x29';

export const SHEET_GROUP_LABELS: Record<SheetGroup, string> = {
  '21': '21面',
  '24': '24面',
  '40': '40面',
  '44': '44面',
  roll: 'ロール紙',
};

export const SHEET_GROUP_ORDER: readonly SheetGroup[] = ['21', '24', '40', '44', 'roll'];

const SHEET_BY_ID = new Map(SHEETS.map((s) => [s.id, s]));

export function getSheet(id: string | null | undefined): SheetDef | null {
  return (id && SHEET_BY_ID.get(id)) || null;
}

export function sheetOrDefault(id: string | null | undefined): SheetDef {
  return getSheet(id) ?? (SHEET_BY_ID.get(DEFAULT_SHEET_ID) as SheetDef);
}

/** 面数ごとにまとめた選択肢（optgroup 用）。 */
export function groupedSheets(): { group: SheetGroup; label: string; sheets: SheetDef[] }[] {
  return SHEET_GROUP_ORDER.map((group) => ({
    group,
    label: SHEET_GROUP_LABELS[group],
    sheets: SHEETS.filter((s) => s.group === group),
  })).filter((g) => g.sheets.length > 0);
}

/** 1 枚の中の n 番目（0 始まり）のセルの行・列。横=左→右へ、縦=上→下へ番号が進む。 */
export function cellOfIndex(def: SheetDef, order: LabelOrder, index: number): { row: number; col: number } {
  if (order === 'column') return { col: Math.floor(index / def.rows), row: index % def.rows };
  return { row: Math.floor(index / def.cols), col: index % def.cols };
}

/** セル（行・列）の番号（1 始まり）。cellOfIndex の逆。 */
export function numberOfCell(def: SheetDef, order: LabelOrder, row: number, col: number): number {
  return (order === 'column' ? col * def.rows + row : row * def.cols + col) + 1;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** セルの矩形（mm）。offset は「印刷位置の微調整」。 */
export function cellRect(def: SheetDef, row: number, col: number, offsetXmm = 0, offsetYmm = 0): Rect {
  return {
    x: def.marginLeft + col * def.pitchX + offsetXmm,
    y: def.marginTop + row * def.pitchY + offsetYmm,
    w: def.labelW,
    h: def.labelH,
  };
}

export function clampStart(def: SheetDef, start: number): number {
  if (def.kind === 'roll') return 1;
  const n = Number.isFinite(start) ? Math.trunc(start) : 1;
  return Math.min(def.faces, Math.max(1, n));
}

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
export function layoutLabels(def: SheetDef, order: LabelOrder, start: number, count: number): Placement[] {
  const n = Math.max(0, Math.trunc(count));
  if (def.kind === 'roll') {
    return Array.from({ length: n }, (_, i) => ({ page: i, row: 0, col: 0 }));
  }
  const first = clampStart(def, start) - 1;
  return Array.from({ length: n }, (_, i) => {
    const slot = first + i;
    const page = Math.floor(slot / def.faces);
    const { row, col } = cellOfIndex(def, order, slot % def.faces);
    return { page, row, col };
  });
}

export interface LabelSummary {
  labels: number;
  start: number;
  /** 使う用紙の枚数。 */
  pages: number;
  /** 最後の用紙の余り面数。 */
  leftover: number;
}

export function summarizeLabels(def: SheetDef, start: number, count: number): LabelSummary {
  const labels = Math.max(0, Math.trunc(count));
  if (def.kind === 'roll') return { labels, start: 1, pages: labels, leftover: 0 };
  const s = clampStart(def, start);
  if (labels === 0) return { labels, start: s, pages: 0, leftover: 0 };
  const used = s - 1 + labels;
  const pages = Math.ceil(used / def.faces);
  return { labels, start: s, pages, leftover: pages * def.faces - used };
}

/** 面数の短い名前。「40面」「ロール紙」。 */
export function sheetFacesName(def: SheetDef): string {
  return def.kind === 'roll' ? SHEET_GROUP_LABELS.roll : SHEET_GROUP_LABELS[def.group];
}

/**
 * Seller が保存した pageType（Smologi の用紙 ID、または Seller 側の短い名前 A4_40）を用紙 ID にする。
 * 知らない値・文字以外は null（元 PDF の面数を推測で埋めない）。
 */
export function resolveSourceSheetId(pageType: unknown): string | null {
  if (typeof pageType !== 'string') return null;
  const id = pageType.trim() === 'A4_40' ? 'A4_40_52x29' : pageType.trim();
  return getSheet(id)?.id ?? null;
}

/** 元 PDF の面数の言い方。「24面」。用紙 ID が無い・知らないときは null。 */
export function sourceFacesName(sheetId: string | null | undefined): string | null {
  const def = getSheet(sheetId);
  return def ? sheetFacesName(def) : null;
}
