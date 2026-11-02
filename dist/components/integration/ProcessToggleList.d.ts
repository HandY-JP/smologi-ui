import type { ProcessToggleItem } from './types';
/**
 * 「使う処理」のスイッチ一覧。押したら onToggle(id, 次の値)。保存・巻き戻しはアプリ側。
 * readOnly の行はスイッチを置かず「常に行います」を出す。
 */
export declare function ProcessToggleList({ items, onToggle, }: {
    items: ProcessToggleItem[];
    onToggle: (id: string, next: boolean) => void;
}): import("react").JSX.Element;
//# sourceMappingURL=ProcessToggleList.d.ts.map