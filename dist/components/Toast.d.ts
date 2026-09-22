type ToastType = 'success' | 'error' | 'info' | 'warning';
interface ToastApi {
    /** durationMs 省略時は DEFAULT_DURATION_MS。長文（警告など）は呼び出し側で延ばす。 */
    show: (message: string, type?: ToastType, durationMs?: number) => void;
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showInfo: (message: string) => void;
    showWarning: (message: string, durationMs?: number) => void;
}
export declare function useToast(): ToastApi;
export declare function ToastProvider({ children }: {
    children: React.ReactNode;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=Toast.d.ts.map