'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { SEMANTIC } from '../lib/theme';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastApi {
  /** durationMs 省略時は DEFAULT_DURATION_MS。長文（警告など）は呼び出し側で延ばす。 */
  show: (message: string, type?: ToastType, durationMs?: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string, durationMs?: number) => void;
}

const DEFAULT_DURATION_MS = 3000;

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  // Provider 外で呼ばれた場合のフォールバック（クラッシュしないだけ）
  if (!ctx) {
    return {
      show: (m) => console.warn('[Toast] no provider:', m),
      showSuccess: (m) => console.warn('[Toast] no provider:', m),
      showError: (m) => console.error('[Toast] no provider:', m),
      showInfo: (m) => console.info('[Toast] no provider:', m),
      showWarning: (m) => console.warn('[Toast] no provider:', m),
    };
  }
  return ctx;
}

// 背景はテーマ非依存の意味色（lib/theme.ts の SEMANTIC）。Tailwind のクラス名ではなく
// 色そのものを inline style で当てる（tailwind.config.ts の content は src/lib/** を見ないため）。
const STYLES: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: SEMANTIC.confirm, icon: '✓' },
  error:   { bg: SEMANTIC.danger,  icon: '✕' },
  info:    { bg: SEMANTIC.info,    icon: 'ℹ' },
  warning: { bg: SEMANTIC.warn,    icon: '⚠' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, type: ToastType = 'info', durationMs: number = DEFAULT_DURATION_MS) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, durationMs);
  }, []);

  const api: ToastApi = {
    show,
    showSuccess: (m) => show(m, 'success'),
    showError:   (m) => show(m, 'error'),
    showInfo:    (m) => show(m, 'info'),
    showWarning: (m, durationMs) => show(m, 'warning', durationMs),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none w-fit">
        {toasts.map(t => (
          <div
            key={t.id}
            // 長文（警告など）が画面外へはみ出さないよう幅を制限し、アイコンは1行目に揃える。
            className="pointer-events-auto max-w-[min(90vw,36rem)] px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white flex items-start gap-2 toast-enter"
            style={{ backgroundColor: STYLES[t.type].bg }}
          >
            <span className="font-bold">{STYLES[t.type].icon}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
