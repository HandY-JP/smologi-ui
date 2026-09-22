'use client';
// トップバー再設計（2026-09）: 道具バー（amazon-app の AmazonToolsSidebar のカプセル意匠を流用。
// 色は青系に置換）。通常時（variant="normal"）は上段左端に置く 42px の帯、畳み時
// （variant="compact"）は FloatingGlassDock が浮かべるガラスカプセルの中身として使う。
//
// 状態表現（2026-09-14 決定）: ループする光り物は禁止。
//   idle    = 何も出さない
//   progress= **アイコン自体が縦に往復**（2026-09-15 ユーザー決定でリング回転は廃止）。
//             進捗%が取れるときはボタン下辺に 2px の進捗バーを足す（円弧も廃止）。
//             進行中はボタンを押せなくする（disabled＋cursor:progress＋opacity .6）。
//   done    = アイコンが 400ms だけチェックに変わってポップし、その後は右上に青い点＋件数。
//             押すとダウンロード一覧などを開ける
//   failed  = アイコンが3回小さく横揺れし、右上に赤い点＋ツールチップ
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { overflowedBarItems, selectBarItemKeys, type TopToolPlacement } from '../lib/top-tool-placement';

export interface TopToolMenuItem {
  key: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /**
   * 一言説明（20文字前後）。帯の右端の「▾」で開く一覧パネル（ToolListPanel）でのみ出す。
   * ドロップダウン（ToolMenu）と吹き出しは従来どおり label だけ。
   */
  description?: string;
  /** 直前に区切り線を入れる（同じメニュー内で毛色の違う項目を分けるとき。先頭では無視）。 */
  separatorBefore?: boolean;
}

export interface TopToolItem {
  key: string;
  label: string;
  icon: ReactNode;
  /** menuItems が無いときのクリック動作。menuItems がある場合はクリックでメニューを開閉する
   *  （onClick は無視する。両方渡さないこと）。 */
  onClick?: () => void;
  /**
   * 渡すと単発クリックの代わりにドロップダウン（ポップオーバー）を開くボタンになる
   * （CSV▾／PDF▾ のような、複数の書き出し先を持つボタン向け）。
   * Escape・外側クリックで閉じる。`aria-haspopup="menu"` を持つ。
   */
  menuItems?: TopToolMenuItem[];
  /**
   * 一言説明（20文字前後）。帯の右端の「▾」で開く一覧パネル（ToolListPanel）でのみ出す。
   * 帯のボタン自体の吹き出し（ToolTooltip）は従来どおり label を出す。
   */
  description?: string;
  /**
   * 2026-09-22 ユーザー決定: 帯（カプセル）にワンクリックで出す道具は「新規（primary の ＋）」
   * 「一覧を最新にする」＋あと最大3個まで。それ以外は帯に出さず、右端の「▾」で開く一覧
   * パネルからだけ実行する。'list' を指定した道具は帯に描画しない（一覧には常に全部出る）。
   */
  placement?: TopToolPlacement;
  primary?: boolean;
  /**
   * ON/OFF のトグルボタン（商品マスタの「編集モード」）で、いま ON であることを示す。
   * アンバーで点灯し `aria-pressed` を持つ（primary との併用は想定しない）。
   */
  active?: boolean;
  disabled?: boolean;
  /** このボタンの前に区切り線を入れる（グループ分け）。 */
  separatorBefore?: boolean;
  status?: 'idle' | 'progress' | 'done' | 'failed';
  /** 非同期ジョブの進捗（0-100）。指定するとボタン下辺に 2px の進捗バーを出す。 */
  progressPercent?: number | null;
  /** 進行中アニメの種類。'paper'（PDF・印刷）は紙が上下する小さめの振れ幅にする。 */
  progressMotion?: 'default' | 'paper';
  /** status="done" のときの右上バッジに出す件数（例: CSVダウンロード件数）。 */
  doneCount?: number;
  /** status="failed" のときにツールチップへ出す理由。 */
  statusMessage?: string;
  /** disabled=true のときにツールチップへ出す理由（例:「出荷作業中でのみ利用できます」）。 */
  disabledReason?: string;
  /** status バッジ自体をクリックしたときの処理（ダウンロード一覧を開く等）。渡さなければボタン本体の onClick を使う。 */
  onStatusClick?: () => void;
}

const TOOL_TIP_MARGIN_PX = 8;
const TOOL_TIP_GAP_PX = 6;

