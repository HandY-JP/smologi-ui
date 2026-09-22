/**
 * 一覧セルの近傍に開く軽いポップオーバー。
 *
 * モーダルほど大げさにしたくないが、セル内に収まらない内訳を見せたい場面
 * （商品マスタ一覧の「在庫」＝利用可能／在庫合計／引当済／入荷予定／ケース換算、
 * 「原価」＝税抜／税込／改定予定／コピー）のために用意した共通部品。
 *
 * 表は overflow-x-auto の中にあり、td にも overflow-hidden が掛かっているため、
 * セル内の absolute 配置では切れてしまう。そこで body へ portal し、トリガーの
 * 画面座標から fixed で配置する（スクロール・リサイズで追従）。
 *
 * 同時に開くのは1つだけ。React の props を経由すると一覧の列定義（useMemo）が
 * 開閉のたびに作り直されてしまうので、開いているキーはモジュール内の小さなストアで持つ。
 */
import { type ReactNode } from 'react';
/** 開いているポップオーバーを閉じる（モーダルを開く前などに呼ぶ）。 */
export declare function closeCellPopover(): void;
/**
 * トリガー（セルの中身）とパネル（内訳）をまとめて描画する。
 * トリガーは素の <button> なので Enter / Space での開閉とフォーカスリングは標準どおり。
 */
export declare function CellPopover({ popoverKey, ariaLabel, title, panelLabel, panelWidth, align, triggerClassName, children, panel, }: {
    /** 同時に1つしか開かないための識別子（行ID＋列キーなど、画面内で一意にする） */
    popoverKey: string;
    ariaLabel: string;
    title?: string;
    /** パネルの見出し（role="dialog" のラベルにもなる） */
    panelLabel: string;
    panelWidth?: number;
    /** トリガーのどちら端にパネルを揃えるか */
    align?: 'left' | 'right';
    /**
     * トリガーの見た目を差し替える（既定はセル幅いっぱいの block）。
     * 表の見出し横に置く小さな「?」アイコンのように、セル以外で使うときに渡す。
     */
    triggerClassName?: string;
    /** セルの中身（配置は呼び出し側の要素に任せる） */
    children: ReactNode;
    /** 開いているときだけ評価される内訳の中身 */
    panel: ReactNode;
}): import("react").JSX.Element;
//# sourceMappingURL=CellPopover.d.ts.map