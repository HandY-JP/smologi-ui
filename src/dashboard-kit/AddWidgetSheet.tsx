'use client';
// 下から出るボトムシート。外したウィジェットを選んで戻す。Esc・外側タップで閉じる。
// role="dialog" を持つので、編集モードの Esc（やめる）は走らない。
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { confirmedSelection, toggleSelected } from './selection';
import type { WidgetPreview } from './types';

const WIDE_QUERY = '(min-width: 640px)';
function subscribeWide(cb: () => void) {
  const mql = window.matchMedia(WIDE_QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}
/** 画面幅が 640px 以上か（開いている間のリサイズにも追従）。SSR は false。 */
function useIsWide(): boolean {
  return useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE_QUERY).matches, () => false);
}

/** データを使わず CSS だけで描く小さな見本。色は currentColor の濃淡だけ。 */
function PreviewArt({ kind = 'stats' }: { kind?: WidgetPreview }) {
  return (
    <div aria-hidden className="mb-2 flex h-14 items-end overflow-hidden rounded-lg bg-current/5 p-2">
      {kind === 'chart' ? (
        <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-full w-full">
          <polyline points="0,26 16,20 32,23 48,12 64,15 80,6 100,9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.6" />
        </svg>
      ) : kind === 'bars' ? (
        <div className="flex h-full w-full items-end gap-1.5">
          {[40, 65, 50, 85, 60, 95].map((h, i) => <span key={i} className="flex-1 rounded-sm bg-current opacity-40" style={{ height: `${h}%` }} />)}
        </div>
      ) : kind === 'list' ? (
        <div className="flex h-full w-full flex-col justify-between">
          {[90, 70, 80].map((w, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-40" />
              <span className="h-1.5 rounded-full bg-current opacity-30" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex w-full flex-col gap-1.5 self-center">
          <span className="h-3 w-2/5 rounded-sm bg-current opacity-50" />
          <span className="h-1.5 w-3/5 rounded-full bg-current opacity-25" />
        </div>
      )}
    </div>
  );
}

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
  /** true なら追加済み。押せないが見本は見えたまま、チェックと「追加済み」を出す。 */
  added?: boolean;
  /** 見本の種類（未指定は 'stats'）。 */
  preview?: WidgetPreview;
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
  const wide = useIsWide();
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
  const heading = title ?? (multiple ? 'ウィジェットを選ぶ' : 'ウィジェットを追加');
  const allAdded = candidates.every((c) => c.added);
  const body = (
    <>
      {multiple ? (
        <p className="mb-3 text-[13px] opacity-60">{hint ?? '押して選び、「追加する」で並べます。あとから「編集」でいつでも変えられます。'}</p>
      ) : null}
      {allAdded ? (
        <p className="text-[13px] opacity-60">すべてのウィジェットを表示中です。</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
          {candidates.map((c) => {
            const locked = !!c.disabled && !c.added;
            const inert = locked || !!c.added;
            return (
              <button
                key={c.id}
                type="button"
                disabled={inert}
                aria-disabled={inert || undefined}
                aria-pressed={multiple && !inert ? selected.includes(c.id) : undefined}
                onClick={() => {
                  if (inert) return;
                  if (multiple) setSelected((cur) => toggleSelected(cur, candidates, c.id));
                  else onPick(c.id);
                }}
                className={`relative text-left ${c.added ? 'cursor-default' : ''} ${multiple && selected.includes(c.id) ? selectedClassName : ''} ${candidateClassName}`}
              >
                {/* 見本。Plus ロックのときだけ薄くする（追加済みは薄くしない）。 */}
                <div className={locked ? 'opacity-50' : undefined}><PreviewArt kind={c.preview} /></div>
                <div className={locked ? 'opacity-50' : undefined}>
                  <b className="mb-1 flex flex-wrap items-center gap-1.5 text-sm">
                    <span>{inert || multiple ? '' : '＋ '}{c.title}</span>
                    {c.added ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-current/10 px-2 py-0.5 text-[11px] font-semibold leading-none">
                    <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden><path d="M2.5 6.5l2.5 2.5 4.5-5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    追加済み
                      </span>
                    ) : null}
                    {c.badge ? <span className="rounded-full border border-current px-1.5 py-px text-[10px] font-semibold leading-none opacity-70">{c.badge}</span> : null}
                    {c.recommended && !c.disabled && !c.added ? <span className="rounded-full border border-current px-1.5 py-px text-[10px] font-semibold leading-none opacity-70">おすすめ</span> : null}
                  </b>
                  {c.description ? <small className="text-xs leading-normal opacity-60">{c.description}</small> : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
  const footer = multiple ? (
    <div className={`${wide ? 'shrink-0 px-5 py-3' : 'sticky bottom-0 -mx-4 mt-3.5 px-4 py-2'} flex justify-end gap-2 ${footerClassName}`}>
      <button type="button" onClick={onClose} className={footerButtonClassName}>{cancelLabel}</button>
      <button type="button" onClick={confirm} disabled={confirmedSelection(selected, candidates).length === 0} className={`${footerPrimaryClassName} disabled:opacity-50`}>{confirmLabel}</button>
    </div>
  ) : null;
  return createPortal(
    <>
      <div className={`fixed inset-0 z-40 ${scrimClassName}`} onClick={onClose} aria-hidden />
      {wide ? (
        // PC 幅: 画面中央のモーダル。大きさは固定で、中身だけスクロールする。
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={heading}
          tabIndex={-1}
          className={`fixed left-1/2 top-1/2 z-[41] flex h-[min(640px,80vh)] w-[min(768px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden outline-none ${sheetClassName}`}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-2 pt-4">
            <h4 className="text-base font-semibold">{heading}</h4>
            <button type="button" onClick={onClose} aria-label="閉じる" className="rounded-full p-1.5 opacity-60 hover:opacity-100">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden><path d="M3.5 3.5l9 9m0-9l-9 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{body}</div>
          {footer}
        </div>
      ) : (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={heading}
          tabIndex={-1}
          className={`fixed bottom-0 left-1/2 z-[41] max-h-[70vh] w-[min(560px,100%)] -translate-x-1/2 overflow-auto outline-none px-4 pb-[calc(20px+env(safe-area-inset-bottom,0px))] pt-2.5 ${sheetClassName}`}
        >
          <div className="mx-auto mb-2.5 mt-1 h-[5px] w-10 rounded-[3px] bg-current opacity-20" />
          <h4 className={`${multiple ? 'mb-1' : 'mb-2.5'} text-base font-semibold`}>{heading}</h4>
          {body}
          {footer}
        </div>
      )}
    </>,
    document.body,
  );
}
