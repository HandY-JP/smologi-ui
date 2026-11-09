import { describe, expect, it } from 'vitest';
import {
  buildImagePrintHtml,
  isSafariUserAgent,
  pdfLoadTimeoutMs,
  pdfSettleMsFor,
  shouldOpenPdfInNewTab,
  detectPrintableKind,
  printableMimeType,
  printFailureMessage,
  type PrintAttachmentFailureReason,
} from '../../src/product-label/ui/attachment-print';

describe('detectPrintableKind', () => {
  it('Content-Type を優先して判定する', () => {
    expect(detectPrintableKind({ contentType: 'application/pdf', fileName: 'label.png' })).toBe('pdf');
    expect(detectPrintableKind({ contentType: 'image/png', fileName: 'label.pdf' })).toBe('image');
    expect(detectPrintableKind({ contentType: 'image/jpeg; charset=binary' })).toBe('image');
    expect(detectPrintableKind({ contentType: 'IMAGE/WEBP' })).toBe('image');
  });

  it('octet-stream・空のときは拡張子で補う（contentType 未設定の Blob 対策）', () => {
    expect(detectPrintableKind({ contentType: 'application/octet-stream', fileName: 'FBA15XYZ.PDF' })).toBe('pdf');
    expect(detectPrintableKind({ contentType: '', fileName: 'label.jpeg' })).toBe('image');
    expect(detectPrintableKind({ contentType: null, fileName: 'https://x.private.blob.vercel-storage.com/a/b.png?download=1' })).toBe('image');
    expect(detectPrintableKind({ fileName: 'box.jpg#page=1' })).toBe('image');
  });

  it('PDF・画像以外は印刷対象にしない', () => {
    expect(detectPrintableKind({ contentType: 'text/html', fileName: 'label.pdf' })).toBeNull();
    expect(detectPrintableKind({ contentType: 'application/json' })).toBeNull();
    expect(detectPrintableKind({ contentType: 'image/svg+xml', fileName: 'a.svg' })).toBeNull();
    expect(detectPrintableKind({ contentType: 'application/octet-stream', fileName: 'data.csv' })).toBeNull();
    expect(detectPrintableKind({ fileName: 'noext' })).toBeNull();
    expect(detectPrintableKind({})).toBeNull();
  });
});

describe('printableMimeType', () => {
  it('PDF は常に application/pdf（octet-stream のままだと iframe がダウンロード扱いで白紙になる）', () => {
    expect(printableMimeType('pdf', 'application/octet-stream', 'a.pdf')).toBe('application/pdf');
    expect(printableMimeType('pdf', null, null)).toBe('application/pdf');
  });

  it('画像は Content-Type、なければ拡張子から決める', () => {
    expect(printableMimeType('image', 'image/jpeg', 'a.png')).toBe('image/jpeg');
    expect(printableMimeType('image', 'application/octet-stream', 'a.JPG')).toBe('image/jpeg');
    expect(printableMimeType('image', '', 'a.webp')).toBe('image/webp');
    expect(printableMimeType('image', null, 'unknown')).toBe('image/png');
  });
});

describe('printFailureMessage', () => {
  const reasons: PrintAttachmentFailureReason[] = ['fetch', 'unsupported', 'load-timeout', 'print-blocked'];

  it('すべての失敗理由で「新しいタブ」か「別タブで開く」へ誘導する（画面印刷へは落とさない）', () => {
    for (const reason of reasons) {
      expect(printFailureMessage(reason, true)).toContain('新しいタブ');
      expect(printFailureMessage(reason, false)).toContain('「別タブで開く」');
    }
  });
});

describe('buildImagePrintHtml', () => {
  it('画像1枚だけの文書を作り、タイトル・URLはエスケープする', () => {
    const html = buildImagePrintHtml('blob:https://smologi.com/abc"<x>', '<script>alert(1)</script>.png');
    expect(html).toContain('<img src="blob:https://smologi.com/abc&quot;&lt;x&gt;"');
    expect(html).toContain('<title>&lt;script&gt;alert(1)&lt;/script&gt;.png</title>');
    expect(html).not.toContain('<script>');
    expect(html.match(/<img /g)).toHaveLength(1);
    expect(html).toContain('@page');
  });
});

const UA = {
  safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  chrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
};

describe('isSafariUserAgent / shouldOpenPdfInNewTab', () => {
  it('Safari だけを Safari と判定する', () => {
    expect(isSafariUserAgent(UA.safari)).toBe(true);
    expect(isSafariUserAgent(UA.chrome)).toBe(false);
    expect(isSafariUserAgent(UA.edge)).toBe(false);
    expect(isSafariUserAgent(UA.firefox)).toBe(false);
  });
  it('Safari・PDF ビューア無効/不明は新しいタブ、Chrome/Edge の有効時は iframe', () => {
    expect(shouldOpenPdfInNewTab({ userAgent: UA.safari, pdfViewerEnabled: true })).toBe(true);
    expect(shouldOpenPdfInNewTab({ userAgent: UA.chrome, pdfViewerEnabled: false })).toBe(true);
    expect(shouldOpenPdfInNewTab({ userAgent: UA.chrome, pdfViewerEnabled: undefined })).toBe(true);
    expect(shouldOpenPdfInNewTab({ userAgent: UA.chrome, pdfViewerEnabled: true })).toBe(false);
    expect(shouldOpenPdfInNewTab({ userAgent: UA.edge, pdfViewerEnabled: true })).toBe(false);
  });
});

describe('ページ数に応じた待ち時間', () => {
  it('load 待ちは12秒＋ページ数×0.1秒、上限60秒', () => {
    expect(pdfLoadTimeoutMs()).toBe(12_000);
    expect(pdfLoadTimeoutMs(100)).toBe(22_000);
    expect(pdfLoadTimeoutMs(100_000)).toBe(60_000);
  });
  it('描画猶予も増え、上限は5秒', () => {
    expect(pdfSettleMsFor()).toBe(600);
    expect(pdfSettleMsFor(100)).toBe(1_600);
    expect(pdfSettleMsFor(100_000)).toBe(5_000);
  });
});
