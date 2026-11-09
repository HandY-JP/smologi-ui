import type { LabelItem } from '../label-doc';
import type { ProductLabelPrintSettings } from '../settings';
import type { LabelFontFiles } from './text-measure';
export declare const MAX_TOTAL_LABELS = 5000;
/** 見本用 PDF の上限ページ数（品目数＋期限シール）。 */
export declare const MAX_FACE_PAGES = 300;
/** 対象 1 つぶんの品目（自前で生成できると判定済みのものだけ渡す）。 */
export interface LabelGroup {
    items: LabelItem[];
}
export type FetchLabelImage = (url: string | null | undefined) => Promise<Buffer | null>;
export interface BuildOptions extends ProductLabelPrintSettings {
    /** 1 始まりの開始位置。 */
    start: number;
}
export interface BuildPdfInput {
    groups: LabelGroup[];
    options: BuildOptions;
    fonts: LabelFontFiles;
    /** 商品画像の取得（テストで差し替える）。 */
    fetchImage?: FetchLabelImage;
}
export interface BuildFacesInput {
    groups: LabelGroup[];
    options: Pick<ProductLabelPrintSettings, 'sheet' | 'image' | 'extra' | 'expirySticker'>;
    fonts: LabelFontFiles;
    fetchImage?: FetchLabelImage;
}
/**
 * 画面の見本用: 品目ごとに 1 ページ（ラベル 1 枚の寸法）。品目の順に、商品ラベル→（期限シールを出す設定で期限があれば）期限シール。
 * ページの並びは dialog-model.faceSlots と同じ（クライアントはこれでページを品目に対応づける）。
 */
export declare function buildFacesPdf(input: BuildFacesInput): Promise<Uint8Array>;
/** 印刷用 PDF。各品目は数量ぶんの商品ラベルのあとに、期限シール（設定オンで期限あり）を同じ数だけ続ける。 */
export declare function buildProductLabelPdf(input: BuildPdfInput): Promise<Uint8Array>;
//# sourceMappingURL=build.d.ts.map