"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
const START_GUIDE_EVENT = "smologi:start-guide";
const guideRegistry = /* @__PURE__ */ new Map();
const registryListeners = /* @__PURE__ */ new Set();
function notifyRegistry() {
  registryListeners.forEach((l) => l());
}
function useAvailableGuides() {
  const [list, setList] = useState([]);
  useEffect(() => {
    const cb = () => setList(Array.from(guideRegistry.values()));
    registryListeners.add(cb);
    cb();
    return () => {
      registryListeners.delete(cb);
    };
  }, []);
  return list;
}
function startGuide(id) {
  window.dispatchEvent(new CustomEvent(START_GUIDE_EVENT, { detail: { id } }));
}
const CARD_W = 340;
const GUIDE_FINISHED_EVENT = "smologi:guide-finished";
function useGuideSeen(storageKey) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!storageKey) {
      setSeen(false);
      return;
    }
    const check = () => {
      try {
        setSeen(!!window.localStorage.getItem(storageKey));
      } catch {
        setSeen(false);
      }
    };
    check();
    window.addEventListener(GUIDE_FINISHED_EVENT, check);
    return () => window.removeEventListener(GUIDE_FINISHED_EVENT, check);
  }, [storageKey]);
  return seen;
}
function GuideTour({ storageKey, introTitle, introBody, steps, active = true, id, label, showIntroOnMount = true, startLabel = "\u30AC\u30A4\u30C9\u3092\u958B\u59CB", onStepChange }) {
  const [phase, setPhase] = useState("hidden");
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState(null);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef(null);
  const [cardH, setCardH] = useState(0);
  useLayoutEffect(() => {
    if (phase !== "steps") return;
    setCardH(cardRef.current?.offsetHeight ?? 0);
  }, [phase, idx, rect]);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!active || !showIntroOnMount || typeof window === "undefined") return;
    try {
      if (!window.localStorage.getItem(storageKey)) setPhase("intro");
    } catch {
    }
  }, [active, showIntroOnMount, storageKey]);
  const finish = useCallback(() => {
    setPhase("hidden");
    try {
      window.localStorage.setItem(storageKey, (/* @__PURE__ */ new Date()).toISOString());
    } catch {
    }
    try {
      window.dispatchEvent(new CustomEvent(GUIDE_FINISHED_EVENT, { detail: { storageKey } }));
    } catch {
    }
  }, [storageKey]);
  const onStepChangeRef = useRef(onStepChange);
  useEffect(() => {
    onStepChangeRef.current = onStepChange;
  }, [onStepChange]);
  const stepIndex = phase === "steps" ? idx : null;
  useEffect(() => {
    onStepChangeRef.current?.(stepIndex);
    return () => {
      if (stepIndex !== null) onStepChangeRef.current?.(null);
    };
  }, [stepIndex]);
  useEffect(() => {
    if (!id || !active) return;
    guideRegistry.set(id, { id, label: label ?? introTitle });
    notifyRegistry();
    const onStart = (e) => {
      const detail = e.detail;
      if (detail?.id !== id) return;
      setIdx(0);
      setPhase("steps");
    };
    window.addEventListener(START_GUIDE_EVENT, onStart);
    return () => {
      guideRegistry.delete(id);
      notifyRegistry();
      window.removeEventListener(START_GUIDE_EVENT, onStart);
    };
  }, [id, label, introTitle, active]);
  useLayoutEffect(() => {
    if (phase !== "steps") return;
    const step2 = steps[idx];
    const el = step2?.target ? document.querySelector(step2.target) : null;
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    const update = () => setRect(el ? el.getBoundingClientRect() : null);
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const iv = window.setInterval(update, 250);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      window.clearInterval(iv);
    };
  }, [phase, idx, steps]);
  useEffect(() => {
    if (phase === "hidden") return;
    const onKey = (e) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, finish]);
  if (!mounted || phase === "hidden" || !active) return null;
  const cardPos = (() => {
    if (!rect) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 10;
    const h = cardH || 220;
    const left = Math.min(Math.max(rect.left, 12), Math.max(12, vw - CARD_W - 12));
    let top;
    if (rect.bottom + margin + h <= vh - 12) top = rect.bottom + margin;
    else if (rect.top - margin - h >= 12) top = rect.top - margin - h;
    else top = Math.max(12, vh - h - 12);
    return { left, top };
  })();
  const step = steps[idx];
  const isLast = idx === steps.length - 1;
  const stepCard = phase === "steps" && step && /* @__PURE__ */ jsxs(
    "div",
    {
      ref: cardRef,
      className: "fixed z-[1102] w-[340px] max-w-[calc(100vw-24px)] rounded-lg bg-white p-4 shadow-xl ring-1 ring-black/10 row-fade-in",
      style: cardPos ?? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" },
      role: "dialog",
      "aria-label": step.title,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-[11px] font-semibold tracking-wide text-blue-600", children: [
            "\u30B9\u30C6\u30C3\u30D7 ",
            idx + 1,
            " / ",
            steps.length
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: finish, className: "text-gray-300 hover:text-gray-500 leading-none", "aria-label": "\u30AC\u30A4\u30C9\u3092\u7D42\u4E86", title: "\u30AC\u30A4\u30C9\u3092\u7D42\u4E86\uFF08\u4EE5\u5F8C\u8868\u793A\u3057\u307E\u305B\u3093\uFF09", children: "\xD7" })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "mt-0.5 text-sm font-semibold text-gray-900", children: step.title }),
        /* @__PURE__ */ jsx("div", { className: "mt-1.5 text-[13px] leading-relaxed text-gray-600", children: step.body }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: steps.map((_, i) => /* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full ${i === idx ? "bg-blue-600" : "bg-gray-200"}` }, i)) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            idx > 0 && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setIdx(idx - 1), className: "rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50", children: "\u623B\u308B" }),
            isLast ? /* @__PURE__ */ jsx("button", { type: "button", onClick: finish, className: "rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700", children: "\u30AC\u30A4\u30C9\u3092\u7D42\u4E86" }) : /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setIdx(idx + 1), className: "rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700", children: "\u6B21\u3078" })
          ] })
        ] })
      ]
    }
  );
  return createPortal(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      phase === "intro" && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 p-4", role: "dialog", "aria-modal": "true", "aria-label": introTitle, children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md rounded-xl bg-white p-6 shadow-2xl row-fade-in", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white", children: "GUIDE" }),
          /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-gray-900", children: introTitle })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 text-sm leading-relaxed text-gray-600", children: introBody }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: finish,
              className: "rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50",
              title: "\u4EE5\u5F8C\u3053\u306E\u6848\u5185\u306F\u8868\u793A\u3055\u308C\u307E\u305B\u3093",
              children: "\u4ECA\u306F\u898B\u306A\u3044"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setIdx(0);
                setPhase("steps");
              },
              className: "rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700",
              children: startLabel
            }
          )
        ] })
      ] }) }),
      phase === "steps" && /* @__PURE__ */ jsxs(Fragment, { children: [
        rect ? /* @__PURE__ */ jsx(
          "div",
          {
            className: "fixed z-[1101] rounded-md transition-all duration-200",
            style: {
              left: rect.left - 6,
              top: rect.top - 6,
              width: rect.width + 12,
              height: rect.height + 12,
              boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.5)",
              pointerEvents: "none"
            },
            "aria-hidden": true
          }
        ) : /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[1101] bg-slate-900/50", "aria-hidden": true }),
        /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[1101]", onClick: () => isLast ? finish() : setIdx(idx + 1), "aria-hidden": true }),
        stepCard
      ] })
    ] }),
    document.body
  );
}
export {
  GuideTour,
  startGuide,
  useAvailableGuides,
  useGuideSeen
};
//# sourceMappingURL=GuideTour.js.map
