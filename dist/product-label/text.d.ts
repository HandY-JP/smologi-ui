/**
 * 商品名を maxChars 以内に収める。入りきらないときは「先頭 + … + 末尾」にする
 * （型番やサイズが末尾に来る商品名が多いため、末尾を残す）。
 * maxChars は全角 1 文字を 1 として数える（呼び出し側が幅から決める）。
 */
export declare function truncateMiddle(text: string, maxChars: number): string;
/** 文字の見かけの幅（全角=1、半角=0.5）。省略の判定用。 */
export declare function visualLength(text: string): number;
/**
 * 見かけの幅が maxWidth（全角換算）に収まるよう、先頭＋…＋末尾で省略する。
 * 半角混じりの商品名でも幅に収まるように、文字数ではなく幅で刻む。
 */
export declare function fitName(text: string, maxWidth: number): string;
export interface ExpiryParts {
    year: string;
    monthDay: string;
}
/** 'YYYY-MM-DD' を「2027年」「8月31日」に分ける（期限シールの唯一の書式）。不正な値は null。 */
export declare function formatExpiry(value: string | null | undefined): ExpiryParts | null;
/**
 * ラベルに印字するコンディション表示名。生値（NewItem / used_very_good など）を対応表で引く。
 * 対応表に無い値（コレクター・再生品など）は null（＝生成できない。呼び出し側は Amazon の PDF をそのまま印刷する）。
 */
export declare function conditionDisplayName(condition: string | null | undefined, _conditionLabel?: string | null): string | null;
/** 幅 maxWidth に収まる分だけ残し、末尾を「…」にする（文字の途中では切らない）。収まるならそのまま。 */
export declare function truncateEndToWidth(text: string, maxWidth: number, measure: (t: string) => number): string;
/** ラベルの文字行に足せる追加項目（⚙ のチェックボックス。選んだ順に並ぶ）。 */
export type LabelExtraKey = 'sku' | 'needsExpiry' | 'setUnits';
export declare const LABEL_EXTRA_OPTIONS: readonly {
    key: LabelExtraKey;
    label: string;
}[];
export declare function isLabelExtraKey(value: unknown): value is LabelExtraKey;
export declare function labelExtraName(key: LabelExtraKey): string;
export interface ExtraSource {
    sellerSku?: string | null;
    /** 期限管理の商品か。古いデータ（不明）は null/undefined。 */
    expiryManaged?: boolean | null;
    /** 1 セットの点数。単品・不明は null/undefined。 */
    unitsPerSet?: number | null;
}
/** 追加項目 1 つの印字文字。出せない（データが無い・対象外）ときは null（何も出さない）。 */
export declare function extraText(key: LabelExtraKey, src: ExtraSource): string | null;
/** 選んだ追加項目のうち、この品目で出せるものの文字（選んだ順）。 */
export declare function extraTexts(src: ExtraSource, extras: readonly LabelExtraKey[]): string[];
//# sourceMappingURL=text.d.ts.map