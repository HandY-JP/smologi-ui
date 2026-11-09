// 商品ラベル印刷ダイアログの計算部分（画面から切り離して vitest で検証する）。
// プレビュー API の応答から、枚数・使う用紙の枚数・シート図の各マスの中身を作る。
import { computeLabelBox, type LabelBox } from './label-layout';
import { extraTexts, formatExpiry, visualLength, type LabelExtraKey } from './text';
import { getSheet, sheetFacesName, sourceFacesName, type LabelOrder, type SheetDef } from './sheets';

export interface PreviewItem {
  productName: string;
  fnSku: string;
  sellerSku: string | null;
  quantity: number;
  hasImage: boolean;
  expiration: string | null;
  /** 印字するコンディション表記（無ければ null）。 */
  conditionLabel: string | null;
  /** 1pt あたり（通常ウェイト）の FNSKU・コンディション・出品者 SKU の幅（pt）。サーバーのフォント実測。クライアントの判定が印刷と一致するために使う。 */
  fnSkuEm: number;
  conditionEm: number;
  skuEm: number;
  /** 追加項目（要期限・◯点入）の文字ごとの 1pt あたりの幅。 */
  extraEm?: Record<string, number>;
  /** 1 セットの点数（セット商品）。古いデータは無い／null。 */
  unitsPerSet?: number | null;
  /** 期限管理の商品か。古いデータは無い／null。 */
  expiryManaged?: boolean | null;
  /** 梱包要件。古いデータは無い／空。 */
  prepInstructions?: string[];
  /** 商品名に出てくる文字（と空白・「…」）ごとの 1pt あたりの幅。印刷と同じ実測で、クライアントの行分けが印刷と一致するために使う。多すぎるときは省略（概算に倒す）。 */
  nameCharEm?: Record<string, number>;
}

export interface PreviewTarget {
  shipmentId: string;
  attachmentUrl: string;
  fileName: string;
  orderNumber: string | null;
  /** generate=自前で描く／asis=描けない（Amazon の PDF をそのまま印刷する。ダイアログは開かない）。 */
  mode: 'generate' | 'asis';
  hasItems: boolean;
  /** FNSKU 空などで読み飛ばした品目がある（枚数が信頼できない）。 */
  hasDroppedItems?: boolean;
  labelCount: number | null;
  items: PreviewItem[];
  /** Seller が届けた元 PDF の用紙 ID。分からなければ無い／null。 */
  sourceSheet?: string | null;
  /** asis のとき、作り直せない理由（画面に出す文）。generate なら無い／null。 */
  asisReason?: string | null;
}

/** シート図の 1 マスに出す中身。 */
export interface CellLabel {
  kind: 'label' | 'expiry';
  fnSku?: string;
  name?: string;
  expiration?: string | null;
  sellerSku?: string | null;
  conditionLabel?: string | null;
  fnSkuEm?: number;
  conditionEm?: number;
  skuEm?: number;
  extraEm?: Record<string, number>;
  unitsPerSet?: number | null;
  expiryManaged?: boolean | null;
  nameCharEm?: Record<string, number>;
  hasImage?: boolean;
  /** 見本画像（印刷と同じ PDF を描いたもの）を引く手がかり。 */
  faceRef?: FaceRef;
}

/** 見本 PDF の中の品目（targets の何番目の対象の何番目の品目か）。 */
export interface FaceRef {
  targetIndex: number;
  itemIndex: number;
}

export type FaceKind = 'label' | 'expiry';

export function faceKey(ref: FaceRef, kind: FaceKind): string {
  return `${ref.targetIndex}:${ref.itemIndex}:${kind}`;
}

/**
 * 見本 PDF（print API の mode=faces）のページの並び。サーバーの buildFacesPdf と同じ順:
 * 自前生成の対象の品目ごとに、商品ラベル→（期限シールを出す設定で期限があれば）期限シール。page は 0 始まり。
 */
export function faceSlots(targets: PreviewTarget[], opts: { expirySticker: boolean }): { ref: FaceRef; kind: FaceKind; page: number }[] {
  const out: { ref: FaceRef; kind: FaceKind; page: number }[] = [];
  targets.forEach((t, targetIndex) => {
    if (t.mode !== 'generate') return;
    t.items.forEach((item, itemIndex) => {
      out.push({ ref: { targetIndex, itemIndex }, kind: 'label', page: out.length });
      if (opts.expirySticker && formatExpiry(item.expiration)) out.push({ ref: { targetIndex, itemIndex }, kind: 'expiry', page: out.length });
    });
  });
  return out;
}

