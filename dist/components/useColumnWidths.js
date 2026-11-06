"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  parseSavedColumnWidths,
  resolveColumnWidths,
  serializeColumnWidths,
  withColumnWidth,
  withoutColumnWidth
} from "../lib/column-widths.js";
function measureColumnWidths(table, attr = "data-col-key") {
  const out = {};
  const row = table?.tHead?.rows[0];
  if (!row) return out;
  for (const th of Array.from(row.querySelectorAll(`th[${attr}]`))) {
    const key = th.getAttribute(attr);
    if (key) out[key] = Math.round(th.getBoundingClientRect().width);
  }
  return out;
}
function useColumnWidths(storageKey, specs) {
  const [overrides, setOverrides] = useState({});
  const hydrated = useRef(false);
  const loaded = useRef(null);
  const specsRef = useRef(specs);
  specsRef.current = specs;
  const signature = specs.map((s) => `${s.key}:${s.defaultWidth ?? "auto"}:${s.minWidth ?? ""}:${s.resizable === false ? 0 : 1}`).join("|");
  useEffect(() => {
    hydrated.current = false;
    let raw = null;
    try {
      raw = window.localStorage.getItem(storageKey);
    } catch {
      raw = null;
    }
    const parsed = parseSavedColumnWidths(raw, specsRef.current);
    loaded.current = parsed;
    setOverrides(parsed);
  }, [storageKey, signature]);
  useEffect(() => {
    if (!hydrated.current) {
      if (overrides === loaded.current) hydrated.current = true;
      return;
    }
    try {
      const json = serializeColumnWidths(overrides, specsRef.current);
      if (json === "{}") window.localStorage.removeItem(storageKey);
      else window.localStorage.setItem(storageKey, json);
    } catch {
    }
  }, [overrides, storageKey]);
  const widths = useMemo(() => resolveColumnWidths(specsRef.current, overrides), [overrides, signature]);
  const widthOf = useCallback((key) => widths[key] ?? null, [widths]);
  const setWidth = useCallback((key, px) => {
    setOverrides((cur) => withColumnWidth(cur, specsRef.current, key, px));
  }, []);
  const seedWidths = useCallback((next) => {
    setOverrides((cur) => {
      let out = cur;
      for (const [key, px] of Object.entries(next)) out = withColumnWidth(out, specsRef.current, key, px);
      return out;
    });
  }, []);
  const resetColumn = useCallback((key) => setOverrides((cur) => withoutColumnWidth(cur, key)), []);
  const resetAll = useCallback(() => setOverrides({}), []);
  return { widths, widthOf, setWidth, seedWidths, resetColumn, resetAll, isCustomized: Object.keys(overrides).length > 0 };
}
export {
  measureColumnWidths,
  useColumnWidths
};
//# sourceMappingURL=useColumnWidths.js.map
