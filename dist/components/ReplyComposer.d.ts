import type { ReactNode } from 'react';
export declare function ReplyComposer({ value, onChange, onSend, id, tools, footer, label, busy, disabled, placeholder, rows, className, }: {
    value: string;
    onChange: (next: string) => void;
    onSend: () => void;
    /** textarea の id（ラベルとの関連付け用）。 */
    id?: string;
    /** textarea の上。ボタン類を並べる。 */
    tools?: ReactNode;
    /** 送信ボタンの左。文字数・注意書きなど。 */
    footer?: ReactNode;
    /** 送信ボタンの文言。 */
    label?: string;
    /** 送信中。ボタンは押せず、textarea も触れない。 */
    busy?: boolean;
    /** 送信を許可しない（本文が空など）。 */
    disabled?: boolean;
    placeholder?: string;
    rows?: number;
    className?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=ReplyComposer.d.ts.map