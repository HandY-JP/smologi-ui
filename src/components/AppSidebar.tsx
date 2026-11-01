'use client';
// 全アプリ共通のサイドバー。Seller（AmazonSidebar / SellerNav）と Smologi（CustomerSidebar / AdminSidebar）の
// 見た目・挙動を一本化したもの。アプリはデータ（sections）と slot を渡すだけ。
//
// 開閉・ピーク（左端 15px のホバー帯・遅延 250/80ms）・スマホドロワー・CSS 変数
// （--sidebar-width / --sidebar-visual-width / --sidebar-toggle-inset / --sidebar-dock-inset）は
// amazon-app a85522311 の AmazonSidebar と同じ数値のまま。next/* には依存しない
// （現在のパスは pathname、リンクは renderLink で受ける）。
import type { ReactNode } from 'react';
import { isZeroCssLength, summarizeSidebarNews, type SidebarNavItem, type SidebarNavSection } from '../lib/sidebar-nav';
import { useSidebarCollapsed } from './useSidebarCollapsed';
import { useSidebarDrawer } from './useSidebarDrawer';
import { SidebarToggleDock } from './SidebarToggleDock';
import {
  DEFAULT_SIDEBAR_ACTIVE_CLASS,
  SidebarNavSections,
  type SidebarRenderLink,
  type SidebarRenderLocked,
} from './SidebarNav';

type DockProps = Omit<
  Parameters<typeof SidebarToggleDock>[0],
  'collapsed' | 'persistedCollapsed' | 'onToggle' | 'hoverHandlers'
>;

/** slot は ReactNode か、開閉状態を受け取る関数。 */
export type SidebarSlot = ReactNode | ((ctx: { collapsed: boolean }) => ReactNode);

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
  /** 選択中の行の className。既定 'sb-nav-active font-semibold'（.sb-nav-active はアプリ CSS）。 */
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

const resolve = (slot: SidebarSlot, ctx: { collapsed: boolean }) => (typeof slot === 'function' ? slot(ctx) : slot);

export function AppSidebar({
  sections,
  pathname,
  top,
  accountMenu,
  storageKey,
  expandedWidth = '14rem',
  collapsedWidth = '0rem',
  renderLink,
  renderLocked,
  lockBadge,
  decorate,
  activeClassName = DEFAULT_SIDEBAR_ACTIVE_CLASS,
  dock,
  navDimmed = false,
  closeMenuLabel = 'メニューを閉じる',
  openSidebarLabel = 'サイドバーを表示',
}: AppSidebarProps) {
  const {
    collapsed,
    persistedCollapsed,
    peeking,
    widthMotionClass,
    setCollapsed,
    edgeTriggerHandlers,
    peekHandlers,
  } = useSidebarCollapsed(expandedWidth, collapsedWidth, { storageKey });
  const { isMobile, mobileOpen, setMobileOpen } = useSidebarDrawer(pathname);

  // 閉じた幅が 0 のときだけ、閉じ中のサイドバーを隠す（aria-hidden / inert）。レールなら残す。
  const zeroWidthWhenClosed = isZeroCssLength(collapsedWidth);
  const sidebarHidden = zeroWidthWhenClosed && persistedCollapsed && !peeking;
  const dockCollapsed = isMobile ? !mobileOpen : sidebarHidden;
  const asideHidden = isMobile ? !mobileOpen : sidebarHidden;

  const news = summarizeSidebarNews(decorate ? sections.map((s) => ({ ...s, items: s.items.map(decorate) })) : sections);
  const ctx = { collapsed: zeroWidthWhenClosed ? false : collapsed };
  const closeDrawer = () => setMobileOpen(false);

  return (
    <>
      {/* 画面左端の当たり判定。折りたたみ中だけ描き、ホバーした瞬間に開く（待ち時間なし）。
          スマホ（ドロワー）では出さない＝タップでの開閉だけにする。レール表示中は不要（レール自体が当たり判定）。 */}
      {persistedCollapsed && !isMobile && zeroWidthWhenClosed && (
        <button
          type="button"
          aria-label={`${openSidebarLabel}する`}
          title={openSidebarLabel}
          onClick={() => setCollapsed(false)}
          {...edgeTriggerHandlers}
          className={`fixed inset-y-0 left-0 z-[60] w-[15px] bg-transparent focus-visible:bg-orange-300/30 focus-visible:outline-none ${peeking ? 'pointer-events-none' : ''}`}
        />
      )}

      {/* スマホドロワーの背景幕。タップで閉じる。 */}
      {mobileOpen && (
        <button
          type="button"
          aria-label={closeMenuLabel}
          onClick={closeDrawer}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      {/* 開閉トグルは <aside> の**外**に固定で置く（折りたたむと幅0になるため、中に置くとトグルごと消えて開き直せない）。 */}
      <SidebarToggleDock
        hasNews={news.hasNews}
        newsReason={news.reason}
        {...dock}
        collapsed={dockCollapsed}
        persistedCollapsed={isMobile ? !mobileOpen : persistedCollapsed}
        onToggle={() => (isMobile ? setMobileOpen((value) => !value) : setCollapsed((value) => !value))}
        hoverHandlers={isMobile ? undefined : peekHandlers}
      />

      <aside
        {...peekHandlers}
        aria-hidden={asideHidden}
        inert={asideHidden ? true : undefined}
        // サイドバーと本文の境界は色面の差（--sb-bg と本文の背景）だけで示す。
        // ホバーでかぶさる peeking のときだけ、本文の上に浮いていることが分かるよう影を残す。
        className={`fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-visual-width)] flex-col overflow-hidden transition-[width] ${widthMotionClass} motion-reduce:transition-none ${peeking ? 'shadow-2xl' : ''} max-md:w-56 max-md:transition-transform max-md:duration-200 ${
          mobileOpen ? 'max-md:translate-x-0 max-md:shadow-2xl' : 'max-md:-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--sb-bg)' }}
      >
        {/* 最上段の余白行。<aside> の外に固定表示されるドックのぶんの高さ（left-2 top-4 h-8）を確保する。 */}
        <div className="mt-4 h-8 flex-shrink-0" aria-hidden="true" />

        {top != null && <div className="mt-3 mb-2 pb-1">{resolve(top, ctx)}</div>}

        <nav
          className={`flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-2 transition-opacity duration-150 motion-reduce:transition-none ${navDimmed ? 'opacity-40' : ''}`}
        >
          <SidebarNavSections
            sections={sections}
            pathname={pathname}
            collapsed={ctx.collapsed}
            activeClassName={activeClassName}
            renderLink={renderLink}
            renderLocked={renderLocked}
            lockBadge={lockBadge}
            decorate={decorate}
            onNavigate={closeDrawer}
          />
        </nav>

        {accountMenu != null && (
          <div className="flex-shrink-0 px-2 pb-2 pt-1">
            <div className="mt-1 border-t pt-1" style={{ borderColor: 'var(--sb-border)' }}>
              {resolve(accountMenu, ctx)}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
