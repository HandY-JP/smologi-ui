import type { ReactNode } from 'react';
/**
 * フォーム行（左ラベル／右コントロール）。
 * `hint` はラベルの下に出す補足。`control` が長い説明を持つ場合は children に自由に書いてよい。
 */
export declare function SettingsRow({ label, hint, htmlFor, children, 
/** ラベルを付けない（説明文だけの行・表を丸ごと置く行）。上限幅も掛けない＝全幅。 */
full, layout, }: {
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
}): import("react").JSX.Element;
/** フォーム行のコントロール列の最大幅（layout='wide' の読みやすさの上限）。 */
export declare const SETTINGS_CONTROL_MAX_W = "720px";
/** 読み取り専用の値（フォーム行の右側に置く）。全区分で同じ見た目にする。 */
export declare function SettingsValue({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
/** 複数行の入力欄（高さだけ入力欄クラスと違う）。 */
export declare const SETTINGS_TEXTAREA_CLASS: string;
/**
 * 区画の中の主操作（その区画でいちばん強い操作が道具バーに無いときだけ使う）。
 * 例: お知らせの「掲載する」。1 区画に 1 つまで。
 */
export declare const SETTINGS_PRIMARY_BUTTON_CLASS: string;
/** フォーム行の外で使うラベル（区画の中に自前のフォームを持つパネル用）。 */
export declare const SETTINGS_LABEL_CLASS = "mb-1.5 block text-[14px] font-medium leading-5 text-[rgb(var(--ink))]";
/**
 * 取り消し系（ログアウト・削除）の控えめなボタン。塗らずに赤文字＋赤枠にして、
 * 主操作（道具バーの「保存」）と重みが競合しないようにする。
 */
export declare const SETTINGS_DANGER_BUTTON_CLASS: string;
/** 設定共通の入力欄クラス（高さ 36px 固定版。スモロジ本体の設定画面と同じ。既定の SETTINGS_INPUT_CLASS は変えない）。 */
export declare const SETTINGS_INPUT_H9_CLASS: string;
/** ゴーストボタン（高さ 36px・折り返さない版）。既定の SETTINGS_GHOST_BUTTON_CLASS は h-8 のまま。 */
export declare const SETTINGS_GHOST_BUTTON_H9_CLASS: string;
/** 区画・フォーム行の幅の組み方。'default'＝従来（sm 以上で 2 カラム）。'wide'＝スモロジ本体（xl 以上で 2 カラム・コントロール側 720px 上限）。 */
export type SettingsLayout = 'default' | 'wide';
/** 設定共通の入力欄クラス（幅は呼び出し側で決める）。 */
export declare const SETTINGS_INPUT_CLASS: string;
/** 区画の中の副次ボタン（ゴースト）。主操作の塗りは道具バーの「保存」だけ。 */
export declare const SETTINGS_GHOST_BUTTON_CLASS: string;
/** ON/OFF のトグル（設定モード共通）。 */
export declare function SettingsToggle({ checked, onChange, disabled, label, id, }: {
    checked: boolean;
    onChange: (next: boolean) => void;
    disabled?: boolean;
    /** 支援技術向けの名前（見出しが別にある場合も必ず付ける）。 */
    label: string;
    id?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=SettingsRow.d.ts.map