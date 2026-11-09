// 出荷添付（FBA納品ラベル・商品ラベル・同梱書類など）を「そのファイルだけ」印刷するヘルパ。
//
// 背景（2026-09-24 報告「FBAの添付ラベルを印刷すると、ときどきラベルではなく画面が印刷される」）:
//   添付には専用の印刷ボタンがなく、画面内プレビュー（<iframe src=PDF> / <img>）を見ながら
//   ⌘P / Ctrl+P やブラウザメニューで印刷していた。このとき印刷されるのは「キーボードフォーカスが
//   ある文書」なので、直前に PDF プレビューの中をクリックしていれば PDF、見出し・余白・スクロール等で
//   フォーカスが親ページに戻っていれば画面全体、画像添付なら常に画面全体、と操作次第で入れ替わっていた。
//
// 方針（どんな場合も親ページ＝画面を印刷しない）:
//   - ファイルは fetch → Blob → blob: URL にして**同一オリジン**の隠し iframe に入れる
//     （旧公開 Blob の別ドメイン URL を直接 iframe に入れると contentWindow.print() が SecurityError になる）。
//   - PDF は iframe の load 後、PDF ビューア初期化の猶予を置いてから iframe の window で print()。
//     画像は srcdoc のラッパー HTML に <img> を置き、decode 完了後に print()。
//   - 何か1つでも失敗したら window.print() には**絶対にフォールバックしない**。
//     呼び出し側が「新しいタブで開く」＋トーストで案内する（PrintAttachmentResult.ok=false）。
//
// 純粋部分（種類判定・失敗理由→案内文）は vitest で検証（tests/product-label/attachment-print.test.ts）。
// 出荷添付の印刷（Smologi）と商品ラベルの印刷（Smologi・Seller）で共有する。

export type PrintableAttachmentKind = 'pdf' | 'image';

export type PrintAttachmentFailureReason =
  /** 取得に失敗（通信・認証・CORS・HTTPエラー） */
  | 'fetch'
  /** PDF・画像以外（印刷できる形式ではない） */
  | 'unsupported'
  /** 隠し iframe の読込・デコードが時間内に終わらなかった */
  | 'load-timeout'
  /** iframe の window に print() を呼べなかった（ブラウザ制約など） */
  | 'print-blocked';

export type PrintAttachmentResult =
  | { ok: true; kind: PrintableAttachmentKind }
  | { ok: false; reason: PrintAttachmentFailureReason };

const IMAGE_MIME = /^image\/(png|jpe?g|gif|webp)$/i;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp)$/i;
const IMAGE_EXT_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
};

