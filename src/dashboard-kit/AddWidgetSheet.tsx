'use client';
// 下から出るボトムシート。外したウィジェットを選んで戻す。Esc・外側タップで閉じる。
// role="dialog" を持つので、編集モードの Esc（やめる）は走らない。
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { confirmedSelection, toggleSelected } from './selection';

export interface AddWidgetCandidate {
  id: string;
  title: string;
  description?: string;
  /** true なら選べない（Plus 未契約など）。 */
  disabled?: boolean;
  /** 候補に付ける小さなバッジ（例: 「Plus」）。 */
  badge?: string;
  /** true なら「おすすめ」の小さなタグを付ける。 */
  recommended?: boolean;
}

export interface AddWidgetSheetProps {
  open: boolean;
  candidates: AddWidgetCandidate[];
  onPick: (id: string) => void;
  onClose: () => void;
  /** シート本体のクラス（ガラス・角丸・背景）。 */
  sheetClassName: string;
  /** 候補ボタンのクラス。 */
  candidateClassName: string;
  scrimClassName?: string;
  /**
   * true なら複数選択モード: 押すと選択が切り替わり（aria-pressed）、「追加する」でまとめて onPickMany を呼ぶ。
   * disabled の候補は選べない。省略（false）は従来どおり、押した 1 つを onPick で追加して閉じる前提。
   */
  multiple?: boolean;
  onPickMany?: (ids: string[]) => void;
  /** 見出し（既定: 複数選択は「ウィジェットを選ぶ」、1 つ追加は「ウィジェットを追加」）。 */
  title?: string;
  /** 見出しの下の説明（複数選択のときの既定あり）。 */
  hint?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 複数選択のフッターのボタン（やめる）。 */
  footerButtonClassName?: string;
  /** 複数選択のフッターの主ボタン（追加する）。 */
  footerPrimaryClassName?: string;
  /** 複数選択のフッター（スクロール中も下に貼り付く）の背景。シートと同じ色を渡す（候補が透けないように）。 */
  footerClassName?: string;
  /** 選択中の候補に足すクラス。 */
  selectedClassName?: string;
}

export function AddWidgetSheet({
  open,
  candidates,
  onPick,
  onClose,
  sheetClassName,
  candidateClassName,
  scrimClassName = 'bg-black/35',
  multiple = false,
  onPickMany,
  title,
  hint,
  confirmLabel = '追加する',
  cancelLabel = 'やめる',
  footerButtonClassName = 'rounded-full border border-current px-4 py-2 text-sm font-medium',
  footerPrimaryClassName = 'rounded-full bg-current px-4 py-2 text-sm font-medium',
  selectedClassName = 'ring-2 ring-current',
  footerClassName = '',
}: AddWidgetSheetProps) {
  const [selected, setSelected] = useState<string[]>([]);
  // 開くたびに選択を空に戻す。
  useEffect(() => {
    if (open) setSelected([]); // eslint-disable-line react-hooks/set-state-in-effect
  }, [open]);
  const confirm = () => {
    const ids = confirmedSelection(selected, candidates);
    if (ids.length === 0) return;
    onPickMany?.(ids);
  };

  const dialogRef = useRef<HTMLDivElement | null>(null);
  // 開いたらシートへ focus し、閉じたら開く前の要素（開いたボタン）へ戻す。
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => {
      if (opener && opener.isConnected) opener.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Tab をシートの中に閉じ込める。
        const root = dialogRef.current;
        if (!root) return;
        const items = Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'));
        if (items.length === 0) { e.preventDefault(); root.focus(); return; }
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === root || !root.contains(active))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (active === last || !root.contains(active))) { e.preventDefault(); first.focus(); }
        return;
      }
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <>
      <div className={`fixed inset-0 z-40 ${scrimClassName}`} onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? (multiple ? 'ウィジェットを選ぶ' : 'ウィジェットを追加')}
        tabIndex={-1}
        className={`fixed bottom-0 left-1/2 z-[41] max-h-[70vh] w-[min(560px,100%)] -translate-x-1/2 overflow-auto outline-none px-4 pb-[calc(20px+env(safe-area-inset-bottom,0px))] pt-2.5 ${sheetClassName}`}
      >
        <div className="mx-auto mb-2.5 mt-1 h-[5px] w-10 rounded-[3px] bg-current opacity-20" />
        <h4 className={`${multiple ? 'mb-1' : 'mb-2.5'} text-base font-semibold`}>{title ?? (multiple ? 'ウィジェットを選ぶ' : 'ウィジェットを追加')}</h4>
        {multiple ? (
          <p className="mb-3 text-[13px] opacity-60">{hint ?? '押して選び、「追加する」で並べます。あとから「編集」でいつでも変えられます。'}</p>
        ) : null}
        {candidates.length === 0 ? (
          <p className="text-[13px] opacity-60">すべてのウィジェットを表示中です。</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
            {candidates.map((c) => (
              <button
                key={c.id}
                type="button"
                disabled={c.disabled}
                aria-disabled={c.disabled || undefined}
                aria-pressed={multiple && !c.disabled ? selected.includes(c.id) : undefined}
                onClick={() => {
                  if (c.disabled) return;
                  if (multiple) setSelected((cur) => toggleSelected(cur, candidates, c.id));
                  else onPick(c.id);
                }}
                className={`relative text-left ${c.disabled ? 'cursor-not-allowed opacity-50' : ''} ${multiple && selected.includes(c.id) ? selectedClassName : ''} ${candidateClassName}`}
              >
                <b className="mb-1 flex items-center gap-1.5 text-sm">
                  <span>{c.disabled || multiple ? '' : '＋ '}{c.title}</span>
                  {c.badge ? <span className="rounded-full border border-current px-1.5 py-px text-[10px] font-semibold leading-none opacity-70">{c.badge}</span> : null}
                  {c.recommended && !c.disabled ? <span className="rounded-full border border-current px-1.5 py-px text-[10px] font-semibold leading-none opacity-70">おすすめ</span> : null}
                </b>
                {c.description ? <small className="text-xs leading-normal opacity-60">{c.description}</small> : null}
              </button>
            ))}
          </div>
        )}
        {multiple ? (
          <div className={`sticky bottom-0 -mx-4 mt-3.5 flex justify-end gap-2 px-4 py-2 ${footerClassName}`}>
            <button type="button" onClick={onClose} className={footerButtonClassName}>{cancelLabel}</button>
            <button type="button" onClick={confirm} disabled={confirmedSelection(selected, candidates).length === 0} className={`${footerPrimaryClassName} disabled:opacity-50`}>{confirmLabel}</button>
          </div>
        ) : null}
      </div>
    </>,
    document.body,
  );
}
