export interface ColumnWidthResetPillProps {
    /** useColumnWidths().isCustomized。 */
    customized: boolean;
    onReset: () => void;
    /** 一括操作ピルが出ている間などに true で隠す。 */
    suppress?: boolean;
    text?: string;
    buttonLabel?: string;
}
export declare function ColumnWidthResetPill({ customized, onReset, suppress, text, buttonLabel, }: ColumnWidthResetPillProps): import("react").JSX.Element | null;
export default ColumnWidthResetPill;
//# sourceMappingURL=ColumnWidthResetPill.d.ts.map