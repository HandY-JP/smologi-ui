/** useListPageSize の戻り値。ListFooter へそのまま渡す。 */
export interface ListPageSize {
    /** いまの表示件数（取得件数・スライスに使う）。 */
    value: number;
    /** 件数の変更（保存まで面倒を見る）。 */
    set: (size: number) => void;
    /** セレクトに出す選択肢。 */
    options: number[];
}
/**
 * 一覧の表示件数（ブラウザに覚えさせる）。
 *
 * localStorage は SSR に無いので、初期値は fallback のままにしてマウント後に読み直す
 * （useState の初期化子で読むとサーバー描画とズレて hydration エラーになる）。
 */
export declare function useListPageSize(fallback: number, { storageKey, options, storage, onChange, }?: {
    /** list-page-size.ts の PAGE_SIZE_STORAGE_KEYS のどれか。省略すると保存しない。 */
    storageKey?: string;
    /** 選択肢（既定は一覧共通の LIST_PAGE_SIZE_OPTIONS）。 */
    options?: number[];
    /** 保存形式が独自の画面（商品マスタ）用の差し替え口。storageKey より優先する。 */
    storage?: {
        read: () => number;
        write: (size: number) => void;
    };
    /** 件数を変えたときに画面側でやること（ページを1へ戻す・選択を解除する等）。 */
    onChange?: (size: number) => void;
}): ListPageSize;
/**
 * 一覧カードの下端に置くフッター（総件数・ページ送り・件数セレクトのガラスピル）。
 *
 * カードの下端が画面内に入るまではビューポート下端に留まり、行がピルの下へ潜り込む。
 * ★ 親のカードは overflow-hidden ではなく overflow-clip にすること
 *   （overflow-hidden はスクロールコンテナを作り、sticky bottom-0 が効かなくなる）。
 */
export declare function ListFooter({ total, page, onPageChange, pageSize, tone, className, }: {
    total: number;
    /** 1始まり。 */
    page: number;
    onPageChange: (page: number) => void;
    /** useListPageSize の戻り値をそのまま渡す。 */
    pageSize: ListPageSize;
    /** ピル面の色だけ画面ごとに違う場合（商品マスタの編集モード＝amber）に渡す。 */
    tone?: 'default' | 'amber';
    /** 透明な行（sticky の基準）に足すクラス。ピルの面色はここではなく tone で指定する。 */
    className?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=ListFooter.d.ts.map