export type SearchableOption = {
    value: string;
    label: string;
    /** 表示はしないが検索対象に含める副テキスト（例: お客様コード）。 */
    keywords?: string;
};
export declare function SearchableSelect({ options, value, onChange, placeholder, searchPlaceholder, leadingOptions, emptyText, className, disabled, variant, ariaLabel, }: {
    options: SearchableOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    /** 検索が空のときだけ先頭に出す特別な選択肢（すべて／未設定／共通 など）。 */
    leadingOptions?: SearchableOption[];
    emptyText?: string;
    className?: string;
    disabled?: boolean;
    /**
     * 'default'（既定）は枠付きのトリガー（従来どおり）。
     * 'inline' はトップバー検索ピルなど、既に枠がある入れ物に埋め込む用に枠・背景を外す
     * （幅は呼び出し元の className で決める）。
     */
    variant?: 'default' | 'inline';
    /** input の aria-label。見出しラベルを別に出さない置き場所（トップバー等）で指定する。未指定なら付けない。 */
    ariaLabel?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=SearchableSelect.d.ts.map