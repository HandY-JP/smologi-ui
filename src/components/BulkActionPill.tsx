'use client';

import { ReactNode, useEffect, useId, useRef, useState } from 'react';

/**
 * 画面下中央の一括操作ピル（反転ガラス）の共通部品。
 *
 * 決定（2026-09-22 ユーザー）:
 *  - 道具バー＝選択不要の操作／一括操作ピル＝選択した行への操作（2026-09-15 決定の再確認）。
 *  - ピルの並びは「次にやること」順。主操作だけアクセント塗り、ほかはゴースト。
 *  - 左に「いま何を選んでいて、何が残っているか」（N件選択・CSV未出力 n …）を出す。
 *  - 押せない操作は消さずに disabled ＋ 理由のツールチップで示す。
 *
 * レイアウトは「左: 状態テキスト＋すべて選択 ／ 中: 主操作 ／ 右: 副操作＋選択解除」。
 * 反転ガラス（.sb-bulk-bar / .sb-bulk-btn / .sb-bulk-primary。globals.css）は据え置きで、
 * 出荷・入荷・返品・振替のどの一覧でも同じ流儀で載せ替えられるようにしてある
 * （今回の載せ替えは出荷のみ。入荷・返品・振替は別PR）。
 */

/** ピル左側に出す「選択の中身」。count が 0 の行は呼び出し側で落としてよい（ここでは出す）。 */
export type BulkPillStat = {
  key: string;
  label: string;
  count: number;
  /** 「残っている作業」は少し強めに出す（未出力・未入力・未ピッキング等）。 */
  tone?: 'plain' | 'warn';
  title?: string;
};

export type BulkPillMenuItem = {
  key: string;
  label: string;
  description?: string;
  onClick: () => void;
  disabled?: boolean;
  /** disabled のときにツールチップで出す理由。 */
  disabledReason?: string;
  /** 右端に出す件数（省略可）。 */
  count?: number;
  separatorBefore?: boolean;
};

export type BulkPillAction = {
  key: string;
  label: string;
  /** 押したときの実処理。menuItems だけ渡した場合は省略可（＝メニューを開くボタンになる）。 */
  onClick?: () => void;
  busy?: boolean;
  /** busy のときのラベル（例: 「確定処理中…」）。 */
  busyLabel?: string;
  disabled?: boolean;
  /** disabled のときにツールチップで出す理由（「送り状番号が未入力の出荷があります」等）。 */
  disabledReason?: string;
  title?: string;
  /** ▾ で開くメニュー。onClick と両方あるとスプリットボタンになる。 */
  menuItems?: BulkPillMenuItem[];
  menuAriaLabel?: string;
  /** 主操作だけ 'primary'（アクセント塗り）。既定はゴースト。 */
  tone?: 'primary' | 'ghost' | 'danger';
  /** 既存の独自ポップオーバー部品（出荷グループ選択など）をそのまま置く口。 */
  render?: ReactNode;
};

const MENU_CLASS = 'absolute bottom-full z-[60] mb-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 text-left shadow-xl';
const MENU_ITEM_CLASS = 'flex w-full items-start justify-between gap-4 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--sb-accent-bg)] disabled:cursor-not-allowed disabled:opacity-40';

function actionClass(tone: BulkPillAction['tone']): string {
  if (tone === 'primary') return 'sb-bulk-primary';
  if (tone === 'danger') return 'sb-bulk-btn danger';
  return 'sb-bulk-btn';
}

/** disabled なボタンは title が出ないブラウザがあるため、理由がある時だけ span で包む。 */
function WithReason({ reason, children }: { reason?: string; children: ReactNode }) {
  if (!reason) return <>{children}</>;
  return <span title={reason} className="inline-flex">{children}</span>;
}