function stripQuery(value: string): string {
  return value.split(/[?#]/)[0] ?? '';
}

/**
 * 印刷できる種類か判定する。Content-Type を優先し、octet-stream・空のときだけ拡張子で補う
 * （contentType 未設定の Blob は octet-stream で返ってくることがあるため）。
 */
export function detectPrintableKind(input: {
  contentType?: string | null;
  fileName?: string | null;
}): PrintableAttachmentKind | null {
  const mime = (input.contentType ?? '').split(';')[0].trim().toLowerCase();
  if (mime === 'application/pdf') return 'pdf';
  if (IMAGE_MIME.test(mime)) return 'image';
  if (mime && mime !== 'application/octet-stream' && mime !== 'binary/octet-stream') return null;
  const name = stripQuery(input.fileName ?? '').toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (IMAGE_EXT.test(name)) return 'image';
  return null;
}

/**
 * Blob に付ける MIME。octet-stream のままだと Chrome は iframe で表示せずダウンロード扱いにし、
 * 空の iframe を印刷することになるため、種類から確定させる。
 */
export function printableMimeType(kind: PrintableAttachmentKind, contentType: string | null | undefined, fileName: string | null | undefined): string {
  if (kind === 'pdf') return 'application/pdf';
  const mime = (contentType ?? '').split(';')[0].trim().toLowerCase();
  if (IMAGE_MIME.test(mime)) return mime;
  const ext = stripQuery(fileName ?? '').toLowerCase().match(IMAGE_EXT)?.[1];
  return (ext && IMAGE_EXT_MIME[ext]) || 'image/png';
}

/** 失敗理由ごとのトースト文言。どれも「画面は印刷していない」ことと次の手を伝える。 */
export function printFailureMessage(reason: PrintAttachmentFailureReason, openedInNewTab: boolean): string {
  const next = openedInNewTab
    ? '新しいタブでファイルを開いたので、そちらで印刷してください。'
    : '「別タブで開く」からファイルを開いて印刷してください。';
  switch (reason) {
    case 'fetch':
      return `ファイルを取得できなかったため印刷を中止しました。${next}`;
    case 'unsupported':
      return `PDF・画像以外のファイルはこの画面から直接印刷できません。${next}`;
    case 'load-timeout':
      return `ファイルの読み込みに時間がかかったため印刷を中止しました。${next}`;
    case 'print-blocked':
      return `このブラウザではこの画面から直接印刷できませんでした。${next}`;
  }
}

/** Safari（Chrome / Edge / Firefox / Opera 系は含めない）かをユーザーエージェントで判定する。 */
export function isSafariUserAgent(ua: string): boolean {
  if (!/Safari\//.test(ua)) return false;
  return !/Chrome|Chromium|CriOS|Edg|EdgA|EdgiOS|FxiOS|OPR|Android/i.test(ua);
}

/**
 * 隠し iframe からの PDF 印刷を試さず、最初から新しいタブで開くべきか。
 * Safari は iframe 内 PDF の print() が不安定、pdfViewerEnabled が false / 未提供のブラウザは
 * 内蔵 PDF ビューアが無い（または不明）で load が来ないため。商品ラベル印刷の経路で使う。
 */
export function shouldOpenPdfInNewTab(env: { userAgent?: string; pdfViewerEnabled?: boolean | undefined }): boolean {
  if (isSafariUserAgent(env.userAgent ?? '')) return true;
  return env.pdfViewerEnabled !== true;
}

/** ブラウザ環境から shouldOpenPdfInNewTab を判定する（SSR では false）。 */
export function browserPrefersPdfTab(): boolean {
  if (typeof navigator === 'undefined') return false;
  return shouldOpenPdfInNewTab({ userAgent: navigator.userAgent, pdfViewerEnabled: navigator.pdfViewerEnabled });
}

/** PDF の load 待ち上限（ページ数が多いほど延ばす）。12秒＋ページ数×0.1秒、上限60秒。 */
export function pdfLoadTimeoutMs(pageCount?: number): number {
  const pages = Math.max(0, Math.floor(pageCount ?? 0));
  return Math.min(60_000, LOAD_TIMEOUT_MS + pages * 100);
}

/** PDF ビューアの描画猶予（ページ数が多いほど延ばす）。600ms＋ページ数×10ms、上限5秒。 */
export function pdfSettleMsFor(pageCount?: number): number {
  const pages = Math.max(0, Math.floor(pageCount ?? 0));
  return Math.min(5_000, PDF_SETTLE_MS + pages * 10);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 画像1枚を用紙いっぱい（縦横比維持）に印刷するためのラッパー HTML（iframe srcdoc 用）。 */
export function buildImagePrintHtml(imageUrl: string, title: string): string {
  return [
    '<!doctype html><html><head><meta charset="utf-8">',
    `<title>${escapeHtml(title)}</title>`,
    '<style>',
    '@page { margin: 0; }',
    'html, body { margin: 0; padding: 0; background: #fff; }',
    'body { display: flex; align-items: flex-start; justify-content: center; }',
    'img { display: block; max-width: 100%; max-height: 100vh; object-fit: contain; }',
    '</style></head><body>',
    `<img src="${escapeHtml(imageUrl)}" alt="">`,
    '</body></html>',
  ].join('');
}

// ─── ここから DOM 依存（ブラウザ専用） ──────────────────────────────────────

/** PDF ビューア（Chrome の PDF プラグイン / Firefox の pdf.js）が load 後に描画を整えるまでの猶予。 */
const PDF_SETTLE_MS = 600;
const LOAD_TIMEOUT_MS = 12_000;
/** 印刷ダイアログを閉じた合図（afterprint）が来ないブラウザ向けの最終片付け。 */
const HARD_CLEANUP_MS = 10 * 60_000;

let activeCleanup: (() => void) | null = null;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForLoad(iframe: HTMLIFrameElement, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), timeoutMs);
    iframe.addEventListener(
      'load',
      () => {
        clearTimeout(timer);
        resolve(true);
      },
      { once: true },
    );
  });
}

async function waitForImage(doc: Document, timeoutMs: number): Promise<boolean> {
  const img = doc.querySelector('img');
  if (!img) return false;
  const ready = (async () => {
    if (!img.complete) {
      await new Promise<void>((resolve, reject) => {
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => reject(new Error('image error')), { once: true });
      });
    }
    if (img.naturalWidth === 0) throw new Error('image broken');
    if (typeof img.decode === 'function') await img.decode();
    return true;
  })().catch(() => false);
  return Promise.race([ready, wait(timeoutMs).then(() => false)]);
}

