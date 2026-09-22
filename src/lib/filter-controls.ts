// 絞り込みUIの純粋ロジック（コンポーネントから切り出してテストできるようにしたもの）。
// 表示部品は src/components/ui/FilterPopover.tsx。

/**
 * 期間フィルタ（開始日／終了日）の入力エラー文言。問題なければ null。
 * 商品マスタの登録日・更新日レンジで使っていた判定を全画面共通に引き上げたもの。
 */
export function filterDateRangeError(from: string, to: string): string | null {
  if (!from || !to) return null;
  return from > to ? '開始日が終了日より後です' : null;
}

/** 期間フィルタが「絞り込み1件」として数えられる状態か（片側だけの指定も1件と数える）。 */
export function dateRangeActiveCount(from: string, to: string): number {
  return from || to ? 1 : 0;
}
