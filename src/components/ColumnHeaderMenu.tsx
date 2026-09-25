'use client';
// 一覧の列見出しに置く「⋮」メニュー（並び替え・絞り込み・列ごとの表示切替・列の移動・列を隠す）。
//
// 出どころ: smologi 本体 src/components/layout/ColumnHeaderMenu.tsx（2026-09-23 商品マスタで先行導入）。
// ここでは系列アプリ共通に使えるよう、次を足した（既存の props は名前・形とも同じ＝smologi がそのまま載せ替えられる）。
//   - filters: 列ごとの絞り込み（文字を含む / 数値の範囲 / 選択肢 / はい・いいえ / 日付の範囲）
//   - sortUnavailableReason: 並び替えできない列（画面で計算する値など）に理由を出す
//   - sort.available: 片方の向きしか無い並び（例「30日販売が多い順」だけ）
//   - move: 列を左へ / 右へ
//
// 見出しは 2 段構え:
//   1. 見出しの文字クリック＝並び替えのトグル（1回目→2回目で逆順→3回目で解除）。
//      いまの並びは文字の右の ↑ / ↓（アクセント色）で示す。未選択の列の ↕ はホバー中だけ薄く出す。
//      絞り込みが効いている列は文字の右に小さなじょうごを出す。
//   2. 見出しの右端に「⋮」。ホバー（とキーボードフォーカス）で現れ、押すとポップオーバーが開く。
//
// 言葉づかい: 「昇順 / 降順」は使わない。列ごとに自然な言い方を呼び出し側が sort.labels で渡す。
//
// 状態は一切持たない props 駆動（開閉と、入力途中の下書きだけ自前）。絞り込みの値は
// 画面側の既存 state（上部の絞り込みメニュー・保存ビュー・チップと同じもの）をそのまま渡すこと。
// 色は Tailwind の gray と --sb-accent-bg だけ（ダークは styles/dark-compat.css が受ける）。
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  activeColumnSortLabel,
  anyColumnFilterActive,
  availableColumnSortDirs,
  clearColumnFilter,
  columnDateRangeError,
  columnFilterSummary,
  columnNumberRangeError,
  isColumnFilterActive,
  nextColumnSortDir,
  normalizeColumnNumberInput,
  type ColumnBooleanFilterSpec,
  type ColumnDateRangeFilterSpec,
  type ColumnEnumFilterSpec,
  type ColumnFilterSpec,
  type ColumnHeaderMoveSpec,
  type ColumnHeaderPreset,
  type ColumnHeaderSortSpec,
  type ColumnHeaderVariantSpec,
  type ColumnNumberRangeFilterSpec,
  type ColumnSortDir,
  type ColumnTextFilterSpec,
} from '../lib/column-header';

export interface ColumnHeaderCellProps {
  /** 見出しの文字（Pro バッジなどを足すときは labelExtra を使う）。 */
  label: ReactNode;
  /** 読み上げ・ツールチップに使う素のテキスト。 */
  labelText: string;
  /** 文字のすぐ右に差し込む要素（Pro バッジなど）。 */
  labelExtra?: ReactNode;
  sort?: ColumnHeaderSortSpec;
  /**
   * 並び替えできない列の理由（例: 「画面で計算する値のため並び替えできません」）。
   * sort を渡さない列でこれを渡すと、メニューに押せない「並び替え」と理由を出す。
   */
  sortUnavailableReason?: string;
  presets?: readonly ColumnHeaderPreset[];
  variant?: ColumnHeaderVariantSpec;
  /** 列ごとの絞り込み。1 列に複数置ける（それぞれ label を付ける）。 */
  filters?: readonly ColumnFilterSpec[];
  /** 列を左へ / 右へ。 */
  move?: ColumnHeaderMoveSpec;
  /** 「この列を隠す」。隠せない列（商品名・コードなど固定列）では渡さない。 */
  onHide?: () => void;
  /** 「表示設定…」（列の ON/OFF・並び順の一括編集）。 */
  onOpenDisplaySettings?: () => void;
  align?: 'left' | 'center' | 'right';
  /** 見出しセルのツールチップ（列の説明）。 */
  title?: string;
}

const JUSTIFY: Record<'left' | 'center' | 'right', string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

