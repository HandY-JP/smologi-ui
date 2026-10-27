import type { ReactNode } from 'react';
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
export declare function DashboardAppRow({ apps, currentAppId, loading, size, className, assetBase, renderIcon, ariaLabel, loadingText, newDotClassName, }: {
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
}): import("react").JSX.Element | null;
//# sourceMappingURL=DashboardAppRow.d.ts.map