'use client';

const GRID_ICON = 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z';

/** 「すべてのページ」パネルの既定 id（ボタンの aria-controls と、アプリ側のパネルの id を合わせる）。 */
export const ALL_PAGES_PANEL_ID = 'all-pages-panel';

/**
 * ドック（▶・ホームの右）の「すべてのページ」アイコンボタン。
 * 開閉の状態とパネル本体はアプリが持つ（open / onToggle で受ける）。
 *
 * - `data-all-pages-trigger`: パネルを閉じたときのフォーカス戻し先、外側クリック判定の除外対象を
 *   アプリ側が探すための目印。落とさないこと。
 * - 開いているときだけ aria-controls でパネル（id=panelId）を指す。
 */
export function AllPagesDockButton({
  open,
  onToggle,
  panelId = ALL_PAGES_PANEL_ID,
}: {
  open: boolean;
  onToggle: () => void;
  panelId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      data-all-pages-trigger
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? panelId : undefined}
      aria-label="すべてのページ"
      title="すべてのページ"
      className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[var(--sb-text)] transition-colors hover:bg-[var(--sb-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-accent-bg)]"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={GRID_ICON} />
      </svg>
    </button>
  );
}
