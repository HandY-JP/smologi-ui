import { visualLength } from "../text.js";
let fontkitPromise = null;
function loadFontkit() {
  if (!fontkitPromise) {
    fontkitPromise = (async () => {
      try {
        const mod = await import("fontkit");
        return typeof mod.openSync === "function" ? mod : mod.default ?? null;
      } catch (error) {
        console.error("[product-label] fontkit load failed; falling back to estimated widths", error instanceof Error ? error.message : error);
        return null;
      }
    })();
  }
  return fontkitPromise;
}
const measurers = /* @__PURE__ */ new Map();
function createTextMeasurer(fonts) {
  const key = `${fonts.regular}
${fonts.bold}`;
  let hit = measurers.get(key);
  if (!hit) {
    hit = (async () => {
      const fontkit = await loadFontkit();
      const faces = /* @__PURE__ */ new Map();
      let failed = fontkit === null;
      const face = (bold) => {
        if (failed || !fontkit) return null;
        const file = bold ? fonts.bold : fonts.regular;
        let f = faces.get(file);
        if (!f) {
          try {
            f = fontkit.openSync(file);
          } catch (error) {
            console.error("[product-label] font open failed; falling back to estimated widths", error instanceof Error ? error.message : error);
            failed = true;
            return null;
          }
          faces.set(file, f);
        }
        return f;
      };
      const measure = (text, fontSize, bold) => {
        const f = face(bold);
        if (!f) return visualLength(text) * fontSize * 1.2;
        const w = f.layout(text).glyphs.reduce((sum, g) => sum + g.advanceWidth, 0);
        return w / f.unitsPerEm * fontSize;
      };
      return { measure, measureEm: (text) => measure(text, 1, false) };
    })();
    measurers.set(key, hit);
  }
  return hit;
}
export {
  createTextMeasurer
};
//# sourceMappingURL=text-measure.js.map