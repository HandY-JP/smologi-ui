"use client";
import { jsx, jsxs } from "react/jsx-runtime";
function StatusTile({ label, tone, value, sub, lastSuccessAt }) {
  const note = sub ?? (lastSuccessAt ? `\u6700\u7D42\u6210\u529F ${lastSuccessAt}` : void 0);
  return /* @__PURE__ */ jsxs("div", { className: `sb-int sb-int-tile sb-int-tile--${tone} flex flex-col gap-0.5 rounded-[10px] px-3.5 py-3`, "data-tone": tone, children: [
    /* @__PURE__ */ jsx("span", { className: "sb-int-muted text-xs", children: label }),
    /* @__PURE__ */ jsxs("span", { className: "sb-int-tile-value flex items-center gap-1.5 font-semibold", children: [
      /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: `sb-int-dot sb-int-dot--${tone} h-2 w-2 flex-none rounded-full` }),
      value
    ] }),
    note && /* @__PURE__ */ jsx("span", { className: "sb-int-muted text-xs tabular-nums", children: note })
  ] });
}
function StatusTileGrid({ tiles }) {
  if (tiles.length === 0) return null;
  return /* @__PURE__ */ jsx("div", { className: "mb-1.5 mt-5 grid gap-2.5", style: { gridTemplateColumns: "repeat(auto-fit, minmax(min(170px, 100%), 1fr))" }, children: tiles.map((t) => /* @__PURE__ */ jsx(StatusTile, { ...t }, t.label)) });
}
export {
  StatusTile,
  StatusTileGrid
};
//# sourceMappingURL=StatusTile.js.map