/**
 * 道具バーのツールチップ（黒い吹き出し）。
 *
 * 2026-09-15 本番崩れ修正: 以前は CSS だけの absolute な吹き出しで、道具バーの祖先
 * （sticky なトップバー・第2行のグループチップ列）の重ね順に負けて裏に隠れていた。
 * ドロップダウン（ToolMenu）と同じく body へ createPortal し、position: fixed ＋ z-index 60
 * （浮遊カプセル 40・sticky 見出し 38 より上）でトリガーの実測位置から自前で配置する。
 * 画面端では左右 8px 以内に収める。
 */
function ToolTooltip({ text, triggerRef }: { text: string; triggerRef: React.RefObject<HTMLElement | null> }) {
  const tipRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      // 幅は描画後の実測（初回は画面外に置いてあるが、幅は確定している）。
      const half = (tipRef.current?.offsetWidth ?? 0) / 2;
      const center = rect.left + rect.width / 2;
      const left = Math.max(
        TOOL_TIP_MARGIN_PX + half,
        Math.min(center, window.innerWidth - TOOL_TIP_MARGIN_PX - half),
      );
      setPosition({ top: rect.bottom + TOOL_TIP_GAP_PX, left });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [triggerRef, text]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={tipRef}
      role="tooltip"
      className="sb-tool-tooltip"
      style={position ? { top: position.top, left: position.left } : { top: -9999, left: -9999, opacity: 0 }}
    >
      {text}
    </div>,
    document.body,
  );
}

const TOOL_MENU_WIDTH_PX = 208; // w-52
const TOOL_MENU_MARGIN_PX = 8;
const TOOL_MENU_GAP_PX = 6; // トリガーとの隙間（mt-1.5 相当）

// 本番崩れ修正（2026-09-14・Opus 実物レビュー）: 通常時は道具バー自身が sticky なトップバーの
// 中（z-30）にあり、absolute 配置のメニューは「下段（第2行）のグループ/絞り込みチップ列」や
// 一覧の sticky 見出し等、祖先の重ね順次第でその下に潜って先頭項目が隠れることがあった
// （CSV▾／PDF▾／アクション▾、道具バーのドロップダウンすべてで共通の部品のため
// 一括りに直す）。body へ createPortal し、position: fixed でトリガーの実測位置から自前で
// 配置することで、祖先の stacking context / overflow に一切影響されないようにする。
function ToolMenu({ items, onClose, triggerRef }: { items: TopToolMenuItem[]; onClose: () => void; triggerRef: React.RefObject<HTMLButtonElement | null> }) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const maxLeft = window.innerWidth - TOOL_MENU_WIDTH_PX - TOOL_MENU_MARGIN_PX;
      const left = Math.max(TOOL_MENU_MARGIN_PX, Math.min(rect.left, maxLeft));
      const top = rect.bottom + TOOL_MENU_GAP_PX;
      setPosition({ top, left });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [triggerRef]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      // トリガーボタン自身の mousedown は除外する（Opus レビュー指摘: 除外しないと、開いている間に
      // トリガーを再クリックしたとき「mousedownで一旦閉じる→click(トグル)で開き直す」が起きて
      // 再クリックで閉じられなくなる）。トリガー自身のクリックは ToolButton 側の onClick（トグル）に任せる。
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, triggerRef]);

  if (typeof document === 'undefined' || !position) return null;

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{ top: position.top, left: position.left, width: TOOL_MENU_WIDTH_PX }}
      className="fixed z-[60] flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xl"
    >
      {items.map((mi, i) => (
        <Fragment key={mi.key}>
          {mi.separatorBefore && i > 0 && <span className="my-1 block h-px bg-gray-100" aria-hidden />}
        <button
          type="button"
          role="menuitem"
          disabled={mi.disabled}
          onClick={() => { mi.onClick(); onClose(); }}
          className="flex items-center rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
        >
          {mi.label}
        </button>
        </Fragment>
      ))}
    </div>,
    document.body,
  );
}

const CheckIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4.5 4.5L19 7.5" />
  </svg>
);

const CaretDownIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
  </svg>
);

