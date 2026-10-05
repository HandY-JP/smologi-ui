'use client';

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

/** ランチャーの 1 項目。 */
export type AppLauncherItem = {
  id: string;
  name: string;
  description?: string;
  /** アイコン画像の URL。icon / renderIcon が無いときに 40px 角丸の <img> で出す。 */
  iconSrc?: string;
  /** アイコンそのもの（iconSrc より優先）。renderIcon が最優先。 */
  icon?: ReactNode;
  href: string;
  /** 現在地。リンクにせず「現在地」ラベル付きの淡い行で出す。 */
  current?: boolean;
  /** true で別タブ（target=_blank rel="noopener noreferrer"）＋ 右端に ↗。既定 true（smologi 本体と同じ）。 */
  external?: boolean;
};

const POPOVER_WIDTH = 340;
const POPOVER_GAP = 8;
const VIEWPORT_MARGIN = 8;

/** renderLink に渡す、リンク行へ付けるべき属性一式。 */
export type AppLauncherLinkProps = {
  href: string;
  target?: '_blank';
  rel?: string;
  onClick: () => void;
  className: string;
  children: ReactNode;
};

/**
 * アプリ一覧ポップオーバー（smologi の ContractedAppsPopover の枠だけを純 UI 化）。
 *
 * - document.body へポータルし、anchorRef のボタン位置から fixed（z-80、幅 340px）で右下に開く。
 *   画面外へはみ出さないようクランプ。リサイズ・スクロールで追従。
 * - Esc / ポップオーバー外・アンカー外のクリックで onClose。開いたら先頭のリンクへフォーカス、
 *   閉じたらアンカーへフォーカスを戻す。
 * - データ取得はしない。apps / loading / failed は呼び出し側が渡す。
 * - 色は gray（本文・補助）、bg-white（ダークは dark-compat.css が受ける）、--sb-accent-bg /
 *   --accent-subtle のみ。パレット意味名の Tailwind クラスは使わない。
 *   → 消費側は tokens/<app>.css ＋ styles.css（＋任意で dark-compat.css）を読み込んでいること。
 */
export function AppLauncherPopover({
  anchorRef,
  open,
  onClose,
  apps,
  loading = false,
  failed = false,
  header,
  renderIcon,
  renderNewDot,
  renderLink,
  loadingText = 'アプリを確認しています…',
  failedText = 'アプリ一覧を取得できませんでした。',
  currentLabel = '現在地',
  ariaLabel = '契約中のアプリ',
  id = 'smologi-app-switcher-popover',
  regionProps,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  apps: AppLauncherItem[];
  /** 取得中。true の間は loadingText を一覧の上に出す（apps が空でなくても出る＝呼び出し側で制御）。 */
  loading?: boolean;
  failed?: boolean;
  /** 先頭の見出し領域の中身（下に border-b が付く。px-5 py-4 の枠込み）。省略で見出し領域なし。 */
  header?: ReactNode;
  /** アイコンの差し替え。省略時は icon → iconSrc の順。 */
  renderIcon?: (app: AppLauncherItem) => ReactNode;
  /** アプリ名の右（ラベルの横）に出す付属物（未読ドットなど）。 */
  renderNewDot?: (app: AppLauncherItem) => ReactNode;
  /** リンク行の差し替え（next/link 等）。省略時は <a>。 */
  renderLink?: (app: AppLauncherItem, props: AppLauncherLinkProps) => ReactNode;
  loadingText?: string;
  failedText?: string;
  currentLabel?: string;
  ariaLabel?: string;
  id?: string;
  /** ルート <section> へ spread する属性（smologi の `sidebarPeekRegionProps` など）。 */
  regionProps?: HTMLAttributes<HTMLElement> & Record<`data-${string}`, string | undefined>;
}) {
  const popoverRef = useRef<HTMLElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  // ボタンの位置（下端・左端）を基準に、画面外へはみ出さないようクランプして配置する。
  // 閉じたら位置を捨てる（次回開いたときに古い座標で一瞬出るのを防ぐ）。
  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const maxLeft = window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN;
      setPosition({
        top: rect.bottom + POPOVER_GAP,
        left: Math.max(VIEWPORT_MARGIN, Math.min(rect.left, maxLeft)),
      });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, onClose, anchorRef]);

  // キーボードでの到達性。閉じたら開いたボタンへフォーカスを戻す。
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      return;
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      anchorRef.current?.focus();
    }
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open || !position) return;
    // position が付いた＝実際に描画されたタイミング。先頭のリンク（現在地の <div> は飛ばされる）へ。
    popoverRef.current?.querySelector<HTMLAnchorElement>('a[href]')?.focus();
  }, [open, position]);

  if (!open || !position || typeof document === 'undefined') return null;

  return createPortal(
    <section
      {...regionProps}
      ref={popoverRef}
      id={id}
      role="dialog"
      aria-label={ariaLabel}
      className="fixed z-[80] w-[340px] max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5"
      style={{ top: position.top, left: position.left }}
    >
      {header != null && <div className="border-b border-gray-200 px-5 py-4">{header}</div>}
      <div className="max-h-[calc(100vh-9rem)] overflow-y-auto p-2">
        {loading && <p className="px-3 py-5 text-sm text-gray-500">{loadingText}</p>}
        {failed && <p className="px-3 py-5 text-sm text-gray-500">{failedText}</p>}
        {apps.map((app) => {
          const icon = renderIcon
            ? renderIcon(app)
            : app.icon ?? (app.iconSrc
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={app.iconSrc} alt="" className="h-10 w-10 shrink-0 rounded-xl shadow-sm" />
              : null);
          const content = (
            <>
              {icon}
              <span className="min-w-0 flex-1">
                <span className="flex items-center text-sm font-semibold text-gray-800">
                  <span className="truncate">{app.name}</span>
                  {renderNewDot?.(app)}
                </span>
                {app.description && (
                  <span className="mt-0.5 block truncate text-xs text-gray-500">{app.description}</span>
                )}
              </span>
              {app.current ? (
                <span className="text-[10px] font-medium" style={{ color: 'var(--sb-accent-bg)' }}>{currentLabel}</span>
              ) : (app.external ?? true) ? (
                <span className="text-gray-500" aria-hidden="true">↗</span>
              ) : null}
            </>
          );
          if (app.current) {
            return (
              <div
                key={app.id}
                aria-current="page"
                className="flex items-center gap-3 rounded-xl px-3 py-3"
                style={{ backgroundColor: 'var(--accent-subtle)' }}
              >
                {content}
              </div>
            );
          }
          const external = app.external ?? true;
          const linkProps: AppLauncherLinkProps = {
            href: app.href,
            ...(external ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {}),
            onClick: onClose,
            className:
              'flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-[var(--accent-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--sb-accent-bg)]',
            children: content,
          };
          return renderLink
            ? <span key={app.id} className="contents">{renderLink(app, linkProps)}</span>
            : <a key={app.id} {...linkProps} />;
        })}
      </div>
    </section>,
    document.body,
  );
}
