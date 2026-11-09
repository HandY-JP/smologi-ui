'use client';
// 商品ラベル（FBA）の印刷ダイアログ。Smologi（倉庫の管理画面）と Seller（納品プランのラベル工程）で共通。
// 大きさは固定（状態・商品数・枚数で変えない）。
//
// ふだんは「ラベル用紙」と「印刷を始める位置」だけを見る。並び順・印字項目・微調整は ⚙ の中。
// 右のシート図のマスを押すと、そこから印刷を始める。斜線のマスは使用済みとして空ける。
// 中身の取得・PDF 作成・既定の保存・印刷の実行はアプリごとに違うので adapter で受ける（ProductLabelDialogAdapter）。
// 計算部分は ../dialog-model.ts。
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { HandyPortalLoader } from '../../components/HandyPortalLoader';
import { LabelFace, useLabelFaces, type LabelFaces } from './LabelFaceImage';
import { InlineActionSpinner } from './parts';
import { ProductLabelDefaultModal, type LabelModalProps } from './default-modal';
import type { FaceSettings, FaceSource } from './face-render';
import type { FaceOptions } from './ProductLabelFace';
import { useDismiss as defaultUseDismiss } from '../../components/Modal';
import {
  cellLabels,
  type CellLabel,
  diagramPage,
  hasExtraOmitted,
  totalCount,
  type PreviewTarget,
} from '../dialog-model';
import {
  DEFAULT_PRODUCT_LABEL_SETTINGS,
  MAX_OFFSET_MM,
  trimExtras,
  withSheet,
  type ProductLabelPrintSettings,
} from '../settings';
import { sheetCapabilities, type SheetCapabilities } from '../label-layout';
import { labelExtraName, LABEL_EXTRA_OPTIONS, type LabelExtraKey } from '../text';
import {
  clampStart,
  getSheet,
  groupedSheets,
  summarizeLabels,
  type SheetDef,
} from '../sheets';

/** 開いた時点で分かっている設定と対象の中身。 */
export interface LabelContext {
  settings: ProductLabelPrintSettings;
  preview: PreviewTarget[];
}

/** 隠し iframe からの印刷を試した結果。失敗したときは、新しいタブで開いたかどうかで案内文を変える。 */
export type LabelPrintOutcome = { ok: true } | { ok: false; message: (openedInNewTab: boolean) => string };

/** アプリが用意するもの。同じ対象には同じ adapter（identity）を渡す（変わると取り直す）。 */
export interface ProductLabelDialogAdapter {
  /** 取得済みの設定と中身があれば同期で返す（あれば取り直さずにすぐ開く）。 */
  peekContext?: () => LabelContext | null;
  /** 既定の設定と、対象の中身を取る。失敗は例外（メッセージは利用者向けの日本語）。 */
  loadContext: () => Promise<LabelContext>;
  /** PDF を作る（start は 1 始まり。ロール紙は 1）。失敗は例外（メッセージは利用者向けの日本語）。 */
  createPdf: (input: { settings: ProductLabelPrintSettings; start: number }) => Promise<Blob>;
  /** 今の設定を既定として保存する。失敗は例外（メッセージは利用者向けの日本語）。 */
  saveDefault: (settings: ProductLabelPrintSettings) => Promise<void>;
  /** 見本（印刷と同じ PDF を画像にしたもの）の取り方。 */
  faces: FaceSource;
  /** PDF の印刷。 */
  printer: {
    /** 隠し iframe で印刷せず、最初から新しいタブで開くべきブラウザか。 */
    prefersPdfTab: () => boolean;
    print: (blob: Blob, opts: { pageCount?: number }) => Promise<LabelPrintOutcome>;
  };
}

/** 画面の文言のうち、アプリごとに言い方が変わるもの。 */
export interface ProductLabelDialogCopy {
  /** 開いたあとに作り直せない対象が見つかったときの案内（印刷は止める）。 */
  ungeneratable?: string;
}

const DEFAULT_COPY: Required<ProductLabelDialogCopy> = {
  ungeneratable: 'この内容では商品ラベルを作り直せません。今は画面を閉じ、Amazon のラベルをそのまま印刷してください。',
};

/** モーダルの差し替え（アプリが自前の Modal を使っているとき）。既定は共通パッケージの Modal。 */
export interface ProductLabelDialogModal {
  Modal: ComponentType<LabelModalProps>;
  useDismiss: typeof defaultUseDismiss;
}

