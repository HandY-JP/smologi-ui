"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  parseSavedColumnWidths,
  resolveColumnWidths,
  serializeColumnWidths,
  withColumnWidth,
  withoutColumnWidth
} from "../lib/column-widths.js";
function useColumnWidths(storageKey, specs) {
  const [overrides, setOverrides] = useState({});
  const hydrated = useRef(false);
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
    setOverrides(parseSavedColumnWidths(raw, specsRef.current));
    hydrated.current = true;
  }, [storageKey, signature]);
  useEffect(() => {
    if (!hydrated.current) return;
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
  const resetColumn = useCallback((key) => setOverrides((cur) => withoutColumnWidth(cur, key)), []);
  const resetAll = useCallback(() => setOverrides({}), []);
  return { widths, widthOf, setWidth, resetColumn, resetAll, isCustomized: Object.keys(overrides).length > 0 };
}
export {
  useColumnWidths
};
//# sourceMappingURL=useColumnWidths.js.map
