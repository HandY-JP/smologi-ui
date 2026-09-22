// 一覧の外枠（表を包むカード）はこの1つに統一する。個別ページで rounded-xl / border-2 に
// しないこと（出荷一覧だけ太く見えていた事故の再発防止）。
//
// overflow-clip: 角丸で中身を切るための overflow は要るが、overflow-hidden は
// スクロールコンテナを作り末尾ページャの sticky bottom-0 が効かなくなる。
export const LIST_CARD_CLASS = 'overflow-clip rounded-lg border border-gray-200 bg-white';

/**
 * 面色（bg-white）や枠色（border-gray-200）を差し替える必要がある一覧向け
 * （例: 操作モード中の amber 面）。`bg-white` と `border-gray-200` を外し、
 * 渡した extra クラス（例: 'border-amber-200 bg-amber-50'）を足す。
 * 同じユーティリティを両方残すと Tailwind の生成順でどちらが勝つか
 * 不定になるため、必ず外してから extra を足す。
 */
export function listCardClass(extra?: string): string {
  const base = LIST_CARD_CLASS
    .replace(/\bbg-white\b/, '')
    .replace(/\bborder-gray-200\b/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return extra ? `${base} ${extra}` : base;
}