function ColumnSortArrow({ dir, label }: { dir: ColumnSortDir | null; label: string | null }) {
  if (!dir) {
    return (
      <span
        className="text-[10px] leading-none text-gray-300 opacity-0 transition-opacity group-hover/ch:opacity-100"
        aria-hidden
      >
        ↕
      </span>
    );
  }
  return (
    <span className="text-[11px] font-bold leading-none text-[var(--sb-accent-bg)]" title={label ?? undefined} aria-hidden>
      {dir === 'asc' ? '↑' : '↓'}
    </span>
  );
}

function FunnelMark({ title }: { title: string }) {
  return (
    <span className="inline-flex shrink-0 text-[var(--sb-accent-bg)]" title={title} aria-hidden>
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 .78 1.63L14 14.1V19a1 1 0 0 1-.55.9l-3 1.5A1 1 0 0 1 9 20.5v-6.4L3.22 5.63A1 1 0 0 1 3 5z" />
      </svg>
    </span>
  );
}

export function ColumnHeaderCell({
  label,
  labelText,
  labelExtra,
  sort,
  sortUnavailableReason,
  presets,
  variant,
  filters,
  move,
  onHide,
  onOpenDisplaySettings,
  align = 'center',
  title,
}: ColumnHeaderCellProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelId = useId();
  const hasFilters = Boolean(filters && filters.length > 0);
  const hasMenu = Boolean(
    sort || sortUnavailableReason || variant || hasFilters || move || onHide || onOpenDisplaySettings
    || (presets && presets.length > 0),
  );
  const activeLabel = activeColumnSortLabel(sort);
  const filterActive = anyColumnFilterActive(filters);
  const filterSummary = filterActive
    ? (filters ?? []).map(columnFilterSummary).filter((s): s is string => Boolean(s)).join(' / ')
    : '';

  const toggleSort = useCallback(() => {
    if (!sort) return;
    const next = nextColumnSortDir(sort);
    if (next) sort.onSort(next);
    else sort.onClear();
  }, [sort]);

  const labelNode = (
    <>
      <span className="truncate">{label}</span>
      {labelExtra}
    </>
  );
  const firstLabel = sort ? sort.labels[nextColumnSortDir({ ...sort, dir: null }) ?? 'asc'] : '';

  return (
    <span className={`group/ch flex w-full min-w-0 items-center gap-0.5 ${JUSTIFY[align]}`}>
      {sort ? (
        <button
          type="button"
          onClick={toggleSort}
          className="inline-flex min-w-0 items-center gap-1 hover:text-gray-700"
          title={activeLabel ? `${labelText}: ${activeLabel}（クリックで切り替え）` : `${title ?? labelText}（クリックで${firstLabel}）`}
          aria-label={activeLabel ? `${labelText}、現在 ${activeLabel}` : `${labelText}で並び替え`}
        >
          {labelNode}
          <ColumnSortArrow dir={sort.dir} label={activeLabel} />
        </button>
      ) : (
        <span className="inline-flex min-w-0 items-center gap-1" title={title}>{labelNode}</span>
      )}
      {filterActive && <FunnelMark title={`絞り込み中: ${filterSummary}`} />}

      {hasMenu && (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-haspopup={hasFilters ? 'dialog' : 'menu'}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-label={`${labelText}列のメニュー`}
          title={`${labelText}列のメニュー（並び替え・絞り込み・表示）`}
          // ホバー・フォーカス・展開中・絞り込み中は出す。キーボードでは Tab で到達でき、
          // focus-visible で見えるようになる（opacity 0 のままでは押しどころが分からないため）。
          className={`inline-flex h-5 w-4 shrink-0 items-center justify-center rounded text-gray-400 transition-opacity hover:bg-gray-100 hover:text-gray-700 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--sb-accent-bg)] group-hover/ch:opacity-100 ${
            open ? 'bg-gray-100 text-gray-700 opacity-100' : 'opacity-0'
          }`}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="12" cy="5" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="12" cy="19" r="1.6" />
          </svg>
        </button>
      )}

      {open && (
        <ColumnHeaderMenuPanel
          id={panelId}
          anchorRef={triggerRef}
          labelText={labelText}
          sort={sort}
          sortUnavailableReason={sortUnavailableReason}
          presets={presets}
          variant={variant}
          filters={filters}
          move={move}
          onHide={onHide}
          onOpenDisplaySettings={onOpenDisplaySettings}
          onClose={() => {
            setOpen(false);
            triggerRef.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </span>
  );
}

const MENU_ITEM_CLASS =
  'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] leading-5 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent';
const MENU_SECTION_CLASS = 'px-3 pb-0.5 pt-1.5 text-[11px] font-semibold text-gray-400';
const MENU_SEPARATOR_CLASS = 'my-1 border-t border-gray-100';
const FIELD_CLASS =
  'h-8 w-full min-w-0 rounded-md border border-gray-300 bg-white px-2 text-[13px] text-gray-700 placeholder:text-gray-400 focus:border-[var(--sb-accent-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400';
const APPLY_BUTTON_CLASS =
  'inline-flex h-7 items-center rounded-md bg-[var(--sb-accent-bg)] px-2.5 text-[12px] font-semibold text-[var(--accent-on)] hover:bg-[var(--accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] disabled:cursor-not-allowed disabled:opacity-40';

/** チェック位置を揃えるための ✓ 枠（未選択でも幅を取る）。 */
function MenuCheck({ checked }: { checked: boolean }) {
  return (
    <span className={`w-3 shrink-0 text-center text-[11px] ${checked ? 'text-[var(--sb-accent-bg)]' : 'text-transparent'}`} aria-hidden>
      ✓
    </span>
  );
}

/**
 * メニュー本体。列見出しは overflow-hidden の箱（横スクロール同期）の中にあることが多いので、
 * 必ず body へ portal して fixed で置く（そのまま出すと切り取られる）。
 */
function ColumnHeaderMenuPanel({
  id,
  anchorRef,
  labelText,
  sort,
  sortUnavailableReason,
  presets,
  variant,
  filters,
  move,
  onHide,
  onOpenDisplaySettings,
  onClose,
}: {
  id: string;
  anchorRef: { current: HTMLElement | null };
  labelText: string;
  sort?: ColumnHeaderSortSpec;
  sortUnavailableReason?: string;
  presets?: readonly ColumnHeaderPreset[];
  variant?: ColumnHeaderVariantSpec;
  filters?: readonly ColumnFilterSpec[];
  move?: ColumnHeaderMoveSpec;
  onHide?: () => void;
  onOpenDisplaySettings?: () => void;
  onClose: () => void;
}) {
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number; maxHeight: number } | null>(null);
  const hasFilters = Boolean(filters && filters.length > 0);

  // 実寸を測って画面内へ収める（右端の列でも画面外へ出さない）。
  useLayoutEffect(() => {
    const MARGIN = 8;
    const update = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
      const top = Math.max(MARGIN, Math.min(rect.bottom + 4, viewportHeight - 120));
      const maxHeight = Math.max(120, viewportHeight - top - MARGIN);
      const width = panel?.offsetWidth ?? 0;
      const preferred = width > 0 ? rect.right - width : rect.left;
      const left = width > 0
        ? Math.min(Math.max(MARGIN, preferred), Math.max(MARGIN, viewportWidth - width - MARGIN))
        : Math.max(MARGIN, preferred);
      setPosition((prev) =>
        prev && prev.top === top && prev.left === left && prev.maxHeight === maxHeight
          ? prev
          : { top, left, maxHeight });
    };
    update();
    window.addEventListener('resize', update);
    // 表の横スクロール・本文スクロールで置いていかれないよう capture で拾う。
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [anchorRef, panel]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panel?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [anchorRef, onClose, panel]);

  // 開いたら先頭の項目へフォーカスを移す（キーボードだけでも操作できるように）。
  useEffect(() => {
    if (!panel) return;
    panel.querySelector<HTMLElement>('button:not(:disabled), input:not(:disabled)')?.focus({ preventScroll: true });
  }, [panel]);

  const onPanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    // 入力欄の中の上下キー（数値の増減・日付）は奪わない。
    if ((event.target as HTMLElement).tagName === 'INPUT') return;
    event.preventDefault();
    const items = Array.from(panel?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === 'ArrowDown'
      ? (current + 1 + items.length) % items.length
      : (current - 1 + items.length) % items.length;
    items[next]?.focus({ preventScroll: true });
  };

  const run = (action: () => void) => () => {
    action();
    onClose();
  };

  if (typeof document === 'undefined') return null;

  const sortDirs = sort ? availableColumnSortDirs(sort) : [];
  const anyFilterActive = anyColumnFilterActive(filters);
  let sectionCount = 0;
  const separator = () => (sectionCount++ > 0 ? <div role="separator" className={MENU_SEPARATOR_CLASS} /> : null);

  return createPortal(
    <div
      id={id}
      ref={setPanel}
      // 入力欄を持つときは dialog（menu の中に textbox は置けない）。
      role={hasFilters ? 'dialog' : 'menu'}
      aria-label={`${labelText}列のメニュー`}
      onKeyDown={onPanelKeyDown}
      // themed-popover-panel: ダークで面色を一段上げる（CellPopover と同じ流儀）。
      className="themed-popover-panel fixed z-[90] min-w-[13rem] max-w-[20rem] overflow-y-auto overscroll-contain rounded-lg border border-gray-200 bg-white py-1 shadow-xl"
      style={{
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        maxHeight: position?.maxHeight,
        opacity: position ? undefined : 0,
      }}
    >
      {presets && presets.length > 0 && (
        <>
          {separator()}
          <div className={MENU_SECTION_CLASS}>一覧全体の並び</div>
          {presets.map((preset) => (
            <button key={preset.key} type="button" role="menuitemradio" aria-checked={preset.active} className={MENU_ITEM_CLASS} onClick={run(preset.onSelect)}>
              <MenuCheck checked={preset.active} />
              <span className="truncate">{preset.label}</span>
            </button>
          ))}
        </>
      )}

      {sort && (
        <>
          {separator()}
          <div className={MENU_SECTION_CLASS}>この列で並び替え</div>
          {sortDirs.map((dir) => (
            <button key={dir} type="button" role="menuitemradio" aria-checked={sort.dir === dir} className={MENU_ITEM_CLASS} onClick={run(() => sort.onSort(dir))}>
              <MenuCheck checked={sort.dir === dir} />
              <span className="truncate">{sort.labels[dir]}</span>
            </button>
          ))}
          <button type="button" role="menuitem" className={MENU_ITEM_CLASS} disabled={!sort.dir} onClick={run(sort.onClear)}>
            <MenuCheck checked={false} />
            <span className="truncate">この列の並び替えをやめる</span>
          </button>
        </>
      )}

      {!sort && sortUnavailableReason && (
        <>
          {separator()}
          <div className={MENU_SECTION_CLASS}>この列で並び替え</div>
          <p className="px-3 pb-1 text-[12px] leading-5 text-gray-400">{sortUnavailableReason}</p>
        </>
      )}

      {hasFilters && (
        <>
          {separator()}
          {(filters ?? []).map((filter, index) => (
            <ColumnFilterSection
              key={`${filter.kind}:${filter.label ?? index}`}
              filter={filter}
              heading={filter.label ?? 'この列で絞り込み'}
              onClose={onClose}
            />
          ))}
          {anyFilterActive && (
            <button
              type="button"
              role="menuitem"
              className={MENU_ITEM_CLASS}
              onClick={run(() => (filters ?? []).forEach(clearColumnFilter))}
            >
              <MenuCheck checked={false} />
              <span className="truncate">この列の絞り込みを解除</span>
            </button>
          )}
        </>
      )}

      {variant && variant.options.length > 0 && (
        <>
          {separator()}
          <div className={MENU_SECTION_CLASS}>{variant.label}</div>
          {variant.options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={variant.value === option.value}
              className={MENU_ITEM_CLASS}
              title={option.hint}
              onClick={run(() => variant.onChange(option.value))}
            >
              <MenuCheck checked={variant.value === option.value} />
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </>
      )}

      {move && (
        <>
          {separator()}
          <button type="button" role="menuitem" className={MENU_ITEM_CLASS} disabled={!move.onMoveLeft} onClick={move.onMoveLeft ? run(move.onMoveLeft) : undefined}>
            <span className="w-3 shrink-0 text-center text-[11px] text-gray-400" aria-hidden>←</span>
            <span className="truncate">左へ移動</span>
          </button>
          <button type="button" role="menuitem" className={MENU_ITEM_CLASS} disabled={!move.onMoveRight} onClick={move.onMoveRight ? run(move.onMoveRight) : undefined}>
            <span className="w-3 shrink-0 text-center text-[11px] text-gray-400" aria-hidden>→</span>
            <span className="truncate">右へ移動</span>
          </button>
        </>
      )}

      {(onHide || onOpenDisplaySettings) && (
        <>
          {separator()}
          {onHide && (
            <button type="button" role="menuitem" className={MENU_ITEM_CLASS} onClick={run(onHide)}>
              <MenuCheck checked={false} />
              <span className="truncate">この列を隠す</span>
            </button>
          )}
          {onOpenDisplaySettings && (
            <button type="button" role="menuitem" className={MENU_ITEM_CLASS} onClick={run(onOpenDisplaySettings)}>
              <MenuCheck checked={false} />
              <span className="truncate">表示設定…</span>
            </button>
          )}
        </>
      )}
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// 絞り込みの区画（種類ごと）
// ---------------------------------------------------------------------------

function ColumnFilterSection({ filter, heading, onClose }: { filter: ColumnFilterSpec; heading: string; onClose: () => void }) {
  const active = isColumnFilterActive(filter);
  return (
    <div className="pb-1">
      <div className={`${MENU_SECTION_CLASS} flex items-center gap-1`}>
        <span className="truncate">{heading}</span>
        {active && <span className="text-[var(--sb-accent-bg)]" aria-label="適用中">●</span>}
      </div>
      {filter.disabledReason ? (
        <p className="px-3 pb-1 text-[12px] leading-5 text-gray-400">{filter.disabledReason}</p>
      ) : filter.kind === 'text' ? (
        <TextFilterField filter={filter} onClose={onClose} />
      ) : filter.kind === 'numberRange' ? (
        <NumberRangeFilterField filter={filter} onClose={onClose} />
      ) : filter.kind === 'dateRange' ? (
        <DateRangeFilterField filter={filter} onClose={onClose} />
      ) : filter.kind === 'enum' ? (
        <EnumFilterField filter={filter} onClose={onClose} />
      ) : (
        <BooleanFilterField filter={filter} onClose={onClose} />
      )}
      {filter.hint && !filter.disabledReason && (
        <p className="px-3 pt-0.5 text-[11px] leading-4 text-gray-400">{filter.hint}</p>
      )}
    </div>
  );
}

/** 入力系（文字・数値・日付）は下書きを持ち、Enter か「適用」で確定する（打つたびに再取得しない）。 */
function TextFilterField({ filter, onClose }: { filter: ColumnTextFilterSpec; onClose: () => void }) {
  const [draft, setDraft] = useState(filter.value);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    filter.onChange(draft.trim());
    onClose();
  };
  return (
    <form onSubmit={submit} className="flex items-center gap-1.5 px-3 py-1">
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={filter.placeholder ?? '含む文字'}
        aria-label={filter.label ?? '含む文字'}
        className={FIELD_CLASS}
      />
      <button type="submit" className={APPLY_BUTTON_CLASS} disabled={draft.trim() === filter.value.trim()}>適用</button>
    </form>
  );
}

function NumberRangeFilterField({ filter, onClose }: { filter: ColumnNumberRangeFilterSpec; onClose: () => void }) {
  const [min, setMin] = useState(filter.min);
  const [max, setMax] = useState(filter.max);
  const error = columnNumberRangeError(min, max);
  const unit = filter.unit ?? '';
  const prefix = (filter.unitPosition ?? (unit === '¥' ? 'prefix' : 'suffix')) === 'prefix';
  const unchanged = min === filter.min && max === filter.max;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (error) return;
    filter.onChange({ min, max });
    onClose();
  };
  const field = (value: string, set: (v: string) => void, placeholder: string) => (
    <span className="flex min-w-0 flex-1 items-center gap-1">
      {unit && prefix && <span className="text-[12px] text-gray-500">{unit}</span>}
      <input
        inputMode={filter.allowDecimal ? 'decimal' : 'numeric'}
        value={value}
        onChange={(event) => set(normalizeColumnNumberInput(event.target.value, filter.allowDecimal))}
        placeholder={placeholder}
        aria-label={`${filter.label ?? ''}${placeholder}`}
        className={`${FIELD_CLASS} text-right tabular-nums`}
      />
      {unit && !prefix && <span className="text-[12px] text-gray-500">{unit}</span>}
    </span>
  );
  return (
    <form onSubmit={submit} className="px-3 py-1">
      <div className="flex items-center gap-1.5">
        {field(min, setMin, '下限')}
        <span className="text-[11px] text-gray-400">〜</span>
        {field(max, setMax, '上限')}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="text-[11px] text-red-600" role={error ? 'alert' : undefined}>{error ?? ''}</span>
        <button type="submit" className={APPLY_BUTTON_CLASS} disabled={Boolean(error) || unchanged}>適用</button>
      </div>
    </form>
  );
}

function DateRangeFilterField({ filter, onClose }: { filter: ColumnDateRangeFilterSpec; onClose: () => void }) {
  const [from, setFrom] = useState(filter.from);
  const [to, setTo] = useState(filter.to);
  const error = columnDateRangeError(from, to);
  const unchanged = from === filter.from && to === filter.to;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (error) return;
    filter.onChange({ from, to });
    onClose();
  };
  return (
    <form onSubmit={submit} className="px-3 py-1">
      <div className="flex items-center gap-1.5">
        <input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} aria-label={`${filter.label ?? ''}開始日`} className={FIELD_CLASS} />
        <span className="text-[11px] text-gray-400">〜</span>
        <input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} aria-label={`${filter.label ?? ''}終了日`} className={FIELD_CLASS} />
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="text-[11px] text-red-600" role={error ? 'alert' : undefined}>{error ?? ''}</span>
        <button type="submit" className={APPLY_BUTTON_CLASS} disabled={Boolean(error) || unchanged}>適用</button>
      </div>
    </form>
  );
}

/** 選択肢はその場で反映。複数選択はメニューを開いたまま、単一選択は閉じる。 */
function EnumFilterField({ filter, onClose }: { filter: ColumnEnumFilterSpec; onClose: () => void }) {
  const multiple = filter.multiple !== false;
  const selected = new Set(filter.value);
  if (!multiple) {
    return (
      <div role="group" aria-label={filter.label ?? 'この列で絞り込み'}>
        <button type="button" role="menuitemradio" aria-checked={selected.size === 0} className={MENU_ITEM_CLASS} onClick={() => { filter.onChange([]); onClose(); }}>
          <MenuCheck checked={selected.size === 0} />
          <span className="truncate">すべて</span>
        </button>
        {filter.options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="menuitemradio"
            aria-checked={selected.has(option.value)}
            className={MENU_ITEM_CLASS}
            title={option.hint}
            onClick={() => { filter.onChange([option.value]); onClose(); }}
          >
            <MenuCheck checked={selected.has(option.value)} />
            <span className="truncate">{option.label}</span>
          </button>
        ))}
      </div>
    );
  }
  return (
    <div role="group" aria-label={filter.label ?? 'この列で絞り込み'}>
      {filter.options.map((option) => {
        const checked = selected.has(option.value);
        return (
          <button
            key={option.value}
            type="button"
            role="menuitemcheckbox"
            aria-checked={checked}
            className={MENU_ITEM_CLASS}
            title={option.hint}
            onClick={() => {
              filter.onChange(checked
                ? filter.value.filter((v) => v !== option.value)
                : [...filter.value, option.value]);
            }}
          >
            <span
              className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border text-[9px] leading-none ${
                checked ? 'border-[var(--sb-accent-bg)] bg-[var(--sb-accent-bg)] text-[var(--accent-on)]' : 'border-gray-300 text-transparent'
              }`}
              aria-hidden
            >
              ✓
            </span>
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function BooleanFilterField({ filter, onClose }: { filter: ColumnBooleanFilterSpec; onClose: () => void }) {
  const choices: { value: boolean | null; label: string }[] = [
    { value: null, label: 'すべて' },
    { value: true, label: filter.trueLabel },
    ...(filter.falseLabel ? [{ value: false as boolean | null, label: filter.falseLabel }] : []),
  ];
  return (
    <div role="group" aria-label={filter.label ?? 'この列で絞り込み'}>
      {choices.map((choice) => (
        <button
          key={String(choice.value)}
          type="button"
          role="menuitemradio"
          aria-checked={filter.value === choice.value}
          className={MENU_ITEM_CLASS}
          onClick={() => { filter.onChange(choice.value); onClose(); }}
        >
          <MenuCheck checked={filter.value === choice.value} />
          <span className="truncate">{choice.label}</span>
        </button>
      ))}
    </div>
  );
}
