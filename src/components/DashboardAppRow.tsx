'use client';
import type { ReactNode } from 'react';
import { AppBrandIcon } from './AppBrandIcon';
import { SidebarNewDot } from './SidebarNewDot';
import { Tooltip } from './Tooltip';

/** アプリ列の1件。データ取得（契約中アプリの一覧）はアプリ側で行い、ここは並べるだけ。 */
export type DashboardAppRowItem = {
  id: string;
  label: string;
  /** 押したときの行き先（別タブで開く）。 */
  href: string;
  /** 未読ドットを出すか（右上に重ねる）。 */
  dot?: boolean;
};

/**
 * ダッシュボード用の「アプリ列」（見た目だけ。Smologi の DashboardAppRow から切り出した）。
 * 契約中のアプリをアイコンで横に並べ、押すとそのアプリへ**別タブで**切り替える。
 * 今いるアプリ（currentAppId と id が一致）は選択中の見た目（outline）で、押しても遷移しない
 * （リンクにせず role="img" ＋ aria-current="page"）。名前はマウスを乗せたとき（Tooltip）と aria-label で伝える。
 *
 * - データ取得・出し分け・「自分自身の先頭追加」などはアプリ側（apps に整えて渡す）。
 * - 取得が終わって apps が空なら何も描画しない（loading 中は枠だけ出して「読み込み中…」）。
 * - 色は Tailwind の ink-muted / line / accent（Smologi・Seller 共通の意味名）。
 */
export function DashboardAppRow({
  apps,
  currentAppId,
  loading = false,
  size = 'md',
  className = '',
  assetBase,
  renderIcon,
  ariaLabel = '契約中のアプリ',
  loadingText = '読み込み中…',
  newDotClassName,
}: {
  apps: DashboardAppRowItem[];
  /** 現在地アプリID。選択中の見た目になる。 */
  currentAppId: string;
  loading?: boolean;
  /** 'sm' は小さい版（パネル内用）。既定 'md'。 */
  size?: 'md' | 'sm';
  className?: string;
  /** 既定アイコン（AppBrandIcon）のロゴ画像置き場。既定 '/brand'。 */
  assetBase?: string;
  /** アイコンの差し替え。省略時は AppBrandIcon（className="block h-full w-full" で枠いっぱい）。 */
  renderIcon?: (app: DashboardAppRowItem) => ReactNode;
  ariaLabel?: string;
  loadingText?: string;
  /** 未読ドットの色クラスの差し替え（SidebarNewDot の colorClassName）。 */
  newDotClassName?: string;
}) {
  if (!loading && apps.length === 0) return null;

  // アイコンだけ（名前の文字・タイル枠は出さない）。全アプリ同じ正方形の枠に収め、余白もそろえる。
  const box = size === 'sm' ? 'h-10 w-10' : 'h-14 w-14';
  return (
    <nav aria-label={ariaLabel} className={`flex flex-wrap items-center gap-3 p-1 ${className}`}>
      {apps.map((app) => {
        const current = app.id === currentAppId;
        // タイルは枠いっぱい（二重の角丸にしない。角丸はアイコン自身の 25%）。選択枠は outline で外側に出す（地色に依存しない）。
        const tileClass = `relative block ${box} flex-shrink-0 rounded-[25%] transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          current ? 'outline outline-2 outline-offset-2 outline-accent' : 'hover:ring-2 hover:ring-line'
        }`;
        const inner = (
          <>
            {renderIcon ? renderIcon(app) : <AppBrandIcon appId={app.id} assetBase={assetBase} className="block h-full w-full" />}
            {app.dot && <SidebarNewDot placement="corner" colorClassName={newDotClassName} />}
          </>
        );
        return (
          <Tooltip key={app.id} content={app.label} side="bottom">
            {current ? (
              // 今いるアプリは押しても遷移しない（リンクにしない）。
              <span role="img" aria-current="page" aria-label={app.label} className={tileClass}>
                {inner}
              </span>
            ) : (
              <a href={app.href} target="_blank" rel="noopener noreferrer" aria-label={app.label} className={tileClass}>
                {inner}
              </a>
            )}
          </Tooltip>
        );
      })}
      {loading && <span className="self-center text-xs text-ink-muted" role="status">{loadingText}</span>}
    </nav>
  );
}