/** 図のマス 1 つぶんの配置。印刷（generate.tsx）と同じ computeLabelBox で、文字幅だけ API の実測値から出す。 */
export function cellLabelBox(
  label: CellLabel,
  sheet: Pick<SheetDef, 'labelW' | 'labelH'> & { id?: string },
  opts: { image: boolean; extra: readonly LabelExtraKey[] },
): LabelBox {
  const fnSku = label.fnSku ?? '';
  const condition = label.conditionLabel ?? null;
  const sku = label.sellerSku ?? '';
  const fnEm = label.fnSkuEm ?? 0;
  const condEm = label.conditionEm ?? 0;
  const skuEm = label.skuEm ?? 0;
  const extraEm = label.extraEm ?? {};
  return computeLabelBox({
    sheetId: sheet.id,
    widthMm: sheet.labelW,
    heightMm: sheet.labelH,
    fnSku,
    withImage: opts.image && Boolean(label.hasImage),
    condition,
    measure: (text, fontSize) =>
      fontSize * (text === fnSku ? fnEm : text === condition ? condEm : text === sku ? skuEm : (extraEm[text] ?? condEm)),
    extras: extraTexts(label, opts.extra),
  });
}

/** 商品名の文字ごとの幅（API の実測）から、印刷と同じ measure（nameRows 用）を作る。実測が無い文字は全角/半角の概算。 */
export function nameMeasurer(charEm: Record<string, number> | undefined, fontSize: number): (text: string) => number {
  if (!charEm) return (t) => visualLength(t) * fontSize * 1.2;
  return (t) => {
    let sum = 0;
    for (const ch of t) sum += charEm[ch] ?? (ch.charCodeAt(0) <= 0xff ? 0.6 : 1.2);
    return sum * fontSize;
  };
}

/** 商品名の文字ごとの幅（1pt あたり）を実測して表にする。文字の種類が上限を超えるなら undefined。 */
export function buildNameCharEm(name: string, measureEm: (text: string) => number, maxKinds = 400): Record<string, number> | undefined {
  const out: Record<string, number> = { ' ': measureEm(' '), '…': measureEm('…') };
  for (const ch of new Set(Array.from(name.trim()))) {
    out[ch] = measureEm(ch);
    if (Object.keys(out).length > maxKinds) return undefined;
  }
  return out;
}

/** 追加項目を選んだのに、この用紙では入らず省略される品目があるか（ダイアログの警告用）。 */
export function hasExtraOmitted(targets: PreviewTarget[], sheet: Pick<SheetDef, 'labelW' | 'labelH'> & { id?: string }, opts: { image: boolean; extra: readonly LabelExtraKey[] }): boolean {
  if (opts.extra.length === 0) return false;
  return targets.some(
    (t) => t.mode === 'generate' && t.items.some((i) => cellLabelBox({ ...i, kind: 'label', fnSku: i.fnSku, name: i.productName }, sheet, opts).extrasOmitted > 0),
  );
}

/** 1 対象が出すラベルの枚数。分からなければ null。 */
export function targetLabelCount(
  target: PreviewTarget,
  opts: { expirySticker: boolean },
): number | null {
  if (target.mode === 'generate') {
    const base = target.labelCount ?? target.items.reduce((s, i) => s + i.quantity, 0);
    const expiry = opts.expirySticker
      ? target.items.reduce((s, i) => s + (i.expiration ? i.quantity : 0), 0)
      : 0;
    return base + expiry;
  }
  return null;
}

/** 全体の枚数。1 件でも分からなければ null。 */
export function totalCount(
  targets: PreviewTarget[],
  opts: { expirySticker: boolean },
): number | null {
  let sum = 0;
  for (const t of targets) {
    const n = targetLabelCount(t, opts);
    if (n === null) return null;
    sum += n;
  }
  return sum;
}

