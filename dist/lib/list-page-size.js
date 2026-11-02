const LIST_PAGE_SIZE_OPTIONS = [50, 100, 200, 500];
const PAGE_SIZE_STORAGE_KEYS = {
  customerInbounds: "smologi:inbounds:page-size",
  adminInbounds: "smologi:admin-inbounds:page-size",
  adminShipments: "smologi:admin-shipments:page-size",
  adminInternalTransfers: "smologi:admin-internal-transfers:page-size",
  // 請求ページの「内訳」表（画面ごとに1キー。タブごとには分けない）。
  adminBilling: "smologi:admin-billing:page-size",
  customerOrders: "smologi:orders:page-size",
  customerShipments: "smologi:shipments:page-size",
  // 返品ワークスペース（ReturnsWorkspace）は admin・お客様の両方で同じ画面を使うので
  // キーも共用。`customer` を冠すると実態と食い違うため付けない。
  returns: "smologi:returns:page-size",
  customerPurchaseOrders: "smologi:purchase-orders:page-size",
  customerDestinations: "smologi:destinations:page-size",
  customerProductSets: "smologi:product-sets:page-size"
};
function readStoredPageSize(key, fallback, options = LIST_PAGE_SIZE_OPTIONS) {
  if (typeof window === "undefined") return fallback;
  try {
    const size = Number(window.localStorage.getItem(key));
    return options.includes(size) ? size : fallback;
  } catch {
    return fallback;
  }
}
function writeStoredPageSize(key, size, options = LIST_PAGE_SIZE_OPTIONS) {
  if (typeof window === "undefined" || !options.includes(size)) return;
  try {
    window.localStorage.setItem(key, String(size));
  } catch {
  }
}
export {
  LIST_PAGE_SIZE_OPTIONS,
  PAGE_SIZE_STORAGE_KEYS,
  readStoredPageSize,
  writeStoredPageSize
};
//# sourceMappingURL=list-page-size.js.map
