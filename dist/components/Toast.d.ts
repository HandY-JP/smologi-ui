type ToastType = 'success' | 'error' | 'info' | 'warning';
interface ToastAction {
    label: string;
    onClick: () => void;
}
interface ToastOptions {
    /** 省略時は ToastProvider の既定（アクション付きは actionDurationMs、それ以外は defaultDurationMs）。 */
    durationMs?: number;
    /** トースト内に置く単一の操作ボタン（例: 「ダウンロード」）。 */
    action?: ToastAction;
    /**
     * true にすると、トーストの上でもクリックが下の画面へ通る（ホバーで止まらない）。
     * 操作の直後にすぐ次のボタンを押す画面で、トーストが重なって押せなくなるのを防ぐ用。
     * action 付きのトーストではボタンを押せなくなるため無視する。省略時は従来どおり。
     */
    passThrough?: boolean;
}
type DurationArg = number | ToastOptions | undefined;
interface ToastApi {
    /** durationMs（または {durationMs, action}）省略時は ToastProvider の既定。長文（警告など）は呼び出し側で延ばす。 */
    show: (message: string, type?: ToastType, options?: DurationArg) => void;
    showSuccess: (message: string, options?: DurationArg) => void;
    showError: (message: string, options?: DurationArg) => void;
    showInfo: (message: string, options?: DurationArg) => void;
    showWarning: (message: string, options?: DurationArg) => void;
}
export declare const TOAST_DEFAULT_DURATION_MS = 3000;
export declare const TOAST_ACTION_DURATION_MS = 10000;
export declare function resolveOptions(options: DurationArg, defaults: {
    defaultMs: number;
    actionMs: number;
}): {
    durationMs: number;
    action?: ToastAction;
    passThrough: boolean;
};
export declare function useToast(): ToastApi;
export declare function ToastProvider({ children, defaultDurationMs, actionDurationMs, }: {
    children: React.ReactNode;
    /** durationMs を渡さないときの表示時間（ms）。既定 3000。 */
    defaultDurationMs?: number;
    /** アクションボタン付きで durationMs を渡さないときの表示時間（ms）。既定 10000。 */
    actionDurationMs?: number;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=Toast.d.ts.map