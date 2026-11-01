import type { CSSProperties, ReactNode } from 'react';
import { type SidebarNavItem, type SidebarNavSection } from '../lib/sidebar-nav';
/** renderLink に渡す、リンクへ付けるべき属性一式。そのまま展開して <Link> 等に渡す。 */
export type SidebarLinkProps = {
    href: string;
    title: string;
    'aria-label'?: string;
    'aria-current'?: 'page';
    onClick?: () => void;
    className: string;
    style?: CSSProperties;
    'data-tour'?: string;
    children: ReactNode;
};
export type SidebarLinkContext = {
    kind: 'item' | 'quickAction' | 'quickActionCount';
    item: SidebarNavItem;
};
/** next/link や prefetch の差し替え口。ctx.item で行ごとの先読みなどを付けられる。 */
export type SidebarRenderLink = (props: SidebarLinkProps, ctx: SidebarLinkContext) => ReactNode;
/** locked 行（Pro ロック）の差し替え口。ProLockedFeatureNotice 等で包んで返す。 */
export type SidebarRenderLocked = (props: {
    className: string;
    title: string;
    children: ReactNode;
}, item: SidebarNavItem) => ReactNode;
export declare const DEFAULT_SIDEBAR_ACTIVE_CLASS = "sb-nav-active font-semibold";
export declare function SidebarNavSectionLabel({ label }: {
    label: string;
}): import("react").JSX.Element;
export declare function SidebarNavLink({ item, pathname, collapsed, activeClassName, renderLink, renderLocked, lockBadge, onNavigate, }: {
    item: SidebarNavItem;
    pathname: string;
    /** アイコンだけのレール表示（折りたたみ幅が 0 でないとき）。 */
    collapsed?: boolean;
    /** 選択中の見た目。既定は .sb-nav-active（アプリ CSS）。 */
    activeClassName?: string;
    renderLink?: SidebarRenderLink;
    renderLocked?: SidebarRenderLocked;
    /** locked 行に付けるバッジの文言。 */
    lockBadge?: string;
    onNavigate?: () => void;
}): import("react").JSX.Element;
/** 区分ごとの見出し＋行の並び。decorate で行ごとにバッジ等を差し込める。 */
export declare function SidebarNavSections({ sections, decorate, ...rest }: {
    sections: readonly SidebarNavSection[];
    pathname: string;
    collapsed?: boolean;
    activeClassName?: string;
    renderLink?: SidebarRenderLink;
    renderLocked?: SidebarRenderLocked;
    lockBadge?: string;
    onNavigate?: () => void;
    decorate?: (item: SidebarNavItem) => SidebarNavItem;
}): import("react").JSX.Element;
//# sourceMappingURL=SidebarNav.d.ts.map