import { type ReactNode } from 'react';
export declare function SettingsPage({ children, className, }: {
    children: ReactNode;
    className?: string;
}): import("react").JSX.Element;
/**
 * 設定の区画（セクション）。
 * 2 つ目以降は上に横罫線が入る（`SettingsPage` の直下に並べるだけでよい）。
 */
export declare function SettingsSection({ title, description, 
/** 区画見出しの右に置く小さな操作（「追加」など）。主操作は道具バーへ。 */
action, 
/** 検索の対象にする語（見出し・説明のほかに拾わせたいもの）。 */
searchText, children, id, }: {
    title: string;
    description?: ReactNode;
    action?: ReactNode;
    searchText?: string[];
    children: ReactNode;
    id?: string;
}): import("react").JSX.Element | null;
/** 値が無い・まだ読めないときの控えめなプレースホルダ。 */
export declare function SettingsEmpty({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
/** 閲覧のみ権限のときに区画の先頭へ出す帯（全区分で同じ文言・同じ見た目にする）。 */
export declare function SettingsReadOnlyNotice({ children }: {
    children?: ReactNode;
}): import("react").JSX.Element;
//# sourceMappingURL=SettingsSection.d.ts.map