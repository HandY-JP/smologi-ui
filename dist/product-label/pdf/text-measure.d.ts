/** 描画に使うフォントファイル（NotoSansJP の OTF）の絶対パス。 */
export interface LabelFontFiles {
    regular: string;
    bold: string;
}
export interface TextMeasurer {
    /** 文字列の幅（pt）。advance width の合計（カーニングなしの上限寄り）。読み込み失敗時は多めの見積もり。 */
    measure: (text: string, fontSize: number, bold: boolean) => number;
    /** 通常ウェイト・1pt あたりの幅。プレビュー用の実測値（toPreviewItem）に渡す。 */
    measureEm: (text: string) => number;
}
/**
 * フォントの実測器を作る（同じフォントの組なら使い回す）。描画の前に 1 回 await する。失敗しても投げない
 * （読めなかったときは見積もりの幅を返す）。
 */
export declare function createTextMeasurer(fonts: LabelFontFiles): Promise<TextMeasurer>;
//# sourceMappingURL=text-measure.d.ts.map