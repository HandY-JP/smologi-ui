'use client';
// 検索つきの単一選択ドロップダウン（コンボボックス）。
// 候補が多い select（お客様・仕入先・拠点など）を、入力で絞り込みながら選べるようにする。
// 商品マスタの絞り込みで使った形を共通化したもの。leadingOptions は「すべて／未設定／共通」など、
// 検索が空のときだけ先頭にピン留めする特別な選択肢に使う。
//
// 本番不具合修正（2026-09-15）: variant="inline"（トップバーの検索ピルに埋め込むお客様セレクタ）は
// 候補パネルを body へ createPortal して position:fixed で置く。以前は absolute + z-30 で、
// sticky なトップバーの第2行（グループ/絞り込みチップ列）や一覧のセルが上に重なり、
// **先頭の「すべてのお客様」だけがクリックできない**（＝お客様を選んだあと未選択に戻せない）
// 状態だった。FilterPopover の panelPortal と同じ作法（実測位置・ビューポート内クランプ・
// パネル内クリックでは閉じない）にそろえる。
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type SearchableOption = {
  value: string;
  label: string;
  /** 表示はしないが検索対象に含める副テキスト（例: お客様コード）。 */
  keywords?: string;
};

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = '選択してください',
  searchPlaceholder = '検索',
  leadingOptions = [],
  emptyText = '項目がありません',
  className = '',
  disabled = false,
  variant = 'default',
  ariaLabel,
}: {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  /** 検索が空のときだけ先頭に出す特別な選択肢（すべて／未設定／共通 など）。 */
  leadingOptions?: SearchableOption[];
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  /**
   * 'default'（既定）は枠付きのトリガー（従来どおり）。
   * 'inline' はトップバー検索ピルなど、既に枠がある入れ物に埋め込む用に枠・背景を外す
   * （幅は呼び出し元の className で決める）。
   */
  variant?: 'default' | 'inline';
  /** input の aria-label。見出しラベルを別に出さない置き場所（トップバー等）で指定する。未指定なら付けない。 */
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = useId();
  const activeOptionId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;
  const inline = variant === 'inline';
  // トップバーのピルに埋め込む inline だけ portal する（祖先の重ね順・overflow に負けないように）。
  const portalPanel = inline;
  // portal したパネルの DOM。実寸を測ってから位置を決めるので ref ではなく state で受ける。
  const [panelNode, setPanelNode] = useState<HTMLDivElement | null>(null);
  const [panelPosition, setPanelPosition] =
    useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);

  // トリガーの直下へ貼り付ける。画面右・下へはみ出す分はクランプし、あふれる高さは内部スクロール。
  useLayoutEffect(() => {
    if (!open || !portalPanel || typeof window === 'undefined') return;
    const MARGIN = 8;
    const update = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
      // 幅はトリガーの実寸と 20rem の広いほう（狭いピルでもお客様名が読めるように）。
      const width = Math.min(Math.max(rect.width, 320), Math.max(160, viewportWidth - MARGIN * 2));
      const top = Math.max(MARGIN, Math.min(rect.bottom + 4, viewportHeight - 120));
      const maxHeight = Math.max(120, viewportHeight - top - MARGIN);
      const left = Math.min(Math.max(MARGIN, rect.left), Math.max(MARGIN, viewportWidth - width - MARGIN));
      setPanelPosition((prev) => (
        prev && prev.top === top && prev.left === left && prev.width === width && prev.maxHeight === maxHeight
          ? prev
          : { top, left, width, maxHeight }
      ));
    };
    update();
    // 開いた直後は周り（検索ピルの開閉アニメ等）が動くので数フレームだけ追従する。
    const startedAt = Date.now();
    let frame = requestAnimationFrame(function follow() {
      update();
      if (Date.now() - startedAt < 400) frame = requestAnimationFrame(follow);
    });
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, portalPanel, panelNode]);

  useEffect(() => {
    if (!open) return;
    const handle = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      // portal したパネルは rootRef の外にあるので、パネル内クリックで閉じないよう別に見る。
      if (panelNode?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, panelNode]);
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      q
        ? options.filter(
            (o) => o.label.toLowerCase().includes(q) || o.keywords?.toLowerCase().includes(q),
          )
        : options,
    [options, q],
  );
  const selectedLabel = useMemo(
    () => [...leadingOptions, ...options].find((o) => o.value === value)?.label,
    [leadingOptions, options, value],
  );
  const visibleOptions = useMemo(
    () => (q ? filtered : [...leadingOptions, ...options]),
    [filtered, leadingOptions, options, q],
  );
  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
  };

  const renderRow = (o: SearchableOption, id: string) => {
    const on = value === o.value;
    return (
      <button
        type="button"
        id={id}
        role="option"
        aria-selected={on}
        onClick={() => pick(o.value)}
        className={`flex w-full items-center justify-between gap-2 rounded px-1.5 py-1.5 text-left text-sm ${on ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
      >
        <span className="truncate">{o.label}</span>
        {on && (
          <svg className="h-4 w-4 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    );
  };

  const openSearch = () => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    setActiveIndex(-1);
  };

  const panelBody = (
    <div className="max-h-full overflow-y-auto p-1" style={portalPanel ? undefined : { maxHeight: '14rem' }}>
      {visibleOptions.length === 0 ? (
        <div className="px-2 py-2 text-xs text-gray-400">
          {q ? `「${query}」に一致する項目がありません` : emptyText}
        </div>
      ) : (
        visibleOptions.map((option, index) => (
          <div key={`${option.value || '__empty__'}:${index}`} className={index === activeIndex ? 'rounded bg-blue-50' : ''}>
            {renderRow(option, `${listboxId}-option-${index}`)}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div ref={rootRef} className={`relative ${inline ? 'min-w-0 ' : ''}${className}`}>
      <div
        className={
          inline
            ? // 未フォーカス（候補を開いていない）ときは、文字の上でも ▾ と同じ手のカーソルにする
              // （2026-09-22 ユーザー決定。中身が input なので放っておくと I ビームになる）。
              // 開いて検索入力できる状態になったら input 側で cursor-text に戻す。
              `relative flex h-full w-full min-w-0 items-center border-0 bg-transparent text-sm transition-colors ${
                disabled ? 'cursor-not-allowed text-gray-400' : open ? 'text-gray-900' : 'cursor-pointer text-gray-700'
              }`
            : `relative flex w-full items-center rounded-md border text-sm transition-colors ${
                disabled
                  ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                  : open ? 'border-blue-400 bg-white ring-2 ring-blue-100' : 'border-gray-300 bg-white hover:border-gray-400'
              }`
        }
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-controls={listboxId}
          aria-expanded={open && !disabled}
          aria-autocomplete="list"
          aria-activedescendant={open ? activeOptionId : undefined}
          aria-label={ariaLabel}
          title={!open && selectedLabel ? selectedLabel : undefined}
          autoComplete="off"
          value={open ? query : (selectedLabel ?? '')}
          onFocus={openSearch}
          onChange={(e) => {
            setOpen(true);
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
              setActiveIndex((index) => Math.min(index + 1, visibleOptions.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (e.key === 'Enter' && open && visibleOptions.length > 0) {
              e.preventDefault();
              pick(visibleOptions[activeIndex >= 0 ? activeIndex : 0].value);
            } else if (e.key === 'Escape') {
              // 候補が開いているときはこのコンボだけを閉じ、外側（商品マスタの document
              // レベル Escape や、将来 handlesEscape=true の画面のドック畳み）へ伝播させない。
              if (open) e.stopPropagation();
              setOpen(false);
              setQuery('');
              setActiveIndex(-1);
              inputRef.current?.blur();
            }
          }}
          placeholder={open ? searchPlaceholder : placeholder}
          disabled={disabled}
          className={
            inline
              ? `min-w-0 flex-1 truncate bg-transparent py-0 px-1 pr-5 text-sm font-medium outline-none ${
                  disabled ? 'cursor-not-allowed' : open ? 'cursor-text' : 'cursor-pointer'
                } ${
                  selectedLabel && !open ? (disabled ? 'text-gray-400' : 'text-gray-700') : 'text-gray-700 placeholder:text-gray-400'
                }`
              : `min-w-0 flex-1 bg-transparent px-2.5 py-2 pr-8 outline-none ${
                  selectedLabel && !open ? (disabled ? 'text-gray-500' : 'text-gray-700') : 'text-gray-700 placeholder:text-gray-400'
                }`
          }
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            if (open) {
              setOpen(false);
              setQuery('');
              setActiveIndex(-1);
            } else {
              inputRef.current?.focus();
            }
          }}
          disabled={disabled}
          aria-label={open ? '候補を閉じる' : '候補を開く'}
          className={`absolute right-0 flex h-full items-center justify-center text-gray-400 ${inline ? 'w-5' : 'w-8'}`}
        >
          <svg className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && !disabled && !portalPanel && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 z-30 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {panelBody}
        </div>
      )}

      {open && !disabled && portalPanel && panelPosition && typeof document !== 'undefined'
        ? createPortal(
          <div
            ref={setPanelNode}
            id={listboxId}
            role="listbox"
            // モーダル（z-90）より下・sticky なトップバー／浮遊ドックより上。
            className="themed-popover-panel fixed z-[80] flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
            style={{
              top: panelPosition.top,
              left: panelPosition.left,
              width: panelPosition.width,
              maxHeight: panelPosition.maxHeight,
            }}
          >
            {panelBody}
          </div>,
          document.body,
        )
        : null}
    </div>
  );
}
