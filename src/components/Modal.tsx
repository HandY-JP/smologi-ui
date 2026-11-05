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

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
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
 *
 * - Escape はモーダルと同じスタックに積む＝モーダルの中のポップオーバーで Escape を押すと
 *   ポップオーバーだけが閉じる（下のモーダルまで一緒に閉じない）。
 * - mousedown は capture フェーズで拾う。モーダルのパネルは onMouseDown で伝播を止めている
 *   （背景クリック判定のため）ので、bubble で待つと中身の操作を取りこぼす環境がある。
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
    document.addEventListener('mousedown', onMouseDown, true);
    return () => document.removeEventListener('mousedown', onMouseDown, true);
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
  /** タイトルのすぐ右（同じ行）に並べる補足（枚数の要約など）。title がある場合だけ出る。 */
  headerAside?: ReactNode;
  /** title を出さないときのアクセシブル名。 */
  ariaLabel?: string;
  /** 重ね順。既定は base（z-[70]）。ドロワーの上に出すものだけ over（z-[90]）。 */
  layer?: ModalLayer;
  size?: ModalSize;
  /** Escape と背景クリックで閉じられるか。フォーム系は false にして誤操作の取りこぼしを防ぐ。 */
  dismissable?: boolean;
  /**
   * 背景クリックで閉じるか。既定は true（2026-09-23 ユーザー決定:
   * 「ポップアップの外を押したら閉じる」を共通部品の既定にする）。
   * dismissable が false のときは、この値に関わらず閉じない。
   * 入力途中の誤爆だけを防ぎたい（Escape と × は残す）フォームモーダル向けに false を渡す。
   */
  closeOnBackdrop?: boolean;
  /**
   * 入力途中かどうか。true のときは背景クリック・Escape で即座には閉じず、
   * フッター上に「入力内容が失われます。閉じますか」の確認バーを出す
   * （ConfirmDialog の入れ子は使わない）。既定 false＝従来どおり即閉じる。
   * 下書きが自動保存されるフォーム（localStorage 等）では渡さないこと。
   */
  dirty?: boolean;
  /**
   * ヘッダーを薄く（最小 44px・上下余白を詰める）する。既定 false＝従来の余白（py-4）。
   * 本文の表示領域を広げたい作業モーダル向け（スモロジ本体の既定の見た目）。
   */
  compactHeader?: boolean;
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
  /**
   * フッターの並べ方。既定は 'flex justify-end gap-2'（ボタンを右寄せ）。
   * 左に補足・右にボタン、のように中身で幅いっぱいに組むときは 'block' を渡す。
   */
  footerClassName?: string;
  /**
   * 狭い画面（sm 未満）で画面の下端に寄せて出す（ボトムシート風）。sm 以上は従来どおり中央。既定 false。
   */
  mobileSheet?: boolean;
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
  headerAside,
  ariaLabel,
  layer = 'base',
  size = 'md',
  dismissable = true,
  closeOnBackdrop,
  dirty = false,
  compactHeader = false,
  panelMaxHeightClassName = 'max-h-[85vh]',
  showCloseButton,
  role = 'dialog',
  bodyClassName = 'px-5 py-4',
  overlayClassName = '',
  panelClassName = '',
  footer,
  footerClassName,
  mobileSheet = false,
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
      headerAside={headerAside}
      ariaLabel={ariaLabel}
      layer={layer}
      size={size}
      dismissable={dismissable}
      closeOnBackdrop={closeOnBackdrop}
      dirty={dirty}
      compactHeader={compactHeader}
      panelMaxHeightClassName={panelMaxHeightClassName}
      showCloseButton={showCloseButton}
      role={role}
      bodyClassName={bodyClassName}
      overlayClassName={overlayClassName}
      panelClassName={panelClassName}
      footer={footer}
      footerClassName={footerClassName}
      mobileSheet={mobileSheet}
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
  headerAside,
  ariaLabel,
  layer,
  size,
  dismissable,
  closeOnBackdrop = true,
  dirty = false,
  compactHeader = false,
  panelMaxHeightClassName,
  showCloseButton,
  role,
  bodyClassName,
  overlayClassName,
  panelClassName,
  footer,
  footerClassName = 'flex justify-end gap-2',
  mobileSheet = false,
  onSubmit,
  children,
}: Omit<ModalProps, 'open'>) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | HTMLFormElement | null>(null);
  const closable = dismissable !== false;
  // 背景クリックの既定は true（2026-09-23 ユーザー決定）。dismissable=false のときは
  // closeOnBackdrop に関わらず閉じない。
  const backdropClosable = closeOnBackdrop && closable;
  const withCloseButton = showCloseButton ?? closable;

  // 入力途中（dirty）のときは、背景クリック・Escape で即座に onClose を呼ばず、
  // フッター上の確認バーを一度だけ挟む。× ボタン・footer 内の自前キャンセルは
  // 呼び出し側の onClose をそのまま使うので対象外（誤操作系の2経路だけを守る）。
  const [confirmDirtyClose, setConfirmDirtyClose] = useState(false);
  const requestClose = () => {
    if (dirty) { setConfirmDirtyClose(true); return; }
    onClose();
  };

  useEscapeDismiss(closable, requestClose);

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
    'flex w-full flex-col overflow-hidden rounded-xl bg-[rgb(var(--surface))] shadow-xl outline-none',
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
        <div className={compactHeader
          ? 'flex min-h-11 shrink-0 items-center gap-3 border-b border-[rgb(var(--line))] px-5 py-1.5'
          : 'flex items-start gap-3 border-b border-[rgb(var(--line))] px-5 py-4'}
        >
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-3">
              <h2 id={titleId} className={`shrink-0 text-[15px] font-semibold text-[rgb(var(--ink))] ${compactHeader ? 'leading-6' : 'leading-[22px]'}`}>{title}</h2>
              {headerAside != null && <div className="min-w-0 basis-full text-[14px] leading-[22px] text-[rgb(var(--ink-muted))] sm:basis-auto">{headerAside}</div>}
            </div>
            {subtitle != null && <div className={compactHeader ? 'text-[12px] leading-4 text-[rgb(var(--ink-muted))]' : 'mt-0.5 text-[12px] leading-[18px] text-[rgb(var(--ink-muted))]'}>{subtitle}</div>}
          </div>
          {headerRight != null && <div className={`flex shrink-0 items-center gap-2${compactHeader ? '' : ' self-center'}`}>{headerRight}</div>}
          {withCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="閉じる"
              className={`${compactHeader ? '-mr-2 inline-flex h-8 w-8 items-center justify-center' : '-mr-1 p-1'} rounded-md text-[22px] leading-none text-[rgb(var(--ink-muted))] transition-colors hover:bg-[rgb(var(--surface-subtle))] hover:text-[rgb(var(--ink))]`}
            >
              ×
            </button>
          )}
        </div>
      )}
      <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${bodyClassName ?? ''}`}>
        {children}
      </div>
      {confirmDirtyClose && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[rgb(var(--warning-ink)/0.25)] bg-[rgb(var(--warning-soft))] px-5 py-2.5">
          <span className="text-[12px] leading-[18px] font-medium text-[rgb(var(--warning-ink))]">入力内容が失われます。閉じますか</span>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[rgb(var(--warning-ink)/0.25)] bg-[rgb(var(--surface))] px-2.5 py-1 text-[12px] leading-[18px] font-semibold text-[rgb(var(--warning-ink))] transition-colors hover:bg-[rgb(var(--warning-soft))]"
            >
              閉じる
            </button>
            <button
              type="button"
              onClick={() => setConfirmDirtyClose(false)}
              className="rounded-md bg-[rgb(var(--warning-solid))] px-2.5 py-1 text-[12px] leading-[18px] font-semibold text-[rgb(var(--on-accent))] transition-colors hover:bg-[rgb(var(--warning-solid)/0.9)]"
            >
              続ける
            </button>
          </div>
        </div>
      )}
      {footer != null && (
        <div className={`shrink-0 border-t border-[rgb(var(--line))] px-5 py-3 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </>
  );

  const body = (
    <div
      className={`fixed inset-0 flex ${mobileSheet ? 'items-end sm:items-center' : 'items-center'} justify-center bg-black/40 p-4 ${LAYER_Z[layer ?? 'base']} ${overlayClassName}`}
      // 背景は全画面を覆ったまま、パネルだけ「本文領域（サイドバーの右）」の中央へ寄せる。
      // --app-content-left はサイドバーのあるレイアウトだけが配る（AppContentLeftVar）。
      // 画面が狭くてサイドバーぶんを引くとパネルが潰れる場合は、22rem を下回らない範囲までしかずらさない。
      style={{ paddingLeft: 'calc(1rem + min(var(--app-content-left, 0px), max(0px, 100vw - 22rem)))' }}
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget && backdropClosable) requestClose(); }}
    >
      {onSubmit
        ? <form {...panelProps} onSubmit={onSubmit}>{inner}</form>
        : <div {...panelProps}>{inner}</div>}
    </div>
  );

  return createPortal(body, document.body);
}
