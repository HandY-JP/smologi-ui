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
     * 閉じたときの幅。既定 0rem（完全に引っ込む）。0 以外（例 '3.5rem'）にするとアイコンだけのレールとして残る。
     * レールのときの見た目（v0.13.0）: ▶・ホーム・すべてのページが縦に並ぶ／区分の見出しは隠して区分の間に短い横線／
     * 件数と「＋」は隠して件数・要対応のある行はアイコンの角に点／行にカーソル・キーボードフォーカスで右に名前の吹き出し
     * （件数があれば「倉庫連携（184）」。portal なので <aside> で切れない）／top slot は出さない／
     * 左端 8px のホバー帯かドックの▶で一時展開（ピーク）。スマホ（767px 以下）は従来のドロワーのまま。
     * レール中は --sidebar-width がこの幅になるので、本文の左余白はアプリが var(--sidebar-width) で追従させる。
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
    /** 要対応の点の色 class（既定 red-500。Smologi は 'bg-danger-solid'）。 */
    dotClassName?: string;
    /** 最初の区分の上余白 class。既定 'pt-1'（Smologi は ''）。 */
    firstSectionGapClassName?: string;
    /** 最上段の余白行の class。既定 'mt-4 h-8'（Smologi はトップバーと同じ 'h-16'）。 */
    topSpacerClassName?: string;
    /** top slot を包む div の class。既定 'mt-3 mb-2 pb-1'（Smologi は ''）。 */
    topWrapperClassName?: string;
    /** true なら中身を expandedWidth で固定し、外側の幅アニメでクリップされるだけにする（閉じた幅 0 のとき。Smologi 流）。既定 false。 */
    fixedContentWidth?: boolean;
    /** true なら aside の transition に box-shadow も含める（ピーク時の影を幅と同じ尺で出し入れ。Smologi 流）。既定 false。 */
    shadowTransition?: boolean;
    /** false にすると 767px 以下でもドロワーにせず、デスクトップと同じ描画のまま。既定 true。 */
    mobileDrawer?: boolean;
    /** true なら --sidebar-dock-inset（畳み時のカプセルの避け幅。ピーク中は 0）も配る。Smologi が使う。 */
    syncDockInset?: boolean;
    /** 左端の当たり判定帯がキーボードフォーカスされたときの背景 class。既定 'focus-visible:bg-orange-300/30'。 */
    edgeTriggerFocusClassName?: string;
    /** nav の状態 class を丸ごと差し替える（既定は navDimmed で opacity-40 / なし）。例 Smologi の画面切替中 'opacity-60'・通常 'opacity-100'。 */
    navStateClassName?: string;
    /** 区分 nav の代わりに出すもの（設定モードで設定メニューに差し替える等）。指定すると <nav> ごと置き換わる。
     *  ただしレール（閉じてアイコンの列だけのとき）は幅が足りないので差し替えず、通常の区分 nav（アイコン）を出す。 */
    navOverride?: ReactNode;
    /** アカウント欄の下に出す slot（「Logisticに戻る」など）。 */
    footer?: SidebarSlot;
    /** 開閉ドック（SidebarToggleDock）へ渡すもの。hasNews / newsReason は未指定なら sections の dot から作る。 */
    dock?: DockProps;
    /** メニューを薄く無効風にする（アカウント未登録など）。 */
    navDimmed?: boolean;
    /** スマホドロワーの背景幕の aria-label。 */
    closeMenuLabel?: string;
    /** 左端ホバー帯の aria-label / title。 */
    openSidebarLabel?: string;
}
export declare function AppSidebar({ sections, pathname, top, accountMenu, storageKey, expandedWidth, collapsedWidth, renderLink, renderLocked, lockBadge, decorate, activeClassName, sectionGapClassName, quickActionClassName, quickActionActiveClassName, dotClassName, firstSectionGapClassName, topSpacerClassName, topWrapperClassName, fixedContentWidth, shadowTransition, mobileDrawer, syncDockInset, edgeTriggerFocusClassName, navStateClassName, navOverride, footer, dock, navDimmed, closeMenuLabel, openSidebarLabel, }: AppSidebarProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=AppSidebar.d.ts.map