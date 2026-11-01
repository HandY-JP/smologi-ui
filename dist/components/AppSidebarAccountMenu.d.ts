import { type ReactNode } from 'react';
import type { SidebarRenderLink } from './SidebarNav';
export declare const SIDEBAR_MENU_ICONS: {
    settings: import("react").JSX.Element;
    help: import("react").JSX.Element;
    logout: import("react").JSX.Element;
};
export interface AppSidebarAccountMenuItem {
    key: string;
    label: string;
    icon?: ReactNode;
    /** href があればリンク、無ければ onSelect のボタン。 */
    href?: string;
    onSelect?: () => void;
}
export declare function AppSidebarAccountMenu({ name, email, image, items, extra, signOut, renderLink, buttonTitle, }: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    /** 設定・ヘルプなど（メニュー中段）。 */
    items: AppSidebarAccountMenuItem[];
    /** 項目の上に差し込むもの（ダークモード切替など。クリックしてもメニューは閉じない）。 */
    extra?: ReactNode;
    /** ログアウト（メニュー最下段）。 */
    signOut?: {
        label?: string;
        onSelect: () => void;
    };
    renderLink?: SidebarRenderLink;
    buttonTitle?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=AppSidebarAccountMenu.d.ts.map