// 一覧の「表示件数」をブラウザに覚えさせる小さなヘルパー。
//
// 商品マスタは表示設定（列のON/OFF・並び順）とまとめて localStorage へ保存しているが、
// 入荷・受注/出荷・返品は表示設定を持たないので、件数だけを独立したキーで保存する。
// キーは画面ごとに分ける（ある画面で 200 件にしたら他の重い一覧まで 200 件になる、を防ぐ）。

/**
 * 一覧共通の表示件数の選択肢（管理画面・お客様画面で共通）。
 *
 * 2026-09 に 30/50/100/200 から 50/100/200/500 へ統一した。以前の選択肢で保存済みの
 * 30（や旧 Pagination 既定の 25）は「選択肢に無い値」なので readStoredPageSize が
 * fallback（＝各画面の 50）へ落とす＝ユーザーは何もしなくて済む（list-page-size.test.ts）。
 * 選択肢を増やすときは一覧APIの limit 上限（500）も併せて確認すること。
 */
export const LIST_PAGE_SIZE_OPTIONS = [50, 100, 200, 500];

/** 画面ごとの保存キー。値は localStorage に直接入るので、後から変えないこと。 */
export const PAGE_SIZE_STORAGE_KEYS = {
  customerInbounds: 'smologi:inbounds:page-size',
  adminInbounds: 'smologi:admin-inbounds:page-size',
  adminShipments: 'smologi:admin-shipments:page-size',
  adminInternalTransfers: 'smologi:admin-internal-transfers:page-size',
  // 請求ページの「内訳」表（画面ごとに1キー。タブごとには分けない）。
  adminBilling: 'smologi:admin-billing:page-size',
  customerOrders: 'smologi:orders:page-size',
  customerShipments: 'smologi:shipments:page-size',
  // 返品ワークスペース（ReturnsWorkspace）は admin・お客様の両方で同じ画面を使うので
  // キーも共用。`customer` を冠すると実態と食い違うため付けない。
  returns: 'smologi:returns:page-size',
  customerPurchaseOrders: 'smologi:purchase-orders:page-size',
  customerDestinations: 'smologi:destinations:page-size',
  customerProductSets: 'smologi:product-sets:page-size',
} as const;

/**
 * 保存済みの表示件数を読む。未保存・壊れている・選択肢に無い値なら fallback を返す。
 * localStorage は SSR に無い／プライベートモードで例外を投げることがあるので必ず握る。
 */
export function readStoredPageSize(key: string, fallback: number, options: number[] = LIST_PAGE_SIZE_OPTIONS): number {
  if (typeof window === 'undefined') return fallback;
  try {
    const size = Number(window.localStorage.getItem(key));
    return options.includes(size) ? size : fallback;
  } catch {
    return fallback;
  }
}

/** 表示件数を保存する（選択肢に無い値は保存しない）。 */
export function writeStoredPageSize(key: string, size: number, options: number[] = LIST_PAGE_SIZE_OPTIONS): void {
  if (typeof window === 'undefined' || !options.includes(size)) return;
  try {
    window.localStorage.setItem(key, String(size));
  } catch {
    /* 保存できなくても表示は続ける（プライベートモード等） */
  }
}
