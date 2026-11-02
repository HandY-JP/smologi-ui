'use client';
// 共通サイドバーの「区分見出し＋行」。Seller の SellerNav と Smologi の CustomerSidebar の行を一本化したもの。
// next/* には依存しない。リンクは renderLink で差し替える（既定は <a>）。
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
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
export type SidebarRenderLocked = (
  props: { className: string; title: string; children: ReactNode },
  item: SidebarNavItem,
) => ReactNode;

/** 選択中の行の既定 class。太字（font-semibold）は部品側で足すので、アプリは色・地の class だけ渡せばよい。 */
export const DEFAULT_SIDEBAR_ACTIVE_CLASS = 'sb-nav-active';

const defaultRenderLink: SidebarRenderLink = (props) => <a {...props} />;

const ROW_FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-text)]';

export function SidebarNavSectionLabel({ label, badge }: { label: string; badge?: string }) {
  return (
    <div className="truncate px-3 pt-4 pb-1 text-[10px] font-semibold tracking-wider" style={{ color: 'var(--sb-label)' }}>
      {label}
      {badge && (
        <span
          className="ml-1.5 rounded-sm border px-1 py-px align-middle text-[9px] font-semibold leading-none"
          style={{ borderColor: 'var(--sb-border)' }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

/**
 * レール（アイコンだけ）表示中の行に、カーソル・キーボードフォーカスで右に名前の吹き出しを出す。
 * サイドバー（overflow-hidden の <aside>）で切れないよう document.body に portal して fixed 配置する。
 * 色は --sb-text / --sb-bg の反転（ライト・ダークとも読める）。
 */
export function SidebarRailTip({ text, children }: { text: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const show = () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.top + r.height / 2, left: r.right + 6 });
  };
  const hide = () => setPos(null);
  return (
    <div
      ref={ref}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== 'touch') show();
      }}
      onPointerLeave={hide}
      onPointerDown={hide}
      onFocus={(e) => {
        // クリック後に残るフォーカスでは出さない（キーボード操作のときだけ）。
        let visible = false;
        try {
          visible = e.target.matches(':focus-visible');
        } catch {
          visible = true;
        }
        if (visible) show();
      }}
      onBlur={hide}
    >
      {children}
      {pos &&
        typeof document !== 'undefined' &&
        createPortal(
          <span
            role="tooltip"
            data-sidebar-rail-tip
            className="pointer-events-none fixed z-[80] -translate-y-1/2 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium shadow-lg"
            style={{ top: pos.top, left: pos.left, backgroundColor: 'var(--sb-text)', color: 'var(--sb-bg)' }}
          >
            <span
              aria-hidden="true"
              className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45"
              style={{ backgroundColor: 'var(--sb-text)' }}
            />
            <span className="relative">{text}</span>
          </span>,
          document.body,
        )}
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

/** レールで件数を点に置き換えるときの色（件数バッジの色調に合わせる）。 */
const COUNT_DOT_CLASS = {
  danger: 'bg-red-600',
  info: 'bg-blue-600',
  accent: 'bg-[var(--sb-accent-bg)]',
  default: 'bg-[#C2560D]',
} as const;

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
  quickActionClassName,
  quickActionActiveClassName,
  dotClassName,
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
  /** 「＋」の通常時の色 class（既定は --sb-hover 地）。Seller: 'bg-black/5 text-[#231F1C] hover:bg-black/10'。 */
  quickActionClassName?: string;
  /** 「＋」の選択中の色 class（既定 sb-nav-round-active）。Seller: 'bg-[#FFE5D1] text-[#C2560D] hover:bg-[#FFE5D1]/80'。 */
  quickActionActiveClassName?: string;
  /** 要対応の点の色 class（既定 red-500。Smologi は 'bg-danger-solid'）。 */
  dotClassName?: string;
  onNavigate?: () => void;
}) {
  // レールでは、インライン展開グループ等の custom は出さず、親の行（href）だけを普通の行として出す。
  if (item.custom != null && !collapsed) return <>{item.custom}</>;
  // ---- 今後実装予定（リンクにしない）----
  if (item.comingSoon) {
    const soon = (
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
    return collapsed ? <SidebarRailTip text={`${item.label}（準備中）`}>{soon}</SidebarRailTip> : soon;
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
    const lockedNode = renderLocked ? (
      <>{renderLocked({ className, title: collapsed ? '' : title, children: body }, item)}</>
    ) : (
      <div className={`${className} cursor-not-allowed`} title={collapsed ? undefined : title} aria-disabled="true">
        {body}
      </div>
    );
    return collapsed ? <SidebarRailTip text={title}>{lockedNode}</SidebarRailTip> : lockedNode;
  }

  const isActive = isSidebarNavItemActive(item, pathname);
  const baseLabel = item.badge ? `${item.label} (${item.badge}版)` : item.label;
  const hasCount = typeof item.count === 'number' && item.count > 0;
  // 「＋」の角の件数（出品の要対応など）。レールでは「＋」ごと隠れるので、点と吹き出しで知らせる。
  const qaCount = item.quickActionCount && typeof item.quickActionCount.count === 'number' && item.quickActionCount.count > 0 ? item.quickActionCount : null;
  const title = item.dot && item.dotReason ? `${baseLabel}（${item.dotReason}）` : item.dim && !isActive ? `${baseLabel}（未設定）` : baseLabel;
  // レール表示中の吹き出し文言（件数があれば「倉庫連携（184）」）。native の title は二重になるので空にする。
  const railText = hasCount ? `${baseLabel}（${item.count}）` : qaCount ? `${baseLabel}（${qaCount.label} ${qaCount.count}件）` : title;
  // レール表示中は行の右端ごと隠れるので「＋」は出さない。
  const quickAction = !collapsed ? item.quickAction : undefined;
  const pillClass = 'sb-glass-surface-ringed whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none';

  const main = renderLink(
    {
      href: item.href,
      title: collapsed ? '' : title,
      'aria-label': collapsed ? railText : item.badge || (item.dot && item.dotReason) ? title : item.label,
      'aria-current': isActive ? 'page' : undefined,
      onClick: onNavigate,
      'data-tour': item.dataTour,
      className: `relative flex h-9 items-center rounded-md text-base transition-colors ${ROW_FOCUS} ${
        collapsed ? 'justify-center px-0' : quickAction ? 'gap-2.5 pl-3 pr-10' : 'gap-2.5 px-3'
      } ${isActive ? `${activeClassName} font-semibold` : 'hover:bg-[var(--sb-hover)]'} ${item.dim && !isActive ? 'opacity-55' : ''}`,
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
          {!collapsed && item.trailing}
          {/* 要対応の赤丸。置き場所は常に行の右端＝開閉で飛ばない（レールでは角）。 */}
          {(item.dot || (collapsed && (hasCount || qaCount))) && (
            <SidebarNewDot
              placement={collapsed ? 'corner' : 'inline'}
              label={collapsed ? null : item.dotReason ?? '新着あり'}
              muted={item.dotMuted}
              onAccent={false}
              colorClassName={item.dot ? dotClassName : COUNT_DOT_CLASS[item.countTone ?? 'default']}
            />
          )}
        </>
      ),
    },
    { kind: 'item', item },
  );

  const inner = (
    <>
      {main}
      {quickAction &&
        renderLink(
          {
            href: quickAction.href,
            title: quickAction.label,
            'aria-label': quickAction.label,
            className: `absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--sb-accent-bg)] ${
              isActive
                ? quickActionActiveClassName ?? 'sb-nav-round-active'
                : quickActionClassName ?? 'bg-[var(--sb-hover)] hover:shadow-[0_0_0_1px_var(--sb-label)]'
            }`,
            style: isActive || quickActionClassName ? undefined : { color: 'var(--sb-text)' },
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
    </>
  );
  return collapsed ? <SidebarRailTip text={railText}>{inner}</SidebarRailTip> : <div className="relative">{inner}</div>;
}

function CollapsibleSectionHeader({ label, open, dot, dotLabel, dotClassName, onToggle }: { label: string; open: boolean; dot: boolean; dotLabel?: string; dotClassName?: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="mt-3 mb-1 flex h-7 w-full items-center gap-2 rounded-md px-3 text-left text-[10px] font-semibold tracking-wider transition-colors hover:bg-[var(--sb-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-text)]"
      style={{ color: 'var(--sb-label)' }}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {/* 閉じていても中に要対応があると分かる赤丸（件数は出さない）。 */}
      {dot && <SidebarNewDot label={dotLabel ?? '中に要対応あり'} colorClassName={dotClassName} />}
      <svg className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

type NavRest = {
  pathname: string;
  collapsed?: boolean;
  activeClassName?: string;
  renderLink?: SidebarRenderLink;
  renderLocked?: SidebarRenderLocked;
  lockBadge?: string;
  quickActionClassName?: string;
  quickActionActiveClassName?: string;
  dotClassName?: string;
  onNavigate?: () => void;
};

function SidebarNavSectionBlock({
  section,
  index,
  gapClassName,
  firstGapClassName,
  decorate,
  ...rest
}: { section: SidebarNavSection; index: number; gapClassName?: string; firstGapClassName?: string; decorate?: (item: SidebarNavItem) => SidebarNavItem } & NavRest) {
  const items = decorate ? section.items.map(decorate) : section.items;
  const [expanded, setExpanded] = useState(section.defaultOpen ?? false);
  useEffect(() => {
    if (!section.collapsible || !section.storageKey) return;
    try {
      const v = window.localStorage.getItem(section.storageKey);
      if (v === '1' || v === '0') setExpanded(v === '1');
    } catch { /* ignore */ }
  }, [section.collapsible, section.storageKey]);
  const toggle = () => {
    setExpanded((prev) => {
      const next = !prev;
      if (section.storageKey) {
        try { window.localStorage.setItem(section.storageKey, next ? '1' : '0'); } catch { /* ignore */ }
      }
      return next;
    });
  };
  const sectionActive = items.some((item) => isSidebarNavItemActive(item, rest.pathname));
  // レール（collapsed）では見出しが無く開閉できないので、開閉できる区分も全部開く。
  const rail = !!rest.collapsed;
  const open = !section.collapsible || sectionActive || expanded || rail;
  const hasDot = items.some((item) => item.dot);
  const gap = rail ? '' : index === 0 ? firstGapClassName ?? 'pt-1' : gapClassName ?? (section.label ? '' : 'mt-4');
  const { onExpandedChange } = section;
  useEffect(() => { if (section.collapsible) onExpandedChange?.(expanded); }, [section.collapsible, expanded, onExpandedChange]);
  return (
    <div className={gap} data-tour={section.dataTour}>
      {/* レールでは見出しを隠し、区分の間に短い横線を1本入れる。 */}
      {rail && index > 0 && items.length > 0 && (
        <div className="mx-auto my-2 h-px w-6" style={{ backgroundColor: 'color-mix(in srgb, var(--sb-label) 35%, transparent)' }} aria-hidden="true" />
      )}
      {section.label && !rail && (
        section.collapsible
          ? <CollapsibleSectionHeader label={section.label} open={open} dot={hasDot} dotLabel={section.dotLabel} dotClassName={rest.dotClassName} onToggle={toggle} />
          : <SidebarNavSectionLabel label={section.label} badge={section.labelBadge} />
      )}
      {open && (
        <div className="space-y-0.5">
          {items.map((item, i) => (
            <SidebarNavLink key={`${item.href}#${i}`} item={item} {...rest} />
          ))}
        </div>
      )}
    </div>
  );
}

/** 区分ごとの見出し＋行の並び。decorate で行ごとにバッジ等を差し込める。 */
export function SidebarNavSections({
  sections,
  decorate,
  sectionGapClassName,
  firstSectionGapClassName,
  ...rest
}: {
  sections: readonly SidebarNavSection[];
  /** 2つ目以降の区分の上余白 class。既定は Smologi 流（見出しあり＝なし、見出しなし＝mt-4）。Seller は 'mt-4'。 */
  sectionGapClassName?: string;
  /** 最初の区分の上余白 class。既定 'pt-1'。Smologi は ''。 */
  firstSectionGapClassName?: string;
  decorate?: (item: SidebarNavItem) => SidebarNavItem;
} & NavRest) {
  return (
    <>
      {sections.map((section, index) => (
        <SidebarNavSectionBlock key={section.key} section={section} index={index} gapClassName={sectionGapClassName} firstGapClassName={firstSectionGapClassName} decorate={decorate} {...rest} />
      ))}
    </>
  );
}
