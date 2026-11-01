import type { ReactNode } from 'react';
export type TonePillTone = 'accent' | 'ok' | 'warn' | 'info' | 'mute';
export declare function TonePill({ tone, icon, children, className, title, }: {
    tone?: TonePillTone;
    /** 左に出す小さなアイコン（14px 程度）。 */
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
    title?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=TonePill.d.ts.map