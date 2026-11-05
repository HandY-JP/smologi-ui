'use client';
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { SEMANTIC } from '../lib/theme';
import { useBottomBarHeightVar } from '../lib/use-bottom-bar-height-var';

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
}

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  action?: ToastAction;
  durationMs: number;
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

// 既定の表示時間。ToastProvider の defaultDurationMs / actionDurationMs で差し替えられる。
// アクションボタン付きは読む→押すの2手が要るので長め。
export const TOAST_DEFAULT_DURATION_MS = 3000;
export const TOAST_ACTION_DURATION_MS = 10000;

function resolveOptions(
  options: DurationArg,
  defaults: { defaultMs: number; actionMs: number },
): { durationMs: number; action?: ToastAction } {
  if (typeof options === 'number') return { durationMs: options };
  if (options && typeof options === 'object') {
    return {
      durationMs: options.durationMs ?? (options.action ? defaults.actionMs : defaults.defaultMs),
      action: options.action,
    };
  }
  return { durationMs: defaults.defaultMs };
}

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

export function ToastProvider({
  children,
  defaultDurationMs = TOAST_DEFAULT_DURATION_MS,
  actionDurationMs = TOAST_ACTION_DURATION_MS,
}: {
  children: React.ReactNode;
  /** durationMs を渡さないときの表示時間（ms）。既定 3000。 */
  defaultDurationMs?: number;
  /** アクションボタン付きで durationMs を渡さないときの表示時間（ms）。既定 10000。 */
  actionDurationMs?: number;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // 画面下の一括操作ピルなど（data-bottom-bar）と重なると、トーストが消えるまでピルのボタンが押せない。
  // バーがあるときはその上に出す（2026-10-14 オーナー依頼）。
  useBottomBarHeightVar();
  // ホバー中は消さない。id ごとに「残り時間を測るタイマー」を持ち直す必要があるので、
  // 開始時刻・残り時間・タイマーIDを ref で追跡する（state化すると再描画が余計に走る）。
  const timers = useRef(new Map<number, { timeoutId: ReturnType<typeof setTimeout>; remainingMs: number; startedAt: number }>());

  const dismiss = useCallback((id: number) => {
    const entry = timers.current.get(id);
    if (entry) {
      clearTimeout(entry.timeoutId);
      timers.current.delete(id);
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const scheduleDismiss = useCallback((id: number, ms: number) => {
    const timeoutId = setTimeout(() => dismiss(id), ms);
    timers.current.set(id, { timeoutId, remainingMs: ms, startedAt: Date.now() });
  }, [dismiss]);

  const pause = useCallback((id: number) => {
    const entry = timers.current.get(id);
    if (!entry) return;
    clearTimeout(entry.timeoutId);
    const elapsed = Date.now() - entry.startedAt;
    entry.remainingMs = Math.max(0, entry.remainingMs - elapsed);
  }, []);

  const resume = useCallback((id: number) => {
    const entry = timers.current.get(id);
    if (!entry) return;
    entry.startedAt = Date.now();
    entry.timeoutId = setTimeout(() => dismiss(id), entry.remainingMs);
  }, [dismiss]);

  const show = useCallback((message: string, type: ToastType = 'info', options?: DurationArg) => {
    const { durationMs, action } = resolveOptions(options, { defaultMs: defaultDurationMs, actionMs: actionDurationMs });
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message, action, durationMs }]);
    scheduleDismiss(id, durationMs);
  }, [scheduleDismiss, defaultDurationMs, actionDurationMs]);

  const api: ToastApi = {
    show,
    showSuccess: (m, o) => show(m, 'success', o),
    showError:   (m, o) => show(m, 'error', o),
    showInfo:    (m, o) => show(m, 'info', o),
    showWarning: (m, o) => show(m, 'warning', o),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-[max(1.5rem,var(--bottom-bar-h,0px))] left-1/2 -translate-x-1/2 z-[100] transition-[bottom] duration-200 motion-reduce:transition-none flex flex-col gap-2 pointer-events-none w-fit">
        {toasts.map(t => (
          <div
            key={t.id}
            data-toast-type={t.type}
            // 長文（警告など）が画面外へはみ出さないよう幅を制限し、アイコンは1行目に揃える。
            // ホバー中は自動で消えない。
            className="pointer-events-auto max-w-[min(90vw,36rem)] px-4 py-2.5 rounded-lg shadow-lg text-[14px] leading-[22px] font-medium text-white flex items-start gap-2 toast-enter"
            style={{ backgroundColor: STYLES[t.type].bg }}
            onMouseEnter={() => pause(t.id)}
            onMouseLeave={() => resume(t.id)}
          >
            <span className="font-semibold">{STYLES[t.type].icon}</span>
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => { t.action?.onClick(); dismiss(t.id); }}
                className="shrink-0 rounded-md bg-white/20 px-2.5 py-1 text-[14px] leading-[22px] font-semibold hover:bg-white/30 transition-colors"
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
