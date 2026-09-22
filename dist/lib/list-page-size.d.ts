/**
 * 一覧共通の表示件数の選択肢（管理画面・お客様画面で共通）。
 *
 * 2026-09 に 30/50/100/200 から 50/100/200/500 へ統一した。以前の選択肢で保存済みの
 * 30（や旧 Pagination 既定の 25）は「選択肢に無い値」なので readStoredPageSize が
 * fallback（＝各画面の 50）へ落とす＝ユーザーは何もしなくて済む（list-page-size.test.ts）。
 * 選択肢を増やすときは一覧APIの limit 上限（500）も併せて確認すること。
 */
export declare const LIST_PAGE_SIZE_OPTIONS: number[];
/** 画面ごとの保存キー。値は localStorage に直接入るので、後から変えないこと。 */
export declare const PAGE_SIZE_STORAGE_KEYS: {
    readonly customerInbounds: "smologi:inbounds:page-size";
    readonly adminInbounds: "smologi:admin-inbounds:page-size";
    readonly adminShipments: "smologi:admin-shipments:page-size";
    readonly adminInternalTransfers: "smologi:admin-internal-transfers:page-size";
    readonly adminBilling: "smologi:admin-billing:page-size";
    readonly customerOrders: "smologi:orders:page-size";
    readonly customerShipments: "smologi:shipments:page-size";
    readonly returns: "smologi:returns:page-size";
    readonly customerPurchaseOrders: "smologi:purchase-orders:page-size";
    readonly customerDestinations: "smologi:destinations:page-size";
    readonly customerProductSets: "smologi:product-sets:page-size";
};
/**
 * 保存済みの表示件数を読む。未保存・壊れている・選択肢に無い値なら fallback を返す。
 * localStorage は SSR に無い／プライベートモードで例外を投げることがあるので必ず握る。
 */
export declare function readStoredPageSize(key: string, fallback: number, options?: number[]): number;
/** 表示件数を保存する（選択肢に無い値は保存しない）。 */
export declare function writeStoredPageSize(key: string, size: number, options?: number[]): void;
//# sourceMappingURL=list-page-size.d.ts.map