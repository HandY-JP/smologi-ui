"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { TonePill } from "../TonePill.js";
import { IntegrationLogo } from "./IntegrationHeader.js";
const PILL_TONE = { ok: "ok", warn: "warn", bad: "bad", off: "mute" };
const MAX_MARKS = 3;
function ShopCard({ shop, action }) {
  const marks = (shop.marks ?? []).slice(0, MAX_MARKS);
  return /* @__PURE__ */ jsxs("div", { className: "sb-int sb-int-card flex items-center gap-3 rounded-[10px] px-3.5 py-3", children: [
    /* @__PURE__ */ jsx(IntegrationLogo, { meta: shop.meta, size: "sm" }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsx("div", { className: "truncate font-semibold", children: shop.name }),
      shop.subtitle && /* @__PURE__ */ jsx("div", { className: "sb-int-muted truncate text-xs", children: shop.subtitle }),
      marks.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-1 flex flex-wrap gap-1", children: marks.map((m) => /* @__PURE__ */ jsx(TonePill, { tone: PILL_TONE[m.tone], children: m.label }, m.label)) })
    ] }),
    action && /* @__PURE__ */ jsx("div", { className: "flex-none", children: action })
  ] });
}
function ShopCardList({
  shops,
  renderAction,
  emptyText = "\u307E\u3060\u304A\u5E97\u304C\u3042\u308A\u307E\u305B\u3093\u3002"
}) {
  if (shops.length === 0) return /* @__PURE__ */ jsx("p", { className: "sb-int sb-int-muted text-[13px]", children: emptyText });
  return /* @__PURE__ */ jsx("div", { className: "grid gap-2.5", style: { gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))" }, children: shops.map((s) => /* @__PURE__ */ jsx(ShopCard, { shop: s, action: renderAction?.(s) }, s.id)) });
}
export {
  ShopCard,
  ShopCardList
};
//# sourceMappingURL=ShopCard.js.map
