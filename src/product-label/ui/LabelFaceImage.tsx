'use client';
// 商品ラベル 1 枚の見本。印刷と同じ PDF を描いた画像を貼る（字形・幅が印刷と同じ）。
// 画像ができるまで・取れなかったときは、簡易表示の SVG（ProductLabelFace）を薄く出す。
import { useEffect, useMemo, useState } from 'react';
import { SkeletonBlock } from './parts';
import { ProductLabelFace, type FaceOptions } from './ProductLabelFace';
import { faceKey, faceSlots, type CellLabel, type FaceKind, type PreviewTarget } from '../dialog-model';
import { renderPdfPages, type FaceSettings, type FaceSource } from './face-render';

const DEBOUNCE_MS = 300;
const RENDER_WIDTH = 560; // 大きく見せるラベル表示にも足りる幅（PDF は変えない）

// 同じ対象・同じ設定は取り直さない（ダイアログを開いたとき、カードで描いた分を使う）
const imageCache = new Map<string, Map<string, string>>();

export type FaceStatus = 'idle' | 'loading' | 'done' | 'failed';
export interface LabelFaces {
  map: Map<string, string>;
  status: FaceStatus;
}
const NONE: LabelFaces = { map: new Map(), status: 'idle' };

/** 見本画像の一覧（faceKey → data URL）。対象や用紙・画像・SKU・期限シールの設定が変わったら 300ms 待って取り直す（前の取得は中断）。 */
export function useLabelFaces(targets: PreviewTarget[] | null, settings: FaceSettings, source: FaceSource): LabelFaces {
  const { sheet, image, extra, expirySticker } = settings;
  const anyGenerate = Boolean(targets?.some((t) => t.mode === 'generate' && t.items.length > 0));
  const requestKey = useMemo(
    () => (targets && anyGenerate
      ? JSON.stringify({ t: targets.map((t) => [t.shipmentId, t.attachmentUrl, t.mode, t.items.length, t.items.map((i) => [i.fnSku, i.productName, i.sellerSku, i.conditionLabel, i.expiration, i.hasImage, i.unitsPerSet ?? null, i.expiryManaged ?? null])]), sheet, image, extra, expirySticker })
      : null),
    [targets, anyGenerate, sheet, image, extra, expirySticker],
  );
  const [result, setResult] = useState<{ key: string; faces: Map<string, string>; status: FaceStatus } | null>(null);

  useEffect(() => {
    if (!requestKey || !targets) return;
    const cached = imageCache.get(requestKey);
    if (cached) {
      setResult({ key: requestKey, faces: cached, status: 'done' });
      return;
    }
    const ctrl = new AbortController();
    const slots = faceSlots(targets, { expirySticker });
    const timer = setTimeout(async () => {
      try {
        const pdf = await source.fetchFacesPdf({ targets, settings: { sheet, image, extra, expirySticker }, signal: ctrl.signal });
        const faces = new Map<string, string>();
        const pages = await renderPdfPages(pdf, RENDER_WIDTH, ctrl.signal, (page, url) => {
          const slot = slots.find((s) => s.page === page);
          if (!slot) return;
          faces.set(faceKey(slot.ref, slot.kind), url);
          setResult({ key: requestKey, faces: new Map(faces), status: 'loading' });
        }, () => source.loadPdfjs());
        if (ctrl.signal.aborted) return;
        // ページ数が合わないなら対応づけが信用できないので使わない（簡易表示に倒す）
        if (pages !== slots.length) {
          setResult({ key: requestKey, faces: new Map(), status: 'failed' });
          return;
        }
        setResult({ key: requestKey, faces: new Map(faces), status: 'done' });
        if (imageCache.size >= 8) imageCache.delete(imageCache.keys().next().value as string);
        imageCache.set(requestKey, faces);
      } catch {
        // 中断は何もしない。失敗は簡易表示に倒す
        if (!ctrl.signal.aborted) setResult({ key: requestKey, faces: new Map(), status: 'failed' });
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
    // targets は requestKey に含めた中身で見る
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  if (!requestKey) return NONE;
  return result && result.key === requestKey ? { map: result.faces, status: result.status } : LOADING;
}

const LOADING: LabelFaces = { map: new Map(), status: 'loading' };

/**
 * 見本 1 枚。画像があれば画像。画像ができるまでは placeholder（skeleton＝枠の骨組み / svg＝簡易表示を薄く）。
 * 取れなかったとき・画像の対象でないときは簡易表示。
 */
export function LabelFace({ label, faces, options, placeholder = 'svg' }: { label: CellLabel; faces: LabelFaces; options: FaceOptions; placeholder?: 'svg' | 'skeleton' }) {
  const kind: FaceKind = label.kind === 'expiry' ? 'expiry' : 'label';
  const url = label.faceRef ? faces.map.get(faceKey(label.faceRef, kind)) : undefined;
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" draggable={false} className="block h-full w-full object-contain" />;
  }
  if (placeholder === 'skeleton' && faces.status === 'loading') return <SkeletonBlock className="h-full w-full" />;
  return <div className={`h-full w-full ${faces.status === 'loading' ? 'opacity-40' : ''}`}><ProductLabelFace label={label} options={options} /></div>;
}
