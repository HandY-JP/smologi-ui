/**
 * チャット見出しのスージーの丸（v0.21.0）。32px の色付きグラデーションの丸に白い星 16px。
 * thinking（答えを待っている間）は丸のふちを色の線がくるくる回る（SuzyLauncher と同じ輪）。
 */
import type { CSSProperties } from 'react';
export interface SuzyOrbProps {
    /** 丸の直径（px）。既定 32。星はその半分。 */
    size?: number;
    /** スージーが答えを考えている間 true。 */
    thinking?: boolean;
    /** 夜のおやすみ中 true（星が少し暗くなる）。 */
    night?: boolean;
    className?: string;
    style?: CSSProperties;
}
export declare function SuzyOrb({ size, thinking, night, className, style }: SuzyOrbProps): import("react").JSX.Element;
//# sourceMappingURL=SuzyOrb.d.ts.map