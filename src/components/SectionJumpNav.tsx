'use client';
// 一覧のセクション見出し（StickySectionHeader）の右側に置く「グループへ移動」の一覧
// （モック mock-shipments-v8.html の .grow-nav / .gnav）。
//
// 2026-09-15 ユーザー決定: 見出しの右端は「次のグループ ▸」の1本リンクではなく、
// **全グループを色ドット＋名前＋件数の小さなボタンで横並び**にして、どこからでも任意の
// グループへ飛べるようにする。現在のセクション（見出し自身のグループ）は .on で強調する。
// 追従（ガラス帯）中も通常時も同じものを出す。
//
// 幅が足りないときは末尾から間引いて「＋n ▾」に畳む（折り返さない）。畳んだ分は
// ドロップダウン（body へ portal・position:fixed）から選べる。
//
// 間引きの計測（2026-09-15 性能修正）: 以前は各見出しが「全候補を描画した計測専用コンテナ」を
// 自前で持っていた。見出しは一覧のセクションぶん（200件表示の入荷なら数十）並ぶため、
// 計測用のボタンだけで N×N 個の DOM ができ、スクロール中の再レイアウトが重くなっていた
// （本番指摘「200件表示でスクロールすると一覧が揺れる」の一因）。
// いまは **画面全体で1つだけの隠しコンテナ**で実寸を測り、ラベル＋件数をキーにして
// 結果を使い回す（measureSectionJumpWidths）。表示側は配列そのものを絞り込む
// （hidden 属性は使わない。一度 display:none になると幅0を返して自己矛盾的に縮み続けるため）。
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { computeChipOverflow, type OverflowChip } from '../lib/topbar-compaction';
import { measureSectionJumpWidths } from './section-jump-measure';

export interface SectionJumpItem {
  key: string;
  label: string;
  count: number;
  /** 色ドットの Tailwind クラス（呼び出し側のグループ色）。無ければドットを出さない。 */
  dotClassName?: string;
}

const MENU_WIDTH_PX = 224;
const MENU_MARGIN_PX = 8;
const MENU_GAP_PX = 6;

function JumpButton({
  item,
  active,
  onJump,
}: {
  item: SectionJumpItem;
  active: boolean;
  onJump: (key: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onJump(item.key)}
      aria-current={active ? 'true' : undefined}
      className={`sb-section-jump${active ? ' on' : ''}`}
      title={`${item.label}（${item.count}件）へ移動`}
    >
      {item.dotClassName && <span className={`sb-section-jump-dot ${item.dotClassName}`} aria-hidden />}
      <span className="sb-section-jump-label">{item.label}</span>
      <b>{item.count > 999 ? '999+' : item.count}</b>
    </button>
  );
}

/** 畳んだぶんを選ぶドロップダウン。祖先の重ね順・overflow に潰されないよう body へ portal する。 */
function OverflowMenu({
  items,
  activeKey,
  onJump,
  onClose,
  triggerRef,
}: {
  items: SectionJumpItem[];
  activeKey?: string | null;
  onJump: (key: string) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const maxLeft = window.innerWidth - MENU_WIDTH_PX - MENU_MARGIN_PX;
      // トリガーの右端に揃える（見出しの右端にあるため）。画面外へは出さない。
      const left = Math.max(MENU_MARGIN_PX, Math.min(rect.right - MENU_WIDTH_PX, maxLeft));
      setPosition({ top: rect.bottom + MENU_GAP_PX, left });
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
      style={{ top: position.top, left: position.left, width: MENU_WIDTH_PX }}
      className="fixed z-[60] flex max-h-[60vh] flex-col overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-xl"
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="menuitem"
          onClick={() => { onJump(item.key); onClose(); }}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
            item.key === activeKey ? 'font-semibold text-gray-900' : 'text-gray-700'
          }`}
        >
          {item.dotClassName && <span className={`h-2 w-2 shrink-0 rounded-full ${item.dotClassName}`} aria-hidden />}
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          <span className="shrink-0 text-xs text-gray-400">{item.count}</span>
        </button>
      ))}
    </div>,
    document.body,
  );
}

export function SectionJumpNav({
  items,
  activeKey,
  onJump,
  ariaLabel,
}: {
  items: SectionJumpItem[];
  /** いま見ている（見出し自身の）セクション。強調表示に使う。 */
  activeKey?: string | null;
  onJump: (key: string) => void;
  ariaLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const moreTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [shownIds, setShownIds] = useState<string[] | null>(null);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const available = el.clientWidth;
      // 実寸は画面共通の隠しコンテナで1回だけ測る（同じラベル＋件数なら使い回す）。
      const measured = measureSectionJumpWidths(items);
      const chips: OverflowChip[] = items.map((item) => ({
        id: item.key,
        widthPx: (measured.widths.get(item.key) ?? 0) + 3,
      }));
      const result = computeChipOverflow(chips, available, measured.moreWidthPx + 3);
      setShownIds((prev) => {
        const next = result.collapsedToCount ? [] : result.shownIds;
        // 同じ結果なら state を据え置く（見出しの数だけ再レンダーが走るのを防ぐ）。
        if (prev && prev.length === next.length && prev.every((id, i) => id === next[i])) return prev;
        return next;
      });
      setHiddenCount(result.hiddenCount);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;
  const shownSet = new Set(shownIds ?? items.map((item) => item.key));
  const visible = items.filter((item) => shownSet.has(item.key));
  const hidden = items.filter((item) => !shownSet.has(item.key));

  return (
    <nav ref={containerRef} aria-label={ariaLabel} className="sb-section-jump-nav">
      {visible.map((item) => (
        <JumpButton key={item.key} item={item} active={item.key === activeKey} onJump={onJump} />
      ))}
      {hiddenCount > 0 && (
        <button
          ref={moreTriggerRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="sb-section-jump"
          title={`他${hiddenCount}件のグループ`}
        >
          ＋{hiddenCount} ▾
        </button>
      )}
      {menuOpen && hidden.length > 0 && (
        <OverflowMenu
          items={hidden}
          activeKey={activeKey}
          onJump={onJump}
          onClose={() => setMenuOpen(false)}
          triggerRef={moreTriggerRef}
        />
      )}
    </nav>
  );
}
