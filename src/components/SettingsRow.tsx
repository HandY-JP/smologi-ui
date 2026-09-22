'use client';
// 設定モード（2026-09-23）のフォーム行。区画（SettingsSection）の中に並べる最小単位。
//
// 「左ラベル（幅 200px 固定）／右コントロール」の 2 カラム。狭いとき（sm 未満）は縦積み。
// 入力欄・ゴーストボタン・トグルのクラスもここに集約し、区分ごとの独自スタイルを無くす。
import type { ReactNode } from 'react';

/**
 * フォーム行（左ラベル／右コントロール）。
 * `hint` はラベルの下に出す補足。`control` が長い説明を持つ場合は children に自由に書いてよい。
 */
export function SettingsRow({
  label,
  hint,
  htmlFor,
  children,
  /** ラベルを付けない（説明文だけの行・表を丸ごと置く行）。 */
  full = false,
}: {
  label?: string;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  full?: boolean;
}) {
  if (full) return <div className="min-w-0">{children}</div>;
  return (
    <div className="grid gap-1.5 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-start sm:gap-4">
      <div className="pt-1.5">
        {label && (
          <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        {hint && <p className="mt-0.5 text-[11px] leading-4 text-gray-400">{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** 設定共通の入力欄クラス（幅は呼び出し側で決める）。 */
export const SETTINGS_INPUT_CLASS =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 '
  + 'placeholder:text-gray-400 focus:border-[var(--sb-accent-bg)] focus:outline-none '
  + 'focus:ring-1 focus:ring-[var(--sb-accent-bg)] disabled:bg-gray-50 disabled:text-gray-400';

/** 区画の中の副次ボタン（ゴースト）。主操作の塗りは道具バーの「保存」だけ。 */
export const SETTINGS_GHOST_BUTTON_CLASS =
  'inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 '
  + 'text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 '
  + 'disabled:cursor-not-allowed disabled:opacity-50';

/** ON/OFF のトグル（設定モード共通）。 */
export function SettingsToggle({
  checked,
  onChange,
  disabled = false,
  label,
  id,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  /** 支援技術向けの名前（見出しが別にある場合も必ず付ける）。 */
  label: string;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-[var(--sb-accent-bg)]' : 'bg-gray-300'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <span
        aria-hidden
        style={{ backgroundColor: '#fff' }}
        className={`inline-block h-3.5 w-3.5 transform rounded-full shadow transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
