import type { ReactNode } from 'react';
export declare function EmptyState({ message, loading, icon, description, bare, className, children, }: {
    /** 見出し（1行目）。description があるときは太字の見出しとして出す。 */
    message?: ReactNode;
    loading?: boolean;
    /** 円形の淡色背景に載せるアイコン（h-6 w-6 想定）。 */
    icon?: ReactNode;
    /** 見出しの下の補足（小さめ・薄め）。 */
    description?: ReactNode;
    /** true で枠・背景・角丸を付けない（すでに枠のあるカードの中に置くとき）。余白は className で足す。 */
    bare?: boolean;
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