import type { CSSProperties, ReactNode } from 'react';
/** アバター（画像があれば丸い <img>、無ければ名前の頭文字の灰色丸）。SidebarAccountRow の avatar に渡す。 */
export declare function SidebarAccountAvatar({ src, name }: {
    src?: string | null;
    name?: string | null;
}): import("react").JSX.Element;
/** renderName に渡す、名前ボタン（または Link）へ付けるべき属性一式。 */
export type SidebarAccountNameProps = {
    className: string;
    style: CSSProperties;
    title: string;
    'aria-current'?: 'page';
    children: ReactNode;
};
/**
 * サイドバー下部のアカウント行（アバター＋名前＋歯車）。smologi の SidebarAccountMenu の
 * 「行の見た目」だけを純 UI 化したもの（ルーティング・セッション・設定モード判定は呼び出し側）。
 *
 * - 名前側: 既定は <button onClick={onNameClick}>。Link にしたいときは renderName で
 *   渡された属性を <Link> に付けて返す（その場合 onNameClick は使われない）。
 * - 歯車: onGear があり、かつ collapsed でないときだけ出す。gearActive で点灯（.sb-nav-round-active、
 *   aria-pressed）。extraActions は歯車の**左**に並べる（b2b のテーマ切替アイコンなど）。
 * - collapsed: アバターだけ（歯車・名前・extraActions は出さない）。
 * - subText: 名前の下に小さく補助行を出す。省略時は従来どおり 1 行（高さ h-9 のまま）。
 */
export declare function SidebarAccountRow({ avatar, name, subText, onNameClick, renderName, nameActive, nameTitle, onGear, gearActive, gearLabel, gearTitle, gearDataTour, extraActions, collapsed, }: {
    avatar: ReactNode;
    name: ReactNode;
    subText?: ReactNode;
    onNameClick?: () => void;
    renderName?: (props: SidebarAccountNameProps) => ReactNode;
    /** 名前側が「いま開いているページ」のとき true（aria-current="page"）。 */
    nameActive?: boolean;
    nameTitle?: string;
    onGear?: () => void;
    /** 歯車の点灯（設定モード中）。aria-pressed にもなる。 */
    gearActive?: boolean;
    /** 歯車の aria-label。既定は gearActive ? '設定を閉じる' : '設定を開く'。 */
    gearLabel?: string;
    /** 歯車の title。既定は gearActive ? '設定を閉じる' : '設定'。 */
    gearTitle?: string;
    /** 歯車へ付ける data-tour 値（ガイドツアー用）。 */
    gearDataTour?: string;
    /** 歯車の左に置く追加アイコン（折りたたみ中は出さない）。 */
    extraActions?: ReactNode;
    collapsed?: boolean;
}): import("react").JSX.Element;
//# sourceMappingURL=SidebarAccountRow.d.ts.map