// ── 道具の一覧パネル（2026-09-22 ユーザー決定「案A」） ──────────────────────────
// 帯（42px のカプセル）はアイコンだけなので、初めて見た人には何のボタンか分からない。
// 帯の右端に小さな「▾」ハンドルを足し、押すと**全ツールが縦一覧**で開く。
// 各行は「アイコン ＋ 名前 ＋ 一言説明」。menuItems を持つ道具（CSV▾ など）は行の右端の「›」で
// その場にインライン展開する（同時に開くのは1つ）。
// 配置の作り方は ToolMenu と同じ（body へ createPortal＋position:fixed）。祖先の
// stacking context / overflow に潰されないようにするためで、理由は ToolMenu のコメント参照。

const TOOL_LIST_WIDTH_PX = 312;
const TOOL_LIST_MARGIN_PX = 8;
const TOOL_LIST_GAP_PX = 6;

/** 一覧パネルの1行（item 行と、展開したサブ項目の行）。キーボード移動のために平らに並べる。 */
type ToolListRow =
  | { kind: 'item'; key: string; item: TopToolItem; separator: boolean }
  | { kind: 'sub'; key: string; parent: TopToolItem; sub: TopToolMenuItem };

function buildToolListRows(items: TopToolItem[], expandedKey: string | null): ToolListRow[] {
  const rows: ToolListRow[] = [];
  items.forEach((item, i) => {
    rows.push({ kind: 'item', key: item.key, item, separator: !!item.separatorBefore && i > 0 });
    if (expandedKey !== item.key) return;
    for (const sub of item.menuItems ?? []) {
      rows.push({ kind: 'sub', key: `${item.key}/${sub.key}`, parent: item, sub });
    }
  });
  return rows;
}

/** 行の右端に出す状態（帯のバッジと同じ情報を、一覧では言葉で出す）。 */
function ToolListRowStatus({ item }: { item: TopToolItem }) {
  if (item.status === 'progress') {
    return <span className="flex-shrink-0 text-[11px] font-medium text-gray-400">処理中</span>;
  }
  if (item.status === 'done') {
    return (
      <span className="flex-shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
        {item.doneCount != null ? `${item.doneCount.toLocaleString()}件 できあがり` : 'できあがり'}
      </span>
    );
  }
  if (item.status === 'failed') {
    return (
      <span className="flex-shrink-0 text-[11px] font-medium text-red-600">
        {item.statusMessage ?? '失敗しました'}
      </span>
    );
  }
  return null;
}

