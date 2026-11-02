import type { ReactNode } from 'react';
/**
 * 商品行の「コード欄」の中身（td は返さない。td・sticky・幅・クリック処理はアプリ側）。
 * 上段 = 商品コード / ASIN、下段 = JAN / SKU（下揃え）。高さは h-14 で名前欄とそろえる。
 * primary / secondary にクリックでコピーする button やリンクを渡してよい（文字の大きさ・色は
 * ここで与え、button 側は `block w-full truncate text-left` 程度でよい）。
 * secondary だけ渡したときは上段扱い（primary と同じ大きさ・色 ink）にする。
 */
export declare function ProductCodeStack({ primary, secondary, primaryClassName, secondaryClassName, }: {
    primary?: ReactNode;
    secondary?: ReactNode;
    /** 色を状態で変えたいときに上書き（例: 保存中は ink）。 */
    primaryClassName?: string;
    /** 下段の文字クラス（大きさ・色）。アプリ固有の色にしたいときに差し替える。 */
    secondaryClassName?: string;
}): import("react").JSX.Element;
/**
 * 商品行の「名前欄」の中身。上段 = 商品名（15px・2 行まで）+ 右にバッジ、下段 = 補助行（13px 薄色）。
 */
export declare function ProductNameStack({ primary, badges, secondary, primaryColorClassName, secondaryColorClassName, }: {
    primary: ReactNode;
    badges?: ReactNode;
    secondary?: ReactNode;
    /** 色だけ差し替える（アプリ固有の配色用）。 */
    primaryColorClassName?: string;
    secondaryColorClassName?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=ProductCells.d.ts.map