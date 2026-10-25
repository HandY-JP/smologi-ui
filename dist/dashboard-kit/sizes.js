const WIDGET_SIZES = ["S", "M", "L", "W"];
const SIZE_LABEL = { S: "\u5C0F", M: "\u4E2D", L: "\u5927", W: "\u6A2A\u9577" };
const SIZE_COLS = { S: 4, M: 6, L: 8, W: 12 };
const SIZE_CLASS = {
  S: "row-span-2 min-[821px]:col-span-4",
  M: "row-span-2 min-[821px]:col-span-6",
  L: "row-span-4 min-[481px]:col-span-2 min-[821px]:col-span-8",
  W: "min-[481px]:col-span-2 min-[821px]:col-span-12"
};
const W_ROWS_CLASS = { 1: "row-span-1", 2: "row-span-2" };
function sizeClassFor(size, rows) {
  return size === "W" ? `${SIZE_CLASS.W} ${W_ROWS_CLASS[rows ?? 1]}` : SIZE_CLASS[size];
}
const GRID_CLASS = "grid grid-cols-1 gap-4 auto-rows-[102px] grid-flow-row min-[481px]:grid-cols-2 min-[821px]:grid-cols-12";
const WIDGET_ROW_HEIGHT_PX = 102;
const WIDGET_GRID_GAP_PX = 16;
export {
  GRID_CLASS,
  SIZE_CLASS,
  SIZE_COLS,
  SIZE_LABEL,
  WIDGET_GRID_GAP_PX,
  WIDGET_ROW_HEIGHT_PX,
  WIDGET_SIZES,
  sizeClassFor
};
//# sourceMappingURL=sizes.js.map