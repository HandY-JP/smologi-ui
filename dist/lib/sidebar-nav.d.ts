import type { ReactNode } from 'react';
export interface SidebarNavItem {
    href: string;
    label: string;
    icon: ReactNode;
    /** 行末の小さな縁つきバッジ（「β」など）。読み上げは「ラベル (バッジ版)」。 */
    badge?: string;
    /** 行末の件数（要対応の件数など）。0・null は出さない。 */
    count?: number | null;
    /** count バッジの色。既定は橙、'danger' は赤、'info' は青、'accent' はテーマのアクセント色。 */
    countTone?: 'danger' | 'info' | 'accent';
    /** count バッジの読み上げ。既定は「N件」。 */
    countLabel?: string;
    /** 「新着・要対応あり」の赤丸（Smologi 流。件数は出さない）。 */
    dot?: boolean;
    /** 点の理由（例「仕入先からの連絡 2件」）。ホバーの title と読み上げに出る。 */
    dotReason?: string;
    /** 行末に置く丸い「＋」（行のリンクとは独立したクリック領域）。 */
    quickAction?: {
        href: string;
        label: string;
    };
    /** 「＋」の角に出す件数。押すと href の一覧へ。0・null は出さない。 */
    quickActionCount?: {
        count: number | null;
        href: string;
        label: string;
    };
    /** 行末の小さなガラスピル（「スモロジ連携で開放」など）。 */
    unlockPill?: string;
    /** プラン未契約などで使えない行。リンクにせず薄く出し、PRO バッジを付ける。 */
    locked?: boolean;
    /** locked のときのホバー文言。 */
    lockedReason?: string;
    /** 今後実装予定の行。リンクにせず「準備中」を付ける。 */
    comingSoon?: boolean;
    /** まだ設定していない行。薄く出すだけでクリックはできる。 */
    dim?: boolean;
    /** ガイドツアー用 data-tour。 */
    dataTour?: string;
    /** item.href 配下以外にも、この行をアクティブ表示させたいパス。 */
    activeMatch?: string[];
    /** true のとき完全一致だけでアクティブ判定する（ダッシュボード行用）。 */
    exactMatch?: boolean;
    /** これらで始まるパスでは光らせない（前方一致。例 [href + '/new']）。isActive があれば無視。 */
    excludeMatch?: string[];
    /** 判定を丸ごと差し替える（あればこれを優先。exactMatch / activeMatch / excludeMatch は見ない）。 */
    isActive?: (pathname: string) => boolean;
}
export interface SidebarNavSection {
    key: string;
    /** 空文字なら見出しを描かない。 */
    label: string;
    items: SidebarNavItem[];
    /** true なら見出しを押して開閉できる（閉じていても中の dot を見出しに出す。中の行が選択中なら開く）。 */
    collapsible?: boolean;
    /** collapsible の初期状態。既定 false（閉じる）。 */
    defaultOpen?: boolean;
    /** 開閉状態の保存キー（localStorage）。省略時は保存しない。 */
    storageKey?: string;
}
/** 行がアクティブか。exactMatch は完全一致のみ。それ以外は href 配下か activeMatch 配下。 */
export declare function isSidebarNavItemActive(item: Pick<SidebarNavItem, 'href' | 'exactMatch' | 'activeMatch' | 'excludeMatch' | 'isActive'>, pathname: string): boolean;
/** 渡された CSS 長さが 0 か（'0rem' '0px' '0'）。0 のサイドバーは閉じると完全に消え、0 以外はレールとして残る。 */
export declare function isZeroCssLength(value: string): boolean;
/** 区分のどこかに要対応の点がある場合の「内訳」文。無ければ null。 */
export declare function summarizeSidebarNews(sections: readonly SidebarNavSection[]): {
    hasNews: boolean;
    reason: string | undefined;
};
//# sourceMappingURL=sidebar-nav.d.ts.map