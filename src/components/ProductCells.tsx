import type { ReactNode } from 'react';
import {
  FLAT_CODE_PRIMARY_CLASS,
  FLAT_CODE_SECONDARY_CLASS,
  FLAT_NAME_PRIMARY_CLASS,
  FLAT_NAME_PRIMARY_COLOR_CLASS,
  FLAT_NAME_SECONDARY_COLOR_CLASS,
  FLAT_NAME_SECONDARY_CLASS,
} from '../lib/flat-table';

/**
 * 商品行の「コード欄」の中身（td は返さない。td・sticky・幅・クリック処理はアプリ側）。
 * 上段 = 商品コード / ASIN、下段 = JAN / SKU（下揃え）。高さは h-14 で名前欄とそろえる。
 * primary / secondary にクリックでコピーする button やリンクを渡してよい（文字の大きさ・色は
 * ここで与え、button 側は `block w-full truncate text-left` 程度でよい）。
 * secondary だけ渡したときは上段扱い（primary と同じ大きさ・色 ink）にする。
 */
export function ProductCodeStack({
  primary,
  secondary,
  primaryClassName = FLAT_CODE_PRIMARY_CLASS,
  secondaryClassName = FLAT_CODE_SECONDARY_CLASS,
}: {
  primary?: ReactNode;
  secondary?: ReactNode;
  /** 色を状態で変えたいときに上書き（例: 保存中は ink）。 */
  primaryClassName?: string;
  /** 下段の文字クラス（大きさ・色）。アプリ固有の色にしたいときに差し替える。 */
  secondaryClassName?: string;
}) {
  const hasPrimary = primary != null && primary !== false;
  const hasSecondary = secondary != null && secondary !== false;
  return (
    <div className="flex h-14 flex-col overflow-hidden">
      {hasPrimary && <div className={`min-w-0 truncate ${primaryClassName}`}>{primary}</div>}
      {hasSecondary && (
        <div
          className={
            hasPrimary
              ? `mt-auto min-w-0 pt-0.5 truncate ${secondaryClassName}`
              : 'min-w-0 truncate text-base tabular-nums text-[rgb(var(--ink))]'
          }
        >
          {secondary}
        </div>
      )}
    </div>
  );
}

/**
 * 商品行の「名前欄」の中身。上段 = 商品名（15px・2 行まで）+ 右にバッジ、下段 = 補助行（13px 薄色）。
 */
export function ProductNameStack({
  primary,
  badges,
  secondary,
  primaryColorClassName = FLAT_NAME_PRIMARY_COLOR_CLASS,
  secondaryColorClassName = FLAT_NAME_SECONDARY_COLOR_CLASS,
}: {
  primary: ReactNode;
  badges?: ReactNode;
  secondary?: ReactNode;
  /** 色だけ差し替える（アプリ固有の配色用）。 */
  primaryColorClassName?: string;
  secondaryColorClassName?: string;
}) {
  return (
    <div className="flex h-14 flex-col overflow-hidden">
      <div className="flex min-w-0 items-start gap-2 overflow-hidden">
        <div className={`${FLAT_NAME_PRIMARY_CLASS} ${primaryColorClassName}`}>{primary}</div>
        {badges}
      </div>
      {secondary != null && secondary !== false && <div className={`${FLAT_NAME_SECONDARY_CLASS} ${secondaryColorClassName}`}>{secondary}</div>}
    </div>
  );
}
