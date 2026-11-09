import { type LabelBox } from './label-layout';
import { type LabelExtraKey } from './text';
import { type LabelOrder, type SheetDef } from './sheets';
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
export declare function faceKey(ref: FaceRef, kind: FaceKind): string;
/**
 * 見本 PDF（print API の mode=faces）のページの並び。サーバーの buildFacesPdf と同じ順:
 * 自前生成の対象の品目ごとに、商品ラベル→（期限シールを出す設定で期限があれば）期限シール。page は 0 始まり。
 */
export declare function faceSlots(targets: PreviewTarget[], opts: {
    expirySticker: boolean;
}): {
    ref: FaceRef;
    kind: FaceKind;
    page: number;
}[];
/** 図のマス 1 つぶんの配置。印刷（generate.tsx）と同じ computeLabelBox で、文字幅だけ API の実測値から出す。 */
export declare function cellLabelBox(label: CellLabel, sheet: Pick<SheetDef, 'labelW' | 'labelH'> & {
    id?: string;
}, opts: {
    image: boolean;
    extra: readonly LabelExtraKey[];
}): LabelBox;
/** 商品名の文字ごとの幅（API の実測）から、印刷と同じ measure（nameRows 用）を作る。実測が無い文字は全角/半角の概算。 */
export declare function nameMeasurer(charEm: Record<string, number> | undefined, fontSize: number): (text: string) => number;
/** 商品名の文字ごとの幅（1pt あたり）を実測して表にする。文字の種類が上限を超えるなら undefined。 */
export declare function buildNameCharEm(name: string, measureEm: (text: string) => number, maxKinds?: number): Record<string, number> | undefined;
/** 追加項目を選んだのに、この用紙では入らず省略される品目があるか（ダイアログの警告用）。 */
export declare function hasExtraOmitted(targets: PreviewTarget[], sheet: Pick<SheetDef, 'labelW' | 'labelH'> & {
    id?: string;
}, opts: {
    image: boolean;
    extra: readonly LabelExtraKey[];
}): boolean;
/** 1 対象が出すラベルの枚数。分からなければ null。 */
export declare function targetLabelCount(target: PreviewTarget, opts: {
    expirySticker: boolean;
}): number | null;
/** 全体の枚数。1 件でも分からなければ null。 */
export declare function totalCount(targets: PreviewTarget[], opts: {
    expirySticker: boolean;
}): number | null;
/** 印刷順に並べたマスの中身（先頭から count 件まで）。 */
export declare function cellLabels(targets: PreviewTarget[], opts: {
    expirySticker: boolean;
}, limit: number): CellLabel[];
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
export declare function diagramPage(def: SheetDef, order: LabelOrder, start: number, labels: CellLabel[], total: number, page: number): DiagramCell[];
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
export declare function labelCardRowSub(r: Pick<LabelCardRow, 'fnSku' | 'conditionLabel' | 'expiration'> & {
    prepInstructions?: readonly string[];
}): string;
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
export declare function labelCardSummary(targets: PreviewTarget[], opts: {
    expirySticker: boolean;
}, sheet: SheetDef): LabelCardSummary;
export declare function formatCardExpiry(iso: string): string;
/** 合計の表示。例「36枚（40面の用紙で約1枚）」。ロール紙は枚数だけ、不明なら注記。 */
export declare function formatCardTotal(s: {
    total: number | null;
    faces: number;
    pages: number | null;
}): string;
/** 専用ダイアログで印刷してよいか。全対象を Smologi で描ける（generate かつ品目あり）ときだけ true。空・1 件でも描けないものがあれば false（Amazon の PDF をそのまま印刷する）。 */
export declare function canPrintWithLabelDialog(preview: readonly Pick<PreviewTarget, 'mode' | 'hasItems'>[]): boolean;
/** 「<面数>で印刷」。ロール紙は「ロール紙で印刷」。 */
export declare function printButtonLabel(sheet: SheetDef): string;
/** 用紙のピルに出す名前。「40面（52.5×29mm）」「ロール紙 50×30mm」。 */
export declare function sheetPillName(sheet: SheetDef): string;
/** 対象全部で元 PDF の用紙が同じと分かるときだけ、その用紙 ID。1 つでも不明・食い違いなら null（推測しない）。 */
export declare function commonSourceSheet(targets: readonly Pick<PreviewTarget, 'sourceSheet'>[]): string | null;
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
export declare function asisCardInfo(targets: readonly Pick<PreviewTarget, 'mode' | 'asisReason' | 'sourceSheet' | 'hasItems'>[]): AsisCardInfo;
/** 元 PDF の添付行の表示名。「元のPDF（Amazon・24面）」。面数不明は「元のPDF（Amazon）」。 */
export declare function originalPdfName(sourceSheetId: string | null | undefined): string;
//# sourceMappingURL=dialog-model.d.ts.map