const DEFAULT_MODAL: ProductLabelDialogModal = { Modal: ProductLabelDefaultModal, useDismiss: defaultUseDismiss };

/** これを超える枚数は PDF 作成に時間がかかる旨を出す。 */
const HEAVY_LABEL_COUNT = 1000;

const field = 'rounded-lg border border-line-strong bg-surface px-2.5 py-2 text-[14px] leading-[22px] text-ink focus:outline focus:outline-2 focus:outline-[var(--sb-accent-bg)]';
const ghostBtn = 'inline-flex h-9 items-center justify-center rounded-lg border border-line-strong bg-surface px-3 text-[14px] leading-[22px] font-semibold text-ink transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-40';

export function ProductLabelPrintDialog({
  adapter,
  initialSheet,
  onClose,
  modal = DEFAULT_MODAL,
  copy,
}: {
  adapter: ProductLabelDialogAdapter;
  /** この印刷だけに選んだ用紙。あれば保存済みの既定の代わりに最初に選ぶ（既定は保存しない）。 */
  initialSheet?: string;
  onClose: () => void;
  modal?: ProductLabelDialogModal;
  copy?: ProductLabelDialogCopy;
}) {
  const { Modal, useDismiss } = modal;
  const text = { ...DEFAULT_COPY, ...copy };
  const applyInitial = useCallback(
    (base: ProductLabelPrintSettings) => (initialSheet ? withSheet(base, initialSheet) : base),
    [initialSheet],
  );
  // 商品ラベル欄が先に取ってある設定と中身があればそれで即座に開く。無ければ取りに行く。
  const [settings, setSettings] = useState<ProductLabelPrintSettings>(() => applyInitial(adapter.peekContext?.()?.settings ?? DEFAULT_PRODUCT_LABEL_SETTINGS));
  const [preview, setPreview] = useState<PreviewTarget[] | null>(() => adapter.peekContext?.()?.preview ?? null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [start, setStart] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [popOpen, setPopOpen] = useState(false);
  const [view, setView] = useState<'sheet' | 'label'>('sheet');
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState<string | null>(null);

  // 既定の設定と、対象の中身（商品・枚数・自前生成できるか）を取る（取得済みなら即座に返る）。
  useEffect(() => {
    let cancelled = false;
    adapter.loadContext()
      .then((ctx) => {
        if (cancelled) return;
        setSettings(applyInitial(ctx.settings));
        setPreview(ctx.preview);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error && e.message ? e.message : '印刷する内容を読み込めませんでした。');
      });
    return () => { cancelled = true; };
    // adapter は対象ごとに同じものを渡す（applyInitial は初回の用紙だけの話なので取り直しの条件にしない）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter]);

  const sheet: SheetDef = getSheet(settings.sheet) ?? getSheet(DEFAULT_PRODUCT_LABEL_SETTINGS.sheet)!;
  const caps = useMemo(() => sheetCapabilities(sheet), [sheet]);
  const isRoll = sheet.kind === 'roll';
  const anyGenerate = (preview ?? []).some((t) => t.mode === 'generate');
  // 開けるのは全部生成できる出荷だけ（カードが判定する）。画面を開いたまま内容が変わった等で生成できない対象があれば、印刷させない。
  const hasUngeneratable = preview !== null && preview.some((t) => t.mode !== 'generate');

  const countOpts = useMemo(
    () => ({ expirySticker: settings.expirySticker && anyGenerate }),
    [settings.expirySticker, anyGenerate],
  );
  const total = useMemo(() => (preview ? totalCount(preview, countOpts) : null), [preview, countOpts]);
  const effectiveStart = clampStart(sheet, start);
  const summary = total !== null ? summarizeLabels(sheet, effectiveStart, total) : null;
  const faces = useLabelFaces(preview, settings, adapter.faces);

  const patch = useCallback((next: Partial<ProductLabelPrintSettings>) => {
    setSettings((s) => ({ ...s, ...next }));
    setSaveState('idle');
  }, []);

  // 用紙を変えたとき、その用紙で選べない追加項目・画像を外す（後から選んだものから）。外したことは 1 度だけ知らせる。
  const changeSheet = (id: string) => {
    const next = getSheet(id);
    if (!next) return;
    const caps = sheetCapabilities(next);
    const { kept, removed } = trimExtras(settings.extra, caps.maxExtras);
    const dropImage = settings.image && !caps.image;
    patch({ sheet: id, extra: kept, image: settings.image && caps.image });
    setStart(1);
    const dropped = [...removed.map(labelExtraName), ...(dropImage ? ['商品画像'] : [])];
    if (dropped.length === 0) setLimitNotice(null);
    else if (caps.maxExtras === 0) setLimitNotice(`この用紙では追加項目や画像を選べないため、${dropped.join('・')}を外しました`);
    else setLimitNotice(`この用紙では${caps.maxExtras}つまでのため、${dropped.join('・')}を外しました`);
  };

  const hasExpiryItems = (preview ?? []).some((t) => t.mode === 'generate' && t.items.some((i) => i.expiration));

  /**
   * mode 'print': 隠し iframe で印刷（Safari・PDF ビューア無効のブラウザは最初から新しいタブで開く）。
   * mode 'tab': 新しいタブで PDF を開くだけ。
   * 新しいタブはクリックの中で空タブを先に開き、PDF ができたら URL を入れる（ポップアップブロック回避）。
   */
  const doPrint = async (mode: 'print' | 'tab' = 'print') => {
    if (busy || !preview) return;
    const toTab = mode === 'tab' || adapter.printer.prefersPdfTab();
    const tabWindow = toTab ? window.open('', '_blank') : null;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const blob = await adapter.createPdf({ settings, start: isRoll ? 1 : effectiveStart });
      if (toTab) {
        const url = URL.createObjectURL(blob);
        if (tabWindow && !tabWindow.closed) {
          tabWindow.location.href = url;
          setTimeout(() => URL.revokeObjectURL(url), 10 * 60_000);
          setNotice('PDF を新しいタブで開きました。開いたタブから印刷してください。');
        } else {
          URL.revokeObjectURL(url);
          setNotice('新しいタブを開けませんでした。ブラウザのポップアップを許可してもう一度お試しください。');
        }
        return;
      }
      const printed = await adapter.printer.print(blob, { pageCount: summary?.pages });
      if (!printed.ok) {
        const url = URL.createObjectURL(blob);
        const opened = window.open(url, '_blank');
        if (opened) setTimeout(() => URL.revokeObjectURL(url), 60_000);
        else URL.revokeObjectURL(url);
        setNotice(printed.message(Boolean(opened)));
      }
    } catch (e) {
      tabWindow?.close();
      setError(e instanceof Error ? e.message : 'ラベルの PDF を作れませんでした。');
    } finally {
      setBusy(false);
    }
  };

  const saveDefault = async () => {
    setSaveState('saving');
    setError(null);
    try {
      await adapter.saveDefault(settings);
      setSaveState('saved');
    } catch (e) {
      setSaveState('idle');
      setError(e instanceof Error ? e.message : '既定を保存できませんでした。');
    }
  };

  const ratio = sheet.pageW / sheet.pageH;
  const pages = summary?.pages ?? 1;
  const pageIdx = Math.min(page, Math.max(pages - 1, 0));
  const viewMode: 'sheet' | 'label' = isRoll ? 'label' : view;
  const canPrint = !(busy || hasUngeneratable || (summary !== null && summary.labels === 0));
  const faceOpts = useMemo(
    () => ({ sheetId: sheet.id, labelW: sheet.labelW, labelH: sheet.labelH, image: settings.image, extra: settings.extra }),
    [sheet.id, sheet.labelW, sheet.labelH, settings.image, settings.extra],
  );
  const selectedLabel = useMemo((): CellLabel | null => {
    if (!preview) return null;
    const first = preview.flatMap((t, ti) => (t.mode === 'generate' ? t.items.map((_, ii) => `${ti}:${ii}`) : []))[0];
    const key = sel ?? first;
    if (!key) return null;
    const [ti, ii] = key.split(':').map(Number);
    const t = preview[ti];
    const item = t?.items[ii];
    if (!t || !item) return null;
    const one = cellLabels([{ ...t, items: [{ ...item, quantity: 1 }] }], { expirySticker: false }, 1)[0];
    return one ? { ...one, faceRef: { targetIndex: ti, itemIndex: ii } } : null;
  }, [preview, sel]);
  const selectedKey = sel ?? (preview ?? []).flatMap((t, ti) => (t.mode === 'generate' ? t.items.map((_, ii) => `${ti}:${ii}`) : []))[0] ?? null;

  const summaryText = summary
    ? (isRoll
      ? `ラベル ${summary.labels.toLocaleString()} 枚（ロール紙）`
      : `ラベル ${summary.labels.toLocaleString()} 枚 ・ 用紙 ${summary.pages.toLocaleString()} 枚 ・ 余り ${summary.leftover} 面`)
    : null;

  const segBtn = (active: boolean) => `h-8 rounded-full px-3.5 text-[14px] leading-[22px] font-semibold transition-colors ${active ? 'bg-[var(--sb-accent-bg)] text-on-accent' : 'text-ink-muted hover:text-ink'}`;

  return (
    <Modal
      open
      onClose={onClose}
      title="商品ラベルを印刷"
      headerAside={preview ? summaryText : null}
      headerRight={preview && !isRoll ? (
        <div className="flex items-center gap-0.5 rounded-full border border-line-strong bg-surface p-0.5" role="group" aria-label="表示の切り替え">
          <button type="button" aria-pressed={viewMode === 'sheet'} onClick={() => setView('sheet')} className={segBtn(viewMode === 'sheet')}>用紙全体</button>
          <button type="button" aria-pressed={viewMode === 'label'} onClick={() => setView('label')} className={segBtn(viewMode === 'label')}>ラベル</button>
        </div>
      ) : null}
      showCloseButton={false}
      size="4xl"
      ariaLabel="商品ラベルを印刷"
      panelClassName="!max-w-[1180px] md:h-[min(800px,90dvh)]"
      panelMaxHeightClassName="max-h-[90dvh]"
      bodyClassName="p-0"
    >
      {loadError ? (
        <p className="m-5 rounded-md border border-danger-ink/15 bg-danger-soft px-3 py-2 text-[14px] leading-[22px] text-danger-ink">{loadError}</p>
      ) : !preview ? (
        <div className="py-16"><HandyPortalLoader variant="inline" /></div>
      ) : (
        <div className="grid md:h-full md:min-h-0 md:grid-cols-[380px_1fr]">
          <div className="flex min-w-0 flex-col gap-4 border-b border-line p-5 md:min-h-0 md:border-b-0 md:border-r">
            <div className="flex shrink-0 flex-col gap-1.5">
              <label htmlFor="pl-sheet" className="text-[14px] leading-[22px] text-ink-muted">ラベル用紙</label>
              <div className="flex gap-2">
                <select
                  id="pl-sheet"
                  className={`${field} min-w-0 flex-1`}
                  value={settings.sheet}
                  onChange={(e) => changeSheet(e.target.value)}
                >
                  {groupedSheets().map((g) => (
                    <optgroup key={g.group} label={g.label}>
                      {g.sheets.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <GearPopover open={popOpen} onOpenChange={setPopOpen} useDismiss={useDismiss}>
                  <SettingsBody
                    settings={settings}
                    patch={patch}
                    caps={caps}
                    limitNotice={limitNotice}
                    onClearNotice={() => setLimitNotice(null)}
                    hasExpiryItems={hasExpiryItems}
                    saveState={saveState}
                    onSave={() => { void saveDefault(); }}
                  />
                </GearPopover>
              </div>
              {hasExtraOmitted(preview ?? [], sheet, { image: settings.image, extra: settings.extra }) && (
                <p className="text-[12px] leading-[18px] text-warning-ink">この用紙では追加項目が入りきらない商品があります（その商品は入らない項目を省略して印刷します）。</p>
              )}
              {limitNotice && <p className="text-[12px] leading-[18px] text-warning-ink">{limitNotice}</p>}
            </div>

            {!isRoll && (
              <div className="flex shrink-0 flex-col gap-1.5">
                <label htmlFor="pl-start" className="text-[14px] leading-[22px] text-ink-muted">印刷を始める位置</label>
                <div className="flex items-stretch">
                  <button type="button" aria-label="1つ前" onClick={() => setStart(clampStart(sheet, effectiveStart - 1))} className="h-11 w-11 rounded-l-lg border border-line-strong bg-surface text-[18px] leading-[26px] text-ink hover:bg-surface-subtle">−</button>
                  <input
                    id="pl-start"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={sheet.faces}
                    value={effectiveStart}
                    onChange={(e) => setStart(clampStart(sheet, Number(e.target.value)))}
                    className="h-11 w-20 border-y border-line-strong bg-surface px-2 text-center text-[15px] leading-[22px] tabular-nums text-ink focus:outline focus:outline-2 focus:outline-[var(--sb-accent-bg)]"
                  />
                  <button type="button" aria-label="1つ後" onClick={() => setStart(clampStart(sheet, effectiveStart + 1))} className="h-11 w-11 rounded-r-lg border border-line-strong bg-surface text-[18px] leading-[26px] text-ink hover:bg-surface-subtle">＋</button>
                  <span className="ml-3 self-center text-[14px] leading-[22px] text-ink-muted">/ {sheet.faces}</span>
                </div>
              </div>
            )}

            <div className="flex min-h-0 flex-col gap-1.5">
              <span className="shrink-0 text-[14px] leading-[22px] text-ink-muted">商品（{preview.reduce((n, t) => n + (t.mode === 'generate' ? t.items.length : 1), 0)}品目）</span>
              <div className="max-h-48 min-h-0 overflow-y-auto overscroll-contain rounded-lg border border-line md:max-h-none">
                {preview.map((t, ti) => (
                  <TargetRows
                    key={`${t.shipmentId}\n${t.attachmentUrl}`}
                    target={t}
                    targetIndex={ti}
                    multiple={preview.length > 1}
                    selectedKey={selectedKey}
                    onSelect={(key) => { setSel(key); setView('label'); }}
                  />
                ))}
              </div>
            </div>

            {error && <p className="shrink-0 rounded-md border border-danger-ink/15 bg-danger-soft px-3 py-2 text-[12px] leading-[18px] text-danger-ink">{error}</p>}
            {hasUngeneratable && (
              <p className="shrink-0 rounded-md border border-warning-ink/15 bg-warning-soft px-3 py-2 text-[12px] leading-[18px] text-warning-ink">
                {text.ungeneratable}
              </p>
            )}
            {notice && <p className="shrink-0 rounded-md border border-warning-ink/15 bg-warning-soft px-3 py-2 text-[12px] leading-[18px] text-warning-ink">{notice}</p>}
            {summary === null && <p className="shrink-0 text-[14px] leading-[22px] text-ink-muted">枚数を数えられませんでした。</p>}

            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-full border border-line-strong bg-surface px-5 text-[15px] leading-[22px] font-semibold text-ink transition-colors hover:bg-surface-subtle">
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => { void doPrint(); }}
                disabled={!canPrint}
                className="inline-flex h-11 min-w-0 flex-1 items-center justify-center rounded-full bg-[var(--sb-accent-bg)] px-4 text-[15px] leading-[22px] font-semibold text-on-accent shadow-sm transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? <><InlineActionSpinner className="mr-2" />PDF を作成中…</> : isRoll ? '印刷' : 'この位置で印刷'}
              </button>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              {summary !== null && summary.labels > HEAVY_LABEL_COUNT && (
                <p className="text-[12px] leading-[18px] text-ink-muted">枚数が多いため時間がかかります。</p>
              )}
              <p className="text-[12px] leading-[18px] text-ink-muted">
                {isRoll
                  ? `プリンターの用紙サイズを ${sheet.pageW}×${sheet.pageH}mm に合わせ、倍率は 100% にしてください。`
                  : '印刷画面で倍率は 100%（実際のサイズ）にしてください。'}
                {' '}
                <button
                  type="button"
                  onClick={() => { void doPrint('tab'); }}
                  disabled={!canPrint}
                  className="underline hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  新しいタブで PDF を開く
                </button>
              </p>
            </div>
          </div>

          <div className={`relative flex min-w-0 flex-col p-5 md:min-h-0 ${viewMode === 'sheet' && pages > 1 ? 'pb-14' : ''}`}>
            {viewMode === 'sheet' ? (
              <>
                <div className="h-[460px] min-h-0 [container-type:size] md:h-auto md:flex-1">
                  <div className="mx-auto" style={{ width: `min(100cqw, calc(100cqh * ${ratio}))`, aspectRatio: `${sheet.pageW}/${sheet.pageH}` }}>
                    <SheetPage
                      sheet={sheet}
                      settings={settings}
                      start={effectiveStart}
                      onPick={setStart}
                      preview={preview}
                      countOpts={countOpts}
                      total={total}
                      page={pageIdx}
                      faces={faces}
                      faceOpts={faceOpts}
                    />
                  </div>
                </div>
                {pages > 1 && (
                  <div className="pointer-events-none absolute bottom-6 right-6">
                    <div className="app-sticky-glass pointer-events-auto flex items-center gap-1 rounded-full border px-2 py-1 text-[14px] leading-[22px]">
                      <button type="button" aria-label="前の用紙" disabled={pageIdx === 0} onClick={() => setPage(pageIdx - 1)} className="h-8 w-8 rounded-full text-[18px] leading-[26px] text-ink hover:bg-surface-subtle disabled:opacity-35">‹</button>
                      <b className="min-w-[5.5rem] text-center tabular-nums text-ink">{pageIdx + 1} / {pages} 枚目</b>
                      <button type="button" aria-label="次の用紙" disabled={pageIdx >= pages - 1} onClick={() => setPage(pageIdx + 1)} className="h-8 w-8 rounded-full text-[18px] leading-[26px] text-ink hover:bg-surface-subtle disabled:opacity-35">›</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-[460px] min-h-0 [container-type:size] md:h-auto md:flex-1">
                {selectedLabel ? (
                  <div
                    className="mx-auto flex items-center justify-center overflow-hidden rounded-md border border-line bg-[var(--label-paper)] text-[var(--label-ink)] shadow-sm"
                    style={{ width: `min(100cqw, calc(100cqh * ${sheet.labelW / sheet.labelH}))`, aspectRatio: `${sheet.labelW}/${sheet.labelH}`, marginTop: 'max(0px, calc((100cqh - 100cqw * ' + sheet.labelH / sheet.labelW + ') / 2))' }}
                  >
                    <LabelFace label={selectedLabel} faces={faces} options={faceOpts} placeholder="skeleton" />
                  </div>
                ) : (
                  <p className="text-[14px] leading-[22px] text-ink-muted">見本を表示できる商品がありません。</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function TargetRows({
  target,
  targetIndex,
  multiple,
  selectedKey,
  onSelect,
}: {
  target: PreviewTarget;
  targetIndex: number;
  multiple: boolean;
  selectedKey: string | null;
  onSelect: (key: string) => void;
}) {
  const head = multiple ? (
    <p className="truncate border-b border-line bg-surface-subtle px-3 py-1 text-[12px] leading-[18px] font-medium text-ink-muted">{target.orderNumber || target.fileName}</p>
  ) : null;
  if (target.mode === 'generate' && target.items.length > 0) {
    return (
      <>
        {head}
        {target.items.map((item, i) => {
          const key = `${targetIndex}:${i}`;
          const on = key === selectedKey;
          return (
            <button
              key={`${item.fnSku}-${i}`}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(key)}
              className={`flex w-full items-center justify-between gap-3 border-b border-line px-3 py-2.5 text-left text-[14px] leading-[22px] last:border-b-0 ${on ? 'bg-accent-soft' : 'hover:bg-surface-subtle'}`}
            >
              <span className="min-w-0 truncate text-ink">{item.productName}</span>
              <span className="shrink-0 tabular-nums text-ink-muted">{item.quantity.toLocaleString()}枚</span>
            </button>
          );
        })}
      </>
    );
  }
  return (
    <>
      {head}
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2.5 text-[14px] leading-[22px] last:border-b-0">
        <span className="min-w-0 truncate text-ink">{target.fileName}</span>
        <span className="shrink-0 tabular-nums text-ink-muted">—</span>
      </div>
    </>
  );
}

/** ⚙ ボタンと、画面端・親の枠からはみ出さないポップオーバー（body 直下に出す）。 */
function GearPopover({
  open,
  onOpenChange,
  useDismiss,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  useDismiss: typeof defaultUseDismiss;
  children: ReactNode;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);

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
    let top: number;
    let maxHeight: number;
    if (h <= below) { top = r.bottom + 6; maxHeight = below; }
    else if (h <= above) { top = r.top - 6 - h; maxHeight = above; }
    else if (below >= above) { top = r.bottom + 6; maxHeight = below; }
    else { top = M; maxHeight = above; }
    setPos({ top, left, width, maxHeight: Math.max(120, maxHeight) });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place, children]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="印刷の詳細設定"
        onClick={() => onOpenChange(!open)}
        className={`h-[38px] w-10 shrink-0 rounded-lg border text-[18px] leading-[26px] text-ink ${open ? 'border-[var(--sb-accent-bg)] bg-accent-soft' : 'border-line-strong bg-surface hover:bg-surface-subtle'}`}
      >
        <span aria-hidden>⚙</span>
        <span className="sr-only">印刷の詳細設定</span>
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={popRef}
          role="dialog"
          aria-label="印刷の詳細設定"
          style={pos
            ? { position: 'fixed', top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxHeight }
            : { position: 'fixed', top: 0, left: 0, width: 340, visibility: 'hidden' }}
          className="z-[90] max-w-[calc(100vw-16px)] overflow-y-auto rounded-xl border border-line bg-surface p-3.5 text-ink shadow-2xl"
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  );
}

function SettingsBody({
  settings,
  patch,
  hasExpiryItems,
  caps,
  limitNotice,
  onClearNotice,
  saveState,
  onSave,
}: {
  settings: ProductLabelPrintSettings;
  patch: (next: Partial<ProductLabelPrintSettings>) => void;
  hasExpiryItems: boolean;
  caps: SheetCapabilities;
  limitNotice: string | null;
  onClearNotice: () => void;
  saveState: 'idle' | 'saving' | 'saved';
  onSave: () => void;
}) {
  const offset = (key: 'offsetXmm' | 'offsetYmm', raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    patch({ [key]: Math.min(MAX_OFFSET_MM, Math.max(-MAX_OFFSET_MM, Math.round(n * 2) / 2)) });
  };
  return (
    <div className="flex flex-col gap-3.5 text-[14px] leading-[22px]">
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] leading-[18px] font-medium text-ink-muted">並び順</span>
        <div className="flex overflow-hidden rounded-lg border border-line-strong" role="group" aria-label="並び順">
          {([['row', '横（1→2→3）'], ['column', '縦（1↓2↓3）']] as const).map(([v, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={settings.order === v}
              onClick={() => patch({ order: v })}
              className={`flex-1 px-2 py-2 text-[12px] leading-[18px] ${settings.order === v ? 'bg-[var(--sb-accent-bg)] font-semibold text-on-accent' : 'bg-surface text-ink hover:bg-surface-subtle'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] leading-[18px] font-medium text-ink-muted">印字する項目</span>
        <label className={`flex items-center gap-2 ${!caps.image ? 'opacity-50' : ''}`}>
          <input type="checkbox" disabled={!caps.image} checked={settings.image && caps.image} onChange={(e) => { onClearNotice(); patch({ image: e.target.checked }); }} />
          商品画像
          {!caps.image && <em className="ml-auto text-[11px] leading-[16px] not-italic text-ink-muted">この用紙では選べません</em>}
        </label>
        <span className="mt-1 flex items-baseline gap-2 text-[12px] leading-[18px] font-medium text-ink-muted">
          追加項目
          <em className="text-[11px] leading-[16px] font-normal not-italic">{caps.maxExtras === 0 ? 'この用紙では選べません' : `この用紙では${caps.maxExtras}つまで`}</em>
        </span>
        {LABEL_EXTRA_OPTIONS.map((opt) => {
          const checked = settings.extra.includes(opt.key);
          const full = !checked && settings.extra.length >= caps.maxExtras;
          const disabled = full;
          return (
            <label key={opt.key} className={`flex items-center gap-2 ${disabled ? 'opacity-50' : ''}`}>
              <input
                type="checkbox"
                disabled={disabled}
                checked={checked}
                onChange={(e) => {
                  onClearNotice();
                  const next: LabelExtraKey[] = e.target.checked ? [...settings.extra, opt.key] : settings.extra.filter((k) => k !== opt.key);
                  patch({ extra: next });
                }}
              />
              {opt.label}
            </label>
          );
        })}
        <label className={`flex items-center gap-2 ${!hasExpiryItems ? 'opacity-50' : ''}`}>
          <input type="checkbox" checked={settings.expirySticker} onChange={(e) => patch({ expirySticker: e.target.checked })} />
          期限シールも印刷（期限管理の商品だけ）
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] leading-[18px] font-medium text-ink-muted">印刷位置の微調整（mm）</span>
        <div className="flex gap-3">
          <label className="flex items-center gap-1.5 text-[12px] leading-[18px]">上下
            <input type="number" step={0.5} min={-MAX_OFFSET_MM} max={MAX_OFFSET_MM} value={settings.offsetYmm} onChange={(e) => offset('offsetYmm', e.target.value)} className={`${field} w-20 py-1.5`} />
          </label>
          <label className="flex items-center gap-1.5 text-[12px] leading-[18px]">左右
            <input type="number" step={0.5} min={-MAX_OFFSET_MM} max={MAX_OFFSET_MM} value={settings.offsetXmm} onChange={(e) => offset('offsetXmm', e.target.value)} className={`${field} w-20 py-1.5`} />
          </label>
        </div>
      </div>

      <button type="button" onClick={onSave} disabled={saveState === 'saving'} className={ghostBtn}>
        {saveState === 'saving' ? '保存中…' : saveState === 'saved' ? '保存しました' : 'この設定をデフォルトにする'}
      </button>
    </div>
  );
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
  faceOpts,
}: {
  sheet: SheetDef;
  settings: ProductLabelPrintSettings;
  start: number;
  onPick: (n: number) => void;
  preview: PreviewTarget[];
  countOpts: { expirySticker: boolean };
  total: number | null;
  page: number;
  faces: LabelFaces;
  faceOpts: FaceOptions;
}) {
  const count = total ?? 0;
  const labels = useMemo(
    () => cellLabels(preview, countOpts, (page + 1) * sheet.faces),
    [preview, countOpts, page, sheet.faces],
  );
  const hatch = 'repeating-linear-gradient(135deg, transparent 0 4px, rgb(128 128 128 / .38) 4px 5px)';
  const cells = diagramPage(sheet, settings.order, start, labels, count, page);
  const interactive = page === 0;
  return (
    <div className="relative h-full w-full border border-line bg-surface-subtle shadow-sm">
      {cells.map((c) => {
        const left = ((sheet.marginLeft + c.col * sheet.pitchX) / sheet.pageW) * 100;
        const top = ((sheet.marginTop + c.row * sheet.pitchY) / sheet.pageH) * 100;
        return (
          <button
            key={c.no}
            type="button"
            tabIndex={interactive ? 0 : -1}
            title={interactive ? `${c.no} 番から印刷` : undefined}
            aria-label={interactive ? `${c.no} 番から印刷` : `${c.no} 番`}
            onClick={interactive ? () => onPick(c.no) : undefined}
            className={`absolute flex flex-col items-center justify-center gap-px overflow-hidden border border-dashed border-line p-0 text-[11px] leading-[16px] text-[var(--label-ink)] ${interactive ? 'cursor-pointer' : 'cursor-default'} ${c.state === 'print' ? 'bg-[var(--label-paper)]' : 'bg-transparent'} ${interactive && c.no === start ? 'z-10 outline outline-2 -outline-offset-2 outline-[var(--sb-accent-bg)]' : ''}`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${(sheet.labelW / sheet.pageW) * 100}%`,
              height: `${(sheet.labelH / sheet.pageH) * 100}%`,
              backgroundImage: c.state === 'used' ? hatch : undefined,
            }}
          >
            <span className="absolute left-0.5 top-px z-[1] font-mono text-[11px] leading-none text-[var(--label-position-ink)]">{c.no}</span>
            {c.state === 'print' && (c.label
              ? <LabelFace label={c.label} faces={faces} options={faceOpts} placeholder="skeleton" />
              : <CellMark label={c.label} />)}
          </button>
        );
      })}
    </div>
  );
}

function CellMark({ label }: { label: { kind: string; fnSku?: string; name?: string; expiration?: string | null } | null }) {
  if (label?.kind === 'expiry') {
    return <span className="text-[11px] leading-tight text-[var(--label-ink-muted)]">期限<br />{label.expiration?.slice(0, 4)}年</span>;
  }
  return (
    <>
      <span className="h-[30%] w-[72%]" style={{ background: 'repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 2px, currentColor 2px 4px, transparent 4px 5px)' }} />
      {label?.fnSku && <span className="max-w-[92%] truncate font-mono text-[11px] leading-[16px] text-[var(--label-ink-muted)]">{label.fnSku}</span>}
    </>
  );
}
