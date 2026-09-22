import { type ReactNode } from 'react';
type Props = {
    total: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    className?: string;
    /** 件数の数え方が「行」でないときの単位（納品プラン一覧＝件、など）。 */
    unitLabel?: string;
    /**
     * コンパクト表示（StickyPagerBar が子要素に自動で注入する）。件数テキストと
     * 最初へ／最後へを省き、‹ 現在/全 › と件数セレクトだけの最小限のピルにする。
     * 単独で使う（一覧に埋め込む簡易ページャなど）ときは指定しない＝従来のフル表示のまま。
     */
    compact?: boolean;
};
/**
 * ページャの表示に必要な計算だけを切り出した純粋関数（テスト用）。
 * page/total/pageSize から安全な現在ページ・全ページ数・表示範囲を導く。
 */
export declare function computePaginationView(total: number, page: number, pageSize: number): {
    totalPages: number;
    safePage: number;
    start: number;
    end: number;
};
export declare function Pagination({ total, page, pageSize, onPageChange, onPageSizeChange, pageSizeOptions, className, unitLabel, compact, }: Props): import("react").JSX.Element;
/**
 * 一覧カードの下端に浮かせるページャ（全一覧で共通）。liquid-glass のピルを
 * ビューポート右下に固定表示する。
 *
 * カードの下端が画面内に入るまではビューポート下端に留まり、行がピルの下へ潜り込む。
 * カード内 sticky なので一覧が短いときは自然に普通のフッターとして収まる（分岐不要）。
 *
 * ★ 前提が2つある。どちらかを崩すと sticky は黙って効かなくなる:
 *   1. 祖先に `overflow: hidden` を作らないこと。角丸で中身を切りたい場合は `overflow-clip`
 *      を使う（見た目は同じで、スクロールコンテナを作らない）。
 *   2. スクロールコンテナ（ChromeMain）の下余白を padding で取らないこと。padding は
 *      sticky の基準矩形を縮めるのでバーが浮く。globals.css の
 *      `.app-main-bottom-space::after`（擬似要素のスペーサー）で取る。
 *
 * z の序列（smologi の実態）: 表ヘッダー z-20 ＜ 固定列 z-[25] ＜ このピル z-[26] ＜
 * トップバー（fixed）z-30 ＜ モーダル z-40 以上。
 *
 * 横スクロールする一覧（商品マスタ・出荷一覧など）でも、ListFooter は表の
 * `overflow-x-auto` コンテナの外（カード直下の兄弟）に置く決まりなので、sticky の
 * 基準は常にカード全体の幅になる。透明な行を `flex justify-end` で右寄せしている
 * （ピル側は `pointer-events-auto`）ため、位置調整の props は不要。
 *
 * 面の色は tone で切り替える（画面ごとに className で bg を渡す方式はやめた。ダーク/
 * reduced-transparency の配色は globals.css の `.app-sticky-glass[data-tone=...]`
 * 側に一本化してあり、className で Tailwind の bg-* を重ねると生成順次第でそちらが勝って
 * 配色が消えることがあったため）。className は「透明な行（sticky の基準）に足す
 * クラス」用に残してある（位置調整など）。
 */
export declare function StickyPagerBar({ tone, className, title, children, }: {
    /** ピル面の色。商品マスタの編集モードなど、既定と違う配色が要る画面だけ 'amber' を渡す。 */
    tone?: 'default' | 'amber';
    /** 透明な行（sticky の基準）に足すクラス。ピルの面色はここではなく tone で指定する。 */
    className?: string;
    /** ピルに乗せる補足説明（例: バリエーション表示中の注記）。 */
    title?: string;
    children: ReactNode;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=Pagination.d.ts.map