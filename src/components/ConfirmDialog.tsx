'use client';

// 破壊的操作の確認ダイアログ。window.confirm の置き換え用。
// アイコン＋見出し＋本文＋2ボタン（実行中はスピナー）という決まった形にして、
// 「消してよいか」の確認だけは全画面で同じ見た目・同じ操作にする。
//
// シェル（オーバーレイ・重ね順・Escape・背景クリック）は Modal に委ねる。
// 実行中（busy）は Escape・背景クリックで閉じない。

import { Modal, type ModalLayer } from './Modal';

export type ConfirmTone = 'danger' | 'primary';

const TONE_ICON: Record<ConfirmTone, string> = {
  danger: 'bg-[rgb(var(--danger-soft))] text-[rgb(var(--danger-ink))]',
  primary: 'bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent-ink))]',
};

const TONE_CONFIRM_BUTTON: Record<ConfirmTone, string> = {
  danger: 'bg-[rgb(var(--danger-solid))] hover:bg-[rgb(var(--danger-solid)/0.9)]',
  primary: 'bg-[var(--sb-accent-bg)] hover:bg-[var(--accent-hover)]',
};

export function ConfirmDialog({
  open,
  title,
  lines = [],
  confirmLabel = '実行する',
  cancelLabel = 'キャンセル',
  tone = 'danger',
  busy = false,
  layer = 'base',
  closeOnBackdrop,
  hideCancel = false,
  overlayClassName,
  panelClassName,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  /** 本文。1行1段落で出す */
  lines?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  busy?: boolean;
  /** ドロワー・パネルの上に重ねるときは 'over'。 */
  layer?: ModalLayer;
  /**
   * 背景クリックで閉じるか。省略時は Modal の既定（busy でなければ閉じる）。
   * 削除などの破壊的確認で誤爆を避けたいときは false を渡す（Escape とキャンセルは残る）。
   */
  closeOnBackdrop?: boolean;
  /** true でキャンセルを出さず、確定ボタン1つのお知らせにする（useNotice 用）。Escape・背景クリックは onClose。 */
  hideCancel?: boolean;
  overlayClassName?: string;
  panelClassName?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel={title}
      role="alertdialog"
      layer={layer}
      size="md"
      dismissable={!busy}
      closeOnBackdrop={closeOnBackdrop}
      bodyClassName="p-5"
      overlayClassName={overlayClassName}
      panelClassName={panelClassName}
      footer={
        <>
          {!hideCancel && (
            <button
              type="button"
              data-autofocus
              onClick={onClose}
              disabled={busy}
              className="rounded-lg border border-[rgb(var(--line-strong))] bg-[rgb(var(--surface))] px-3.5 py-2 text-[14px] leading-[22px] font-medium text-[rgb(var(--ink))] transition-colors hover:bg-[rgb(var(--surface-subtle))] disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            data-autofocus={hideCancel ? true : undefined}
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[14px] leading-[22px] font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${TONE_CONFIRM_BUTTON[tone]}`}
          >
            {busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONE_ICON[tone]}`}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
            {tone === 'danger' ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25h1.5v5.25m-.75-9h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            )}
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[14px] leading-[22px] font-semibold text-[rgb(var(--ink))]">{title}</h2>
          {lines.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {lines.map((line) => (
                <li key={line} className="text-[12px] leading-5 text-[rgb(var(--ink-muted))]">{line}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
