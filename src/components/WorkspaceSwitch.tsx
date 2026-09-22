'use client';

import type { WorkspaceKind } from '../lib/workspace';

/**
 * 「倉庫画面 ⇄ お客様画面（自社）」の2分割セグメントトグル。
 *
 * 置き場所: サイドバー最上部のドック（SidebarToggleDock）の**右端**。
 * ▶（開閉）／🔔（通知）／?（ヘルプ）／⋮⋮⋮（アプリ一覧）の後ろに並ぶ。
 *
 * 見た目:
 * - 2つのアイコンボタンが1つの角丸ピル（高さ32px＝ドックの他アイコンと同じ）に入り、
 *   選択側だけアクセント色で塗る（Claude アプリのセグメントトグルの流儀）。
 * - 地色は --sb-hover（サイドバー上に載るので周囲と馴染む）。選択側は --sb-accent-bg ＋
 *   --accent-on。--sb-heading を使うと暗色テーマで「白地に白アイコン」になるため使わない。
 *
 * 出す条件・折りたたみ時の扱いは呼び出し側（SidebarToggleDock）が持つ。
 * ここは「押されたら onSwitch(target) を呼ぶだけ」の見た目部品にしておく
 * （遷移や憑依の張り替えはサイドバー側の責務）。
 *
 * アクセシビリティ: role="radiogroup" ＋ 2つの role="radio"。矢印キーでの移動は
 * ブラウザ既定の Tab 移動で足りる（項目が2つだけ・どちらも常に押せる）ため足していない。
 */
export function WorkspaceSwitch({
  current,
  onSwitch,
  onPrefetch,
  disabled = false,
  pendingTarget = null,
}: {
  /** いまどちらのワークスペースにいるか。 */
  current: WorkspaceKind;
  /** 押された側（= 切替先）。すでに現在地なら呼ばれない。 */
  onSwitch: (target: WorkspaceKind) => void;
  /** ホバー・フォーカスで呼ぶ先読み（遷移先のコード/RSCを温める）。 */
  onPrefetch?: (target: WorkspaceKind) => void;
  /** 切替処理の実行中など、両方押せなくするとき。 */
  disabled?: boolean;
  /**
   * 切り替え中の行き先。指定すると、遷移が終わる前でも**押した側を選択済みに見せる**
   * （楽観的表示）。待っている間に「押したのに何も変わらない」と感じさせないための仕掛け。
   */
  pendingTarget?: WorkspaceKind | null;
}) {
  // 遷移の完了を待たずに選択側を反転する。完了後は current が行き先に変わるので、
  // 表示は連続したまま（点滅しない）。
  const shown = pendingTarget ?? current;
  const item = (
    kind: WorkspaceKind,
    label: string,
    title: string,
    icon: React.ReactNode,
  ) => {
    const selected = shown === kind;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        aria-label={label}
        title={title}
        disabled={disabled}
        onPointerEnter={() => onPrefetch?.(kind)}
        onFocus={() => onPrefetch?.(kind)}
        onClick={() => {
          if (kind === current || disabled) return;
          onSwitch(kind);
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
  };

  return (
    <div
      role="radiogroup"
      aria-label="画面の切り替え"
      className="flex h-8 flex-shrink-0 items-center gap-0.5 rounded-full px-0.5"
      style={{ backgroundColor: 'var(--sb-hover)' }}
    >
      {item(
        'logistics',
        '倉庫画面',
        '倉庫画面（スモロジ管理）',
        // 倉庫＝building/warehouse（切妻屋根＋シャッター）
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 21v-6h8v6" />
          <path strokeLinecap="round" d="M8 17.5h8" />
        </svg>,
      )}
      {item(
        'customer',
        'お客様画面',
        'お客様画面（自社）',
        // お客様＝人（1人）
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </svg>,
      )}
    </div>
  );
}
