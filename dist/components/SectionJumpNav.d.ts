export interface SectionJumpItem {
    key: string;
    label: string;
    count: number;
    /** 色ドットの Tailwind クラス（呼び出し側のグループ色）。無ければドットを出さない。 */
    dotClassName?: string;
}
export declare function SectionJumpNav({ items, activeKey, onJump, ariaLabel, }: {
    items: SectionJumpItem[];
    /** いま見ている（見出し自身の）セクション。強調表示に使う。 */
    activeKey?: string | null;
    onJump: (key: string) => void;
    ariaLabel: string;
}): import("react").JSX.Element | null;
//# sourceMappingURL=SectionJumpNav.d.ts.map