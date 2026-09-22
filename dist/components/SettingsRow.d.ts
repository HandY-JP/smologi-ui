import type { ReactNode } from 'react';
/**
 * フォーム行（左ラベル／右コントロール）。
 * `hint` はラベルの下に出す補足。`control` が長い説明を持つ場合は children に自由に書いてよい。
 */
export declare function SettingsRow({ label, hint, htmlFor, children, 
/** ラベルを付けない（説明文だけの行・表を丸ごと置く行）。 */
full, }: {
    label?: string;
    hint?: ReactNode;
    htmlFor?: string;
    children: ReactNode;
    full?: boolean;
}): import("react").JSX.Element;
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