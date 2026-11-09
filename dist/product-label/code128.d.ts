/**
 * Code128（サブセットB）の純関数エンコーダ。
 *
 * オーダーピッキング帳票（C案）で受注番号をバーコード化するために実装。
 * 外部ライブラリを追加せず @react-pdf/renderer の Svg/Rect で自前描画するため、
 * 「文字列 → バー/スペースの幅配列（モジュール単位）」までをここで純粋に計算する。
 *
 * サブセットBは ASCII 32(スペース)〜126(`~`) の95文字を値0〜94として符号化する。
 * 値103〜106は START A / START B / START C / STOP専用（データ文字としては使わない）。
 *
 * パターン表は Code128 の標準参照実装（ZXing の CODE_PATTERNS）に基づく
 * 「値ごとの幅6個（STOPのみ7個）・各幅1〜4モジュール・合計11（STOPのみ13）」の表。
 */
export declare const CODE128_START_B = 104;
export declare const CODE128_STOP = 106;
/** 1文字をサブセットBの値（0〜94）に変換する。範囲外は例外。 */
export declare function code128BCharValue(char: string): number;
/** 文字列がそのまま Code128 サブセットBで符号化できるか（ASCII 32〜126のみ）。 */
export declare function isCode128BEncodable(text: string): boolean;
/**
 * START B + データ + チェックサム + STOP の値配列を返す。
 * チェックサムは mod 103（START値を重み1として、以降の文字は位置番号を重みにする標準式）。
 */
export declare function code128BEncodeValues(text: string): number[];
/** 値配列 → 幅パターン（モジュール数の配列。バー/スペース交互、バーから開始）へ展開する。 */
export declare function code128Widths(values: number[]): number[];
export type Code128Bar = {
    /** 左端からのオフセット（モジュール単位）。 */
    x: number;
    /** バーの幅（モジュール単位）。 */
    width: number;
};
/**
 * 文字列から「黒バーの位置と幅（モジュール単位）」の配列を返す。
 * 白スペースは描画不要なので除外し、react-pdf の Rect 列挙をそのまま作れる形にする。
 */
export declare function code128Bars(text: string): {
    bars: Code128Bar[];
    totalModules: number;
};
//# sourceMappingURL=code128.d.ts.map