/**
 * 画面に出さない印刷用 iframe。display:none や 0×0 だと Chrome の PDF プラグインが起動せず
 * 白紙になるため、画面外に実寸を持たせて置く。
 */
function createHiddenFrame(): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.tabIndex = -1;
  iframe.title = '印刷用';
  Object.assign(iframe.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '800px',
    height: '600px',
    border: '0',
    opacity: '0',
    pointerEvents: 'none',
  } satisfies Partial<CSSStyleDeclaration>);
  return iframe;
}

/**
 * 添付を印刷する。source は同一オリジンの配信 API（/api/logistics/attachments/file?url=…）
 * または旧公開 Blob の URL、あるいは結合済み PDF などの Blob。
 *
 * 成功時も失敗時も window.print()（＝画面の印刷）は呼ばない。
 */
export async function printAttachment(
  source: string | Blob,
  options: { fileName?: string; contentType?: string; /** PDF のページ数（待ち時間を延ばすため） */ pageCount?: number } = {},
): Promise<PrintAttachmentResult> {
  // 前回分の iframe が残っていれば片付ける（連続印刷で古い iframe が溜まらないように）。
  activeCleanup?.();
  activeCleanup = null;

  let blob: Blob;
  let contentType = options.contentType ?? null;
  if (typeof source === 'string') {
    try {
      const res = await fetch(source, { credentials: 'same-origin' });
      if (!res.ok) return { ok: false, reason: 'fetch' };
      contentType = res.headers.get('content-type') ?? contentType;
      blob = await res.blob();
    } catch {
      return { ok: false, reason: 'fetch' };
    }
  } else {
    blob = source;
    contentType = contentType ?? source.type;
  }

  const kind = detectPrintableKind({ contentType: contentType || blob.type, fileName: options.fileName });
  if (!kind) return { ok: false, reason: 'unsupported' };
  // 「PDF をダウンロードする」設定などで内蔵 PDF ビューアが無いと、iframe はダウンロード扱いになり
  // load も来ない。待たずに新しいタブへ回す。
  if (kind === 'pdf' && typeof navigator !== 'undefined' && navigator.pdfViewerEnabled === false) {
    return { ok: false, reason: 'print-blocked' };
  }

  const typed = new Blob([blob], { type: printableMimeType(kind, contentType || blob.type, options.fileName) });
  const objectUrl = URL.createObjectURL(typed);
  const iframe = createHiddenFrame();

  let cleaned = false;
  let hardTimer: ReturnType<typeof setTimeout> | null = null;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (hardTimer) clearTimeout(hardTimer);
    iframe.remove();
    URL.revokeObjectURL(objectUrl);
    if (activeCleanup === cleanup) activeCleanup = null;
  };
  activeCleanup = cleanup;

  // load を待つリスナーは src/srcdoc を入れる前に張る（キャッシュ済みで即 load しても取りこぼさない）。
  const loaded = waitForLoad(iframe, kind === 'pdf' ? pdfLoadTimeoutMs(options.pageCount) : LOAD_TIMEOUT_MS);
  if (kind === 'pdf') {
    iframe.src = objectUrl;
  } else {
    iframe.srcdoc = buildImagePrintHtml(objectUrl, options.fileName ?? '');
  }
  document.body.appendChild(iframe);

  if (!(await loaded)) {
    cleanup();
    return { ok: false, reason: 'load-timeout' };
  }

  if (kind === 'pdf') {
    await wait(pdfSettleMsFor(options.pageCount));
  } else {
    let doc: Document | null = null;
    try {
      doc = iframe.contentDocument;
    } catch {
      doc = null;
    }
    if (!doc || !(await waitForImage(doc, LOAD_TIMEOUT_MS))) {
      cleanup();
      return { ok: false, reason: 'load-timeout' };
    }
  }

  const frameWindow = iframe.contentWindow;
  if (!frameWindow || frameWindow === window) {
    cleanup();
    return { ok: false, reason: 'print-blocked' };
  }
  try {
    // Safari / Firefox は focus してからでないと親ページが印刷対象になることがある
    frameWindow.focus();
    // 画像（通常の文書）は afterprint で片付ける。PDF プラグインは print() がすぐ返り
    // afterprint も来ないことがあるので、そのときは次回の印刷か最終タイマーで片付ける
    // （ダイアログ表示中に iframe を消すと白紙・中断になるため、早く消さない）。
    frameWindow.addEventListener('afterprint', () => setTimeout(cleanup, 1000), { once: true });
    frameWindow.print();
  } catch {
    cleanup();
    return { ok: false, reason: 'print-blocked' };
  }
  hardTimer = setTimeout(cleanup, HARD_CLEANUP_MS);
  return { ok: true, kind };
}
