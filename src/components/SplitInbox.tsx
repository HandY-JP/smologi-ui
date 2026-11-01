'use client';

// 受信箱型の分割レイアウト。PC（md 以上）は 一覧｜詳細｜補助(任意) の 3 列、
// 狭い幅は selected の有無で 一覧／詳細 を切り替える（詳細の先頭に戻るボタン）。
// 高さは親いっぱい（親に高さを持たせること）。各列は独立してスクロールする。

import type { ReactNode } from 'react';

export function SplitInbox({
  list,
  detail,
  aside,
  selected,
  onBack,
  backLabel = '一覧に戻る',
  emptyDetail,
  listWidth = 'md:w-[320px]',
  asideWidth = 'lg:w-[300px]',
  className = '',
}: {
  list: ReactNode;
  detail: ReactNode;
  /** 補助列（注文情報など）。lg 以上で右に出す。省略すれば 2 列。 */
  aside?: ReactNode;
  /** 詳細を開いているか。狭い幅の画面切替に使う。 */
  selected: boolean;
  /** 狭い幅の戻るボタン。 */
  onBack: () => void;
  backLabel?: string;
  /** PC で未選択のときの詳細欄の中身。 */
  emptyDetail?: ReactNode;
  /** 一覧列の幅クラス（PC）。 */
  listWidth?: string;
  /** 補助列の幅クラス。 */
  asideWidth?: string;
  className?: string;
}) {
  return (
    <div className={`flex h-full min-h-0 w-full ${className}`}>
      <section
        aria-label="一覧"
        className={`min-h-0 w-full flex-shrink-0 overflow-y-auto md:border-r md:border-gray-200 ${listWidth} ${
          selected ? 'hidden md:block' : 'block'
        }`}
      >
        {list}
      </section>
      <section
        aria-label="詳細"
        className={`min-h-0 min-w-0 flex-1 flex-col ${selected ? 'flex' : 'hidden md:flex'}`}
      >
        <div className="flex-shrink-0 border-b border-gray-200 px-3 py-2 md:hidden">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span aria-hidden>‹</span>
            {backLabel}
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {selected ? detail : emptyDetail ?? <div className="p-8 text-center text-sm text-gray-400">左の一覧から選んでください。</div>}
        </div>
      </section>
      {aside && (
        <aside
          aria-label="補助"
          className={`hidden min-h-0 flex-shrink-0 overflow-y-auto border-l border-gray-200 lg:block ${asideWidth}`}
        >
          {aside}
        </aside>
      )}
    </div>
  );
}