/** 印刷順に並べたマスの中身（先頭から count 件まで）。 */
export function cellLabels(
  targets: PreviewTarget[],
  opts: { expirySticker: boolean },
  limit: number,
): CellLabel[] {
  const out: CellLabel[] = [];
  for (const [targetIndex, t] of targets.entries()) {
    if (out.length >= limit) break;
    if (t.mode === 'generate') {
      for (const [itemIndex, item] of t.items.entries()) {
        const faceRef = { targetIndex, itemIndex };
        for (let i = 0; i < item.quantity && out.length < limit; i++) {
          out.push({
            kind: 'label',
            fnSku: item.fnSku,
            name: item.productName,
            sellerSku: item.sellerSku,
            conditionLabel: item.conditionLabel,
            fnSkuEm: item.fnSkuEm,
            conditionEm: item.conditionEm,
            skuEm: item.skuEm,
            extraEm: item.extraEm,
            unitsPerSet: item.unitsPerSet,
            expiryManaged: item.expiryManaged,
            nameCharEm: item.nameCharEm,
            hasImage: item.hasImage,
            faceRef,
          });
        }
        if (opts.expirySticker && item.expiration) {
          for (let i = 0; i < item.quantity && out.length < limit; i++) {
            out.push({ kind: 'expiry', name: item.productName, fnSku: item.fnSku, expiration: item.expiration, faceRef });
          }
        }
      }
    }
  }
  return out;
}

export interface DiagramCell {
  /** 0 始まりの行・列。 */
  row: number;
  col: number;
  /** 並び順に従う番号（1 始まり）。 */
  no: number;
  state: 'used' | 'print' | 'spare';
  label: CellLabel | null;
}

/**
 * シート 1 枚ぶんのマス。番号は order に従い、開始位置より前の最初の用紙は「使用済み」、
 * 枚数ぶんは「今回印刷」、残りは「余り」。
 */
export function diagramPage(
  def: SheetDef,
  order: LabelOrder,
  start: number,
  labels: CellLabel[],
  total: number,
  page: number,
): DiagramCell[] {
  const cells: DiagramCell[] = [];
  for (let row = 0; row < def.rows; row++) {
    for (let col = 0; col < def.cols; col++) {
      const no = (order === 'column' ? col * def.rows + row : row * def.cols + col) + 1;
      const slot = page * def.faces + no - 1;
      const li = slot - (start - 1);
      let state: DiagramCell['state'] = 'spare';
      if (page === 0 && no < start) state = 'used';
      else if (li >= 0 && li < total) state = 'print';
      cells.push({ row, col, no, state, label: state === 'print' ? labels[li] ?? null : null });
    }
  }
  return cells;
}

export interface LabelCardRow {
  name: string;
  fnSku: string;
  quantity: number;
  conditionLabel: string | null;
  expiration: string | null;
  /** 梱包要件（Seller の納品プラン由来）。無ければ空。 */
  prepInstructions: string[];
  /** 行に出す小さな実物ラベル（ProductLabelFace に渡す）。 */
  label: CellLabel;
}

/** 行の2行目に出す補足（「FNSKU X00…・中古-非常に良い・期限 2027/06/30」）。新品と期限なしは書かない。 */
export function labelCardRowSub(r: Pick<LabelCardRow, 'fnSku' | 'conditionLabel' | 'expiration'> & { prepInstructions?: readonly string[] }): string {
  const parts = [`FNSKU ${r.fnSku}`];
  if (r.conditionLabel && r.conditionLabel !== '新品') parts.push(r.conditionLabel);
  if (r.expiration) parts.push(`期限 ${formatCardExpiry(r.expiration)}`);
  if (r.prepInstructions && r.prepInstructions.length > 0) parts.push(`梱包 ${r.prepInstructions.join(' / ')}`);
  return parts.join('・');
}

export interface LabelCardSummary {
  rows: LabelCardRow[];
  /** 合計枚数。分からなければ null。 */
  total: number | null;
  /** 用紙の面数（ロール紙は 1）と、必要な用紙の枚数（ロール紙・枚数不明は null）。 */
  faces: number;
  pages: number | null;
  /** 印刷される 1 枚目の見本。 */
  first: CellLabel | null;
}

