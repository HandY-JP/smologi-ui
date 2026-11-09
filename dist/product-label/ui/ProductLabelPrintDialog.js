"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HandyPortalLoader } from "../../components/HandyPortalLoader.js";
import { LabelFace, useLabelFaces } from "./LabelFaceImage.js";
import { InlineActionSpinner } from "./parts.js";
import { ProductLabelDefaultModal } from "./default-modal.js";
import { useDismiss as defaultUseDismiss } from "../../components/Modal.js";
import {
  cellLabels,
  diagramPage,
  hasExtraOmitted,
  totalCount
} from "../dialog-model.js";
import {
  DEFAULT_PRODUCT_LABEL_SETTINGS,
  MAX_OFFSET_MM,
  trimExtras,
  withSheet
} from "../settings.js";
import { sheetCapabilities } from "../label-layout.js";
import { labelExtraName, LABEL_EXTRA_OPTIONS } from "../text.js";
import {
  clampStart,
  getSheet,
  groupedSheets,
  summarizeLabels
} from "../sheets.js";
const DEFAULT_COPY = {
  ungeneratable: "\u3053\u306E\u5185\u5BB9\u3067\u306F\u5546\u54C1\u30E9\u30D9\u30EB\u3092\u4F5C\u308A\u76F4\u305B\u307E\u305B\u3093\u3002\u4ECA\u306F\u753B\u9762\u3092\u9589\u3058\u3001Amazon \u306E\u30E9\u30D9\u30EB\u3092\u305D\u306E\u307E\u307E\u5370\u5237\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
};
const DEFAULT_MODAL = { Modal: ProductLabelDefaultModal, useDismiss: defaultUseDismiss };
const HEAVY_LABEL_COUNT = 1e3;
const field = "rounded-lg border border-line-strong bg-surface px-2.5 py-2 text-[14px] leading-[22px] text-ink focus:outline focus:outline-2 focus:outline-[var(--sb-accent-bg)]";
const ghostBtn = "inline-flex h-9 items-center justify-center rounded-lg border border-line-strong bg-surface px-3 text-[14px] leading-[22px] font-semibold text-ink transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-40";
function ProductLabelPrintDialog({
  adapter,
  initialSheet,
  onClose,
  modal = DEFAULT_MODAL,
  copy
}) {
  const { Modal, useDismiss } = modal;
  const text = { ...DEFAULT_COPY, ...copy };
  const applyInitial = useCallback(
    (base) => initialSheet ? withSheet(base, initialSheet) : base,
    [initialSheet]
  );
  const [settings, setSettings] = useState(() => applyInitial(adapter.peekContext?.()?.settings ?? DEFAULT_PRODUCT_LABEL_SETTINGS));
  const [preview, setPreview] = useState(() => adapter.peekContext?.()?.preview ?? null);
  const [loadError, setLoadError] = useState(null);
  const [start, setStart] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [limitNotice, setLimitNotice] = useState(null);
  const [saveState, setSaveState] = useState("idle");
  const [popOpen, setPopOpen] = useState(false);
  const [view, setView] = useState("sheet");
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState(null);
  useEffect(() => {
    let cancelled = false;
    adapter.loadContext().then((ctx) => {
      if (cancelled) return;
      setSettings(applyInitial(ctx.settings));
      setPreview(ctx.preview);
    }).catch((e) => {
      if (!cancelled) setLoadError(e instanceof Error && e.message ? e.message : "\u5370\u5237\u3059\u308B\u5185\u5BB9\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002");
    });
    return () => {
      cancelled = true;
    };
  }, [adapter]);
  const sheet = getSheet(settings.sheet) ?? getSheet(DEFAULT_PRODUCT_LABEL_SETTINGS.sheet);
  const caps = useMemo(() => sheetCapabilities(sheet), [sheet]);
  const isRoll = sheet.kind === "roll";
  const anyGenerate = (preview ?? []).some((t) => t.mode === "generate");
  const hasUngeneratable = preview !== null && preview.some((t) => t.mode !== "generate");
  const countOpts = useMemo(
    () => ({ expirySticker: settings.expirySticker && anyGenerate }),
    [settings.expirySticker, anyGenerate]
  );
  const total = useMemo(() => preview ? totalCount(preview, countOpts) : null, [preview, countOpts]);
  const effectiveStart = clampStart(sheet, start);
  const summary = total !== null ? summarizeLabels(sheet, effectiveStart, total) : null;
  const faces = useLabelFaces(preview, settings, adapter.faces);
  const patch = useCallback((next) => {
    setSettings((s) => ({ ...s, ...next }));
    setSaveState("idle");
  }, []);
  const changeSheet = (id) => {
    const next = getSheet(id);
    if (!next) return;
    const caps2 = sheetCapabilities(next);
    const { kept, removed } = trimExtras(settings.extra, caps2.maxExtras);
    const dropImage = settings.image && !caps2.image;
    patch({ sheet: id, extra: kept, image: settings.image && caps2.image });
    setStart(1);
    const dropped = [...removed.map(labelExtraName), ...dropImage ? ["\u5546\u54C1\u753B\u50CF"] : []];
    if (dropped.length === 0) setLimitNotice(null);
    else if (caps2.maxExtras === 0) setLimitNotice(`\u3053\u306E\u7528\u7D19\u3067\u306F\u8FFD\u52A0\u9805\u76EE\u3084\u753B\u50CF\u3092\u9078\u3079\u306A\u3044\u305F\u3081\u3001${dropped.join("\u30FB")}\u3092\u5916\u3057\u307E\u3057\u305F`);
    else setLimitNotice(`\u3053\u306E\u7528\u7D19\u3067\u306F${caps2.maxExtras}\u3064\u307E\u3067\u306E\u305F\u3081\u3001${dropped.join("\u30FB")}\u3092\u5916\u3057\u307E\u3057\u305F`);
  };
  const hasExpiryItems = (preview ?? []).some((t) => t.mode === "generate" && t.items.some((i) => i.expiration));
  const doPrint = async (mode = "print") => {
    if (busy || !preview) return;
    const toTab = mode === "tab" || adapter.printer.prefersPdfTab();
    const tabWindow = toTab ? window.open("", "_blank") : null;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const blob = await adapter.createPdf({ settings, start: isRoll ? 1 : effectiveStart });
      if (toTab) {
        const url = URL.createObjectURL(blob);
        if (tabWindow && !tabWindow.closed) {
          tabWindow.location.href = url;
          setTimeout(() => URL.revokeObjectURL(url), 10 * 6e4);
          setNotice("PDF \u3092\u65B0\u3057\u3044\u30BF\u30D6\u3067\u958B\u304D\u307E\u3057\u305F\u3002\u958B\u3044\u305F\u30BF\u30D6\u304B\u3089\u5370\u5237\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        } else {
          URL.revokeObjectURL(url);
          setNotice("\u65B0\u3057\u3044\u30BF\u30D6\u3092\u958B\u3051\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u30D6\u30E9\u30A6\u30B6\u306E\u30DD\u30C3\u30D7\u30A2\u30C3\u30D7\u3092\u8A31\u53EF\u3057\u3066\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002");
        }
        return;
      }
      const printed = await adapter.printer.print(blob, { pageCount: summary?.pages });
      if (!printed.ok) {
        const url = URL.createObjectURL(blob);
        const opened = window.open(url, "_blank");
        if (opened) setTimeout(() => URL.revokeObjectURL(url), 6e4);
        else URL.revokeObjectURL(url);
        setNotice(printed.message(Boolean(opened)));
      }
    } catch (e) {
      tabWindow?.close();
      setError(e instanceof Error ? e.message : "\u30E9\u30D9\u30EB\u306E PDF \u3092\u4F5C\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002");
    } finally {
      setBusy(false);
    }
  };
  const saveDefault = async () => {
    setSaveState("saving");
    setError(null);
    try {
      await adapter.saveDefault(settings);
      setSaveState("saved");
    } catch (e) {
      setSaveState("idle");
      setError(e instanceof Error ? e.message : "\u65E2\u5B9A\u3092\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002");
    }
  };
  const ratio = sheet.pageW / sheet.pageH;
  const pages = summary?.pages ?? 1;
  const pageIdx = Math.min(page, Math.max(pages - 1, 0));
  const viewMode = isRoll ? "label" : view;
  const canPrint = !(busy || hasUngeneratable || summary !== null && summary.labels === 0);
  const faceOpts = useMemo(
    () => ({ sheetId: sheet.id, labelW: sheet.labelW, labelH: sheet.labelH, image: settings.image, extra: settings.extra }),
    [sheet.id, sheet.labelW, sheet.labelH, settings.image, settings.extra]
  );
  const selectedLabel = useMemo(() => {
    if (!preview) return null;
    const first = preview.flatMap((t2, ti2) => t2.mode === "generate" ? t2.items.map((_, ii2) => `${ti2}:${ii2}`) : [])[0];
    const key = sel ?? first;
    if (!key) return null;
    const [ti, ii] = key.split(":").map(Number);
    const t = preview[ti];
    const item = t?.items[ii];
    if (!t || !item) return null;
    const one = cellLabels([{ ...t, items: [{ ...item, quantity: 1 }] }], { expirySticker: false }, 1)[0];
    return one ? { ...one, faceRef: { targetIndex: ti, itemIndex: ii } } : null;
  }, [preview, sel]);
  const selectedKey = sel ?? (preview ?? []).flatMap((t, ti) => t.mode === "generate" ? t.items.map((_, ii) => `${ti}:${ii}`) : [])[0] ?? null;
  const summaryText = summary ? isRoll ? `\u30E9\u30D9\u30EB ${summary.labels.toLocaleString()} \u679A\uFF08\u30ED\u30FC\u30EB\u7D19\uFF09` : `\u30E9\u30D9\u30EB ${summary.labels.toLocaleString()} \u679A \u30FB \u7528\u7D19 ${summary.pages.toLocaleString()} \u679A \u30FB \u4F59\u308A ${summary.leftover} \u9762` : null;
  const segBtn = (active) => `h-8 rounded-full px-3.5 text-[14px] leading-[22px] font-semibold transition-colors ${active ? "bg-[var(--sb-accent-bg)] text-on-accent" : "text-ink-muted hover:text-ink"}`;
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open: true,
      onClose,
      title: "\u5546\u54C1\u30E9\u30D9\u30EB\u3092\u5370\u5237",
      headerAside: preview ? summaryText : null,
      headerRight: preview && !isRoll ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5 rounded-full border border-line-strong bg-surface p-0.5", role: "group", "aria-label": "\u8868\u793A\u306E\u5207\u308A\u66FF\u3048", children: [
        /* @__PURE__ */ jsx("button", { type: "button", "aria-pressed": viewMode === "sheet", onClick: () => setView("sheet"), className: segBtn(viewMode === "sheet"), children: "\u7528\u7D19\u5168\u4F53" }),
        /* @__PURE__ */ jsx("button", { type: "button", "aria-pressed": viewMode === "label", onClick: () => setView("label"), className: segBtn(viewMode === "label"), children: "\u30E9\u30D9\u30EB" })
      ] }) : null,
      showCloseButton: false,
      size: "4xl",
      ariaLabel: "\u5546\u54C1\u30E9\u30D9\u30EB\u3092\u5370\u5237",
      panelClassName: "!max-w-[1180px] md:h-[min(800px,90dvh)]",
      panelMaxHeightClassName: "max-h-[90dvh]",
      bodyClassName: "p-0",
      children: loadError ? /* @__PURE__ */ jsx("p", { className: "m-5 rounded-md border border-danger-ink/15 bg-danger-soft px-3 py-2 text-[14px] leading-[22px] text-danger-ink", children: loadError }) : !preview ? /* @__PURE__ */ jsx("div", { className: "py-16", children: /* @__PURE__ */ jsx(HandyPortalLoader, { variant: "inline" }) }) : /* @__PURE__ */ jsxs("div", { className: "grid md:h-full md:min-h-0 md:grid-cols-[380px_1fr]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-col gap-4 border-b border-line p-5 md:min-h-0 md:border-b-0 md:border-r", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 flex-col gap-1.5", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "pl-sheet", className: "text-[14px] leading-[22px] text-ink-muted", children: "\u30E9\u30D9\u30EB\u7528\u7D19" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                "select",
                {
                  id: "pl-sheet",
                  className: `${field} min-w-0 flex-1`,
                  value: settings.sheet,
                  onChange: (e) => changeSheet(e.target.value),
                  children: groupedSheets().map((g) => /* @__PURE__ */ jsx("optgroup", { label: g.label, children: g.sheets.map((s) => /* @__PURE__ */ jsx("option", { value: s.id, children: s.label }, s.id)) }, g.group))
                }
              ),
              /* @__PURE__ */ jsx(GearPopover, { open: popOpen, onOpenChange: setPopOpen, useDismiss, children: /* @__PURE__ */ jsx(
                SettingsBody,
                {
                  settings,
                  patch,
                  caps,
                  limitNotice,
                  onClearNotice: () => setLimitNotice(null),
                  hasExpiryItems,
                  saveState,
                  onSave: () => {
                    void saveDefault();
                  }
                }
              ) })
            ] }),
            hasExtraOmitted(preview ?? [], sheet, { image: settings.image, extra: settings.extra }) && /* @__PURE__ */ jsx("p", { className: "text-[12px] leading-[18px] text-warning-ink", children: "\u3053\u306E\u7528\u7D19\u3067\u306F\u8FFD\u52A0\u9805\u76EE\u304C\u5165\u308A\u304D\u3089\u306A\u3044\u5546\u54C1\u304C\u3042\u308A\u307E\u3059\uFF08\u305D\u306E\u5546\u54C1\u306F\u5165\u3089\u306A\u3044\u9805\u76EE\u3092\u7701\u7565\u3057\u3066\u5370\u5237\u3057\u307E\u3059\uFF09\u3002" }),
            limitNotice && /* @__PURE__ */ jsx("p", { className: "text-[12px] leading-[18px] text-warning-ink", children: limitNotice })
          ] }),
          !isRoll && /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 flex-col gap-1.5", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "pl-start", className: "text-[14px] leading-[22px] text-ink-muted", children: "\u5370\u5237\u3092\u59CB\u3081\u308B\u4F4D\u7F6E" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-stretch", children: [
              /* @__PURE__ */ jsx("button", { type: "button", "aria-label": "1\u3064\u524D", onClick: () => setStart(clampStart(sheet, effectiveStart - 1)), className: "h-11 w-11 rounded-l-lg border border-line-strong bg-surface text-[18px] leading-[26px] text-ink hover:bg-surface-subtle", children: "\u2212" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "pl-start",
                  type: "number",
                  inputMode: "numeric",
                  min: 1,
                  max: sheet.faces,
                  value: effectiveStart,
                  onChange: (e) => setStart(clampStart(sheet, Number(e.target.value))),
                  className: "h-11 w-20 border-y border-line-strong bg-surface px-2 text-center text-[15px] leading-[22px] tabular-nums text-ink focus:outline focus:outline-2 focus:outline-[var(--sb-accent-bg)]"
                }
              ),
              /* @__PURE__ */ jsx("button", { type: "button", "aria-label": "1\u3064\u5F8C", onClick: () => setStart(clampStart(sheet, effectiveStart + 1)), className: "h-11 w-11 rounded-r-lg border border-line-strong bg-surface text-[18px] leading-[26px] text-ink hover:bg-surface-subtle", children: "\uFF0B" }),
              /* @__PURE__ */ jsxs("span", { className: "ml-3 self-center text-[14px] leading-[22px] text-ink-muted", children: [
                "/ ",
                sheet.faces
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex min-h-0 flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxs("span", { className: "shrink-0 text-[14px] leading-[22px] text-ink-muted", children: [
              "\u5546\u54C1\uFF08",
              preview.reduce((n, t) => n + (t.mode === "generate" ? t.items.length : 1), 0),
              "\u54C1\u76EE\uFF09"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "max-h-48 min-h-0 overflow-y-auto overscroll-contain rounded-lg border border-line md:max-h-none", children: preview.map((t, ti) => /* @__PURE__ */ jsx(
              TargetRows,
              {
                target: t,
                targetIndex: ti,
                multiple: preview.length > 1,
                selectedKey,
                onSelect: (key) => {
                  setSel(key);
                  setView("label");
                }
              },
              `${t.shipmentId}
${t.attachmentUrl}`
            )) })
          ] }),
          error && /* @__PURE__ */ jsx("p", { className: "shrink-0 rounded-md border border-danger-ink/15 bg-danger-soft px-3 py-2 text-[12px] leading-[18px] text-danger-ink", children: error }),
          hasUngeneratable && /* @__PURE__ */ jsx("p", { className: "shrink-0 rounded-md border border-warning-ink/15 bg-warning-soft px-3 py-2 text-[12px] leading-[18px] text-warning-ink", children: text.ungeneratable }),
          notice && /* @__PURE__ */ jsx("p", { className: "shrink-0 rounded-md border border-warning-ink/15 bg-warning-soft px-3 py-2 text-[12px] leading-[18px] text-warning-ink", children: notice }),
          summary === null && /* @__PURE__ */ jsx("p", { className: "shrink-0 text-[14px] leading-[22px] text-ink-muted", children: "\u679A\u6570\u3092\u6570\u3048\u3089\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002" }),
          /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 gap-2", children: [
            /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "inline-flex h-11 items-center justify-center rounded-full border border-line-strong bg-surface px-5 text-[15px] leading-[22px] font-semibold text-ink transition-colors hover:bg-surface-subtle", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  void doPrint();
                },
                disabled: !canPrint,
                className: "inline-flex h-11 min-w-0 flex-1 items-center justify-center rounded-full bg-[var(--sb-accent-bg)] px-4 text-[15px] leading-[22px] font-semibold text-on-accent shadow-sm transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40",
                children: busy ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(InlineActionSpinner, { className: "mr-2" }),
                  "PDF \u3092\u4F5C\u6210\u4E2D\u2026"
                ] }) : isRoll ? "\u5370\u5237" : "\u3053\u306E\u4F4D\u7F6E\u3067\u5370\u5237"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 flex-col gap-1", children: [
            summary !== null && summary.labels > HEAVY_LABEL_COUNT && /* @__PURE__ */ jsx("p", { className: "text-[12px] leading-[18px] text-ink-muted", children: "\u679A\u6570\u304C\u591A\u3044\u305F\u3081\u6642\u9593\u304C\u304B\u304B\u308A\u307E\u3059\u3002" }),
            /* @__PURE__ */ jsxs("p", { className: "text-[12px] leading-[18px] text-ink-muted", children: [
              isRoll ? `\u30D7\u30EA\u30F3\u30BF\u30FC\u306E\u7528\u7D19\u30B5\u30A4\u30BA\u3092 ${sheet.pageW}\xD7${sheet.pageH}mm \u306B\u5408\u308F\u305B\u3001\u500D\u7387\u306F 100% \u306B\u3057\u3066\u304F\u3060\u3055\u3044\u3002` : "\u5370\u5237\u753B\u9762\u3067\u500D\u7387\u306F 100%\uFF08\u5B9F\u969B\u306E\u30B5\u30A4\u30BA\uFF09\u306B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
              " ",
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    void doPrint("tab");
                  },
                  disabled: !canPrint,
                  className: "underline hover:text-ink disabled:cursor-not-allowed disabled:opacity-40",
                  children: "\u65B0\u3057\u3044\u30BF\u30D6\u3067 PDF \u3092\u958B\u304F"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: `relative flex min-w-0 flex-col p-5 md:min-h-0 ${viewMode === "sheet" && pages > 1 ? "pb-14" : ""}`, children: viewMode === "sheet" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "h-[460px] min-h-0 [container-type:size] md:h-auto md:flex-1", children: /* @__PURE__ */ jsx("div", { className: "mx-auto", style: { width: `min(100cqw, calc(100cqh * ${ratio}))`, aspectRatio: `${sheet.pageW}/${sheet.pageH}` }, children: /* @__PURE__ */ jsx(
            SheetPage,
            {
              sheet,
              settings,
              start: effectiveStart,
              onPick: setStart,
              preview,
              countOpts,
              total,
              page: pageIdx,
              faces,
              faceOpts
            }
          ) }) }),
          pages > 1 && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute bottom-6 right-6", children: /* @__PURE__ */ jsxs("div", { className: "app-sticky-glass pointer-events-auto flex items-center gap-1 rounded-full border px-2 py-1 text-[14px] leading-[22px]", children: [
            /* @__PURE__ */ jsx("button", { type: "button", "aria-label": "\u524D\u306E\u7528\u7D19", disabled: pageIdx === 0, onClick: () => setPage(pageIdx - 1), className: "h-8 w-8 rounded-full text-[18px] leading-[26px] text-ink hover:bg-surface-subtle disabled:opacity-35", children: "\u2039" }),
            /* @__PURE__ */ jsxs("b", { className: "min-w-[5.5rem] text-center tabular-nums text-ink", children: [
              pageIdx + 1,
              " / ",
              pages,
              " \u679A\u76EE"
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", "aria-label": "\u6B21\u306E\u7528\u7D19", disabled: pageIdx >= pages - 1, onClick: () => setPage(pageIdx + 1), className: "h-8 w-8 rounded-full text-[18px] leading-[26px] text-ink hover:bg-surface-subtle disabled:opacity-35", children: "\u203A" })
          ] }) })
        ] }) : /* @__PURE__ */ jsx("div", { className: "h-[460px] min-h-0 [container-type:size] md:h-auto md:flex-1", children: selectedLabel ? /* @__PURE__ */ jsx(
          "div",
          {
            className: "mx-auto flex items-center justify-center overflow-hidden rounded-md border border-line bg-[var(--label-paper)] text-[var(--label-ink)] shadow-sm",
            style: { width: `min(100cqw, calc(100cqh * ${sheet.labelW / sheet.labelH}))`, aspectRatio: `${sheet.labelW}/${sheet.labelH}`, marginTop: "max(0px, calc((100cqh - 100cqw * " + sheet.labelH / sheet.labelW + ") / 2))" },
            children: /* @__PURE__ */ jsx(LabelFace, { label: selectedLabel, faces, options: faceOpts, placeholder: "skeleton" })
          }
        ) : /* @__PURE__ */ jsx("p", { className: "text-[14px] leading-[22px] text-ink-muted", children: "\u898B\u672C\u3092\u8868\u793A\u3067\u304D\u308B\u5546\u54C1\u304C\u3042\u308A\u307E\u305B\u3093\u3002" }) }) })
      ] })
    }
  );
}
function TargetRows({
  target,
  targetIndex,
  multiple,
  selectedKey,
  onSelect
}) {
  const head = multiple ? /* @__PURE__ */ jsx("p", { className: "truncate border-b border-line bg-surface-subtle px-3 py-1 text-[12px] leading-[18px] font-medium text-ink-muted", children: target.orderNumber || target.fileName }) : null;
  if (target.mode === "generate" && target.items.length > 0) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      head,
      target.items.map((item, i) => {
        const key = `${targetIndex}:${i}`;
        const on = key === selectedKey;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            "aria-pressed": on,
            onClick: () => onSelect(key),
            className: `flex w-full items-center justify-between gap-3 border-b border-line px-3 py-2.5 text-left text-[14px] leading-[22px] last:border-b-0 ${on ? "bg-accent-soft" : "hover:bg-surface-subtle"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "min-w-0 truncate text-ink", children: item.productName }),
              /* @__PURE__ */ jsxs("span", { className: "shrink-0 tabular-nums text-ink-muted", children: [
                item.quantity.toLocaleString(),
                "\u679A"
              ] })
            ]
          },
          `${item.fnSku}-${i}`
        );
      })
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    head,
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-line px-3 py-2.5 text-[14px] leading-[22px] last:border-b-0", children: [
      /* @__PURE__ */ jsx("span", { className: "min-w-0 truncate text-ink", children: target.fileName }),
      /* @__PURE__ */ jsx("span", { className: "shrink-0 tabular-nums text-ink-muted", children: "\u2014" })
    ] })
  ] });
}
function GearPopover({
  open,
  onOpenChange,
  useDismiss,
  children
}) {
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const [pos, setPos] = useState(null);
  useDismiss(popRef, () => onOpenChange(false), { enabled: open, ignore: btnRef });
  const place = useCallback(() => {
    const btn = btnRef.current;
    const pop = popRef.current;
    if (!btn || !pop) return;
    const M = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(340, vw - M * 2);
    const r = btn.getBoundingClientRect();
    const left = Math.min(Math.max(M, r.right - width), vw - width - M);
    const h = pop.scrollHeight;
    const below = vh - r.bottom - M - 6;
    const above = r.top - M - 6;
    let top;
    let maxHeight;
    if (h <= below) {
      top = r.bottom + 6;
      maxHeight = below;
    } else if (h <= above) {
      top = r.top - 6 - h;
      maxHeight = above;
    } else if (below >= above) {
      top = r.bottom + 6;
      maxHeight = below;
    } else {
      top = M;
      maxHeight = above;
    }
    setPos({ top, left, width, maxHeight: Math.max(120, maxHeight) });
  }, []);
  useLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place, children]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        ref: btnRef,
        type: "button",
        "aria-expanded": open,
        "aria-haspopup": "dialog",
        title: "\u5370\u5237\u306E\u8A73\u7D30\u8A2D\u5B9A",
        onClick: () => onOpenChange(!open),
        className: `h-[38px] w-10 shrink-0 rounded-lg border text-[18px] leading-[26px] text-ink ${open ? "border-[var(--sb-accent-bg)] bg-accent-soft" : "border-line-strong bg-surface hover:bg-surface-subtle"}`,
        children: [
          /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "\u2699" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "\u5370\u5237\u306E\u8A73\u7D30\u8A2D\u5B9A" })
        ]
      }
    ),
    open && typeof document !== "undefined" && createPortal(
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: popRef,
          role: "dialog",
          "aria-label": "\u5370\u5237\u306E\u8A73\u7D30\u8A2D\u5B9A",
          style: pos ? { position: "fixed", top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxHeight } : { position: "fixed", top: 0, left: 0, width: 340, visibility: "hidden" },
          className: "z-[90] max-w-[calc(100vw-16px)] overflow-y-auto rounded-xl border border-line bg-surface p-3.5 text-ink shadow-2xl",
          children
        }
      ),
      document.body
    )
  ] });
}
function SettingsBody({
  settings,
  patch,
  hasExpiryItems,
  caps,
  limitNotice,
  onClearNotice,
  saveState,
  onSave
}) {
  const offset = (key, raw) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    patch({ [key]: Math.min(MAX_OFFSET_MM, Math.max(-MAX_OFFSET_MM, Math.round(n * 2) / 2)) });
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3.5 text-[14px] leading-[22px]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[12px] leading-[18px] font-medium text-ink-muted", children: "\u4E26\u3073\u9806" }),
      /* @__PURE__ */ jsx("div", { className: "flex overflow-hidden rounded-lg border border-line-strong", role: "group", "aria-label": "\u4E26\u3073\u9806", children: [["row", "\u6A2A\uFF081\u21922\u21923\uFF09"], ["column", "\u7E26\uFF081\u21932\u21933\uFF09"]].map(([v, label]) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          "aria-pressed": settings.order === v,
          onClick: () => patch({ order: v }),
          className: `flex-1 px-2 py-2 text-[12px] leading-[18px] ${settings.order === v ? "bg-[var(--sb-accent-bg)] font-semibold text-on-accent" : "bg-surface text-ink hover:bg-surface-subtle"}`,
          children: label
        },
        v
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[12px] leading-[18px] font-medium text-ink-muted", children: "\u5370\u5B57\u3059\u308B\u9805\u76EE" }),
      /* @__PURE__ */ jsxs("label", { className: `flex items-center gap-2 ${!caps.image ? "opacity-50" : ""}`, children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", disabled: !caps.image, checked: settings.image && caps.image, onChange: (e) => {
          onClearNotice();
          patch({ image: e.target.checked });
        } }),
        "\u5546\u54C1\u753B\u50CF",
        !caps.image && /* @__PURE__ */ jsx("em", { className: "ml-auto text-[11px] leading-[16px] not-italic text-ink-muted", children: "\u3053\u306E\u7528\u7D19\u3067\u306F\u9078\u3079\u307E\u305B\u3093" })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "mt-1 flex items-baseline gap-2 text-[12px] leading-[18px] font-medium text-ink-muted", children: [
        "\u8FFD\u52A0\u9805\u76EE",
        /* @__PURE__ */ jsx("em", { className: "text-[11px] leading-[16px] font-normal not-italic", children: caps.maxExtras === 0 ? "\u3053\u306E\u7528\u7D19\u3067\u306F\u9078\u3079\u307E\u305B\u3093" : `\u3053\u306E\u7528\u7D19\u3067\u306F${caps.maxExtras}\u3064\u307E\u3067` })
      ] }),
      LABEL_EXTRA_OPTIONS.map((opt) => {
        const checked = settings.extra.includes(opt.key);
        const full = !checked && settings.extra.length >= caps.maxExtras;
        const disabled = full;
        return /* @__PURE__ */ jsxs("label", { className: `flex items-center gap-2 ${disabled ? "opacity-50" : ""}`, children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              disabled,
              checked,
              onChange: (e) => {
                onClearNotice();
                const next = e.target.checked ? [...settings.extra, opt.key] : settings.extra.filter((k) => k !== opt.key);
                patch({ extra: next });
              }
            }
          ),
          opt.label
        ] }, opt.key);
      }),
      /* @__PURE__ */ jsxs("label", { className: `flex items-center gap-2 ${!hasExpiryItems ? "opacity-50" : ""}`, children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: settings.expirySticker, onChange: (e) => patch({ expirySticker: e.target.checked }) }),
        "\u671F\u9650\u30B7\u30FC\u30EB\u3082\u5370\u5237\uFF08\u671F\u9650\u7BA1\u7406\u306E\u5546\u54C1\u3060\u3051\uFF09"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[12px] leading-[18px] font-medium text-ink-muted", children: "\u5370\u5237\u4F4D\u7F6E\u306E\u5FAE\u8ABF\u6574\uFF08mm\uFF09" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-[12px] leading-[18px]", children: [
          "\u4E0A\u4E0B",
          /* @__PURE__ */ jsx("input", { type: "number", step: 0.5, min: -MAX_OFFSET_MM, max: MAX_OFFSET_MM, value: settings.offsetYmm, onChange: (e) => offset("offsetYmm", e.target.value), className: `${field} w-20 py-1.5` })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-[12px] leading-[18px]", children: [
          "\u5DE6\u53F3",
          /* @__PURE__ */ jsx("input", { type: "number", step: 0.5, min: -MAX_OFFSET_MM, max: MAX_OFFSET_MM, value: settings.offsetXmm, onChange: (e) => offset("offsetXmm", e.target.value), className: `${field} w-20 py-1.5` })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("button", { type: "button", onClick: onSave, disabled: saveState === "saving", className: ghostBtn, children: saveState === "saving" ? "\u4FDD\u5B58\u4E2D\u2026" : saveState === "saved" ? "\u4FDD\u5B58\u3057\u307E\u3057\u305F" : "\u3053\u306E\u8A2D\u5B9A\u3092\u30C7\u30D5\u30A9\u30EB\u30C8\u306B\u3059\u308B" })
  ] });
}
function SheetPage({
  sheet,
  settings,
  start,
  onPick,
  preview,
  countOpts,
  total,
  page,
  faces,
  faceOpts
}) {
  const count = total ?? 0;
  const labels = useMemo(
    () => cellLabels(preview, countOpts, (page + 1) * sheet.faces),
    [preview, countOpts, page, sheet.faces]
  );
  const hatch = "repeating-linear-gradient(135deg, transparent 0 4px, rgb(128 128 128 / .38) 4px 5px)";
  const cells = diagramPage(sheet, settings.order, start, labels, count, page);
  const interactive = page === 0;
  return /* @__PURE__ */ jsx("div", { className: "relative h-full w-full border border-line bg-surface-subtle shadow-sm", children: cells.map((c) => {
    const left = (sheet.marginLeft + c.col * sheet.pitchX) / sheet.pageW * 100;
    const top = (sheet.marginTop + c.row * sheet.pitchY) / sheet.pageH * 100;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        tabIndex: interactive ? 0 : -1,
        title: interactive ? `${c.no} \u756A\u304B\u3089\u5370\u5237` : void 0,
        "aria-label": interactive ? `${c.no} \u756A\u304B\u3089\u5370\u5237` : `${c.no} \u756A`,
        onClick: interactive ? () => onPick(c.no) : void 0,
        className: `absolute flex flex-col items-center justify-center gap-px overflow-hidden border border-dashed border-line p-0 text-[11px] leading-[16px] text-[var(--label-ink)] ${interactive ? "cursor-pointer" : "cursor-default"} ${c.state === "print" ? "bg-[var(--label-paper)]" : "bg-transparent"} ${interactive && c.no === start ? "z-10 outline outline-2 -outline-offset-2 outline-[var(--sb-accent-bg)]" : ""}`,
        style: {
          left: `${left}%`,
          top: `${top}%`,
          width: `${sheet.labelW / sheet.pageW * 100}%`,
          height: `${sheet.labelH / sheet.pageH * 100}%`,
          backgroundImage: c.state === "used" ? hatch : void 0
        },
        children: [
          /* @__PURE__ */ jsx("span", { className: "absolute left-0.5 top-px z-[1] font-mono text-[11px] leading-none text-[var(--label-position-ink)]", children: c.no }),
          c.state === "print" && (c.label ? /* @__PURE__ */ jsx(LabelFace, { label: c.label, faces, options: faceOpts, placeholder: "skeleton" }) : /* @__PURE__ */ jsx(CellMark, { label: c.label }))
        ]
      },
      c.no
    );
  }) });
}
function CellMark({ label }) {
  if (label?.kind === "expiry") {
    return /* @__PURE__ */ jsxs("span", { className: "text-[11px] leading-tight text-[var(--label-ink-muted)]", children: [
      "\u671F\u9650",
      /* @__PURE__ */ jsx("br", {}),
      label.expiration?.slice(0, 4),
      "\u5E74"
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { className: "h-[30%] w-[72%]", style: { background: "repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 2px, currentColor 2px 4px, transparent 4px 5px)" } }),
    label?.fnSku && /* @__PURE__ */ jsx("span", { className: "max-w-[92%] truncate font-mono text-[11px] leading-[16px] text-[var(--label-ink-muted)]", children: label.fnSku })
  ] });
}
export {
  ProductLabelPrintDialog
};
//# sourceMappingURL=ProductLabelPrintDialog.js.map