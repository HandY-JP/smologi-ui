'use client';
/**
 * 一覧セルの近傍に開く軽いポップオーバー。
 *
 * モーダルほど大げさにしたくないが、セル内に収まらない内訳を見せたい場面
 * （商品マスタ一覧の「在庫」＝利用可能／在庫合計／引当済／入荷予定／ケース換算、
 * 「原価」＝税抜／税込／改定予定／コピー）のために用意した共通部品。
 *
 * 表は overflow-x-auto の中にあり、td にも overflow-hidden が掛かっているため、
 * セル内の absolute 配置では切れてしまう。そこで body へ portal し、トリガーの
 * 画面座標から fixed で配置する（スクロール・リサイズで追従）。
 *
 * 同時に開くのは1つだけ。React の props を経由すると一覧の列定義（useMemo）が
 * 開閉のたびに作り直されてしまうので、開いているキーはモジュール内の小さなストアで持つ。
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

let openKey: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function setOpenKey(key: string | null) {
  if (openKey === key) return;
  openKey = key;
  emit();
}

/** 開いているポップオーバーを閉じる（モーダルを開く前などに呼ぶ）。 */
export function closeCellPopover() {
  setOpenKey(null);
}

function useIsOpen(key: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => openKey === key,
    () => false,
  );
}

const PANEL_GAP = 6;
const VIEWPORT_MARGIN = 8;

interface PanelPosition {
  top: number;
  left: number;
}

/**
 * トリガー（セルの中身）とパネル（内訳）をまとめて描画する。
 * トリガーは素の <button> なので Enter / Space での開閉とフォーカスリングは標準どおり。
 */
export function CellPopover({
  popoverKey,
  ariaLabel,
  title,
  panelLabel,
  panelWidth = 232,
  align = 'right',
  triggerClassName,
  children,
  panel,
}: {
  /** 同時に1つしか開かないための識別子（行ID＋列キーなど、画面内で一意にする） */
  popoverKey: string;
  ariaLabel: string;
  title?: string;
  /** パネルの見出し（role="dialog" のラベルにもなる） */
  panelLabel: string;
  panelWidth?: number;
  /** トリガーのどちら端にパネルを揃えるか */
  align?: 'left' | 'right';
  /**
   * トリガーの見た目を差し替える（既定はセル幅いっぱいの block）。
   * 表の見出し横に置く小さな「?」アイコンのように、セル以外で使うときに渡す。
   */
  triggerClassName?: string;
  /** セルの中身（配置は呼び出し側の要素に任せる） */
  children: ReactNode;
  /** 開いているときだけ評価される内訳の中身 */
  panel: ReactNode;
}) {
  const open = useIsOpen(popoverKey);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  // 直近に開いたときの座標。閉じている間は portal ごと消えるので古い値が残っていてよい
  // （次に開いたときも useLayoutEffect が描画前に測り直すため、ズレたまま表示されることはない）。
  const [position, setPosition] = useState<PanelPosition | null>(null);

  // 開いている間だけ、自分がアンマウントされたら閉じる（ページ送り・再検索でセルが消えるとき）。
  useEffect(() => () => {
    if (openKey === popoverKey) setOpenKey(null);
  }, [popoverKey]);

  const reposition = useCallback(() => {
    const trigger = triggerRef.current;
    const panelEl = panelRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const height = panelEl?.offsetHeight ?? 0;
    const width = panelEl?.offsetWidth ?? panelWidth;
    // 下に入らなければ上へ回す。
    const belowTop = rect.bottom + PANEL_GAP;
    const fitsBelow = belowTop + height <= window.innerHeight - VIEWPORT_MARGIN;
    const top = fitsBelow ? belowTop : Math.max(VIEWPORT_MARGIN, rect.top - PANEL_GAP - height);
    const rawLeft = align === 'right' ? rect.right - width : rect.left;
    const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN;
    const left = Math.max(VIEWPORT_MARGIN, Math.min(rawLeft, Math.max(VIEWPORT_MARGIN, maxLeft)));
    setPosition({ top, left });
  }, [align, panelWidth]);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => reposition();
    // 表の横スクロールでも追従させたいので capture で拾う。
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpenKey(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenKey(null);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, reposition]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        title={title}
        onClick={(event) => {
          event.stopPropagation();
          setOpenKey(open ? null : popoverKey);
        }}
        className={triggerClassName
          ?? `block w-full cursor-pointer rounded-md px-1 py-0.5 transition-colors hover:bg-blue-50/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${open ? 'bg-blue-50' : ''}`}
      >
        {children}
      </button>
      {/* open は SSR・ハイドレーション時点では必ず false（getServerSnapshot が false）なので、
          portal をここで条件描画してもマークアップの食い違いは起きない。 */}
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label={panelLabel}
          style={{
            top: position?.top ?? -9999,
            left: position?.left ?? -9999,
            width: panelWidth,
            visibility: position ? 'visible' : 'hidden',
          }}
          // themed-popover-panel: ダークでは白（→ #1e293b）のままだと一覧カードと同じ面色になり
          // 境界が消えるため、globals.css 側でワントーン明るい面＋濃い枠・影に差し替える。
          className="themed-popover-panel fixed z-[60] rounded-lg border border-gray-200 bg-white p-3 text-left shadow-xl"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
        >
          <p className="mb-2 text-[11px] font-semibold tracking-wide text-gray-500">{panelLabel}</p>
          {panel}
        </div>,
        document.body,
      )}
    </>
  );
}
