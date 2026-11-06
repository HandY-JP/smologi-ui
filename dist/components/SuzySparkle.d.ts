/**
 * スージー（AI サポートチャット）の星アイコン。Seller・スモロジ・モバイルで共通（v0.21.0）。
 * アプリで星の SVG を手書きしない。右下の丸ボタンは SuzyLauncher、見出しの丸は SuzyOrb を使う。
 *
 * 形: 宝石のようにカットした大きな星＋小さな相棒の星（viewBox 0 0 24 24）。色は brand のグラデーション
 * （--accent → --cat-5-solid → --cat-1-solid）。tone="white" は見出しの色付き丸の上に載せる白い星。
 * 13px 以下は細かい面を省いた形に自動で切り替わる（小さくてもつぶれない）。
 *
 * state（動き）:
 * - idle      … 完全に静止。ふだんはこれ
 * - notice    … お知らせあり。大きな星に光が走り（約 2.5 秒周期）、小さな星がまたたく
 * - thinking  … スージーが考え中。光が速く続けて走る（丸ボタン側のくるくる回る輪は SuzyLauncher / SuzyOrb が足す）
 * - night     … 夜のおやすみ中。少し暗く（opacity 0.55）動かない。月マークは出さない
 * prefers-reduced-motion では動きをすべて止める（components.css）。
 * SVG の id は useId でインスタンスごとに一意。
 */
import { type CSSProperties } from 'react';
export type SuzyState = 'idle' | 'notice' | 'thinking' | 'night';
export type SuzySparkleTone = 'color' | 'white';
/** この大きさ（px）以下は、面を省いた簡略形にする。 */
export declare const SUZY_SPARKLE_SIMPLE_MAX_SIZE = 13;
export interface SuzySparkleProps {
    /** 表示サイズ（px）。既定 22。 */
    size?: number;
    /** 'color'＝グラデーション（既定）／'white'＝白（色付きの丸の上用）。 */
    tone?: SuzySparkleTone;
    state?: SuzyState;
    /** 簡略形を強制する／しない。省略時は size <= 13 で簡略形。 */
    simplified?: boolean;
    className?: string;
    style?: CSSProperties;
    /** 読み上げ名。省略時は装飾扱い（aria-hidden）。 */
    title?: string;
}
export declare function SuzySparkle({ size, tone, state, simplified, className, style, title }: SuzySparkleProps): import("react").JSX.Element;
//# sourceMappingURL=SuzySparkle.d.ts.map