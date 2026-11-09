async function renderPdfPages(data, displayWidth, signal, onPage, loadPdfjs) {
  const pdfjs = await loadPdfjs();
  const dpr = typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 3);
  const task = pdfjs.getDocument({ data: new Uint8Array(data) });
  const doc = await task.promise;
  try {
    for (let i = 1; i <= doc.numPages; i += 1) {
      if (signal.aborted) break;
      const page = await doc.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: displayWidth * dpr / base.width });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas unavailable");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      page.cleanup();
      if (signal.aborted) break;
      onPage(i - 1, canvas.toDataURL("image/png"));
    }
    return doc.numPages;
  } finally {
    void task.destroy();
  }
}
export {
  renderPdfPages
};
//# sourceMappingURL=face-render.js.map