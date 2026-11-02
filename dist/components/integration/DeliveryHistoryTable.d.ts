import type { DeliveryHistoryRow } from './types';
/**
 * 送信履歴の表。「失敗だけ」切替（controlled にも uncontrolled にもできる）と、再送・まとめて再送。
 * 表は横スクロール枠に入れる（スマホで崩れない）。
 */
export declare function DeliveryHistoryTable({ rows, failedOnly, defaultFailedOnly, onFailedOnlyChange, onResend, onResendAll, resendingIds, emptyText, }: {
    rows: DeliveryHistoryRow[];
    failedOnly?: boolean;
    defaultFailedOnly?: boolean;
    onFailedOnlyChange?: (next: boolean) => void;
    onResend?: (id: string) => void;
    onResendAll?: () => void;
    resendingIds?: string[];
    emptyText?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=DeliveryHistoryTable.d.ts.map