function ToolListPanel({
  items,
  onClose,
  triggerRef,
}: {
  items: TopToolItem[];
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const rows = buildToolListRows(items, expandedKey);
  // 行の並びはサブ項目の展開・折りたたみで変わるので、ref の配列を持たずに、必要なときに
  // パネルの中の行ボタンを DOM から拾う（行番号と ref がずれる事故を作らない）。
  const rowButtons = () =>
    Array.from(panelRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
  const focusRow = (index: number) => {
    const buttons = rowButtons();
    if (buttons.length === 0) return;
    buttons[((index % buttons.length) + buttons.length) % buttons.length]?.focus();
  };

  useLayoutEffect(() => {
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      // ハンドル直下・左寄せ。右端からはみ出すときだけ左へ寄せ戻す（ToolMenu と同じ）。
      const maxLeft = window.innerWidth - TOOL_LIST_WIDTH_PX - TOOL_LIST_MARGIN_PX;
      const left = Math.max(TOOL_LIST_MARGIN_PX, Math.min(rect.left, maxLeft));
      setPosition({ top: rect.bottom + TOOL_LIST_GAP_PX, left });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [triggerRef]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      // ハンドル自身の mousedown は除外する（除外しないと再クリックで閉じられない。
      // 理由は ToolMenu の同じ箇所のコメント参照）。
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, triggerRef]);

  // 開いたら先頭行へフォーカス（閉じたときにハンドルへ戻すのは呼び出し側）。
  const positioned = position != null;
  useEffect(() => {
    if (!positioned) return;
    panelRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
  }, [positioned]);

  if (typeof document === 'undefined' || !position) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="menu"
      aria-label="道具の一覧"
      style={{ top: position.top, left: position.left, width: TOOL_LIST_WIDTH_PX }}
      className="fixed z-[60] flex max-h-[min(70vh,560px)] flex-col overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
      onKeyDown={(e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
        e.preventDefault();
        const buttons = rowButtons();
        const index = buttons.indexOf(e.target as HTMLButtonElement);
        if (e.key === 'ArrowDown') focusRow(index < 0 ? 0 : index + 1);
        else if (e.key === 'ArrowUp') focusRow(index < 0 ? -1 : index - 1);
        else if (e.key === 'Home') focusRow(0);
        else focusRow(buttons.length - 1);
      }}
    >
      {rows.map((row) => {
        if (row.kind === 'sub') {
          const { parent, sub } = row;
          return (
            <Fragment key={row.key}>
            {sub.separatorBefore && <span className="my-1 block h-px bg-gray-100" aria-hidden />}
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              aria-disabled={sub.disabled || undefined}
              onClick={() => { if (sub.disabled) return; sub.onClick(); onClose(); }}
              className={`flex w-full items-center gap-2.5 rounded-lg py-1.5 pl-9 pr-2.5 text-left transition-colors ${
                sub.disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none'
              }`}
            >
              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center text-gray-300 [&_svg]:h-4 [&_svg]:w-4" aria-hidden>
                {parent.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-gray-700">{sub.label}</span>
                {sub.description && (
                  <span className="mt-0.5 block text-[11px] leading-snug text-gray-400">{sub.description}</span>
                )}
              </span>
            </button>
            </Fragment>
          );
        }

        const { item } = row;
        const hasMenu = !!item.menuItems && item.menuItems.length > 0;
        const expanded = expandedKey === item.key;
        // 進行中は帯と同じく押せない（二重起動の防止）。
        const inert = !!item.disabled || item.status === 'progress';
        // 説明の位置には、使えないときは「使えない理由」を出す（帯の吹き出しと同じ文言）。
        const sub = inert && item.disabled && item.disabledReason ? item.disabledReason : item.description;
        return (
          <Fragment key={row.key}>
            {row.separator && <span className="my-1 block h-px bg-gray-100" aria-hidden />}
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              aria-disabled={inert || undefined}
              aria-expanded={hasMenu ? expanded : undefined}
              onClick={() => {
                if (inert) return;
                if (hasMenu) { setExpandedKey((cur) => (cur === item.key ? null : item.key)); return; }
                item.onClick?.();
                onClose();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                inert ? 'cursor-not-allowed opacity-45' : 'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none'
              }`}
            >
              <span
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center [&_svg]:h-5 [&_svg]:w-5 ${
                  item.primary ? 'text-blue-600' : item.active ? 'text-amber-500' : 'text-gray-400'
                }`}
                aria-hidden
              >
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-gray-800">{item.label}</span>
                {sub && <span className="mt-0.5 block text-xs leading-snug text-gray-500">{sub}</span>}
              </span>
              <ToolListRowStatus item={item} />
              {hasMenu && (
                <span
                  className={`flex-shrink-0 text-gray-400 transition-transform [&_svg]:h-4 [&_svg]:w-4 ${expanded ? 'rotate-180' : '-rotate-90'}`}
                  aria-hidden
                >
                  {CaretDownIcon}
                </span>
              )}
            </button>
          </Fragment>
        );
      })}
    </div>,
    document.body,
  );
}

function ToolButton({ item, variant }: { item: TopToolItem; variant: 'normal' | 'compact' }) {
  const btnClass = variant === 'normal' ? 'sb-tool-btn' : 'sb-glass-btn';
  const dot = item.status === 'done' || item.status === 'failed';
  const title = item.disabled && item.disabledReason
    ? item.disabledReason
    : item.status === 'failed' && item.statusMessage ? item.statusMessage : item.label;
  const hasMenu = !!item.menuItems && item.menuItems.length > 0;
  const [menuOpen, setMenuOpen] = useState(false);
  // ツールチップは「マウスを載せている間」か「キーボードのフォーカス（:focus-visible）中」だけ。
  // クリックでフォーカスが残っただけの状態では出さない（本番スクショで CSV と PDF の吹き出しが
  // 同時に出ていた原因。:focus-visible は環境によってはクリック後のフォーカス復帰でも
  // 一致するため、CSS の :focus-visible 任せをやめて明示的に制御する）。
  const [hovering, setHovering] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  // 完了の瞬間だけアイコンをチェックに差し替える（400ms）。status が 'done' に**変わった**
  // ときだけ動かす（'done' のまま留まる間ずっとチェックにはしない）。
  const [showCheck, setShowCheck] = useState(false);
  const prevStatusRef = useRef(item.status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = item.status;
    if (item.status !== 'done' || prev === 'done') return;
    setShowCheck(true);
    const id = window.setTimeout(() => setShowCheck(false), 400);
    return () => window.clearTimeout(id);
  }, [item.status]);
  // ホバー判定は（disabled なボタンがマウスイベントを発火しないので）外側の箱で受ける。
  // 「利用できない理由」のツールチップは disabled のときこそ出す必要がある。
  return (
    <div
      className="relative flex items-center"
      onPointerEnter={(e) => { if (e.pointerType !== 'touch') setHovering(true); }}
      onPointerLeave={() => setHovering(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={hasMenu ? () => setMenuOpen((v) => !v) : item.onClick}
        // 進行中は押せない（二重起動の防止も兼ねる。呼び出し側が disabled を立てていなくても）。
        disabled={item.disabled || item.status === 'progress'}
        aria-busy={item.status === 'progress' ? true : undefined}
        onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) setKeyboardFocus(true); }}
        onBlur={() => setKeyboardFocus(false)}
        aria-label={item.label}
        aria-pressed={item.active != null ? item.active : undefined}
        aria-haspopup={hasMenu ? 'menu' : undefined}
        aria-expanded={hasMenu ? menuOpen : undefined}
        className={`${btnClass}${item.primary ? ' primary' : ''}${item.active ? ' is-active' : ''}${item.status === 'progress' ? ' is-progress' : ''}${item.progressMotion === 'paper' ? ' paper' : ''}${item.status === 'failed' ? ' is-failed' : ''}`}
      >
        <span className={`sb-tool-icon${showCheck ? ' is-check' : ''}`}>{showCheck ? CheckIcon : item.icon}</span>
        {item.status === 'progress' && item.progressPercent != null && (
          <span className="sb-tool-progress" aria-hidden>
            <i style={{ width: `${Math.max(0, Math.min(100, item.progressPercent))}%` }} />
          </span>
        )}
        {dot && (
          <span
            role={item.onStatusClick ? 'button' : undefined}
            onClick={item.onStatusClick ? (e) => { e.stopPropagation(); item.onStatusClick?.(); } : undefined}
            className={`sb-tool-dot ${item.status}`}
            key={item.status === 'done' ? `done-${item.doneCount ?? 0}` : item.status}
            aria-label={item.status === 'done' ? `完了（${item.doneCount ?? 0}件）` : '失敗しました'}
          >
            {item.status === 'done' ? (item.doneCount != null ? Math.min(99, item.doneCount) : '') : '!'}
          </span>
        )}
      </button>
      {/* メニューを開いている間は吹き出しを出さない（メニューと重なるため）。
          畳み時（compact＝浮遊カプセル内）も同じ吹き出しを使う。 */}
      {(hovering || keyboardFocus) && !menuOpen && <ToolTooltip text={title} triggerRef={triggerRef} />}
      {hasMenu && menuOpen && (
        <ToolMenu items={item.menuItems!} onClose={() => setMenuOpen(false)} triggerRef={triggerRef} />
      )}
    </div>
  );
}

