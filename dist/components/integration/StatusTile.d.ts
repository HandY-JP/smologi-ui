import type { StatusTileModel } from './types';
export declare function StatusTile({ label, tone, value, sub, lastSuccessAt }: StatusTileModel): import("react").JSX.Element;
/** 状態タイルの並び。幅に応じて折り返す（スマホは 1 列）。 */
export declare function StatusTileGrid({ tiles }: {
    tiles: StatusTileModel[];
}): import("react").JSX.Element | null;
//# sourceMappingURL=StatusTile.d.ts.map