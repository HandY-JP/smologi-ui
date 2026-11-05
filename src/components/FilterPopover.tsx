'use client';
// 全画面共通の「絞り込み」ポップオーバー。
//
// これまでは入荷(admin/customer)・セット商品・発注(customer)・返品・棚ボード・商品ピッカー・
// 出荷（ShipmentFilterMenu）がまったく同じマークアップを手書きで持っていた（トリガーの
// クラス文字列がバイト単位で一致していた）。見た目のズレ・押しにくさ・チップ表示の有無が
// 画面ごとに散らばるため、ここに集約する。
//
// 統一ルール（変更するときはこの3つを崩さないこと）:
//  1. トリガーは min-w-7rem のピル。適用中はアクセント色＋左肩に件数バッジ
//     （例外は畳んだ検索バーの中だけ。CollapsedFilterTriggerProvider が効いている間は
//      枠なしのじょうごアイコン＋適用中ドットになる）
//  2. 「すべてクリア」はパネル右上に固定（本文の中に混ぜない）
//  3. activeCount には検索語も数える（検索バーとポップオーバーで件数が食い違わないように）
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { filterDateRangeError } from '../lib/filter-controls';
import { useDismiss } from './Modal';

// ------------------------------------------------------------
// 適用中チップ
// ------------------------------------------------------------

export interface FilterChip {
  key: string;
  /** 条件名（「依頼種別」など） */
  label: string;
  /** 選択値（「FBA」など） */
  valueLabel: string;
  onClear: () => void;
}

/**
 * 適用中の絞り込みをツールバーに常時表示するチップ（×で個別解除）。
 * ポップオーバーを開かないと条件が見えない問題への対処。未適用なら何も描画しない。
 */
export function ActiveFilterChips({
  chips,
  onClearAll,
}: {
  chips: FilterChip[];
  onClearAll?: () => void;
}) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--sb-accent-bg)]/40 bg-[var(--sb-accent-bg)]/5 py-0.5 pl-2.5 pr-1 text-[12px] leading-[18px] text-[var(--sb-accent-bg)]"
        >
          <span className="text-[rgb(var(--ink-muted))]">{chip.label}:</span>
          <span className="font-medium">{chip.valueLabel}</span>
          <button
            type="button"
            onClick={chip.onClear}
            className="ml-0.5 rounded-full p-0.5 hover:bg-[var(--sb-accent-bg)]/10"
            aria-label={`${chip.label}の絞り込みを解除`}
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      {chips.length > 1 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-[12px] leading-[18px] text-[rgb(var(--ink-muted))] underline-offset-2 hover:text-[rgb(var(--ink))] hover:underline"
        >
          すべて解除
        </button>
      )}
    </div>
  );
}

/**
 * チップの掲示先（DOMノード）。SearchFilterBar が検索バーの下段に用意する。
 * FilterPopover はここへ portal して、画面側が何も書かなくてもチップが出るようにする。
 * ホストが無い場所（モーダル内の簡易フィルタなど）ではチップを出さない。
 */
const FilterChipsHostContext = createContext<HTMLElement | null>(null);

export function FilterChipsHostProvider({ host, children }: { host: HTMLElement | null; children: ReactNode }) {
  return <FilterChipsHostContext.Provider value={host}>{children}</FilterChipsHostContext.Provider>;
}

/**
 * 検索バーが畳まれている（枠なしの素のアイコンだけ）かどうか。SearchFilterBar が配る。
 * true のとき絞り込みトリガーは「じょうごアイコンだけ」になり、適用中は赤いドットで示す。
 * 検索バーの外で使う FilterTriggerButton（商品ピッカーなど）は既定 false のまま＝従来のピル。
 */
const CollapsedFilterTriggerContext = createContext(false);

export function CollapsedFilterTriggerProvider({ collapsed, children }: { collapsed: boolean; children: ReactNode }) {
  return <CollapsedFilterTriggerContext.Provider value={collapsed}>{children}</CollapsedFilterTriggerContext.Provider>;
}

// ------------------------------------------------------------
// ポップオーバー本体
// ------------------------------------------------------------

export interface FilterPopoverTabs {
  items: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
}

