'use client';

// 画面共通のモーダルシェル。オーバーレイ・パネル・ヘッダー・閉じる操作・スクロールロックを一箇所に集約する。
//
// 段階導入（フェーズ1）: まず小型モーダルから移行し、見た目は現状踏襲のまま「シェル部分だけ」を共通化する。
// 個々のモーダルは children（＋ footer）に中身を書くだけでよい。
//
// 重ね順は既存の z 体系に合わせて 2 段だけ用意する。
//   base = z-[70] … 通常のモーダル（ドロワー z-[80] より下）
//   over = z-[90] … ドロワー・パネルの上にさらに重ねる確認ダイアログ
// これ以上の段は作らないこと（増やすと「どれが上か」を誰も把握できなくなる）。

import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

export type ModalLayer = 'base' | 'over';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

const LAYER_Z: Record<ModalLayer, string> = {
  base: 'z-[70]',
  over: 'z-[90]',
};

const SIZE_MAX_W: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
  // 検索一覧など、表を載せる作業モーダル向けの幅。増やしすぎないこと。
  '2xl': 'max-w-3xl',
  '3xl': 'max-w-4xl',
  '4xl': 'max-w-5xl',
};

// ───────── 背景スクロールのロック（入れ子モーダルでも壊れないよう参照カウント） ─────────
let scrollLockCount = 0;
let scrollLockPrevious = '';

function lockBodyScroll(): () => void {
  if (scrollLockCount === 0) {
    scrollLockPrevious = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLockCount += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    scrollLockCount -= 1;
    if (scrollLockCount === 0) document.body.style.overflow = scrollLockPrevious;
  };
}

// ───────── Escape の宛先スタック（最前面のものだけが反応する） ─────────
// 既存実装に合わせて capture フェーズ＋stopPropagation。外側のドロワーへ Escape を伝えない。
const escapeStack: symbol[] = [];

function useEscapeDismiss(enabled: boolean, onDismiss: () => void): void {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => { onDismissRef.current = onDismiss; });

  useEffect(() => {
    if (!enabled) return;
    const token = Symbol('modal');
    escapeStack.push(token);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // 自分が最前面のときだけ閉じる（入れ子モーダルで下の層まで一緒に閉じないように）。
      if (escapeStack[escapeStack.length - 1] !== token) return;
      event.stopPropagation();
      onDismissRef.current();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      const index = escapeStack.indexOf(token);
      if (index >= 0) escapeStack.splice(index, 1);
    };
  }, [enabled]);
}

/**
 * 外側クリック（mousedown）と Escape で閉じる共通フック。
 * ポップオーバー・ドロップダウンなど、モーダルシェルを使わない要素向け。
 * ref には「内側」とみなす要素を渡す（トリガーボタンも内側にしたい場合は ignore に渡す）。
 */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  onDismiss: () => void,
  { enabled = true, ignore }: { enabled?: boolean; ignore?: RefObject<HTMLElement | null> } = {},
): void {
  useEscapeDismiss(enabled, onDismiss);

  const onDismissRef = useRef(onDismiss);
  useEffect(() => { onDismissRef.current = onDismiss; });

  useEffect(() => {
    if (!enabled) return;
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (ref.current?.contains(target)) return;
      if (ignore?.current?.contains(target)) return;
      onDismissRef.current();
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [enabled, ref, ignore]);
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** ヘッダーの見出し。省略するとヘッダー自体を出さない（確認ダイアログなど中身で見出しを作る場合）。 */
  title?: ReactNode;
  /** 見出しの下に添える小さな説明（商品名・仕入先名など）。 */
  subtitle?: ReactNode;
  /**
   * ヘッダーの右（× の手前）へ並べる操作。
   * 作業モーダルで「この作業の対象」を選ばせる小さなセレクタ（入荷作成のお客様など）を、
   * 本文の先頭ではなくヘッダーに置きたいときに使う。title がある場合だけ出る。
   */
  headerRight?: ReactNode;
  /** title を出さないときのアクセシブル名。 */
  ariaLabel?: string;
  /** 重ね順。既定は base（z-[70]）。ドロワーの上に出すものだけ over（z-[90]）。 */
  layer?: ModalLayer;
  size?: ModalSize;
  /** Escape と背景クリックで閉じられるか。フォーム系は false にして誤操作の取りこぼしを防ぐ。 */
  dismissable?: boolean;
  /**
   * 背景クリックで閉じるか。既定は dismissable と同じ。
   * 入力途中の誤爆だけを防ぎたい（Escape と × は残す）フォームモーダル向けに false を渡す。
   */
  closeOnBackdrop?: boolean;
  /**
   * パネルの高さ上限。既定は max-h-[85vh]。
   * 縦の短いノートPCで本文を目一杯使いたいモーダルだけ dvh 指定に差し替える。
   */
  panelMaxHeightClassName?: string;
  /** ヘッダーの × を出すか。既定は dismissable と同じ。 */
  showCloseButton?: boolean;
  role?: 'dialog' | 'alertdialog';
  /** 本文の余白などを差し替えたいとき。既定は px-5 py-4。 */
  bodyClassName?: string;
  overlayClassName?: string;
  panelClassName?: string;
  /** 下部に固定するボタン列。渡すと区切り線付きのフッターになる。 */
  footer?: ReactNode;
  /** 渡すとパネルが <form> になる（Enter 送信を効かせたいフォームモーダル向け）。 */
  onSubmit?: (event: React.FormEvent) => void;
  children?: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  headerRight,
  ariaLabel,
  layer = 'base',
  size = 'md',
  dismissable = true,
  closeOnBackdrop,
  panelMaxHeightClassName = 'max-h-[85vh]',
  showCloseButton,
  role = 'dialog',
  bodyClassName = 'px-5 py-4',
  overlayClassName = '',
  panelClassName = '',
  footer,
  onSubmit,
  children,
}: ModalProps) {
  if (!open) return null;
  return (
    <ModalBody
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      headerRight={headerRight}
      ariaLabel={ariaLabel}
      layer={layer}
      size={size}
      dismissable={dismissable}
      closeOnBackdrop={closeOnBackdrop}
      panelMaxHeightClassName={panelMaxHeightClassName}
      showCloseButton={showCloseButton}
      role={role}
      bodyClassName={bodyClassName}
      overlayClassName={overlayClassName}
      panelClassName={panelClassName}
      footer={footer}
      onSubmit={onSubmit}
    >
      {children}
    </ModalBody>
  );
}

