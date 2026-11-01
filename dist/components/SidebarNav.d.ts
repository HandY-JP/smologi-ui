import { type CSSProperties, type ReactNode } from 'react';
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
    role?: string;
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
/** 選択中の行の既定 class。太字（font-semibold）は部品側で足すので、アプリは色・地の class だけ渡せばよい。 */
export declare const DEFAULT_SIDEBAR_ACTIVE_CLASS = "sb-nav-active";
export declare function SidebarNavSectionLabel({ label }: {
    label: string;
}): import("react").JSX.Element;
export declare function SidebarNavLink({ item, pathname, collapsed, activeClassName, renderLink, renderLocked, lockBadge, quickActionClassName, quickActionActiveClassName, onNavigate, }: {
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
    /** 「＋」の通常時の色 class（既定は --sb-hover 地）。Seller: 'bg-black/5 text-[#231F1C] hover:bg-black/10'。 */
    quickActionClassName?: string;
    /** 「＋」の選択中の色 class（既定 sb-nav-round-active）。Seller: 'bg-[#FFE5D1] text-[#C2560D] hover:bg-[#FFE5D1]/80'。 */
    quickActionActiveClassName?: string;
    onNavigate?: () => void;
}): import("react").JSX.Element;
type NavRest = {
    pathname: string;
    collapsed?: boolean;
    activeClassName?: string;
    renderLink?: SidebarRenderLink;
    renderLocked?: SidebarRenderLocked;
    lockBadge?: string;
    quickActionClassName?: string;
    quickActionActiveClassName?: string;
    onNavigate?: () => void;
};
/** 区分ごとの見出し＋行の並び。decorate で行ごとにバッジ等を差し込める。 */
export declare function SidebarNavSections({ sections, decorate, sectionGapClassName, ...rest }: {
    sections: readonly SidebarNavSection[];
    /** 2つ目以降の区分の上余白 class。既定は Smologi 流（見出しあり＝なし、見出しなし＝mt-4）。Seller は 'mt-4'。 */
    sectionGapClassName?: string;
    decorate?: (item: SidebarNavItem) => SidebarNavItem;
} & NavRest): import("react").JSX.Element;
export {};
//# sourceMappingURL=SidebarNav.d.ts.map