export declare function Tooltip({ content, children, side, className, wrap, wrapWidth, }: {
    content: React.ReactNode;
    children: React.ReactElement;
    side?: 'top' | 'bottom' | 'right' | 'left';
    className?: string;
    /** 長文を折り返して表示する（既定は1行 nowrap）。 */
    wrap?: boolean;
    /** wrap 時の幅クラス（既定 w-56）。長文チップで広げたいときに上書きする。 */
    wrapWidth?: string;
}): import("react").JSX.Element;
export declare function HelpHint({ text, className, side, wrap, wrapWidth, }: {
    text: React.ReactNode;
    className?: string;
    side?: 'top' | 'bottom' | 'right' | 'left';
    wrap?: boolean;
    /** wrap 時の幅クラス（未指定は Tooltip の既定 w-56）。 */
    wrapWidth?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=Tooltip.d.ts.map