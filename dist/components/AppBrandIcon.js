import { jsx, jsxs } from "react/jsx-runtime";
const TILE_RADIUS = 12;
function Tile({
  id,
  from,
  to,
  rim = "rgba(255,255,255,0.28)",
  children,
  className
}) {
  const gradId = `appTileGrad-${id}`;
  return /* @__PURE__ */ jsxs("svg", { className, viewBox: "0 0 48 48", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: gradId, x1: "0", y1: "0", x2: "48", y2: "48", gradientUnits: "userSpaceOnUse", children: [
      /* @__PURE__ */ jsx("stop", { offset: "0", stopColor: from }),
      /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: to })
    ] }) }),
    /* @__PURE__ */ jsx("rect", { width: "48", height: "48", rx: TILE_RADIUS, fill: `url(#${gradId})` }),
    /* @__PURE__ */ jsx("path", { d: "M0 0h48v14.5c-15.5 5.5-32.5 5.5-48 0Z", fill: "#fff", opacity: "0.14" }),
    children,
    /* @__PURE__ */ jsx("rect", { x: "0.75", y: "0.75", width: "46.5", height: "46.5", rx: TILE_RADIUS - 0.75, fill: "none", stroke: rim, strokeWidth: "1.5" })
  ] });
}
function SmologiBrandLogo({ className, assetBase }) {
  return /* @__PURE__ */ jsx(Tile, { id: "smologi", from: "#ffffff", to: "#dbeafe", rim: "rgba(147,197,253,0.45)", className, children: /* @__PURE__ */ jsx("image", { href: `${assetBase}/smologi-logo-transparent-512.png`, x: "9", y: "9", width: "30", height: "30" }) });
}
function SmologiClientBrandLogo({ className, assetBase }) {
  return /* @__PURE__ */ jsx(Tile, { id: "smologi-client", from: "#ecfdf5", to: "#5eead4", rim: "rgba(45,212,191,0.45)", className, children: /* @__PURE__ */ jsx("image", { href: `${assetBase}/smologi-logo-transparent-512.png`, x: "9", y: "9", width: "30", height: "30" }) });
}
function PortalBrandLogo({ className, assetBase }) {
  return /* @__PURE__ */ jsx(Tile, { id: "portal", from: "#ffffff", to: "#f1f5f9", rim: "rgba(100,116,139,0.45)", className, children: /* @__PURE__ */ jsx("image", { href: `${assetBase}/portal-logo-transparent-512.png`, x: "9", y: "9", width: "30", height: "30" }) });
}
function SellerBrandLogo({ className, assetBase }) {
  return /* @__PURE__ */ jsx(Tile, { id: "seller", from: "#ffffff", to: "#ffedd5", rim: "rgba(251,146,60,0.45)", className, children: /* @__PURE__ */ jsx("image", { href: `${assetBase}/seller-logo-transparent-512.png`, x: "9", y: "9", width: "30", height: "30" }) });
}
function AdsBrandLogo({ className }) {
  return /* @__PURE__ */ jsxs(Tile, { id: "ads", from: "#26221c", to: "#050505", rim: "rgba(251,146,60,0.4)", className, children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "appTileGlyph-ads", x1: "0", y1: "39", x2: "0", y2: "12", gradientUnits: "userSpaceOnUse", children: [
      /* @__PURE__ */ jsx("stop", { offset: "0", stopColor: "#c2410c" }),
      /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#fb923c" })
    ] }) }),
    /* @__PURE__ */ jsx("rect", { x: "10", y: "28", width: "7", height: "11", rx: "1.8", fill: "url(#appTileGlyph-ads)", opacity: "0.75" }),
    /* @__PURE__ */ jsx("rect", { x: "20", y: "22", width: "7", height: "17", rx: "1.8", fill: "url(#appTileGlyph-ads)", opacity: "0.88" }),
    /* @__PURE__ */ jsx("rect", { x: "30", y: "15", width: "7", height: "24", rx: "1.8", fill: "url(#appTileGlyph-ads)" }),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M11 24.5L24 17l13.5-7.5",
        fill: "none",
        stroke: "#fff",
        strokeWidth: "2.6",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M31.5 8.2l6-.7-.2 6",
        fill: "none",
        stroke: "#fff",
        strokeWidth: "2.6",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    )
  ] });
}
function MobileBrandLogo({ className }) {
  return /* @__PURE__ */ jsx(Tile, { id: "mobile", from: "#38bdf8", to: "#1e40af", className, children: /* @__PURE__ */ jsx("g", { transform: "translate(7.2 7.2) scale(1.4)", fill: "none", stroke: "#fff", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" }) }) });
}
function TasksBrandLogo({ className }) {
  return /* @__PURE__ */ jsx(Tile, { id: "tasks", from: "#ef4444", to: "#991b1b", className, children: /* @__PURE__ */ jsx("g", { transform: "translate(7.2 7.2) scale(1.4)", fill: "none", stroke: "#fff", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" }) }) });
}
function PoizonBrandLogo({ className, assetBase }) {
  return /* @__PURE__ */ jsxs(Tile, { id: "poizon", from: "#2e1065", to: "#0c0618", rim: "rgba(192,132,252,0.35)", className, children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("filter", { id: "appTileGlow-poizon", x: "-40%", y: "-40%", width: "180%", height: "180%", children: /* @__PURE__ */ jsx("feGaussianBlur", { stdDeviation: "2.2" }) }) }),
    /* @__PURE__ */ jsx("image", { href: `${assetBase}/poizon-logo-transparent-512.png`, x: "9", y: "9", width: "30", height: "30", opacity: "0.85", filter: "url(#appTileGlow-poizon)" }),
    /* @__PURE__ */ jsx("image", { href: `${assetBase}/poizon-logo-transparent-512.png`, x: "9", y: "9", width: "30", height: "30" })
  ] });
}
function SmologiB2BBrandLogo({ className, assetBase }) {
  return /* @__PURE__ */ jsx(Tile, { id: "smologi-b2b", from: "#ffffff", to: "#ede9fe", rim: "rgba(139,92,246,0.45)", className, children: /* @__PURE__ */ jsx("image", { href: `${assetBase}/b2b-logo-transparent-512.png`, x: "9", y: "9", width: "30", height: "30" }) });
}
function DefaultBrandLogo({ className }) {
  return /* @__PURE__ */ jsx(Tile, { id: "default", from: "#64748b", to: "#334155", className, children: [0, 1, 2].map(
    (row) => [0, 1, 2].map((col) => /* @__PURE__ */ jsx(
      "rect",
      {
        x: 12 + col * 9,
        y: 12 + row * 9,
        width: "6",
        height: "6",
        rx: "1.6",
        fill: "#fff",
        opacity: row === 1 && col === 1 ? 1 : 0.7
      },
      `${row}-${col}`
    ))
  ) });
}
function AppBrandIcon({
  appId,
  className,
  assetBase = "/brand"
}) {
  const p = { className, assetBase };
  if (appId === "smologi") return /* @__PURE__ */ jsx(SmologiBrandLogo, { ...p });
  if (appId === "smologi-client") return /* @__PURE__ */ jsx(SmologiClientBrandLogo, { ...p });
  if (appId === "portal") return /* @__PURE__ */ jsx(PortalBrandLogo, { ...p });
  if (appId === "amazon") return /* @__PURE__ */ jsx(SellerBrandLogo, { ...p });
  if (appId === "amazon-ads") return /* @__PURE__ */ jsx(AdsBrandLogo, { ...p });
  if (appId === "smologi-mobile" || appId === "mobile-app") return /* @__PURE__ */ jsx(MobileBrandLogo, { ...p });
  if (appId === "tasks") return /* @__PURE__ */ jsx(TasksBrandLogo, { ...p });
  if (appId === "poizon") return /* @__PURE__ */ jsx(PoizonBrandLogo, { ...p });
  if (appId === "smologi-b2b") return /* @__PURE__ */ jsx(SmologiB2BBrandLogo, { ...p });
  return /* @__PURE__ */ jsx(DefaultBrandLogo, { ...p });
}
export {
  AppBrandIcon
};
//# sourceMappingURL=AppBrandIcon.js.map