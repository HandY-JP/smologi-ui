import type { ProviderPickerItem } from './types';
/**
 * 連携先の選択一覧。外枠は既存の Modal の children に入れて使う。
 * comingSoon の項目は押せない（disabled・「準備中」）。
 */
export declare function ProviderPicker({ providers, onSelect, }: {
    providers: ProviderPickerItem[];
    onSelect: (id: string) => void;
}): import("react").JSX.Element;
//# sourceMappingURL=ProviderPicker.d.ts.map