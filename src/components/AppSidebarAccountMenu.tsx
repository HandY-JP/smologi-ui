'use client';
// サイドバー下部のプロフィールメニュー（Seller の SellerSidebarAccountMenu を純 UI 化したもの）。
// セッション・サインアウト・テーマ切替はアプリ側（user / items / extra / onSignOut で受ける）。
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SidebarAccountAvatar } from './SidebarAccountRow';
import type { SidebarRenderLink } from './SidebarNav';
import { useSidebarPeekHold } from './useSidebarPeekHold';

export const SIDEBAR_MENU_ICONS = {
  settings: (
    <svg className="h-[18px] w-[18px] text-[var(--sb-label)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317a1.724 1.724 0 013.35 0 1.724 1.724 0 002.573 1.066 1.724 1.724 0 012.37 2.37 1.724 1.724 0 001.065 2.572 1.724 1.724 0 010 3.35 1.724 1.724 0 00-1.066 2.573 1.724 1.724 0 01-2.37 2.37 1.724 1.724 0 00-2.572 1.065 1.724 1.724 0 01-3.35 0 1.724 1.724 0 00-2.573-1.066 1.724 1.724 0 01-2.37-2.37 1.724 1.724 0 00-1.065-2.572 1.724 1.724 0 010-3.35 1.724 1.724 0 001.066-2.573 1.724 1.724 0 012.37-2.37 1.724 1.724 0 002.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  help: (
    <svg className="h-[18px] w-[18px] text-[var(--sb-label)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519a3 3 0 115.242 2.532c-.966.966-1.5 1.29-1.5 2.949M12 17.5h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
    </svg>
  ),
  logout: (
    <svg className="h-[18px] w-[18px] text-[var(--sb-label)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

export interface AppSidebarAccountMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  /** href があればリンク、無ければ onSelect のボタン。 */
  href?: string;
  onSelect?: () => void;
}

const ITEM_CLASS =
  'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-[var(--sb-text)] transition-colors hover:bg-[var(--sb-hover)]';

export function AppSidebarAccountMenu({
  name,
  email,
  image,
  items,
  extra,
  signOut,
  renderLink,
  buttonTitle,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  /** 設定・ヘルプなど（メニュー中段）。 */
  items: AppSidebarAccountMenuItem[];
  /** 項目の上に差し込むもの（ダークモード切替など。クリックしてもメニューは閉じない）。 */
  extra?: ReactNode;
  /** ログアウト（メニュー最下段）。 */
  signOut?: { label?: string; onSelect: () => void };
  renderLink?: SidebarRenderLink;
  buttonTitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  // ピーク中にこのメニューを開いたら、開いている間はサイドバーを閉じさせない。
  useSidebarPeekHold(open);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const display = name ?? email ?? 'ユーザー';
  const avatar = <SidebarAccountAvatar src={image} name={(name ?? email ?? '?').toUpperCase()} />;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={buttonTitle ?? name ?? 'アカウント'}
        className="flex h-9 w-full items-center gap-2 rounded-md px-2 transition-colors hover:bg-[var(--sb-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--sb-text)]"
        style={{ color: 'var(--sb-text)' }}
      >
        {avatar}
        <span className="min-w-0 flex-1 truncate text-left text-base">{display}</span>
        <svg className="h-3.5 w-3.5 flex-shrink-0 text-[var(--sb-label)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 15l4-4 4 4M8 9l4-4 4 4" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-2 right-2 z-30 mb-1 overflow-hidden rounded-md border shadow-lg"
          style={{ backgroundColor: 'var(--sb-glass-bg-opaque, #fff)', borderColor: 'var(--sb-border, #e5e7eb)', color: 'var(--sb-text)' }}
        >
          <div className="flex items-center gap-3 px-3 py-3">
            {avatar}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold" style={{ color: 'var(--sb-heading, var(--sb-text))' }}>{display}</p>
              {email && <p className="truncate text-xs" style={{ color: 'var(--sb-label)' }}>{email}</p>}
            </div>
          </div>
          <div className="border-t py-1" style={{ borderColor: 'var(--sb-hover)' }}>
            {extra}
            {items.map((item) => {
              const body = (<>{item.icon}{item.label}</>);
              if (item.href) {
                const linkProps = {
                  href: item.href,
                  title: item.label,
                  onClick: () => { setOpen(false); item.onSelect?.(); },
                  className: ITEM_CLASS,
                  children: body,
                };
                return renderLink ? (
                  <div key={item.key} role="menuitem">{renderLink(linkProps, { kind: 'item', item: { href: item.href, label: item.label, icon: item.icon } })}</div>
                ) : (
                  <a key={item.key} role="menuitem" {...linkProps} />
                );
              }
              return (
                <button key={item.key} type="button" role="menuitem" onClick={() => { setOpen(false); item.onSelect?.(); }} className={ITEM_CLASS}>
                  {body}
                </button>
              );
            })}
          </div>
          {signOut && (
            <div className="border-t py-1" style={{ borderColor: 'var(--sb-hover)' }}>
              <button type="button" role="menuitem" onClick={signOut.onSelect} className={ITEM_CLASS}>
                {SIDEBAR_MENU_ICONS.logout}
                {signOut.label ?? 'ログアウト'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
