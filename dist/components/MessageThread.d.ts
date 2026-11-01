import type { ReactNode } from 'react';
export type ThreadMessage = {
    id: string;
    direction: 'in' | 'out';
    /** 本文（改行は保つ）。 */
    body: ReactNode;
    /** 送り手の表示名（「お客様」「ご担当」など）。 */
    sender?: string;
    /** ISO 文字列または Date。時刻表示と日付区切りに使う。 */
    at?: string | Date | null;
};
export declare function MessageThread({ messages, className, empty, }: {
    messages: ThreadMessage[];
    className?: string;
    /** 0 件のときの表示。 */
    empty?: ReactNode;
}): import("react").JSX.Element;
//# sourceMappingURL=MessageThread.d.ts.map