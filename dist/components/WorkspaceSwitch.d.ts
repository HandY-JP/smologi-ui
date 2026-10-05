import type { ReactNode } from 'react';
import type { WorkspaceKind } from '../lib/workspace';
/** 切替の 1 項目。`kind` は呼び出し側が決める識別子（onSelect/onSwitch にそのまま渡る）。 */
export type WorkspaceSwitchItem<K extends string = string> = {
    kind: K;
    /** aria-label（読み上げ名）。 */
    label: string;
    /** ホバー時の title。省略時は label。 */
    title?: string;
    icon: ReactNode;
};
/** 倉庫＝箱（段ボール箱の線画。2026-09-23 に smologi 本体で差し替え）。 */
export declare const WAREHOUSE_ICON: import("react").JSX.Element;
/** お客様＝店舗（storefront の線画。2026-09-23 に smologi 本体で差し替え）。 */
export declare const STOREFRONT_ICON: import("react").JSX.Element;
/** props なし（倉庫/お客様）のときの既定の 2 項目。 */
export declare const DEFAULT_WORKSPACE_ITEMS: WorkspaceSwitchItem<WorkspaceKind>[];
/**
 * 画面切替の 2 分割セグメントトグル（既定は「倉庫画面 ⇄ お客様画面（自社）」）。
 *
 * 置き場所: サイドバー最上部のドック（SidebarToggleDock）の**右端**。
 *
 * 見た目:
 * - アイコンボタンが 1 つの角丸ピル（高さ32px＝ドックの他アイコンと同じ）に入り、
 *   選択側だけアクセント色で塗る（Claude アプリのセグメントトグルの流儀）。
 * - 地色は --sb-hover。選択側は --sb-accent-bg ＋ --accent-on。
 *   --sb-heading を使うと暗色テーマで「白地に白アイコン」になるため使わない。
 *
 * 出す条件・折りたたみ時の扱いは呼び出し側が持つ。ここは「押されたら
 * onSelect(kind)（または onSwitch）を呼ぶだけ」の見た目部品。
 *
 * v0.4.0: `items` で任意の項目に差し替え可能（b2b など）。`items` 省略時は従来どおり
 * 倉庫/お客様で、`onSwitch` / `pendingTarget` も従来の名前のまま使える。
 * アクセシビリティ: role="radiogroup" ＋ 各 role="radio"。
 */
export declare function WorkspaceSwitch<K extends string = WorkspaceKind>({ items, current, onSelect, onSwitch, onPrefetch, disabled, pendingTarget, pending, ariaLabel, }: {
    /** 項目（2 件想定）。省略時は倉庫/お客様（K は WorkspaceKind）。 */
    items?: WorkspaceSwitchItem<K>[];
    /** いま選択中の kind。 */
    current: K;
    /** 押された側（= 切替先）。すでに現在地なら呼ばれない。onSwitch の別名（両方あれば両方呼ぶ）。 */
    onSelect?: (target: K) => void;
    /** 従来名。onSelect と同じ。 */
    onSwitch?: (target: K) => void;
    /** ホバー・フォーカスで呼ぶ先読み（遷移先のコード/RSCを温める）。 */
    onPrefetch?: (target: K) => void;
    /** 切替処理の実行中など、全項目を押せなくするとき。 */
    disabled?: boolean;
    /**
     * 切り替え中の行き先。指定すると、遷移が終わる前でも**押した側を選択済みに見せる**
     * （楽観的表示）。`pending` は同じものの別名（pending が優先）。
     */
    pendingTarget?: K | null;
    pending?: K | null;
    /** radiogroup の aria-label。 */
    ariaLabel?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=WorkspaceSwitch.d.ts.map