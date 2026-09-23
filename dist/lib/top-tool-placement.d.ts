/** 帯に出すか一覧のみにするか。既定は 'bar'。 */
export type TopToolPlacement = 'bar' | 'list';
export interface TopToolPlacementInput {
    key: string;
    placement?: TopToolPlacement;
    primary?: boolean;
}
/**
 * 画面の toolItems 定義順に関係なく、表示順を
 * 「＋新規（primary）」→「更新（key='refresh'）」→ その他（元の並びのまま）に揃える。
 * 帯（バー）にも ▾ 一覧にも同じ関数を通す。primary・refresh が無ければそのまま素通りする。
 */
export declare function orderToolItems<T extends TopToolPlacementInput>(items: T[]): T[];
/**
 * 帯に残す道具の key を返す（並びは呼び出し側の定義順のまま使うこと）。
 * - placement: 'list' の道具は最初から対象外。
 * - 'bar' の道具が maxBarItems を超えたら、超えた分は自動的に一覧のみへ回す。
 *   そのとき primary と 'refresh' は優先して残す（画面ごとの並び順に関係なく主操作は帯に残る）。
 */
export declare function selectBarItemKeys(items: TopToolPlacementInput[], maxBarItems: number): Set<string>;
/** 帯からあふれた（＝'bar' 指定なのに一覧のみへ回った）道具。開発時の警告に使う。 */
export declare function overflowedBarItems<T extends TopToolPlacementInput>(items: T[], barKeys: Set<string>): T[];
//# sourceMappingURL=top-tool-placement.d.ts.map