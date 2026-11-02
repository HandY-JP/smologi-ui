'use client';
// 全アプリ共通のサイドバー。Seller（AmazonSidebar / SellerNav）と Smologi（CustomerSidebar / AdminSidebar）の
// 見た目・挙動を一本化したもの。アプリはデータ（sections）と slot を渡すだけ。
//
// 開閉・ピーク（左端 15px のホバー帯・遅延 250/80ms）・スマホドロワー・CSS 変数
// （--sidebar-width / --sidebar-visual-width / --sidebar-toggle-inset）は
// amazon-app a85522311 の AmazonSidebar と同じ数値のまま。--sidebar-dock-inset はアプリの globals.css が
// --sidebar-toggle-inset から橋渡しする（この部品は配らない）。
// next/* には依存しない（現在のパスは pathname、リンクは renderLink で受ける）。
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
  sectionGapClassName,
  quickActionClassName,
  quickActionActiveClassName,
  dotClassName,
  firstSectionGapClassName,
  topSpacerClassName = 'mt-4 h-8',
  topWrapperClassName = 'mt-3 mb-2 pb-1',
  fixedContentWidth = false,
  shadowTransition = false,
  mobileDrawer = true,
  syncDockInset = false,
  edgeTriggerFocusClassName = 'focus-visible:bg-orange-300/30',
  navStateClassName,
  navOverride,
  footer,
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
  } = useSidebarCollapsed(expandedWidth, collapsedWidth, { storageKey, syncDockInset });
  const drawer = useSidebarDrawer(pathname);
  const isMobile = mobileDrawer && drawer.isMobile;
  const mobileOpen = mobileDrawer && drawer.mobileOpen;
  const { setMobileOpen } = drawer;

  // 閉じた幅が 0 のときだけ、閉じ中のサイドバーを隠す（aria-hidden / inert）。レールなら残す。
  const zeroWidthWhenClosed = isZeroCssLength(collapsedWidth);
  const sidebarHidden = zeroWidthWhenClosed && persistedCollapsed && !peeking;
  // レール（閉じた幅が 0 でない）として見えている間。ピーク中・スマホドロワーでは false（通常の展開描画）。
  const railActive = !zeroWidthWhenClosed && collapsed && !isMobile;
  const dockCollapsed = isMobile ? !mobileOpen : zeroWidthWhenClosed ? sidebarHidden : collapsed;
  const asideHidden = isMobile ? !mobileOpen : sidebarHidden;

  const news = summarizeSidebarNews(decorate ? sections.map((s) => ({ ...s, items: s.items.map(decorate) })) : sections);
  const ctx = { collapsed: railActive };
  const closeDrawer = () => setMobileOpen(false);

  // レールでは ▶・ホーム・すべてのページが縦に並ぶので、そのぶんの高さを取り、下に短い横線を引く。
  const railDockCount = 1 + (dock?.home ? 1 : 0) + (dock?.allPages ? 1 : 0);
  const spacer = railActive ? (
    <div
      className="flex flex-shrink-0 items-end justify-center pb-2"
      style={{ height: `calc(1rem + ${railDockCount * 2 + (railDockCount - 1) * 0.25}rem + 1rem)` }}
      aria-hidden="true"
    >
      <div className="h-px w-6" style={{ backgroundColor: 'color-mix(in srgb, var(--sb-label) 35%, transparent)' }} />
    </div>
  ) : (
    <div className={`${topSpacerClassName} flex-shrink-0`} aria-hidden="true" />
  );
  // ストア・アカウントなどの切り替え（top）は、レールでは出さない（一時展開したときに使う）。
  const topNode = !railActive && top != null && (topWrapperClassName ? <div className={topWrapperClassName}>{resolve(top, ctx)}</div> : resolve(top, ctx));
  const navNode =
    navOverride != null && !railActive ? (
      navOverride
    ) : (
      <nav
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-2 transition-opacity duration-150 motion-reduce:transition-none ${navStateClassName ?? (navDimmed ? 'opacity-40' : '')}`}
      >
        <SidebarNavSections
          sections={sections}
          pathname={pathname}
          collapsed={ctx.collapsed}
          activeClassName={activeClassName}
          renderLink={renderLink}
          renderLocked={renderLocked}
          lockBadge={lockBadge}
          sectionGapClassName={sectionGapClassName}
          firstSectionGapClassName={firstSectionGapClassName}
          dotClassName={dotClassName}
          quickActionClassName={quickActionClassName}
          quickActionActiveClassName={quickActionActiveClassName}
          decorate={decorate}
          onNavigate={closeDrawer}
        />
      </nav>
    );
  const body = (
    <>
      {/* 最上段の余白行。<aside> の外に固定表示されるドックのぶんの高さを確保する。 */}
      {spacer}
      {topNode}
      {navNode}
      {accountMenu != null && (
        <div className="flex-shrink-0 px-2 pb-2 pt-1">
          <div className="mt-1 border-t pt-1" style={{ borderColor: 'var(--sb-border)' }}>
            {resolve(accountMenu, ctx)}
          </div>
        </div>
      )}
      {footer != null && resolve(footer, ctx)}
    </>
  );

  return (
    <>
      {/* 画面左端の当たり判定。折りたたみ中だけ描き、ホバーした瞬間に開く（待ち時間なし）。
          スマホ（ドロワー）では出さない＝タップでの開閉だけにする。レール表示中は、行にカーソルを当てて名前を見られるよう左端 8px だけの帯にする。 */}
      {persistedCollapsed && !isMobile && (zeroWidthWhenClosed || railActive || peeking) && (
        <button
          type="button"
          aria-label={`${openSidebarLabel}する`}
          title={openSidebarLabel}
          onClick={() => setCollapsed(false)}
          {...edgeTriggerHandlers}
          className={`fixed inset-y-0 left-0 z-[60] ${zeroWidthWhenClosed ? 'w-[15px]' : 'w-2'} bg-transparent ${edgeTriggerFocusClassName} focus-visible:outline-none ${peeking ? 'pointer-events-none' : ''}`}
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
        hoverHandlers={isMobile || railActive ? undefined : peekHandlers}
        rail={railActive}
      />

      <aside
        {...(railActive ? {} : peekHandlers)}
        aria-hidden={asideHidden}
        inert={asideHidden ? true : undefined}
        // サイドバーと本文の境界は色面の差（--sb-bg と本文の背景）だけで示す。
        // ホバーでかぶさる peeking のときだけ、本文の上に浮いていることが分かるよう影を残す。
        className={`fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-visual-width)] flex-col overflow-hidden ${shadowTransition ? 'transition-[width,box-shadow]' : 'transition-[width]'} ${widthMotionClass} motion-reduce:transition-none ${peeking ? 'shadow-2xl' : ''} ${
          mobileDrawer
            ? `max-md:w-56 max-md:transition-transform max-md:duration-200 ${mobileOpen ? 'max-md:translate-x-0 max-md:shadow-2xl' : 'max-md:-translate-x-full'}`
            : ''
        }`}
        style={{ backgroundColor: 'var(--sb-bg)' }}
      >
        {fixedContentWidth && zeroWidthWhenClosed ? (
          <div className="flex h-full flex-col overflow-hidden" style={{ width: expandedWidth }}>
            {body}
          </div>
        ) : (
          body
        )}
      </aside>
    </>
  );
}
