import { type HTMLAttributes, type ReactNode, type RefObject } from 'react';
/** ランチャーの 1 項目。 */
export type AppLauncherItem = {
    id: string;
    name: string;
    description?: string;
    /** アイコン画像の URL。icon / renderIcon が無いときに 40px 角丸の <img> で出す。 */
    iconSrc?: string;
    /** アイコンそのもの（iconSrc より優先）。renderIcon が最優先。 */
    icon?: ReactNode;
    href: string;
    /** 現在地。リンクにせず「現在地」ラベル付きの淡い行で出す。 */
    current?: boolean;
    /** true で別タブ（target=_blank rel="noopener noreferrer"）＋ 右端に ↗。既定 true（smologi 本体と同じ）。 */
    external?: boolean;
};
/** renderLink に渡す、リンク行へ付けるべき属性一式。 */
export type AppLauncherLinkProps = {
    href: string;
    target?: '_blank';
    rel?: string;
    onClick: () => void;
    className: string;
    children: ReactNode;
};
/**
 * アプリ一覧ポップオーバー（smologi の ContractedAppsPopover の枠だけを純 UI 化）。
 *
 * - document.body へポータルし、anchorRef のボタン位置から fixed（z-80、幅 340px）で右下に開く。
 *   画面外へはみ出さないようクランプ。リサイズ・スクロールで追従。
 * - Esc / ポップオーバー外・アンカー外のクリックで onClose。開いたら先頭のリンクへフォーカス、
 *   閉じたらアンカーへフォーカスを戻す。
 * - データ取得はしない。apps / loading / failed は呼び出し側が渡す。
 * - 色は gray（本文・補助）、bg-white（ダークは dark-compat.css が受ける）、--sb-accent-bg /
 *   --accent-subtle のみ。パレット意味名の Tailwind クラスは使わない。
 *   → 消費側は tokens/<app>.css ＋ styles.css（＋任意で dark-compat.css）を読み込んでいること。
 */
export declare function AppLauncherPopover({ anchorRef, open, onClose, apps, loading, failed, header, renderIcon, renderNewDot, renderLink, loadingText, failedText, currentLabel, ariaLabel, id, regionProps, }: {
    anchorRef: RefObject<HTMLElement | null>;
    open: boolean;
    onClose: () => void;
    apps: AppLauncherItem[];
    /** 取得中。true の間は loadingText を一覧の上に出す（apps が空でなくても出る＝呼び出し側で制御）。 */
    loading?: boolean;
    failed?: boolean;
    /** 先頭の見出し領域の中身（下に border-b が付く。px-5 py-4 の枠込み）。省略で見出し領域なし。 */
    header?: ReactNode;
    /** アイコンの差し替え。省略時は icon → iconSrc の順。 */
    renderIcon?: (app: AppLauncherItem) => ReactNode;
    /** アプリ名の右（ラベルの横）に出す付属物（未読ドットなど）。 */
    renderNewDot?: (app: AppLauncherItem) => ReactNode;
    /** リンク行の差し替え（next/link 等）。省略時は <a>。 */
    renderLink?: (app: AppLauncherItem, props: AppLauncherLinkProps) => ReactNode;
    loadingText?: string;
    failedText?: string;
    currentLabel?: string;
    ariaLabel?: string;
    id?: string;
    /** ルート <section> へ spread する属性（smologi の `sidebarPeekRegionProps` など）。 */
    regionProps?: HTMLAttributes<HTMLElement> & Record<`data-${string}`, string | undefined>;
}): import("react").ReactPortal | null;
//# sourceMappingURL=AppLauncherPopover.d.ts.map