/**
 * 「絞り込み」トリガーのピル。FilterPopover が使うほか、パネルを自前で持つ画面
 * （商品ピッカーのインライン詳細パネルなど）からも同じ見た目で使えるように公開する。
 * 畳んだ検索バーの中では、ピルではなく枠なしのじょうごアイコンになる。
 */
export function FilterTriggerButton({
  label = '絞り込み',
  activeCount,
  open,
  onToggle,
  title,
  ariaControls,
  iconBadge = 'dot',
}: {
  label?: string;
  activeCount: number;
  open: boolean;
  onToggle: () => void;
  title?: string;
  ariaControls?: string;
  /**
   * 畳んだ検索バーの中（じょうごアイコンだけ）での適用中の示し方。既定は従来どおり赤いドット。
   * 'count' は件数バッジ（作成モーダルの商品検索など、条件が多く件数を見せたい所だけ）。
   */
  iconBadge?: 'dot' | 'count';
}) {
  const iconOnly = useContext(CollapsedFilterTriggerContext);
  const triggerTitle = title ?? (activeCount > 0 ? `${label}（${activeCount}件の条件を指定中）` : label);
  const triggerAriaLabel = activeCount > 0 ? `${label}、${activeCount}件の条件を指定中` : label;

  // 畳んだ検索バーの中では、枠なしのじょうごアイコンだけにする（文字も∨も出さない）。
  // 何かで絞り込まれている間だけ、右上に赤いドットを重ねて「絞り込み中」を示す
  // （サイドバーの新着ドットと同系の色。件数はパネルを開けば分かるので出さない）。
  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={ariaControls}
        title={triggerTitle}
        aria-label={triggerAriaLabel}
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--search-accent)] ${
          activeCount > 0 || open
            ? 'text-[var(--search-accent)] hover:bg-[var(--search-accent-light)]'
            : 'text-[rgb(var(--ink-muted))] hover:bg-[rgb(var(--surface-subtle))] hover:text-[rgb(var(--ink))]'
        }`}
      >
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
          />
        </svg>
        {activeCount > 0 && iconBadge === 'count' && (
          <span
            className="pointer-events-none absolute -right-0.5 -top-0.5 min-w-[1.125rem] rounded-full bg-[var(--search-accent)] px-1 text-center text-[11px] font-semibold leading-[1.125rem] text-[rgb(var(--on-accent))] ring-2 ring-[rgb(var(--surface))]"
            aria-hidden
          >
            {activeCount}
          </span>
        )}
        {activeCount > 0 && iconBadge === 'dot' && (
          <span
            className="pointer-events-none absolute right-1 top-1 h-2 w-2 rounded-full bg-[rgb(var(--danger-solid))] ring-2 ring-white"
            aria-hidden
          />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={ariaControls}
      title={triggerTitle}
      aria-label={triggerAriaLabel}
      className={`relative mr-1.5 flex h-8 min-w-[7rem] items-center justify-center rounded-full px-7 text-[12px] font-semibold leading-none transition-colors ${
        activeCount > 0 || open
          ? 'bg-[var(--search-accent-light)] text-[var(--search-accent)]'
          : 'text-[rgb(var(--ink-muted))] hover:bg-[rgb(var(--surface-subtle))] hover:text-[rgb(var(--ink))]'
      }`}
    >
      {label}
      {activeCount > 0 && (
        <span className="absolute left-2 rounded-full bg-[var(--search-accent)] px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
          {activeCount}
        </span>
      )}
      <svg
        className={`absolute right-2.5 h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

