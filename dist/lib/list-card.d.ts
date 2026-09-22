export declare const LIST_CARD_CLASS = "overflow-clip rounded-lg border border-gray-200 bg-white";
/**
 * 面色（bg-white）や枠色（border-gray-200）を差し替える必要がある一覧向け
 * （例: 操作モード中の amber 面）。`bg-white` と `border-gray-200` を外し、
 * 渡した extra クラス（例: 'border-amber-200 bg-amber-50'）を足す。
 * 同じユーティリティを両方残すと Tailwind の生成順でどちらが勝つか
 * 不定になるため、必ず外してから extra を足す。
 */
export declare function listCardClass(extra?: string): string;
//# sourceMappingURL=list-card.d.ts.map