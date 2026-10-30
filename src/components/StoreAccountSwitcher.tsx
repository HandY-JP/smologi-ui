'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';

/** 一覧の 1 項目。`href` があればリンク、無ければボタン（押したら `onSelect`）。 */
export type StoreAccountSwitcherItem = {
  id: string;
  label: string;
  /** ラベル下の小さな補足（例: 所有する会社名）。 */
  sub?: string;
  /** 今の表示先。選択色＋「今の画面」の印を出す。 */
  checked?: boolean;
  disabled?: boolean;
  /** 右端の小さな印（例: 「未連携」）。 */
  badge?: string;
  href?: string;
  onSelect?: () => void;
};

export type StoreAccountSwitcherGroup = {
  id: string;
  /** グループ見出し（例: 「Amazon」「楽天市場」）。省略時は見出しなし。 */
  heading?: string;
  items: StoreAccountSwitcherItem[];
};

export type StoreAccountSwitcherState = 'ready' | 'loading' | 'error' | 'empty';

/** `renderLink` に渡る引数。Next の Link などにそのまま展開できる。 */
export type StoreAccountSwitcherLinkProps = {
  href: string;
  className?: string;
  style?: CSSProperties;
  role?: string;
  title?: string;
  'aria-current'?: 'page';
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
};

export type StoreAccountSwitcherProps = {
  /** 閉じた状態の欄に出す現在の表示名（例: 「HandY 本店」）。 */
  currentLabel: string;
  groups: StoreAccountSwitcherGroup[];
  /** 一覧の末尾（例: 「＋ アカウントを追加」「別の会社で入り直す」）。 */
  footerItems?: StoreAccountSwitcherItem[];
  /** 既定 'ready'。ready 以外のときは一覧の代わりに下の文言を出す。 */
  state?: StoreAccountSwitcherState;
  loadingText?: string;
  errorText?: string;
  emptyText?: string;
  /**
   * 指定すると欄全体がこの href のリンクになり、開閉しない（未登録時）。
   * Seller の「Amazonアカウントを連携」と同じ橙の見た目。補足文は `emptyHint`。
   */
  emptyHref?: string;
  emptyHint?: string;
  /** Next の Link などを渡す。省略時は <a>。 */
  renderLink?: (props: StoreAccountSwitcherLinkProps) => ReactNode;
  /** 開閉が変わったとき（サイドバーのピーク保持用）。 */
  onOpenChange?: (open: boolean) => void;
  /** 初期状態を開いた状態にする（テスト・見本用）。 */
  defaultOpen?: boolean;
  ariaLabel?: string;
  className?: string;
};

const FIELD_BASE =
  'group flex h-10 w-full items-center gap-2 rounded-md px-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--sb-text)]';