function ModalBody({
  onClose,
  title,
  subtitle,
  headerRight,
  ariaLabel,
  layer,
  size,
  dismissable,
  closeOnBackdrop,
  panelMaxHeightClassName,
  showCloseButton,
  role,
  bodyClassName,
  overlayClassName,
  panelClassName,
  footer,
  onSubmit,
  children,
}: Omit<ModalProps, 'open'>) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | HTMLFormElement | null>(null);
  const closable = dismissable !== false;
  const backdropClosable = (closeOnBackdrop ?? closable) && closable;
  const withCloseButton = showCloseButton ?? closable;

  useEscapeDismiss(closable, onClose);

  useEffect(() => lockBodyScroll(), []);

  // 開いた瞬間のフォーカス移動と、閉じたときの復帰。
  // 中身が autoFocus を持つ場合（既にパネル内へフォーカスが来ている場合）は横取りしない。
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const preferred = panel?.querySelector<HTMLElement>('[data-autofocus]');
    // preventScroll: フォーカス移動のついでに本文がスクロールしてしまうと、
    // 先頭の見出し（入荷作成の「お客様」など）がヘッダーの裏に隠れた状態で開いてしまう。
    if (preferred) {
      preferred.focus({ preventScroll: true });
    } else if (panel && !panel.contains(document.activeElement)) {
      panel.focus({ preventScroll: true });
    }
    return () => { previouslyFocused?.focus?.(); };
  }, []);

  const panelClass = [
    'flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-xl outline-none',
    panelMaxHeightClassName ?? 'max-h-[85vh]',
    SIZE_MAX_W[size ?? 'md'],
    panelClassName,
  ].filter(Boolean).join(' ');

  const panelProps = {
    ref: panelRef as never,
    role,
    'aria-modal': true,
    ...(title ? { 'aria-labelledby': titleId } : { 'aria-label': ariaLabel }),
    tabIndex: -1,
    className: panelClass,
    onMouseDown: (event: React.MouseEvent) => event.stopPropagation(),
  };

  const inner = (
    <>
      {title != null && (
        <div className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-bold text-gray-900">{title}</h2>
            {subtitle != null && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
          </div>
          {headerRight != null && <div className="flex shrink-0 items-center gap-2 self-center">{headerRight}</div>}
          {withCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="閉じる"
              className="-mr-1 rounded-md p-1 text-xl leading-none text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      )}
      <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${bodyClassName ?? ''}`}>
        {children}
      </div>
      {footer != null && (
        <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 px-5 py-3">
          {footer}
        </div>
      )}
    </>
  );

  const body = (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/40 p-4 ${LAYER_Z[layer ?? 'base']} ${overlayClassName}`}
      // 背景は全画面を覆ったまま、パネルだけ「本文領域（サイドバーの右）」の中央へ寄せる。
      // --app-content-left はサイドバーのあるレイアウトだけが配る（AppContentLeftVar）。
      // 画面が狭くてサイドバーぶんを引くとパネルが潰れる場合は、22rem を下回らない範囲までしかずらさない。
      style={{ paddingLeft: 'calc(1rem + min(var(--app-content-left, 0px), max(0px, 100vw - 22rem)))' }}
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget && backdropClosable) onClose(); }}
    >
      {onSubmit
        ? <form {...panelProps} onSubmit={onSubmit}>{inner}</form>
        : <div {...panelProps}>{inner}</div>}
    </div>
  );

  return createPortal(body, document.body);
}
