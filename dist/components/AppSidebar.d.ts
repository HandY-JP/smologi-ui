import type { ReactNode } from 'react';
import { type SidebarNavItem, type SidebarNavSection } from '../lib/sidebar-nav';
import { SidebarToggleDock } from './SidebarToggleDock';
import { type SidebarRenderLink, type SidebarRenderLocked } from './SidebarNav';
type DockProps = Omit<Parameters<typeof SidebarToggleDock>[0], 'collapsed' | 'persistedCollapsed' | 'onToggle' | 'hoverHandlers'>;
/** slot は ReactNode か、開閉状態を受け取る関数。 */
export type SidebarSlot = ReactNode | ((ctx: {
    collapsed: boolean;
}) => ReactNode);
export interface AppSidebarProps {
    sections: readonly SidebarNavSection[];
    /** 現在のパス名（next/navigation の usePathname() など。パッケージは next に依存しない）。 */
    pathname: string;
    /** 上部 slot（拠点・ストア・ワークスペース切り替え。StoreAccountSwitcher など）。 */
    top?: SidebarSlot;
    /** 下部のアカウントメニュー（AppSidebarAccountMenu か、アプリ独自のもの）。 */
    accountMenu?: SidebarSlot;
    /** 開閉の保存キー。既定は Smologi / Seller と同じ 'handy-sidebar-collapsed-v1'。 */
    storageKey?: string;
    /** 開いたときの幅。既定 14rem。 */
    expandedWidth?: string;
    /**
     * 閉じたときの幅。既定 0rem（完全に引っ込む）。0 以外にするとアイコンだけのレールとして残る
     * （そのときは hidden/inert にせず、行はアイコン表示に切り替わる）。変更はこの部品の中だけで済む。
     */
    collapsedWidth?: string;
    /** next/link などへの差し替え。既定は <a>。 */
    renderLink?: SidebarRenderLink;
    /** Pro ロック行の差し替え（ProLockedFeatureNotice で包むなど）。 */
    renderLocked?: SidebarRenderLocked;
    /** ロック行のバッジ文言。既定 'PRO'。 */
    lockBadge?: string;
    /** 行ごとに件数・点などを差し込む。 */
    decorate?: (item: SidebarNavItem) => SidebarNavItem;
    /** 2つ目以降の区分の上余白 class（Seller は 'mt-4'）。 */
    sectionGapClassName?: string;
    /** 「＋」の通常時 / 選択中の色 class（Seller の旧見た目に合わせる用）。 */
    quickActionClassName?: string;
    quickActionActiveClassName?: string;
    /** 選択中の行の className（太字は部品側で足す）。既定 'sb-nav-active'（.sb-nav-active はアプリ CSS）。 */
    activeClassName?: string;
    /** 開閉ドック（SidebarToggleDock）へ渡すもの。hasNews / newsReason は未指定なら sections の dot から作る。 */
    dock?: DockProps;
    /** メニューを薄く無効風にする（アカウント未登録など）。 */
    navDimmed?: boolean;
    /** スマホドロワーの背景幕の aria-label。 */
    closeMenuLabel?: string;
    /** 左端ホバー帯の aria-label / title。 */
    openSidebarLabel?: string;
}
export declare function AppSidebar({ sections, pathname, top, accountMenu, storageKey, expandedWidth, collapsedWidth, renderLink, renderLocked, lockBadge, decorate, activeClassName, sectionGapClassName, quickActionClassName, quickActionActiveClassName, dock, navDimmed, closeMenuLabel, openSidebarLabel, }: AppSidebarProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=AppSidebar.d.ts.map