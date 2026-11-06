export declare const SUZY_PANE_BREAKPOINT = 1440;
export declare const SUZY_PANE_WIDTH = 380;
/** 右ペインとして開いているか。ペインが開いたら閉じたい別の右ペインを持つ画面が見る。 */
export declare function useSuzyPaneActive(): boolean;
export interface UseSuzyPaneOptions {
    /** チャットが開いているか。 */
    open: boolean;
    /** ペインにする最小の画面幅（px）。既定 1440。 */
    breakpoint?: number;
    /** ペインの幅（px）。既定 380。 */
    width?: number;
}
export declare function useSuzyPane({ open, breakpoint, width }: UseSuzyPaneOptions): {
    isPane: boolean;
    active: boolean;
};
//# sourceMappingURL=suzy-pane.d.ts.map