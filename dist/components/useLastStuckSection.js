"use client";
import { useCallback, useEffect, useRef, useState } from "react";
function useLastStuckSection(orderedKeys) {
  const [activeStuckKey, setActiveStuckKey] = useState(null);
  const stuckRef = useRef(/* @__PURE__ */ new Set());
  const orderedRef = useRef(orderedKeys);
  const recompute = useCallback(() => {
    const keys = orderedRef.current;
    let next = null;
    for (let i = keys.length - 1; i >= 0; i -= 1) {
      if (stuckRef.current.has(keys[i])) {
        next = keys[i];
        break;
      }
    }
    setActiveStuckKey((prev) => prev === next ? prev : next);
  }, []);
  const reportStuck = useCallback((key, stuck) => {
    if (stuckRef.current.has(key) === stuck) return;
    if (stuck) stuckRef.current.add(key);
    else stuckRef.current.delete(key);
    recompute();
  }, [recompute]);
  useEffect(() => {
    orderedRef.current = orderedKeys;
    if (stuckRef.current.size > 0) {
      const alive = new Set(orderedKeys);
      for (const key of [...stuckRef.current]) if (!alive.has(key)) stuckRef.current.delete(key);
    }
    recompute();
  }, [orderedKeys, recompute]);
  return { activeStuckKey, reportStuck };
}
export {
  useLastStuckSection
};
//# sourceMappingURL=useLastStuckSection.js.map