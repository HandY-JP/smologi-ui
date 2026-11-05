import type { ReactNode } from 'react';
export type TonePillTone = 'accent' | 'solid' | 'ok' | 'warn' | 'bad' | 'info' | 'mute';
export type TonePillSize = 'sm' | 'md';
export declare function TonePill({ tone, size, icon, children, className, title, ariaLabel, }: {
    tone?: TonePillTone;
    size?: TonePillSize;
    /** 左に出す小さなアイコン（14px 程度）。 */
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
    title?: string;
    /** 読み上げ用の文言（件数バッジの「3件」など）。 */
    ariaLabel?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=TonePill.d.ts.map