/** 出荷詳細の「商品ラベル」欄に出す内容（品目ごとの枚数・合計・見本 1 枚）。用紙は保存済みの既定。 */
export function labelCardSummary(
  targets: PreviewTarget[],
  opts: { expirySticker: boolean },
  sheet: SheetDef,
): LabelCardSummary {
  const anyGenerate = targets.some((t) => t.mode === 'generate');
  const countOpts = { expirySticker: opts.expirySticker && anyGenerate };
  const rows: LabelCardRow[] = targets.flatMap((t, targetIndex) =>
    t.mode !== 'generate'
      ? []
      : t.items.map((i, itemIndex) => ({
          name: i.productName,
          fnSku: i.fnSku,
          quantity: i.quantity,
          conditionLabel: i.conditionLabel,
          expiration: i.expiration,
          prepInstructions: i.prepInstructions ?? [],
          label: {
            kind: 'label' as const,
            fnSku: i.fnSku,
            name: i.productName,
            sellerSku: i.sellerSku,
            conditionLabel: i.conditionLabel,
            fnSkuEm: i.fnSkuEm,
            conditionEm: i.conditionEm,
            skuEm: i.skuEm,
            extraEm: i.extraEm,
            unitsPerSet: i.unitsPerSet,
            expiryManaged: i.expiryManaged,
            nameCharEm: i.nameCharEm,
            hasImage: i.hasImage,
            faceRef: { targetIndex, itemIndex },
          },
        })),
  );
  const total = totalCount(targets, countOpts);
  const pages = total !== null && sheet.kind === 'sheet' ? Math.ceil(total / sheet.faces) : null;
  return { rows, total, faces: sheet.faces, pages, first: cellLabels(targets, countOpts, 1)[0] ?? null };
}

export function formatCardExpiry(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, '/');
}

/** 合計の表示。例「36枚（40面の用紙で約1枚）」。ロール紙は枚数だけ、不明なら注記。 */
export function formatCardTotal(s: { total: number | null; faces: number; pages: number | null }): string {
  if (s.total === null) return '枚数は印刷画面で確認できます';
  if (s.pages === null) return `${s.total.toLocaleString()}枚`;
  return `${s.total.toLocaleString()}枚（${s.faces}面の用紙で約${s.pages.toLocaleString()}枚）`;
}

/** 専用ダイアログで印刷してよいか。全対象を Smologi で描ける（generate かつ品目あり）ときだけ true。空・1 件でも描けないものがあれば false（Amazon の PDF をそのまま印刷する）。 */
export function canPrintWithLabelDialog(preview: readonly Pick<PreviewTarget, 'mode' | 'hasItems'>[]): boolean {
  return preview.length > 0 && preview.every((t) => t.mode === 'generate' && t.hasItems);
}

/** 「<面数>で印刷」。ロール紙は「ロール紙で印刷」。 */
export function printButtonLabel(sheet: SheetDef): string {
  return `${sheetFacesName(sheet)}で印刷`;
}

/** 用紙のピルに出す名前。「40面（52.5×29mm）」「ロール紙 50×30mm」。 */
export function sheetPillName(sheet: SheetDef): string {
  return sheet.label;
}

/** 対象全部で元 PDF の用紙が同じと分かるときだけ、その用紙 ID。1 つでも不明・食い違いなら null（推測しない）。 */
export function commonSourceSheet(targets: readonly Pick<PreviewTarget, 'sourceSheet'>[]): string | null {
  if (targets.length === 0) return null;
  const first = targets[0].sourceSheet ?? null;
  if (!first || !getSheet(first)) return null;
  return targets.every((t) => (t.sourceSheet ?? null) === first) ? first : null;
}

export interface AsisCardInfo {
  /** 「用紙」の帯に出す言葉。「24面（届いたPDFのまま）」「届いたPDFのまま」。 */
  bandText: string;
  /** 「<面数>のまま印刷」。面数不明なら「そのまま印刷」。 */
  buttonLabel: string;
  /** 作り直せない理由。 */
  reason: string;
  /** 元 PDF の面数（「24面」）。不明なら null。 */
  sourceFaces: string | null;
}

/** 作り直せない出荷の「商品ラベル」欄の文言。理由は最初に作り直せなかった対象のもの。 */
export function asisCardInfo(targets: readonly Pick<PreviewTarget, 'mode' | 'asisReason' | 'sourceSheet' | 'hasItems'>[]): AsisCardInfo {
  const blocked = targets.find((t) => t.mode !== 'generate' || !t.hasItems);
  const faces = sourceFacesName(commonSourceSheet(targets));
  return {
    bandText: faces ? `${faces}（届いたPDFのまま）` : '届いたPDFのまま',
    buttonLabel: faces ? `${faces}のまま印刷` : 'そのまま印刷',
    reason: blocked?.asisReason || 'この納品プランは作り直せません',
    sourceFaces: faces,
  };
}

/** 元 PDF の添付行の表示名。「元のPDF（Amazon・24面）」。面数不明は「元のPDF（Amazon）」。 */
export function originalPdfName(sourceSheetId: string | null | undefined): string {
  const faces = sourceFacesName(sourceSheetId);
  return faces ? `元のPDF（Amazon・${faces}）` : '元のPDF（Amazon）';
}
