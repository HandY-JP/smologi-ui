import type { CSSProperties, MouseEvent, ReactNode } from 'react';
/** 一覧の 1 項目。`href` があればリンク、無ければボタン（押したら `onSelect`）。 */
export type StoreAccountSwitcherItem = {
    id: string;
    label: string;
    /** ラベル下の小さな補足（例: 所有する会社名）。 */
    sub?: string;
    /** 今の表示先。選択色＋「今の画面」の印を出す。 */
    checked?: boolean;
    disabled?: boolean;
    /** 右端の小さな印（例: 「未連携」）。 */
    badge?: string;
    href?: string;
    onSelect?: () => void;
};
export type StoreAccountSwitcherGroup = {
    id: string;
    /** グループ見出し（例: 「Amazon」「楽天市場」）。省略時は見出しなし。 */
    heading?: string;
    items: StoreAccountSwitcherItem[];
};
export type StoreAccountSwitcherState = 'ready' | 'loading' | 'error' | 'empty';
/** `renderLink` に渡る引数。Next の Link などにそのまま展開できる。 */
export type StoreAccountSwitcherLinkProps = {
    href: string;
    className?: string;
    style?: CSSProperties;
    role?: string;
    title?: string;
    'aria-current'?: 'page';
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    children: ReactNode;
};
export type StoreAccountSwitcherProps = {
    /** 閉じた状態の欄に出す現在の表示名（例: 「HandY 本店」）。 */
    currentLabel: string;
    groups: StoreAccountSwitcherGroup[];
    /** 一覧の末尾（例: 「＋ アカウントを追加」「別の会社で入り直す」）。 */
    footerItems?: StoreAccountSwitcherItem[];
    /** 既定 'ready'。ready 以外のときは一覧の代わりに下の文言を出す。 */
    state?: StoreAccountSwitcherState;
    loadingText?: string;
    errorText?: string;
    emptyText?: string;
    /**
     * 指定すると欄全体がこの href のリンクになり、開閉しない（未登録時）。
     * Seller の「Amazonアカウントを連携」と同じ橙の見た目。補足文は `emptyHint`。
     */
    emptyHref?: string;
    emptyHint?: string;
    /** Next の Link などを渡す。省略時は <a>。 */
    renderLink?: (props: StoreAccountSwitcherLinkProps) => ReactNode;
    /** 開閉が変わったとき（サイドバーのピーク保持用）。 */
    onOpenChange?: (open: boolean) => void;
    /** 初期状態を開いた状態にする（テスト・見本用）。 */
    defaultOpen?: boolean;
    ariaLabel?: string;
    className?: string;
};
/**
 * ストアとアカウントの切り替え（サイドバー用。見た目と開閉だけ。取得・保存・遷移は利用側）。
 *
 * - 閉じた状態: サイドバー幅いっぱい・高さ h-10 の 1 行に「現在の表示名 ▼」（ロゴ・頭文字なし）。
 * - 開いた状態: 直下にグループ見出し付きの一覧＋末尾のフッター項目。checked は選択色＋「今の画面」。
 * - 外側クリック・Esc で閉じる（Esc は欄にフォーカスを戻す）。項目を選ぶと閉じる。
 * - 色は --sb-* / --sb-popover-* / --accent-* のみ。--sb-popover-bg が無ければ --sb-bg に落ちる
 *   （--sb-heading は暗色テーマで白地に白文字になるため使わない。WorkspaceSwitch 参照）。
 *   emptyHref の橙だけは Tailwind の orange（Seller の現行どおり）。
 *
 * 余白は呼び出し側が className（例: `mx-3 w-[calc(100%-1.5rem)]`）で決める。既定は親幅いっぱい。
 */
export declare function StoreAccountSwitcher({ currentLabel, groups, footerItems, state, loadingText, errorText, emptyText, emptyHref, emptyHint, renderLink, onOpenChange, defaultOpen, ariaLabel, className, }: StoreAccountSwitcherProps): import("react").JSX.Element;
//# sourceMappingURL=StoreAccountSwitcher.d.ts.map