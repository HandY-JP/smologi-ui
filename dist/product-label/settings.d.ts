import { type LabelOrder } from './sheets';
import { type LabelExtraKey } from './text';
export type { LabelExtraKey };
export interface ProductLabelPrintSettings {
    sheet: string;
    order: LabelOrder;
    image: boolean;
    /** 文字行に足す追加項目（選んだ順。数は用紙ごとの上限まで）。 */
    extra: LabelExtraKey[];
    expirySticker: boolean;
    /** 印刷位置の微調整（mm、右・下が＋）。 */
    offsetXmm: number;
    offsetYmm: number;
}
export declare const DEFAULT_PRODUCT_LABEL_SETTINGS: ProductLabelPrintSettings;
export declare const MAX_OFFSET_MM = 10;
/** 追加項目の保存形式を読む。配列（選んだ順）。旧形式の 'sku' / 'none' も受ける。未知の値・重複は捨てる。 */
export declare function normalizeExtras(raw: unknown): LabelExtraKey[];
/** 用紙の上限を超える分を、後から選んだ方から外す。 */
export declare function trimExtras(extras: readonly LabelExtraKey[], max: number): {
    kept: LabelExtraKey[];
    removed: LabelExtraKey[];
};
/** 未知の値・欠けた項目は既定値に倒す（壊れた行や古い行で印刷が止まらないように）。 */
export declare function normalizeProductLabelSettings(input: unknown): ProductLabelPrintSettings;
/** 用紙だけを差し替えた設定（この出荷だけの用紙選択用。保存はしない）。用紙で選べない画像・追加項目は外す。 */
export declare function withSheet(settings: ProductLabelPrintSettings, sheetId: string): ProductLabelPrintSettings;
//# sourceMappingURL=settings.d.ts.map