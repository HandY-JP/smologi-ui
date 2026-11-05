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
  /** ラベルを付けない（説明文だけの行・表を丸ごと置く行）。上限幅も掛けない＝全幅。 */
  full = false,
  layout = 'default',
}: {
  label?: string;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  full?: boolean;
  /**
   * 'default'（既定）＝sm（640px）以上で 200px ラベル／可変コントロールの 2 カラム。
   * 'wide'＝xl（1280px）以上でだけ 2 カラムにし、コントロール側に SETTINGS_CONTROL_MAX_W（720px）の上限を掛ける
   * （サイドバーを引いた本文幅で考える。スモロジ本体の設定画面）。
   */
  layout?: SettingsLayout;
}) {
  if (full) return <div className="min-w-0">{children}</div>;
  const wide = layout === 'wide';
  return (
    <div className={wide ? 'grid gap-1.5 xl:grid-cols-[200px_minmax(0,720px)] xl:items-start xl:gap-4' : 'grid gap-1.5 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-start sm:gap-4'}>
      <div className={wide ? 'xl:pt-1.5' : 'pt-1.5'}>
        {label && (
          <label htmlFor={htmlFor} className={`block text-[14px] font-medium text-[rgb(var(--ink))] ${wide ? 'leading-5' : 'leading-[22px]'}`}>
            {label}
          </label>
        )}
        {hint && <p className={wide ? 'mt-0.5 text-[12px] leading-5 text-[rgb(var(--ink-muted))]' : 'mt-0.5 text-[11px] leading-4 text-[rgb(var(--ink-muted))]'}>{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** フォーム行のコントロール列の最大幅（layout='wide' の読みやすさの上限）。 */
export const SETTINGS_CONTROL_MAX_W = '720px';

/** 読み取り専用の値（フォーム行の右側に置く）。全区分で同じ見た目にする。 */
export function SettingsValue({ children }: { children: ReactNode }) {
  return <p className="pt-1.5 text-[14px] leading-5 text-[rgb(var(--ink))]">{children}</p>;
}


/** 複数行の入力欄（高さだけ入力欄クラスと違う）。 */
export const SETTINGS_TEXTAREA_CLASS =
  'block w-full rounded-md border border-[rgb(var(--line-strong))] bg-[rgb(var(--surface))] px-3 py-2 text-[14px] leading-6 text-[rgb(var(--ink))] '
  + 'placeholder:text-[rgb(var(--ink-faint))] focus:border-[var(--sb-accent-bg)] focus:outline-none '
  + 'focus:ring-1 focus:ring-[var(--sb-accent-bg)] disabled:bg-[rgb(var(--surface-subtle))] disabled:text-[rgb(var(--ink-faint))]';

/**
 * 区画の中の主操作（その区画でいちばん強い操作が道具バーに無いときだけ使う）。
 * 例: お知らせの「掲載する」。1 区画に 1 つまで。
 */
export const SETTINGS_PRIMARY_BUTTON_CLASS =
  'inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-md bg-[var(--sb-accent-bg)] px-3 '
  + 'text-[14px] leading-[22px] font-medium text-[rgb(var(--on-accent))] transition-colors hover:bg-[var(--accent-hover)] '
  + 'disabled:cursor-not-allowed disabled:opacity-50';

/** フォーム行の外で使うラベル（区画の中に自前のフォームを持つパネル用）。 */
export const SETTINGS_LABEL_CLASS = 'mb-1.5 block text-[14px] font-medium leading-5 text-[rgb(var(--ink))]';

/**
 * 取り消し系（ログアウト・削除）の控えめなボタン。塗らずに赤文字＋赤枠にして、
 * 主操作（道具バーの「保存」）と重みが競合しないようにする。
 */
export const SETTINGS_DANGER_BUTTON_CLASS =
  'inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-md border border-[rgb(var(--danger-ink)/0.25)] bg-[rgb(var(--surface))] px-3 '
  + 'text-[14px] leading-[22px] font-medium text-[rgb(var(--danger-ink))] transition-colors hover:bg-[rgb(var(--danger-soft))] '
  + 'disabled:cursor-not-allowed disabled:opacity-50';

/** 設定共通の入力欄クラス（高さ 36px 固定版。スモロジ本体の設定画面と同じ。既定の SETTINGS_INPUT_CLASS は変えない）。 */
export const SETTINGS_INPUT_H9_CLASS =
  'block h-9 w-full rounded-md border border-[rgb(var(--line-strong))] bg-[rgb(var(--surface))] px-3 text-[14px] leading-[22px] text-[rgb(var(--ink))] '
  + 'placeholder:text-[rgb(var(--ink-faint))] focus:border-[var(--sb-accent-bg)] focus:outline-none '
  + 'focus:ring-1 focus:ring-[var(--sb-accent-bg)] disabled:bg-[rgb(var(--surface-subtle))] disabled:text-[rgb(var(--ink-faint))]';

/** ゴーストボタン（高さ 36px・折り返さない版）。既定の SETTINGS_GHOST_BUTTON_CLASS は h-8 のまま。 */
export const SETTINGS_GHOST_BUTTON_H9_CLASS =
  'inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-md border border-[rgb(var(--line-strong))] bg-[rgb(var(--surface))] px-3 '
  + 'text-[14px] leading-[22px] font-medium text-[rgb(var(--ink))] transition-colors hover:bg-[rgb(var(--surface-subtle))] '
  + 'disabled:cursor-not-allowed disabled:opacity-50';

/** 区画・フォーム行の幅の組み方。'default'＝従来（sm 以上で 2 カラム）。'wide'＝スモロジ本体（xl 以上で 2 カラム・コントロール側 720px 上限）。 */
export type SettingsLayout = 'default' | 'wide';
/** 設定共通の入力欄クラス（幅は呼び出し側で決める）。 */
export const SETTINGS_INPUT_CLASS =
  'w-full rounded-md border border-[rgb(var(--line-strong))] bg-[rgb(var(--surface))] px-3 py-2 text-[14px] leading-[22px] text-[rgb(var(--ink))] '
  + 'placeholder:text-[rgb(var(--ink-faint))] focus:border-[var(--sb-accent-bg)] focus:outline-none '
  + 'focus:ring-1 focus:ring-[var(--sb-accent-bg)] disabled:bg-[rgb(var(--surface-subtle))] disabled:text-[rgb(var(--ink-faint))]';

/** 区画の中の副次ボタン（ゴースト）。主操作の塗りは道具バーの「保存」だけ。 */
export const SETTINGS_GHOST_BUTTON_CLASS =
  'inline-flex h-8 items-center gap-1.5 rounded-md border border-[rgb(var(--line-strong))] bg-[rgb(var(--surface))] px-3 '
  + 'text-[14px] leading-[22px] font-medium text-[rgb(var(--ink))] transition-colors hover:bg-[rgb(var(--surface-subtle))] '
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
        checked ? 'bg-[var(--sb-accent-bg)]' : 'bg-[rgb(var(--surface-muted))]'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <span
        aria-hidden
        className={`inline-block h-3.5 w-3.5 transform rounded-full shadow transition-transform ${
          checked ? 'translate-x-[18px] bg-[var(--accent-on)]' : 'translate-x-0.5 bg-white'
        }`}
      />
    </button>
  );
}
