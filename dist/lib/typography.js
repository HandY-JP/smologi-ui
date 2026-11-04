const TEXT = {
  meta: "text-[11px] leading-[16px]",
  note: "text-[12px] leading-[18px]",
  label: "text-[13px] leading-[20px]",
  body: "text-[14px] leading-[22px]",
  item: "text-[15px] leading-[22px]",
  title: "text-[18px] leading-[26px]",
  heading: "text-[22px] leading-[30px]",
  figure: "text-[28px] leading-[36px]"
};
const WEIGHT = {
  normal: "font-normal",
  medium: "font-medium",
  strong: "font-semibold"
};
const NUM_CLASS = "tabular-nums";
const TYPE_SCALE = [
  { name: "meta", px: 11, lineHeight: 16, usage: "\u88DC\u8DB3\u306E\u88DC\u8DB3\u3002\u30D0\u30C3\u30B8\u30FB\u30BF\u30B0\u30FB\u5C0F\u3055\u306A\u6CE8\u8A18\u30FB\u65E5\u4ED8\u306E\u6DFB\u3048" },
  { name: "note", px: 12, lineHeight: 18, usage: "\u6CE8\u91C8\u30FB\u30D8\u30EB\u30D7\u6587\u30FB\u5165\u529B\u6B04\u306E\u4E0B\u306E\u8AAC\u660E\u30FB\u8868\u306E\u88DC\u52A9\u884C" },
  { name: "label", px: 13, lineHeight: 20, usage: "\u9805\u76EE\u540D\u30FB\u8868\u306E\u898B\u51FA\u3057\u30FB\u30D5\u30A9\u30FC\u30E0\u306E\u30E9\u30D9\u30EB\u30FB\u30DC\u30BF\u30F3\uFF08\u5C0F\uFF09" },
  { name: "body", px: 14, lineHeight: 22, usage: "\u672C\u6587\u30FB\u8868\u306E\u30BB\u30EB\u30FB\u5165\u529B\u6B04\u30FB\u30DC\u30BF\u30F3\uFF08\u6A19\u6E96\uFF09" },
  { name: "item", px: 15, lineHeight: 22, usage: "\u4E00\u89A7\u306E\u4E3B\u5F79\uFF08\u5546\u54C1\u540D\u30FB\u30B3\u30FC\u30C9\uFF09\u30FB\u30B5\u30A4\u30C9\u30D0\u30FC\u306E\u9805\u76EE" },
  { name: "title", px: 18, lineHeight: 26, usage: "\u30AB\u30FC\u30C9\u30FB\u30E2\u30FC\u30C0\u30EB\u30FB\u533A\u753B\u306E\u898B\u51FA\u3057" },
  { name: "heading", px: 22, lineHeight: 30, usage: "\u30DA\u30FC\u30B8\u306E\u898B\u51FA\u3057" },
  { name: "figure", px: 28, lineHeight: 36, usage: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u306E\u5927\u304D\u306A\u6570\u5B57" }
];
const TYPE_SIZE_MAP = {
  px: [
    { from: 0, step: "meta" },
    { from: 12, step: "note" },
    { from: 13, step: "label" },
    { from: 14, step: "body" },
    { from: 15, step: "item" },
    { from: 17, step: "title" },
    { from: 20, step: "heading" },
    { from: 28, step: "figure" }
  ],
  tailwind: {
    xs: "note",
    sm: "body",
    base: "item",
    lg: "title",
    xl: "heading",
    "2xl": "heading",
    "3xl": "figure",
    "4xl": "figure",
    "5xl": "figure",
    "6xl": "figure",
    "7xl": "figure",
    "8xl": "figure",
    "9xl": "figure"
  }
};
function typeStepForPx(px) {
  if (!Number.isFinite(px) || px < 0) return void 0;
  let hit = TYPE_SIZE_MAP.px[0].step;
  for (const row of TYPE_SIZE_MAP.px) if (px >= row.from) hit = row.step;
  return hit;
}
function typeStepForTailwind(name) {
  return TYPE_SIZE_MAP.tailwind[name];
}
const WEIGHT_MAP = {
  "font-thin": "normal",
  "font-extralight": "normal",
  "font-light": "normal",
  "font-normal": "normal",
  "font-medium": "medium",
  "font-semibold": "strong",
  "font-bold": "strong",
  "font-extrabold": "strong",
  "font-black": "strong"
};
export {
  NUM_CLASS,
  TEXT,
  TYPE_SCALE,
  TYPE_SIZE_MAP,
  WEIGHT,
  WEIGHT_MAP,
  typeStepForPx,
  typeStepForTailwind
};
//# sourceMappingURL=typography.js.map