export function FilterPopover({
  activeCount,
  onClearAll,
  chips = [],
  children,
  footer,
  tabs,
  title = '絞り込み条件',
  description,
  triggerLabel = '絞り込み',
  panelWidthClass,
  columns = 1,
  align = 'right',
  triggerTitle,
  panelPortal = false,
  triggerBadge = 'dot',
}: {
  /** 適用中の条件数（検索語も含めること） */
  activeCount: number;
  onClearAll?: () => void;
  /** 適用中チップ。SearchFilterBar 配下なら検索バーの下段へ自動で出る */
  chips?: FilterChip[];
  children: ReactNode;
  /** パネル下部の操作（「初期表示に保存」など） */
  footer?: ReactNode;
  /** パネル内タブ（出荷一覧の 絞り込み / 表示設定） */
  tabs?: FilterPopoverTabs;
  title?: string;
  description?: string;
  triggerLabel?: string;
  /** 幅を明示的に指定するとき用（未指定なら columns から決める）。 */
  panelWidthClass?: string;
  /**
   * 本文のレイアウト。既定は 1（従来どおり縦積み・幅 w-80）。
   * 条件が多い画面（出荷一覧の絞り込みタブなど）だけ 2 を指定すると、
   * 幅 w-[44rem] の2列グリッドになる（FilterField の span・FilterDateRange の
   * sm:col-span-2 はこのときだけ意味を持つ）。単一のラッパー子を渡す画面
   * （返品の商品ピッカー・NE商品登録など）で 2 を指定すると中身が半幅に潰れるので使わないこと。
   */
  columns?: 1 | 2;
  align?: 'left' | 'right';
  triggerTitle?: string;
  /**
   * パネルを body へ portal して fixed 配置する。
   * テーブルのヘッダーセルのように overflow（overflow-x-auto など）で切られる場所に
   * トリガーを置くとき用。既定は false ＝従来どおりトリガーの直下に absolute 配置。
   */
  panelPortal?: boolean;
  /** 畳んだ検索バーの中での適用中の示し方（FilterTriggerButton の iconBadge）。 */
  triggerBadge?: 'dot' | 'count';
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  // portal したパネルの DOM（外側クリック判定用。useDismiss は RefObject で受ける）。
  const panelRef = useRef<HTMLDivElement | null>(null);
  // portal したパネルの DOM。実寸（幅）を測って画面内へクランプするので ref ではなく state で受ける
  // （マウントで effect を再実行させ、初回描画のペイント前に測り直すため）。
  const [panelNode, setPanelNode] = useState<HTMLDivElement | null>(null);
  const chipsHost = useContext(FilterChipsHostContext);
  // portal 時のパネル位置。left/top は実測でビューポート内へ収め、maxHeight で内部スクロールにする。
  const [panelPosition, setPanelPosition] =
    useState<{ top: number; left: number; maxHeight: number } | null>(null);

  // ★ 画面外へ出さないこと（出荷一覧のじょうごを押すとパネルが画面右へ消えた不具合の再発防止）:
  //   トリガーは表のヘッダー右端に置かれることが多く、align='left' のまま素直に
  //   left = trigger.left とするとパネル幅（w-80=320px 等）がそのまま画面右へはみ出す。
  //   高さも同様に、条件が多い画面（出荷）ではビューポートを超える。
  //   → 実測した幅・高さでクランプし、収まらない分はパネル内スクロールにする。
  useLayoutEffect(() => {
    if (!open || !panelPortal) return;
    const MARGIN = 8;
    const update = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      // スクロールバーを除いた実際の表示幅（window.innerWidth だとバーの分だけ右へずれる）。
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
      // トリガーの直下。トリガー自体が画面下端に近いときも、最低限の高さは残す。
      const top = Math.max(MARGIN, Math.min(rect.bottom + MARGIN, viewportHeight - 160));
      const maxHeight = Math.max(160, viewportHeight - top - MARGIN);
      // パネルが未マウントの1パス目は幅が測れない。寄せ方向だけで仮置きし、
      // マウント直後（panelNode 変化）にこの effect が再実行されてペイント前に補正される。
      const width = panelNode?.offsetWidth ?? 0;
      const preferred = align === 'right' && width > 0 ? rect.right - width : rect.left;
      const left = width > 0
        ? Math.min(Math.max(MARGIN, preferred), Math.max(MARGIN, viewportWidth - width - MARGIN))
        : Math.max(MARGIN, preferred);
      // 位置が変わっていないフレームでは再描画しない。
      setPanelPosition((prev) =>
        prev && prev.top === top && prev.left === left && prev.maxHeight === maxHeight
          ? prev
          : { top, left, maxHeight });
    };
    update();
    // 開いた直後に周りが動くことがある（検索欄の開閉アニメーションなど）。
    // 数フレームだけ測り直して、トリガーの直下に貼り付いたままにする。
    const startedAt = Date.now();
    let frame = requestAnimationFrame(function follow() {
      update();
      if (Date.now() - startedAt < 400) frame = requestAnimationFrame(follow);
    });
    window.addEventListener('resize', update);
    // 表の横スクロールやページスクロールで置いていかれないように capture で拾う。
    window.addEventListener('scroll', update, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, panelPortal, align, panelNode]);

  // 外側クリック（検索欄を含むパネルの外のどこでも）と Escape で閉じる。共通の useDismiss を使う:
  //  - Escape はモーダルと同じスタックに積まれる＝作成モーダルの中で押してもポップオーバーだけが閉じる
  //    （以前は document の bubble で待っていたため、先にモーダルが Escape を握りつぶして
  //     モーダルごと閉じていた）。
  //  - mousedown は capture で拾う（モーダルのパネルが onMouseDown で伝播を止めても取りこぼさない）。
  //  - 内側＝トリガー（rootRef）と portal したパネル。パネル内の選択肢・ドロップダウンの操作では閉じない。
  // 閉じたらフォーカスをじょうご（トリガー）へ戻す。外側の入力欄などを押した場合は、この後の
  // mousedown の既定動作でフォーカスがそちらへ移るので横取りにはならない。
  const dismiss = () => {
    setOpen(false);
    rootRef.current?.querySelector<HTMLButtonElement>('button[aria-expanded]')?.focus({ preventScroll: true });
  };
  useDismiss(panelPortal ? panelRef : rootRef, dismiss, { enabled: open, ignore: rootRef });

  const clearDisabled = !onClearAll || activeCount === 0;

  const panelBody = (
    <>
      {tabs && (
        <div className="mb-3 flex gap-1 rounded-lg bg-[rgb(var(--surface-subtle))] p-1">
          {tabs.items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => tabs.onChange(item.key)}
              className={`flex-1 rounded-md px-3 py-1.5 text-[14px] leading-[22px] font-medium ${
                tabs.active === item.key ? 'bg-[rgb(var(--surface))] text-[var(--sb-accent-bg)] shadow-sm' : 'text-[rgb(var(--ink-muted))]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[14px] leading-[22px] font-semibold text-[rgb(var(--ink))]">{title}</span>
          {description && <p className="mt-0.5 text-[12px] leading-[18px] text-[rgb(var(--ink-muted))]">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onClearAll}
          disabled={clearDisabled}
          className="shrink-0 text-[12px] leading-[18px] text-[rgb(var(--ink-muted))] hover:text-[rgb(var(--ink))] disabled:opacity-40"
        >
          すべてクリア
        </button>
      </div>

      <div className={columns === 2 ? 'mt-3 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2' : 'mt-3 space-y-3'}>
        {children}
      </div>

      {footer && <div className="mt-3 flex justify-end border-t border-[rgb(var(--line))] pt-3">{footer}</div>}
    </>
  );
  // 幅は columns から決める（呼び出し側の panelWidthClass 指定があればそちらを優先）。
  const resolvedWidthClass = panelWidthClass ?? (columns === 2 ? 'w-[44rem]' : 'w-80');
  // overscroll-contain: パネル内を末端まで送ってもページ側がスクロールしない（一覧が動いてしまうのを防ぐ）。
  const panelClass = `${resolvedWidthClass} max-w-[calc(100vw-3rem)] overflow-y-auto overscroll-contain rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-4 shadow-xl`;

  return (
    <div
      ref={rootRef}
      className={`${open ? 'relative z-50' : 'relative'} flex h-full shrink-0 items-center`}
    >
      <FilterTriggerButton
        label={triggerLabel}
        activeCount={activeCount}
        open={open}
        // 位置は開くたびに測り直す（前回の位置で一瞬出るのを防ぐ）。
        onToggle={() => { setPanelPosition(null); setOpen((value) => !value); }}
        title={triggerTitle}
        iconBadge={triggerBadge}
      />

      {/* 非 portal（トップバーのピル内など）は absolute のまま。ただし条件が多い画面では
          パネルが縦に画面を突き抜けるので、こちらもビューポート基準で頭打ちにして内部スクロールにする。 */}
      {open && !panelPortal && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full z-30 mt-2 ${panelClass}`}
          style={{ maxHeight: 'calc(100vh - 8rem)' }}
        >
          {panelBody}
        </div>
      )}

      {open && panelPortal && panelPosition && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={(node) => { panelRef.current = node; setPanelNode(node); }}
              // モーダル（z-90）より下・画面内の粘着ヘッダーより上。
              className={`fixed z-[80] ${panelClass}`}
              style={{ top: panelPosition.top, left: panelPosition.left, maxHeight: panelPosition.maxHeight }}
            >
              {panelBody}
            </div>,
            document.body,
          )
        : null}

      {chipsHost && chips.length > 0
        ? createPortal(<ActiveFilterChips chips={chips} onClearAll={onClearAll} />, chipsHost)
        : null}
    </div>
  );
}

