import type { ReactNode } from 'react';
export declare function EmptyState({ message, loading, className, children, }: {
    message?: ReactNode;
    loading?: boolean;
    className?: string;
    /** 「登録する」ボタンなど、次の一手。 */
    children?: ReactNode;
}): import("react").JSX.Element;
export declare function EmptyTableRow({ colSpan, message, loading, className, }: {
    colSpan: number;
    message?: ReactNode;
    loading?: boolean;
    className?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=EmptyState.d.ts.map