'use client';
// ★ 一覧のフッターはこれ1つ。個別組み立て禁止。
// 例外: 仕入先ポータル(sp)は対象外（別ビジュアル系で、表示件数も独自の 25/50/100）。
//
// 「ページ送り＋表示件数セレクト＋一覧カード下端への貼り付き＋件数のブラウザ保存」は
// 全一覧で同じ振る舞いにする。以前は画面ごとに StickyPagerBar + Pagination +
// useState/useEffect(readStoredPageSize) + writeStoredPageSize を手で組み立てていたため、
// 貼り付きを忘れる・保存キーを付け忘れる・選択肢が画面ごとに違う、といったズレが出ていた。
// 新しい一覧を作るときは、この2つ（useListPageSize と ListFooter）だけを使うこと。
//
//   const listPageSize = useListPageSize(50, { storageKey: PAGE_SIZE_STORAGE_KEYS.xxx });
//   const pageSize = listPageSize.value;           // 取得・スライスに使う
//   ...
//   <ListFooter total={total} page={page} onPageChange={setPage} pageSize={listPageSize} />
//
// 保存形式が独自の画面（商品マスタ＝表示設定の JSON にまとめて入れている）は
// storage: { read, write } を渡して読み書きだけ差し替える（口はこの1つだけ）。
import { useCallback, useEffect, useState } from 'react';
import { Pagination, StickyPagerBar } from './Pagination';
import { LIST_PAGE_SIZE_OPTIONS, readStoredPageSize, writeStoredPageSize } from '../lib/list-page-size';

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
export function useListPageSize(
  fallback: number,
  {
    storageKey,
    options = LIST_PAGE_SIZE_OPTIONS,
    storage,
    onChange,
  }: {
    /** list-page-size.ts の PAGE_SIZE_STORAGE_KEYS のどれか。省略すると保存しない。 */
    storageKey?: string;
    /** 選択肢（既定は一覧共通の LIST_PAGE_SIZE_OPTIONS）。 */
    options?: number[];
    /** 保存形式が独自の画面（商品マスタ）用の差し替え口。storageKey より優先する。 */
    storage?: { read: () => number; write: (size: number) => void };
    /** 件数を変えたときに画面側でやること（ページを1へ戻す・選択を解除する等）。 */
    onChange?: (size: number) => void;
  } = {},
): ListPageSize {
  const [value, setValue] = useState(fallback);

  const readStored = storage?.read;
  useEffect(() => {
    if (readStored) {
      setValue(readStored());
      return;
    }
    if (!storageKey) return;
    setValue(readStoredPageSize(storageKey, fallback, options));
    // fallback / options はレンダーごとに作り直される可能性があるので deps から外す
    // （見るのはマウント直後の1回だけでよい）。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, readStored]);

  const writeStored = storage?.write;
  const set = useCallback((size: number) => {
    setValue(size);
    if (writeStored) writeStored(size);
    else if (storageKey) writeStoredPageSize(storageKey, size, options);
    onChange?.(size);
    // 同上（onChange は毎レンダー作り直されるが、呼ぶのはクリック時なので最新を見れば足りる）。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, writeStored, onChange]);

  return { value, set, options };
}

/**
 * 一覧カードの下端に置くフッター（総件数・ページ送り・件数セレクトのガラスピル）。
 *
 * カードの下端が画面内に入るまではビューポート下端に留まり、行がピルの下へ潜り込む。
 * ★ 親のカードは overflow-hidden ではなく overflow-clip にすること
 *   （overflow-hidden はスクロールコンテナを作り、sticky bottom-0 が効かなくなる）。
 */
export function ListFooter({
  total,
  page,
  onPageChange,
  pageSize,
  tone,
  className,
}: {
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
}) {
  return (
    <StickyPagerBar tone={tone} className={className}>
      <Pagination
        total={total}
        page={page}
        pageSize={pageSize.value}
        onPageChange={onPageChange}
        onPageSizeChange={pageSize.set}
        pageSizeOptions={pageSize.options}
      />
    </StickyPagerBar>
  );
}
