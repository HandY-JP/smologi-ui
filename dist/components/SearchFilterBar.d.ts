import { type ReactNode, type Ref } from 'react';
export interface SearchFilterBarProps {
    value: string;
    onValueChange: (value: string) => void;
    onSearch: () => void;
    /**
     * 入力が空になった瞬間に呼ぶ（`type="search"` のブラウザ標準の × を押した／文字を全部消した）。
     * Enter で確定する画面（適用済み検索を別 state に持つ画面）は必ず渡すこと。渡さないと
     * 「× で文字は消えたのに一覧は絞られたまま」になる。詳しくは TopbarSearchDock の同名 prop を参照。
     */
    onCleared?: () => void;
    placeholder: string;
    filterControl?: ReactNode;
    countLabel?: string;
    disabled?: boolean;
    loading?: boolean;
    dirty?: boolean;
    className?: string;
    inputAriaLabel?: string;
    inputRef?: Ref<HTMLInputElement>;
    accentColor?: string;
    accentLightColor?: string;
    /**
     * 検索欄を畳んで素のアイコン（虫メガネ＋じょうご）だけにする（既定 false = 常時展開）。
     * 畳んだ状態はピルの枠・背景・リングを出さず、ホバーで薄い背景が付くだけにする。
     * アイコンを押すと開いて即入力でき、空のままフォーカスを外す（または Esc）と畳む。
     * 検索語が入っている間は畳まない（何で絞られているか分からなくなるため）。
     */
    collapsible?: boolean;
}
export declare function SearchFilterBar({ value, onValueChange, onSearch, onCleared, placeholder, filterControl, countLabel, disabled, loading, dirty, className, inputAriaLabel, inputRef, accentColor, accentLightColor, collapsible, }: SearchFilterBarProps): import("react").JSX.Element;
//# sourceMappingURL=SearchFilterBar.d.ts.map