'use client';

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
export const WAREHOUSE_ICON = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="5" width="16" height="14" rx="1" />
    <path strokeLinecap="round" d="M4 9.5h16" />
    <path strokeLinecap="round" d="M12 9.5V19" />
  </svg>
);

/** お客様＝店舗（storefront の線画。2026-09-23 に smologi 本体で差し替え）。 */
export const STOREFRONT_ICON = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V10M20 21V10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10 4 4h16l1 6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 21v-5a2 2 0 0 1 4 0v5" />
  </svg>
);

/** props なし（倉庫/お客様）のときの既定の 2 項目。 */
export const DEFAULT_WORKSPACE_ITEMS: WorkspaceSwitchItem<WorkspaceKind>[] = [
  { kind: 'logistics', label: '倉庫画面', title: '倉庫画面（スモロジ管理）', icon: WAREHOUSE_ICON },
  { kind: 'customer', label: 'お客様画面', title: 'お客様画面（自社）', icon: STOREFRONT_ICON },
];

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
export function WorkspaceSwitch<K extends string = WorkspaceKind>({
  items,
  current,
  onSelect,
  onSwitch,
  onPrefetch,
  disabled = false,
  pendingTarget = null,
  pending,
  ariaLabel = '画面の切り替え',
}: {
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
}) {
  const list = (items ?? (DEFAULT_WORKSPACE_ITEMS as unknown as WorkspaceSwitchItem<K>[]));
  // 遷移の完了を待たずに選択側を反転する。完了後は current が行き先に変わるので、
  // 表示は連続したまま（点滅しない）。
  const shown = pending ?? pendingTarget ?? current;
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex h-8 flex-shrink-0 items-center gap-0.5 rounded-full px-0.5"
      style={{ backgroundColor: 'var(--sb-hover)' }}
    >
      {list.map(({ kind, label, title, icon }) => {
        const selected = shown === kind;
        return (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={title ?? label}
            disabled={disabled}
            onPointerEnter={() => onPrefetch?.(kind)}
            onFocus={() => onPrefetch?.(kind)}
            onClick={() => {
              if (kind === current || disabled) return;
              onSelect?.(kind);
              onSwitch?.(kind);
            }}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-accent-bg)] disabled:cursor-default"
            style={
              selected
                ? { backgroundColor: 'var(--sb-accent-bg)', color: 'var(--accent-on)' }
                : { color: 'var(--sb-text)' }
            }
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