/**
 * 帯の右端の「▾」ハンドル。押すと全ツールの縦一覧（ToolListPanel）が開く。
 * アイコンだけの帯では何のボタンか分からないので、名前と一言説明を読める場所を必ず1つ用意する。
 */
function ToolListHandle({
  items,
  variant,
  hiddenStatus,
}: {
  items: TopToolItem[];
  variant: 'normal' | 'compact';
  /** 帯に出ていない道具の done/failed をまとめたもの（ハンドル右上の点で知らせる）。 */
  hiddenStatus: { status: 'done' | 'failed'; count: number } | null;
}) {
  const btnClass = variant === 'normal' ? 'sb-tool-btn' : 'sb-glass-btn';
  const [open, setOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const close = () => {
    setOpen(false);
    // 閉じたらハンドルへフォーカスを戻す（キーボード操作で行き場を失わないように）。
    triggerRef.current?.focus();
  };

  const handleLabel = hiddenStatus?.status === 'failed'
    ? '道具の一覧を開く（失敗したものがあります）'
    : hiddenStatus?.status === 'done'
      ? `道具の一覧を開く（${hiddenStatus.count.toLocaleString()}件 できあがり）`
      : '道具の一覧を開く';

  return (
    <div
      className="relative flex items-center"
      onPointerEnter={(e) => { if (e.pointerType !== 'touch') setHovering(true); }}
      onPointerLeave={() => setHovering(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) setKeyboardFocus(true); }}
        onBlur={() => setKeyboardFocus(false)}
        aria-label={handleLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${btnClass} sb-tool-caret`}
      >
        <span className="sb-tool-icon">{CaretDownIcon}</span>
        {/* 帯から外した道具の「できあがり／失敗」は帯では見えないので、ハンドル自身に点で出す。
            押せば一覧が開き、その行に状態ピル（N件 できあがり 等）が出る。 */}
        {hiddenStatus && (
          <span
            className={`sb-tool-dot ${hiddenStatus.status}`}
            key={hiddenStatus.status === 'done' ? `done-${hiddenStatus.count}` : 'failed'}
            aria-hidden
          >
            {hiddenStatus.status === 'done' ? (hiddenStatus.count > 0 ? Math.min(99, hiddenStatus.count) : '') : '!'}
          </span>
        )}
      </button>
      {(hovering || keyboardFocus) && !open && <ToolTooltip text={handleLabel} triggerRef={triggerRef} />}
      {open && <ToolListPanel items={items} onClose={close} triggerRef={triggerRef} />}
    </div>
  );
}

/** 帯に出す道具の既定の上限（新規＋更新＋3）。規則の実体は src/lib/top-tool-placement.ts。 */
const DEFAULT_MAX_BAR_ITEMS = 5;

export function TopToolCapsule({
  ariaLabel,
  items,
  variant = 'normal',
  dataTour,
  listPanel = true,
  maxBarItems = DEFAULT_MAX_BAR_ITEMS,
}: {
  ariaLabel: string;
  items: TopToolItem[];
  variant?: 'normal' | 'compact';
  dataTour?: string;
  /** 帯の右端に「▾」（全ツールの縦一覧）を出すか。既定 true。 */
  listPanel?: boolean;
  /** 帯に出す道具の上限。既定 5（新規＋更新＋3）。超えた分は一覧パネルのみへ回す。 */
  maxBarItems?: number;
}) {
  const capsuleClass = variant === 'normal' ? 'sb-tool-capsule' : 'sb-glass';
  const railClass = variant === 'normal' ? 'sb-tool-rail' : 'sb-glass-tools';
  const sepClass = variant === 'normal' ? 'sb-tool-sep' : 'sb-glass-sep';
  const showListPanel = listPanel && items.length > 0;
  // 一覧パネルを出せないときまで道具を隠すと実行できなくなるので、そのときだけ上限を外す。
  const barKeys = selectBarItemKeys(items, showListPanel ? maxBarItems : Number.POSITIVE_INFINITY);
  const barItems = showListPanel ? items.filter((item) => barKeys.has(item.key)) : items;
  // 帯に出ていない道具の done/failed は帯では見えないので、ハンドルの点でまとめて知らせる。
  const hiddenItems = items.filter((item) => !barKeys.has(item.key));
  const hiddenFailed = hiddenItems.some((item) => item.status === 'failed');
  const hiddenDoneCount = hiddenItems
    .filter((item) => item.status === 'done')
    .reduce((sum, item) => sum + (item.doneCount ?? 0), 0);
  const hiddenDone = hiddenItems.some((item) => item.status === 'done');
  const hiddenStatus: { status: 'done' | 'failed'; count: number } | null = hiddenFailed
    ? { status: 'failed', count: 0 }
    : hiddenDone ? { status: 'done', count: hiddenDoneCount } : null;

  // 開発時だけ、帯からあふれた道具を知らせる（並びを決め直す合図。1回だけ）。
  const warnedRef = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || warnedRef.current) return;
    const overflow = overflowedBarItems(items, barKeys);
    if (overflow.length === 0) return;
    warnedRef.current = true;
    console.warn(
      `[TopToolCapsule] ${ariaLabel}: 帯の上限（${maxBarItems}）を超えたため ${overflow.map((item) => item.key).join(', ')} を一覧のみにしました。placement: 'list' を明示してください。`,
    );
  });

  return (
    <nav aria-label={ariaLabel} data-tour={dataTour} role="toolbar" className={capsuleClass}>
      <div className={railClass}>
        {barItems.map((item, i) => (
          <span key={item.key} className="flex items-center">
            {(item.separatorBefore && i > 0) && <span className={sepClass} aria-hidden />}
            <ToolButton item={item} variant={variant} />
          </span>
        ))}
        {showListPanel && (
          <>
            {barItems.length > 0 && <span className={sepClass} aria-hidden />}
            <ToolListHandle items={items} variant={variant} hiddenStatus={hiddenStatus} />
          </>
        )}
      </div>
    </nav>
  );
}
