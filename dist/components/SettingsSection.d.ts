import { type ReactNode } from 'react';
import type { SettingsLayout } from './SettingsRow';
export declare function SettingsPage({ children, className, layout, }: {
    children: ReactNode;
    className?: string;
    /** 'default'＝従来（max-w-4xl）。'wide'＝全画面幅（読みやすさの上限は SettingsRow の layout='wide' 側）。 */
    layout?: SettingsLayout;
}): import("react").JSX.Element;
/**
 * 設定の区画（セクション）。
 * 2 つ目以降は上に横罫線が入る（`SettingsPage` の直下に並べるだけでよい）。
 */
export declare function SettingsSection({ title, description, 
/** 区画見出しの右に置く小さな操作（「追加」など）。主操作は道具バーへ。 */
action, 
/** 検索の対象にする語（見出し・説明のほかに拾わせたいもの）。 */
searchText, children, id, layout, }: {
    title: string;
    description?: ReactNode;
    action?: ReactNode;
    searchText?: string[];
    children: ReactNode;
    id?: string;
    /** 'default'＝従来の余白・説明文 12px。'wide'＝スモロジ本体（区画 py-7・説明文 13px/68ch・子の間隔 20px）。 */
    layout?: SettingsLayout;
}): import("react").JSX.Element | null;
/**
 * 区画の中の小見出し（1 区画に 2 つ以上のかたまりがあるとき）。
 * 区画見出し（15px bold）と行ラベル（14px medium）の間の階層。
 */
export declare function SettingsSubheading({ children, hint, }: {
    children: ReactNode;
    hint?: ReactNode;
}): import("react").JSX.Element;
/** 値が無い・まだ読めないときの控えめなプレースホルダ。 */
export declare function SettingsEmpty({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
/** 閲覧のみ権限のときに区画の先頭へ出す帯（全区分で同じ文言・同じ見た目にする）。 */
export declare function SettingsReadOnlyNotice({ children }: {
    children?: ReactNode;
}): import("react").JSX.Element;
/**
 * 区画の中の畳み（2026-09-28 簡素化監査 タスク 4）。
 *
 * - `kind="advanced"`: 既定値のまま使えば困らない項目（「詳細設定」）。既定は閉じる。
 * - `kind="setup"`: 初回セットアップで一度決めた項目（「セットアップの内容を見直す」）。
 *   未セットアップのうちは開いておく（呼び出し側が defaultOpen を渡す）。
 * 設定の検索語が入っている間は、中の項目が見つかるよう開いて出す。
 * 中の項目は畳んでいても保存値はそのまま（見えないだけで、動きは変わらない）。
 */
export declare function SettingsDisclosure({ kind, title, hint, defaultOpen, children, }: {
    kind?: 'advanced' | 'setup';
    /** 省略時は kind に応じて「詳細設定」／「セットアップの内容を見直す」。 */
    title?: string;
    /** 見出しの右に出す短い補足（「変更あり」など）。 */
    hint?: ReactNode;
    defaultOpen?: boolean;
    children: ReactNode;
}): import("react").JSX.Element;
//# sourceMappingURL=SettingsSection.d.ts.map