// ------------------------------------------------------------
// パネル内の共通フィールド
// ------------------------------------------------------------

/**
 * パネル内の見出し付きグループ（「基本」「在庫・保管」など）。
 *
 * 既定は従来どおり「見出し＋縦積み」。条件が多い画面（商品マスタ）だけが
 * active（見出し横の「適用中」ドット）と columns={2}（区画の中を2列に）を使う。
 * 既定値は変えないこと＝入荷・出荷・NE商品登録の見た目は据え置き。
 */
export function FilterSection({
  title,
  first = false,
  active = false,
  columns = 1,
  children,
}: {
  title: string;
  /** 先頭セクションは上罫線を引かない */
  first?: boolean;
  /** この区画に適用中の条件があるとき true。見出しの右に小さな青い点を出す。 */
  active?: boolean;
  /**
   * 区画の中身のレイアウト。1（既定）は従来どおり縦積み。
   * 2 は「入るだけ2列・狭ければ1列」の自動折返しグリッド（auto-fit）。
   * ビューポートの sm: ではなく**パネルの実寸**で折り返すので、
   * サイドバーで狭くなった管理画面でも中身が潰れない。全幅にしたい項目は
   * 子側に col-span-full を付ける。
   */
  columns?: 1 | 2;
  children: ReactNode;
}) {
  return (
    <section className={first ? '' : 'border-t border-[rgb(var(--line))] pt-3'}>
      <h3 className="mb-2 flex items-center gap-1.5 text-[11px] leading-[16px] font-semibold tracking-wide text-[rgb(var(--ink-muted))]">
        <span>{title}</span>
        {active && (
          <>
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--search-accent)]"
              aria-hidden
            />
            <span className="sr-only">適用中の条件があります</span>
          </>
        )}
      </h3>
      <div
        className={
          columns === 2
            ? 'grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] items-start gap-x-4 gap-y-3'
            : 'space-y-3'
        }
      >
        {children}
      </div>
    </section>
  );
}

