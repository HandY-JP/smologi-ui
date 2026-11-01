'use client';
// 共通サイドバーの「区分見出し＋行」。Seller の SellerNav と Smologi の CustomerSidebar の行を一本化したもの。
// next/* には依存しない。リンクは renderLink で差し替える（既定は <a>）。
import type { CSSProperties, ReactNode } from 'react';
import { isSidebarNavItemActive, type SidebarNavItem, type SidebarNavSection } from '../lib/sidebar-nav';
import { SidebarNewDot } from './SidebarNewDot';

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
export type SidebarRenderLocked = (
  props: { className: string; title: string; children: ReactNode },
  item: SidebarNavItem,
) => ReactNode;

export const DEFAULT_SIDEBAR_ACTIVE_CLASS = 'sb-nav-active font-semibold';

const defaultRenderLink: SidebarRenderLink = (props) => <a {...props} />;

const ROW_FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-text)]';

export function SidebarNavSectionLabel({ label }: { label: string }) {
  return (
    <div className="truncate px-3 pt-4 pb-1 text-[10px] font-semibold tracking-wider" style={{ color: 'var(--sb-label)' }}>
      {label}
    </div>
  );
}

function CountBadge({ item }: { item: SidebarNavItem }) {
  if (typeof item.count !== 'number' || item.count <= 0) return null;
  return (
    <span
      className={`min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none tabular-nums ${
        item.countTone === 'danger'
          ? 'bg-red-600 text-white'
          : item.countTone === 'info'
            ? 'bg-blue-600 text-white'
            : item.countTone === 'accent'
              ? 'bg-[var(--sb-accent-bg)] text-[color:var(--accent-on)]'
              : 'bg-[var(--sb-hover,#FBF7F2)] text-[#C2560D]'
      }`}
      aria-label={item.countLabel ?? `${item.count}件`}
    >
      {item.count > 999 ? '999+' : item.count}
    </span>
  );
}

const PLUS_ICON = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
  </svg>
);