const ROW_BASE =
  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--sb-popover-current-bg,var(--accent-subtle))] focus-visible:bg-[var(--sb-popover-current-bg,var(--accent-subtle))] focus-visible:outline-none disabled:cursor-default disabled:opacity-50';

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
      style={{ color: 'var(--sb-label)' }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/**
 * ストアとアカウントの切り替え（サイドバー用。見た目と開閉だけ。取得・保存・遷移は利用側）。
 *
 * - 閉じた状態: サイドバー幅いっぱい・高さ h-10 の 1 行に「現在の表示名 ▼」（ロゴ・頭文字なし）。
 * - 開いた状態: 直下にグループ見出し付きの一覧＋末尾のフッター項目。checked は選択色＋「今の画面」。
 * - 外側クリック・Esc で閉じる（Esc は欄にフォーカスを戻す）。項目を選ぶと閉じる。
 * - 色は --sb-* / --sb-popover-* / --accent-* のみ。--sb-popover-bg が無ければ --sb-bg に落ちる
 *   （--sb-heading は暗色テーマで白地に白文字になるため使わない。WorkspaceSwitch 参照）。
 *   emptyHref の橙だけは Tailwind の orange（Seller の現行どおり）。
 *
 * 余白は呼び出し側が className（例: `mx-3 w-[calc(100%-1.5rem)]`）で決める。既定は親幅いっぱい。
 */
export function StoreAccountSwitcher({
  currentLabel,
  groups,
  footerItems,
  state = 'ready',
  loadingText = '読み込み中…',
  errorText = '一覧を取得できませんでした',
  emptyText = '登録がありません',
  emptyHref,
  emptyHint,
  renderLink,
  onOpenChange,
  defaultOpen = false,
  ariaLabel = 'ストアとアカウントの切り替え',
  className,
}: StoreAccountSwitcherProps) {
  const [open, setOpenState] = useState(defaultOpen);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const menuId = useId();

  const openRef = useRef(defaultOpen);
  const setOpen = useCallback((next: boolean) => {
    if (openRef.current === next) return;
    openRef.current = next;
    setOpenState(next);
    onOpenChangeRef.current?.(next);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, setOpen]);

  const link = (props: StoreAccountSwitcherLinkProps): ReactNode =>
    renderLink ? renderLink(props) : (
      <a href={props.href} className={props.className} style={props.style} role={props.role} title={props.title} aria-current={props['aria-current']} onClick={props.onClick}>
        {props.children}
      </a>
    );

  // 未登録: 欄自体を橙のリンクにする（開かない）。
  if (emptyHref) {
    return (
      <div className={className}>
        {link({
          href: emptyHref,
          title: currentLabel,
          className: `${FIELD_BASE} border border-orange-200 bg-orange-50 hover:bg-orange-100`,
          children: (
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-orange-800">{currentLabel}</span>
          ),
        })}
        {emptyHint && (
          <p className="mt-1.5 px-0.5 text-[11px] leading-relaxed" style={{ color: 'var(--sb-label)' }}>
            {emptyHint}
          </p>
        )}
      </div>
    );
  }

  const renderItem = (item: StoreAccountSwitcherItem) => {
    const body = (
      <>
        <span className="min-w-0 flex-1">
          <span className="block truncate" style={item.checked ? { color: 'var(--sb-popover-current-ink, var(--sb-accent-bg))', fontWeight: 600 } : undefined}>
            {item.label}
          </span>
          {item.sub && (
            <span className="block truncate text-[11px]" style={{ color: 'var(--sb-popover-muted, var(--sb-label))' }}>
              {item.sub}
            </span>
          )}
        </span>
        {item.badge && (
          <span
            className="flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none"
            style={{ backgroundColor: 'var(--sb-hover)', color: 'var(--sb-popover-muted, var(--sb-label))' }}
          >
            {item.badge}
          </span>
        )}
        {item.checked && (
          <span
            className="flex-shrink-0 text-xs font-semibold"
            style={{ color: 'var(--sb-popover-current-ink, var(--sb-accent-bg))' }}
          >
            <span aria-hidden="true">✓ </span>今の画面
          </span>
        )}
      </>
    );
    const rowStyle: CSSProperties = {
      color: 'var(--sb-popover-ink, var(--sb-text))',
      ...(item.checked ? { backgroundColor: 'var(--sb-popover-current-bg, var(--accent-subtle))' } : null),
    };
    if (item.href && !item.disabled) {
      return link({
        href: item.href,
        role: 'menuitem',
        className: ROW_BASE,
        style: rowStyle,
        'aria-current': item.checked ? 'page' : undefined,
        onClick: () => {
          item.onSelect?.();
          setOpen(false);
        },
        children: body,
      });
    }
    return (
      <button
        type="button"
        role="menuitem"
        disabled={item.disabled}
        aria-current={item.checked ? 'true' : undefined}
        className={ROW_BASE}
        style={rowStyle}
        onClick={() => {
          item.onSelect?.();
          setOpen(false);
        }}
      >
        {body}
      </button>
    );
  };

  const statusText = state === 'loading' ? loadingText : state === 'error' ? errorText : state === 'empty' ? emptyText : null;
  const lineStyle: CSSProperties = { borderColor: 'var(--sb-popover-line, var(--sb-border))' };
  // 閉じた欄（ボタン）だけの見た目。アプリ側が次の変数を定義したときだけ変わる（未定義なら従来どおり）。
  //   --sb-field-bg    : 欄の地色（既定は透明＝サイドバーの地色のまま）
  //   --sb-field-line  : 欄の枠線の色（既定は --sb-popover-line → --sb-border）
  //   --sb-field-hover : ホバー時の地色（既定は --sb-hover）
  const fieldStyle: CSSProperties = {
    backgroundColor: 'var(--sb-field-bg, transparent)',
    borderColor: 'var(--sb-field-line, var(--sb-popover-line, var(--sb-border)))',
  };

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${ariaLabel}（現在: ${currentLabel}）`}
        title={ariaLabel}
        className={`${FIELD_BASE} border hover:bg-[var(--sb-field-hover,var(--sb-hover))]`}
        style={{ ...fieldStyle, color: 'var(--sb-text)' }}
      >
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{currentLabel}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[70vh] overflow-y-auto rounded-md border py-1 shadow-lg"
          style={{ ...lineStyle, backgroundColor: 'var(--sb-popover-bg, var(--sb-bg))' }}
        >
          {statusText ? (
            <div
              role="status"
              className="px-3 py-2 text-xs"
              style={{ color: 'var(--sb-popover-muted, var(--sb-label))' }}
            >
              {statusText}
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.id} role="group" aria-label={group.heading}>
                {group.heading && (
                  <div
                    className="px-3 pb-0.5 pt-2 text-[11px] font-semibold"
                    style={{ color: 'var(--sb-popover-muted, var(--sb-label))' }}
                  >
                    {group.heading}
                  </div>
                )}
                {group.items.map((item) => (
                  <div key={item.id}>{renderItem(item)}</div>
                ))}
              </div>
            ))
          )}
          {footerItems && footerItems.length > 0 && (
            <div className="mt-1 border-t pt-1" style={lineStyle}>
              {footerItems.map((item) => (
                <div key={item.id}>{renderItem(item)}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