function BulkPillActionButton({
  action, openMenuKey, onToggleMenu, onCloseMenu, menuAlign,
}: {
  action: BulkPillAction;
  openMenuKey: string | null;
  onToggleMenu: (key: string) => void;
  onCloseMenu: () => void;
  menuAlign: 'left' | 'right';
}) {
  const menuId = useId();
  if (action.render) return <>{action.render}</>;

  const hasMenu = !!action.menuItems && action.menuItems.length > 0;
  const open = hasMenu && openMenuKey === action.key;
  const label = action.busy ? (action.busyLabel ?? action.label) : action.label;
  const disabled = !!action.disabled || !!action.busy;
  const buttonClass = actionClass(action.tone);
  const run = (fn: () => void) => { onCloseMenu(); fn(); };

  const menu = open && action.menuItems ? (
    <div
      id={menuId}
      className={`${MENU_CLASS} ${menuAlign === 'right' ? 'right-0' : 'left-0'}`}
      role="group"
      aria-label={action.menuAriaLabel ?? action.label}
    >
      {action.menuItems.map((item) => (
        <div key={item.key}>
          {item.separatorBefore && <div className="my-1 border-t border-gray-100" role="separator" />}
          <WithReason reason={item.disabled ? item.disabledReason : undefined}>
            <button
              type="button"
              disabled={item.disabled}
              title={item.disabled ? item.disabledReason : undefined}
              onClick={() => run(item.onClick)}
              className={MENU_ITEM_CLASS}
            >
              <span className="min-w-0">
                <span className="block truncate">{item.label}</span>
                {item.description && (
                  <span className="mt-0.5 block truncate text-[11px] font-normal text-gray-400">{item.description}</span>
                )}
              </span>
              {typeof item.count === 'number' && (
                <span className="shrink-0 text-xs tabular-nums text-gray-400">{item.count.toLocaleString()}件</span>
              )}
            </button>
          </WithReason>
        </div>
      ))}
    </div>
  ) : null;

  // メニューだけ（実処理を持たない）ボタン。
  if (hasMenu && !action.onClick) {
    return (
      <div className="relative">
        <WithReason reason={disabled ? action.disabledReason : undefined}>
          <button
            type="button"
            disabled={disabled}
            title={action.disabled ? action.disabledReason : action.title}
            aria-expanded={open}
            aria-haspopup="true"
            onClick={() => onToggleMenu(action.key)}
            className={`${buttonClass} inline-flex items-center gap-1.5`}
          >
            {action.busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" aria-hidden="true" />}
            {label}
            <span className="text-[10px] opacity-70" aria-hidden="true">▾</span>
          </button>
        </WithReason>
        {menu}
      </div>
    );
  }

  // スプリットボタン（実処理＋▾）。
  if (hasMenu && action.onClick) {
    return (
      <div className="relative">
        <span className="inline-flex items-stretch">
          <WithReason reason={disabled ? action.disabledReason : undefined}>
            <button
              type="button"
              disabled={disabled}
              title={action.disabled ? action.disabledReason : action.title}
              onClick={() => run(action.onClick!)}
              className={`${buttonClass} sb-bulk-split-main inline-flex items-center gap-1.5`}
            >
              {action.busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" aria-hidden="true" />}
              {label}
            </button>
          </WithReason>
          <button
            type="button"
            disabled={!!action.busy}
            aria-label={`${action.label}の種類を選ぶ`}
            aria-expanded={open}
            aria-haspopup="true"
            onClick={() => onToggleMenu(action.key)}
            className={`${buttonClass} sb-bulk-split-caret`}
          >
            <span className="text-[10px] opacity-80" aria-hidden="true">▾</span>
          </button>
        </span>
        {menu}
      </div>
    );
  }

  return (
    <WithReason reason={disabled ? action.disabledReason : undefined}>
      <button
        type="button"
        disabled={disabled}
        title={action.disabled ? action.disabledReason : action.title}
        onClick={action.onClick}
        className={`${buttonClass} inline-flex items-center gap-1.5`}
      >
        {action.busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" aria-hidden="true" />}
        {label}
      </button>
    </WithReason>
  );
}

export function BulkActionPill({
  ariaLabel, dataTour, selectedCount, selectedLabel = '件選択', stats = [],
  leading, primary = [], secondary = [], onClear, clearLabel = '選択解除', error,
}: {
  ariaLabel: string;
  dataTour?: string;
  selectedCount: number;
  selectedLabel?: string;
  /** 「CSV未出力 3」など、選んだ行の残作業。 */
  stats?: BulkPillStat[];
  /** 状態テキストの直後（例: 「すべて選択（N件）」）。 */
  leading?: ReactNode;
  /** 次にやること（アクセント塗りは先頭の tone: 'primary' だけにする）。 */
  primary?: BulkPillAction[];
  /** 戻す・差し戻すなどの副操作。 */
  secondary?: BulkPillAction[];
  onClear?: () => void;
  clearLabel?: string;
  /** 実行に失敗したときの理由（ピルの下に出す）。 */
  error?: ReactNode;
}) {
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenuKey) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(event.target as Node)) setOpenMenuKey(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.isComposing) return;
      if (event.key === 'Escape') setOpenMenuKey(null);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [openMenuKey]);

  const toggleMenu = (key: string) => setOpenMenuKey((current) => (current === key ? null : key));
  const closeMenu = () => setOpenMenuKey(null);

  return (
    <div ref={pillRef} className="sb-bulk-layer">
      <div
        role="group"
        aria-label={ariaLabel}
        data-tour={dataTour}
        className="sb-bulk-bar flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full px-5 py-2.5"
      >
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 whitespace-nowrap text-sm">
          <span className="font-semibold tabular-nums">{selectedCount.toLocaleString()}{selectedLabel}</span>
          {stats.map((stat) => (
            <span key={stat.key} className="inline-flex items-center gap-1" title={stat.title}>
              <span className="sb-bulk-stat-sep" aria-hidden="true">・</span>
              <span className={stat.tone === 'warn' ? 'sb-bulk-stat warn' : 'sb-bulk-stat'}>
                {stat.label} <span className="tabular-nums">{stat.count.toLocaleString()}</span>
              </span>
            </span>
          ))}
        </span>
        {leading}
        {primary.length > 0 && (
          <span className="flex flex-wrap items-center gap-2">
            {primary.map((action) => (
              <BulkPillActionButton
                key={action.key}
                action={action}
                openMenuKey={openMenuKey}
                onToggleMenu={toggleMenu}
                onCloseMenu={closeMenu}
                menuAlign="left"
              />
            ))}
          </span>
        )}
        {secondary.length > 0 && (
          <span className="flex flex-wrap items-center gap-2">
            {secondary.map((action) => (
              <BulkPillActionButton
                key={action.key}
                action={action}
                openMenuKey={openMenuKey}
                onToggleMenu={toggleMenu}
                onCloseMenu={closeMenu}
                menuAlign="right"
              />
            ))}
          </span>
        )}
        {onClear && (
          <button type="button" onClick={() => { closeMenu(); onClear(); }} className="sb-bulk-clear">
            {clearLabel}
          </button>
        )}
      </div>
      {error && (
        <p className="max-w-[min(48rem,100%)] rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 shadow-lg" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default BulkActionPill;
