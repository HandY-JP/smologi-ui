import type { LabelItem } from '../label-doc';
import { type SheetDef } from '../sheets';
import { type LabelExtraKey } from '../text';
import { type LabelFontFiles, type TextMeasurer } from './text-measure';
export interface DrawnLabel {
    kind: 'product' | 'expiry';
    item: LabelItem;
    /** 取得できた商品画像（JPEG）。無ければ画像なしで描く。 */
    image: Buffer | null;
}
export interface DrawnPlacement {
    page: number;
    row: number;
    col: number;
    label: DrawnLabel;
}
export interface DrawOptions {
    sheet: SheetDef;
    /** 商品画像を出すか。 */
    image: boolean;
    /** 足す追加項目（選んだ順）。 */
    extra: LabelExtraKey[];
    offsetXmm: number;
    offsetYmm: number;
    /** 文字幅の実測器（createTextMeasurer）。 */
    measurer: TextMeasurer;
}
/** 配置どおりに描いた PDF を返す。ラベルの無い用紙は空白ページ。 */
export declare function renderDrawnPdf(placements: DrawnPlacement[], pageCount: number, input: Omit<DrawOptions, 'measurer'>, fonts: LabelFontFiles): Promise<Buffer>;
/**
 * 画面の見本用: ラベル 1 枚＝1 ページ（ページの寸法＝ラベルの寸法）の PDF。印刷と同じ ProductLabel / ExpiryLabel で描くので、
 * これを画像にすれば印刷と同じ字形・幅になる。位置の微調整は紙上の位置の話なのでここでは使わない。
 */
export declare function renderFacesPdf(labels: DrawnLabel[], input: Omit<DrawOptions, 'offsetXmm' | 'offsetYmm' | 'measurer'>, fonts: LabelFontFiles): Promise<Buffer>;
//# sourceMappingURL=generate.d.ts.map