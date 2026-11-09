export interface LabelItem {
    sellerSku: string;
    asin: string;
    fnSku: string;
    productName: string;
    quantity: number;
    /** 例: 'new_new' / 'used_like_new'。古いデータには無い。 */
    condition: string | null;
    /** 画面・ラベルに出すコンディション表記（例: 新品 / 中古 - ほぼ新品）。古いデータには無い。 */
    conditionLabel: string | null;
    imageUrl: string | null;
    /** 'YYYY-MM-DD'。期限管理でない商品・未入力は null。 */
    expiration: string | null;
    /** 1 セットの点数（セット商品）。単品・古いデータは null。 */
    unitsPerSet: number | null;
    /** 期限管理の商品か。古いデータ（不明）は null。 */
    expiryManaged: boolean | null;
    /** 梱包要件（Seller が納品プラン作成時に取得。表示用の文字）。古いデータは空。 */
    prepInstructions: string[];
}
export interface SellerLabelDoc {
    items: LabelItem[];
    /** FNSKU が空・数量 0 以下で読み飛ばした品目があった（＝items の合計は元 PDF の枚数と一致しない）。 */
    hasDroppedItems?: boolean;
    /** Seller が届けた元 PDF の用紙（sheets.ts の ID）。metadata に pageType があり、既知の用紙のときだけ。無ければ推測せず null。 */
    sourceSheet?: string | null;
}
/** metadata JSON を読み取り用の形にする。items が配列でなければ null（＝生成せず Amazon の PDF をそのまま印刷する）。 */
export declare function parseLabelDocMetadata(metadata: unknown): SellerLabelDoc | null;
export type LabelMode = 'generate' | 'asis';
/**
 * 作り直せない（Amazon の PDF をそのまま印刷するしかない）理由。作り直せるなら null。画面の理由文にもそのまま使う。
 * 全品目にコンディション（生値）があり表示名が決まるときだけ自前生成（コンディションはラベルの必須項目で、推測で埋めない）。
 * 商品名が空の品目、FNSKU が Code128B で表せない品目、FNSKU 空で読み飛ばした品目が 1 つでもあれば、出荷まるごと作り直せない（混在させない）。
 */
export declare function asisReason(doc: SellerLabelDoc | null): string | null;
/** 自前生成するか、Amazon の PDF をそのまま印刷するか（asisReason が null のときだけ自前生成）。 */
export declare function decideLabelMode(doc: SellerLabelDoc | null): LabelMode;
export declare function totalLabelCount(doc: SellerLabelDoc): number;
/** preview API の品目。クライアントのシート図が印刷と同じ判定をできるよう、1pt あたりの文字幅（フォント実測）を付ける。 */
export declare function toPreviewItem(item: LabelItem, measureEm: (text: string) => number): {
    productName: string;
    fnSku: string;
    sellerSku: string;
    quantity: number;
    hasImage: boolean;
    expiration: string | null;
    unitsPerSet: number | null;
    expiryManaged: boolean | null;
    prepInstructions: string[];
    conditionLabel: string | null;
    fnSkuEm: number;
    conditionEm: number;
    skuEm: number;
    extraEm: {
        [k: string]: number;
    };
    nameCharEm: Record<string, number> | undefined;
};
//# sourceMappingURL=label-doc.d.ts.map