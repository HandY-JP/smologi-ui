'use client';
// 下から出るボトムシート。外したウィジェットを選んで戻す。Esc・外側タップで閉じる。
// role="dialog" を持つので、編集モードの Esc（やめる）は走らない。
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface AddWidgetCandidate {
  id: string;
  title: string;
  description?: string;
  /** true なら選べない（Plus 未契約など）。 */
  disabled?: boolean;
  /** 候補に付ける小さなバッジ（例: 「Plus」）。 */
  badge?: string;
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
}

export function AddWidgetSheet({
  open,
  candidates,
  onPick,
  onClose,
  sheetClassName,
  candidateClassName,
  scrimClassName = 'bg-black/35',
}: AddWidgetSheetProps) {
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
        aria-label="ウィジェットを追加"
        tabIndex={-1}
        className={`fixed bottom-0 left-1/2 z-[41] max-h-[70vh] w-[min(560px,100%)] -translate-x-1/2 overflow-auto outline-none px-4 pb-[calc(20px+env(safe-area-inset-bottom,0px))] pt-2.5 ${sheetClassName}`}
      >
        <div className="mx-auto mb-2.5 mt-1 h-[5px] w-10 rounded-[3px] bg-current opacity-20" />
        <h4 className="mb-2.5 text-base font-semibold">ウィジェットを追加</h4>
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
                onClick={() => { if (!c.disabled) onPick(c.id); }}
                className={`text-left ${c.disabled ? 'cursor-not-allowed opacity-50' : ''} ${candidateClassName}`}
              >
                <b className="mb-1 flex items-center gap-1.5 text-sm">
                  <span>{c.disabled ? '' : '＋ '}{c.title}</span>
                  {c.badge ? <span className="rounded-full border border-current px-1.5 py-px text-[10px] font-semibold leading-none opacity-70">{c.badge}</span> : null}
                </b>
                {c.description ? <small className="text-xs leading-normal opacity-60">{c.description}</small> : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}
