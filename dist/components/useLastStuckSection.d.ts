export declare function useLastStuckSection(orderedKeys: readonly string[]): {
    /** 現在ガラス表示してよいセクションの key。無ければ null。 */
    activeStuckKey: string | null;
    /** 各 StickySectionHeader の onStuckChange にそのまま渡す（key を bind して使う）。 */
    reportStuck: (key: string, stuck: boolean) => void;
};
//# sourceMappingURL=useLastStuckSection.d.ts.map