/**
 * ON/OFF のチップ（押すと塗り）。複数同時に押せる条件（「バーコードあり」「画像なし」など）を
 * 1行に並べて、ラベル＋セレクトの縦積みより縦を詰めるための部品。
 * 排他の2〜3択は従来どおりセグメント（ピル）を使うこと。
 */
export function FilterChipToggle({
  label,
  pressed,
  onToggle,
  title,
}: {
  label: string;
  pressed: boolean;
  onToggle: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={pressed}
      title={title}
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] leading-[18px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--search-accent)] ${
        pressed
          ? 'border-[var(--search-accent)] bg-[var(--search-accent)] text-white shadow-sm'
          : 'border-[rgb(var(--line))] bg-[rgb(var(--surface))] text-[rgb(var(--ink-muted))] hover:border-[rgb(var(--line-strong))] hover:bg-[rgb(var(--surface-subtle))] hover:text-[rgb(var(--ink))]'
      }`}
    >
      {label}
    </button>
  );
}

/** FilterChipToggle を並べる行（任意の見出し付き）。 */
export function FilterChipGroup({
  label,
  children,
  ariaLabel,
}: {
  label?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <div>
      {label && <div className="mb-1.5 text-[12px] leading-[18px] font-medium text-[rgb(var(--ink-muted))]">{label}</div>}
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={ariaLabel ?? label}>
        {children}
      </div>
    </div>
  );
}

/** ラベル＋任意のコントロール（SearchableSelect などを差し込む）。 */
export function FilterField({
  label,
  hint,
  children,
  span = 1,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  /** パネルが2列のとき、幅の要る項目（チェックボックス群・検索欄など）は 2 を指定して全幅にする。 */
  span?: 1 | 2;
}) {
  return (
    <div className={span === 2 ? 'sm:col-span-2' : undefined}>
      <span className="mb-1 block text-[12px] leading-[18px] text-[rgb(var(--ink-muted))]">{label}</span>
      {children}
      {hint && <p className="mt-1 text-[11px] leading-[16px] text-[rgb(var(--ink-muted))]">{hint}</p>}
    </div>
  );
}

const FILTER_INPUT_CLASS =
  'w-full rounded-md border border-[rgb(var(--line-strong))] bg-[rgb(var(--surface))] px-2 py-2 text-[14px] leading-[22px] text-[rgb(var(--ink))] focus:outline-none focus:ring-1 focus:ring-[var(--sb-accent-bg)]';

/** パネル内の共通 <select>（ラベル付き）。 */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] leading-[18px] text-[rgb(var(--ink-muted))]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={FILTER_INPUT_CLASS}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

/** パネル内の共通チェックボックス（「CSV未出力のみ」など）。 */
export function FilterCheckbox({
  label,
  checked,
  onChange,
  tone = 'accent',
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tone?: 'accent' | 'rose' | 'gray';
}) {
  const toneClass =
    tone === 'rose'
      ? 'text-[rgb(var(--danger-ink))] focus:ring-[rgb(var(--danger-solid))]'
      : tone === 'gray'
        ? 'text-[rgb(var(--ink-muted))] focus:ring-gray-500'
        : 'text-[var(--sb-accent-bg)] focus:ring-[var(--sb-accent-bg)]';
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[12px] leading-[18px] text-[rgb(var(--ink))]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className={`h-4 w-4 rounded border-[rgb(var(--line-strong))] ${toneClass}`}
      />
      {label}
    </label>
  );
}

/**
 * 期間フィルタ（開始日／終了日）。from > to のときはその場でエラーを出す
 * （商品マスタだけが持っていた検証を全画面へ引き上げたもの）。
 */
export function FilterDateRange({
  label,
  from,
  to,
  onChangeFrom,
  onChangeTo,
  fromLabel = '開始日',
  toLabel = '終了日',
}: {
  /** 「入荷予定日の期間」など。省略時は見出しなし */
  label?: string;
  from: string;
  to: string;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
  fromLabel?: string;
  toLabel?: string;
}) {
  const error = filterDateRangeError(from, to);
  return (
    <div className="sm:col-span-2">
      {label && <p className="mb-1 text-[12px] leading-[18px] font-semibold text-[rgb(var(--ink-muted))]">{label}</p>}
      <div className="grid grid-cols-2 gap-2">
        <label>
          <span className="mb-1 block text-[12px] leading-[18px] text-[rgb(var(--ink-muted))]">{fromLabel}</span>
          <input
            type="date"
            value={from}
            onChange={(event) => onChangeFrom(event.target.value)}
            aria-label={label ? `${label}の${fromLabel}` : fromLabel}
            aria-invalid={error ? true : undefined}
            className={FILTER_INPUT_CLASS}
          />
        </label>
        <label>
          <span className="mb-1 block text-[12px] leading-[18px] text-[rgb(var(--ink-muted))]">{toLabel}</span>
          <input
            type="date"
            value={to}
            onChange={(event) => onChangeTo(event.target.value)}
            aria-label={label ? `${label}の${toLabel}` : toLabel}
            aria-invalid={error ? true : undefined}
            className={FILTER_INPUT_CLASS}
          />
        </label>
      </div>
      {error && <p className="mt-1 text-[12px] leading-[18px] text-[rgb(var(--danger-ink))]">{error}</p>}
    </div>
  );
}
