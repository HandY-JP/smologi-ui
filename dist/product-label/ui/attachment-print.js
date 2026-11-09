const IMAGE_MIME = /^image\/(png|jpe?g|gif|webp)$/i;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp)$/i;
const IMAGE_EXT_MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp"
};
function stripQuery(value) {
  return value.split(/[?#]/)[0] ?? "";
}
function detectPrintableKind(input) {
  const mime = (input.contentType ?? "").split(";")[0].trim().toLowerCase();
  if (mime === "application/pdf") return "pdf";
  if (IMAGE_MIME.test(mime)) return "image";
  if (mime && mime !== "application/octet-stream" && mime !== "binary/octet-stream") return null;
  const name = stripQuery(input.fileName ?? "").toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (IMAGE_EXT.test(name)) return "image";
  return null;
}
function printableMimeType(kind, contentType, fileName) {
  if (kind === "pdf") return "application/pdf";
  const mime = (contentType ?? "").split(";")[0].trim().toLowerCase();
  if (IMAGE_MIME.test(mime)) return mime;
  const ext = stripQuery(fileName ?? "").toLowerCase().match(IMAGE_EXT)?.[1];
  return ext && IMAGE_EXT_MIME[ext] || "image/png";
}
function printFailureMessage(reason, openedInNewTab) {
  const next = openedInNewTab ? "\u65B0\u3057\u3044\u30BF\u30D6\u3067\u30D5\u30A1\u30A4\u30EB\u3092\u958B\u3044\u305F\u306E\u3067\u3001\u305D\u3061\u3089\u3067\u5370\u5237\u3057\u3066\u304F\u3060\u3055\u3044\u3002" : "\u300C\u5225\u30BF\u30D6\u3067\u958B\u304F\u300D\u304B\u3089\u30D5\u30A1\u30A4\u30EB\u3092\u958B\u3044\u3066\u5370\u5237\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
  switch (reason) {
    case "fetch":
      return `\u30D5\u30A1\u30A4\u30EB\u3092\u53D6\u5F97\u3067\u304D\u306A\u304B\u3063\u305F\u305F\u3081\u5370\u5237\u3092\u4E2D\u6B62\u3057\u307E\u3057\u305F\u3002${next}`;
    case "unsupported":
      return `PDF\u30FB\u753B\u50CF\u4EE5\u5916\u306E\u30D5\u30A1\u30A4\u30EB\u306F\u3053\u306E\u753B\u9762\u304B\u3089\u76F4\u63A5\u5370\u5237\u3067\u304D\u307E\u305B\u3093\u3002${next}`;
    case "load-timeout":
      return `\u30D5\u30A1\u30A4\u30EB\u306E\u8AAD\u307F\u8FBC\u307F\u306B\u6642\u9593\u304C\u304B\u304B\u3063\u305F\u305F\u3081\u5370\u5237\u3092\u4E2D\u6B62\u3057\u307E\u3057\u305F\u3002${next}`;
    case "print-blocked":
      return `\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F\u3053\u306E\u753B\u9762\u304B\u3089\u76F4\u63A5\u5370\u5237\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002${next}`;
  }
}
function isSafariUserAgent(ua) {
  if (!/Safari\//.test(ua)) return false;
  return !/Chrome|Chromium|CriOS|Edg|EdgA|EdgiOS|FxiOS|OPR|Android/i.test(ua);
}
function shouldOpenPdfInNewTab(env) {
  if (isSafariUserAgent(env.userAgent ?? "")) return true;
  return env.pdfViewerEnabled !== true;
}
function browserPrefersPdfTab() {
  if (typeof navigator === "undefined") return false;
  return shouldOpenPdfInNewTab({ userAgent: navigator.userAgent, pdfViewerEnabled: navigator.pdfViewerEnabled });
}
function pdfLoadTimeoutMs(pageCount) {
  const pages = Math.max(0, Math.floor(pageCount ?? 0));
  return Math.min(6e4, LOAD_TIMEOUT_MS + pages * 100);
}
function pdfSettleMsFor(pageCount) {
  const pages = Math.max(0, Math.floor(pageCount ?? 0));
  return Math.min(5e3, PDF_SETTLE_MS + pages * 10);
}
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function buildImagePrintHtml(imageUrl, title) {
  return [
    '<!doctype html><html><head><meta charset="utf-8">',
    `<title>${escapeHtml(title)}</title>`,
    "<style>",
    "@page { margin: 0; }",
    "html, body { margin: 0; padding: 0; background: #fff; }",
    "body { display: flex; align-items: flex-start; justify-content: center; }",
    "img { display: block; max-width: 100%; max-height: 100vh; object-fit: contain; }",
    "</style></head><body>",
    `<img src="${escapeHtml(imageUrl)}" alt="">`,
    "</body></html>"
  ].join("");
}
const PDF_SETTLE_MS = 600;
const LOAD_TIMEOUT_MS = 12e3;
const HARD_CLEANUP_MS = 10 * 6e4;
let activeCleanup = null;
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function waitForLoad(iframe, timeoutMs) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), timeoutMs);
    iframe.addEventListener(
      "load",
      () => {
        clearTimeout(timer);
        resolve(true);
      },
      { once: true }
    );
  });
}
async function waitForImage(doc, timeoutMs) {
  const img = doc.querySelector("img");
  if (!img) return false;
  const ready = (async () => {
    if (!img.complete) {
      await new Promise((resolve, reject) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => reject(new Error("image error")), { once: true });
      });
    }
    if (img.naturalWidth === 0) throw new Error("image broken");
    if (typeof img.decode === "function") await img.decode();
    return true;
  })().catch(() => false);
  return Promise.race([ready, wait(timeoutMs).then(() => false)]);
}
function createHiddenFrame() {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  iframe.title = "\u5370\u5237\u7528";
  Object.assign(iframe.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "800px",
    height: "600px",
    border: "0",
    opacity: "0",
    pointerEvents: "none"
  });
  return iframe;
}
async function printAttachment(source, options = {}) {
  activeCleanup?.();
  activeCleanup = null;
  let blob;
  let contentType = options.contentType ?? null;
  if (typeof source === "string") {
    try {
      const res = await fetch(source, { credentials: "same-origin" });
      if (!res.ok) return { ok: false, reason: "fetch" };
      contentType = res.headers.get("content-type") ?? contentType;
      blob = await res.blob();
    } catch {
      return { ok: false, reason: "fetch" };
    }
  } else {
    blob = source;
    contentType = contentType ?? source.type;
  }
  const kind = detectPrintableKind({ contentType: contentType || blob.type, fileName: options.fileName });
  if (!kind) return { ok: false, reason: "unsupported" };
  if (kind === "pdf" && typeof navigator !== "undefined" && navigator.pdfViewerEnabled === false) {
    return { ok: false, reason: "print-blocked" };
  }
  const typed = new Blob([blob], { type: printableMimeType(kind, contentType || blob.type, options.fileName) });
  const objectUrl = URL.createObjectURL(typed);
  const iframe = createHiddenFrame();
  let cleaned = false;
  let hardTimer = null;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (hardTimer) clearTimeout(hardTimer);
    iframe.remove();
    URL.revokeObjectURL(objectUrl);
    if (activeCleanup === cleanup) activeCleanup = null;
  };
  activeCleanup = cleanup;
  const loaded = waitForLoad(iframe, kind === "pdf" ? pdfLoadTimeoutMs(options.pageCount) : LOAD_TIMEOUT_MS);
  if (kind === "pdf") {
    iframe.src = objectUrl;
  } else {
    iframe.srcdoc = buildImagePrintHtml(objectUrl, options.fileName ?? "");
  }
  document.body.appendChild(iframe);
  if (!await loaded) {
    cleanup();
    return { ok: false, reason: "load-timeout" };
  }
  if (kind === "pdf") {
    await wait(pdfSettleMsFor(options.pageCount));
  } else {
    let doc = null;
    try {
      doc = iframe.contentDocument;
    } catch {
      doc = null;
    }
    if (!doc || !await waitForImage(doc, LOAD_TIMEOUT_MS)) {
      cleanup();
      return { ok: false, reason: "load-timeout" };
    }
  }
  const frameWindow = iframe.contentWindow;
  if (!frameWindow || frameWindow === window) {
    cleanup();
    return { ok: false, reason: "print-blocked" };
  }
  try {
    frameWindow.focus();
    frameWindow.addEventListener("afterprint", () => setTimeout(cleanup, 1e3), { once: true });
    frameWindow.print();
  } catch {
    cleanup();
    return { ok: false, reason: "print-blocked" };
  }
  hardTimer = setTimeout(cleanup, HARD_CLEANUP_MS);
  return { ok: true, kind };
}
export {
  browserPrefersPdfTab,
  buildImagePrintHtml,
  detectPrintableKind,
  isSafariUserAgent,
  pdfLoadTimeoutMs,
  pdfSettleMsFor,
  printAttachment,
  printFailureMessage,
  printableMimeType,
  shouldOpenPdfInNewTab
};
//# sourceMappingURL=attachment-print.js.map