export function SidebarNavLink({
  item,
  pathname,
  collapsed = false,
  activeClassName = DEFAULT_SIDEBAR_ACTIVE_CLASS,
  renderLink = defaultRenderLink,
  renderLocked,
  lockBadge = 'PRO',
  onNavigate,
}: {
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
}) {
  // ---- 今後実装予定（リンクにしない）----
  if (item.comingSoon) {
    return (
      <div
        className={`flex h-9 items-center rounded-md text-base cursor-not-allowed opacity-50 select-none ${collapsed ? 'justify-center' : 'gap-2.5 px-3'}`}
        style={{ color: 'var(--sb-text)' }}
        title="今後実装予定の機能です"
      >
        {item.icon}
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <span
              className="flex-shrink-0 whitespace-nowrap rounded px-1 py-px text-[9px] font-bold"
              style={{ backgroundColor: 'var(--sb-hover)', color: 'var(--sb-label)' }}
            >
              準備中
            </span>
          </>
        )}
      </div>
    );
  }

  // ---- Pro ロック（リンクにしない。案内はアプリ側が renderLocked で付ける）----
  if (item.locked) {
    const title = item.lockedReason ?? `${item.label}（利用できません）`;
    const body = (
      <>
        {item.icon}
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <span
              className="flex-shrink-0 whitespace-nowrap rounded px-1 py-px text-[9px] font-bold"
              style={{ backgroundColor: 'var(--sb-hover)', color: 'var(--sb-label)' }}
            >
              {lockBadge}
            </span>
          </>
        )}
      </>
    );
    const className = `flex h-9 w-full items-center rounded-md text-left text-base text-[var(--sb-text)] opacity-50 transition-opacity hover:opacity-90 ${
      collapsed ? 'justify-center' : 'gap-2.5 px-3'
    } focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sb-accent-bg)]`;
    return renderLocked ? (
      <>{renderLocked({ className, title, children: body }, item)}</>
    ) : (
      <div className={`${className} cursor-not-allowed`} title={title} aria-disabled="true">
        {body}
      </div>
    );
  }

  const isActive = isSidebarNavItemActive(item, pathname);
  const baseLabel = item.badge ? `${item.label} (${item.badge}版)` : item.label;
  const title = item.dot && item.dotReason ? `${baseLabel}（${item.dotReason}）` : item.dim && !isActive ? `${baseLabel}（未設定）` : baseLabel;
  // レール表示中は行の右端ごと隠れるので「＋」は出さない。
  const quickAction = !collapsed ? item.quickAction : undefined;
  const pillClass = 'sb-glass-surface-ringed whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none';

  const main = renderLink(
    {
      href: item.href,
      title,
      'aria-label': item.badge || (item.dot && item.dotReason) ? title : item.label,
      'aria-current': isActive ? 'page' : undefined,
      onClick: onNavigate,
      'data-tour': item.dataTour,
      className: `relative flex h-9 items-center rounded-md text-base transition-colors ${ROW_FOCUS} ${
        collapsed ? 'justify-center px-0' : quickAction ? 'gap-2.5 pl-3 pr-10' : 'gap-2.5 px-3'
      } ${isActive ? activeClassName : 'hover:bg-[var(--sb-hover)]'} ${item.dim && !isActive ? 'opacity-55' : ''}`,
      style: isActive ? undefined : { color: 'var(--sb-text)' },
      children: (
        <>
          {item.icon}
          {/* 幅アニメ中に折り返さないよう truncate で固定する。 */}
          {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
          {!collapsed && <CountBadge item={item} />}
          {!collapsed && item.unlockPill && (
            <span className={pillClass} style={{ color: 'var(--sb-label)' }}>{item.unlockPill}</span>
          )}
          {!collapsed && item.badge && (
            <span className="rounded-full border border-orange-300 bg-white px-1.5 py-0.5 text-[11px] font-bold leading-none text-orange-700">
              {item.badge}
            </span>
          )}
          {/* 要対応の赤丸。置き場所は常に行の右端＝開閉で飛ばない（レールでは角）。 */}
          {item.dot && (
            <SidebarNewDot placement={collapsed ? 'corner' : 'inline'} label={item.dotReason ?? '新着あり'} onAccent={false} />
          )}
        </>
      ),
    },
    { kind: 'item', item },
  );

  return (
    <div className="relative">
      {main}
      {quickAction &&
        renderLink(
          {
            href: quickAction.href,
            title: quickAction.label,
            'aria-label': quickAction.label,
            className: `absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--sb-accent-bg)] ${
              isActive ? 'sb-nav-round-active' : 'bg-[var(--sb-hover)] hover:shadow-[0_0_0_1px_var(--sb-label)]'
            }`,
            style: isActive ? undefined : { color: 'var(--sb-text)' },
            children: PLUS_ICON,
          },
          { kind: 'quickAction', item },
        )}
      {quickAction && item.quickActionCount && typeof item.quickActionCount.count === 'number' && item.quickActionCount.count > 0 &&
        renderLink(
          {
            href: item.quickActionCount.href,
            title: `${item.quickActionCount.label} ${item.quickActionCount.count}件`,
            'aria-label': `${item.quickActionCount.label} ${item.quickActionCount.count}件`,
            className:
              'absolute right-0 top-0 min-w-[1rem] rounded-full bg-[#C2560D] px-1 py-0.5 text-center text-[10px] font-semibold leading-none tabular-nums text-white',
            children: item.quickActionCount.count > 99 ? '99+' : item.quickActionCount.count,
          },
          { kind: 'quickActionCount', item },
        )}
    </div>
  );
}

/** 区分ごとの見出し＋行の並び。decorate で行ごとにバッジ等を差し込める。 */
export function SidebarNavSections({
  sections,
  decorate,
  ...rest
}: {
  sections: readonly SidebarNavSection[];
  pathname: string;
  collapsed?: boolean;
  activeClassName?: string;
  renderLink?: SidebarRenderLink;
  renderLocked?: SidebarRenderLocked;
  lockBadge?: string;
  onNavigate?: () => void;
  decorate?: (item: SidebarNavItem) => SidebarNavItem;
}) {
  return (
    <>
      {sections.map((section, index) => (
        <div key={section.key} className={index === 0 ? 'pt-1' : section.label ? '' : 'mt-4'}>
          {section.label && !rest.collapsed && <SidebarNavSectionLabel label={section.label} />}
          <div className="space-y-0.5">
            {section.items.map((item) => (
              <SidebarNavLink key={item.href} item={decorate ? decorate(item) : item} {...rest} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
