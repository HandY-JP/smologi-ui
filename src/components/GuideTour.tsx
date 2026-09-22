'use client';
// 初回レクチャーガイドの共通コンポーネント。
// 「案内を読むだけ」のバナーではなく、①ポップアップで開始を促す → ②画面上の実際の場所を
// スポットライトで示しながらステップを順にクリックして進む → ③「ガイドを終了」で完了、という
// 対話型ツアー。終了・スキップすると localStorage に記録し、二回目以降は表示しない
// （何度も出ると迷惑なため。再表示したいときは storageKey を変える）。
import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface GuideTourStep {
  /** ハイライト対象の CSS セレクタ（例: '[data-tour="save"]'）。省略時は中央にカードのみ表示 */
  target?: string;
  title: string;
  body: ReactNode;
}

// ───────── ガイドのレジストリ（ヘルプドロワーの「ガイドを開始」導線用） ─────────
// 画面に描画中の GuideTour が自分を登録し、ヘルプ側は「いまこの画面で開始できるガイド」を
// 一覧できる。開始はイベントで通知する（初回表示済みでも何度でも再生できる）。
export interface GuideMeta { id: string; label: string }
const START_GUIDE_EVENT = 'smologi:start-guide';
const guideRegistry = new Map<string, GuideMeta>();
const registryListeners = new Set<() => void>();
function notifyRegistry() { registryListeners.forEach((l) => l()); }

/** いまの画面で開始できるガイドの一覧（ヘルプドロワーが使う）。 */
export function useAvailableGuides(): GuideMeta[] {
  const [list, setList] = useState<GuideMeta[]>([]);
  useEffect(() => {
    const cb = () => setList(Array.from(guideRegistry.values()));
    registryListeners.add(cb);
    cb();
    return () => { registryListeners.delete(cb); };
  }, []);
  return list;
}

/** 指定 id のガイドを（表示済みでも）最初のステップから開始する。 */
export function startGuide(id: string) {
  window.dispatchEvent(new CustomEvent(START_GUIDE_EVENT, { detail: { id } }));
}

const CARD_W = 340; // ステップカードの幅(px)。位置計算で使う

// ガイドが終了（完了・スキップ）したときに飛ばすイベント。
// 同じ画面に複数のガイドがある場合に「前のガイドが終わってから次を出す」判定へ使う
// （localStorage は書き込んでも他のコンポーネントへ通知されないため）。
const GUIDE_FINISHED_EVENT = 'smologi:guide-finished';

/** 指定 storageKey のガイドが「表示済み」かどうかを追跡する（終了イベントで再評価）。 */
export function useGuideSeen(storageKey: string | null): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!storageKey) { setSeen(false); return; }
    const check = () => {
      try { setSeen(!!window.localStorage.getItem(storageKey)); } catch { setSeen(false); }
    };
    check();
    window.addEventListener(GUIDE_FINISHED_EVENT, check);
    return () => window.removeEventListener(GUIDE_FINISHED_EVENT, check);
  }, [storageKey]);
  return seen;
}

export function GuideTour({ storageKey, introTitle, introBody, steps, active = true, id, label, showIntroOnMount = true, startLabel = 'ガイドを開始', onStepChange }: {
  /** 表示済み記録のキー。ユーザー/顧客ごとに分けること */
  storageKey: string;
  introTitle: string;
  introBody: ReactNode;
  steps: GuideTourStep[];
  /** false の間はガイドを出さない（対象UIがまだ描画されていない画面状態など） */
  active?: boolean;
  /** ヘルプドロワーから再生できるようにする識別子（省略時はヘルプに出ない） */
  id?: string;
  /** ヘルプドロワーに表示する名前（省略時は introTitle） */
  label?: string;
  /** true のときは初回表示を自動で出す。false なら startGuide(id) など明示開始のみ。 */
  showIntroOnMount?: boolean;
  /** イントロの開始ボタンのラベル（省略時は「ガイドを開始」）。 */
  startLabel?: string;
  /**
   * 表示中のステップ番号が変わるたびに呼ばれる（ガイドを閉じている間は null）。
   * 「このステップの間だけ画面を一時的にその状態にする」（例: 先頭行を選択して
   * 一括操作ピルを出す）ような演出を呼び出し側で行うためのフック。
   */
  onStepChange?: (index: number | null) => void;
}) {
  const [phase, setPhase] = useState<'hidden' | 'intro' | 'steps'>('hidden');
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  // ステップカードの実高さ。位置計算（下→上→クランプ）に使う。内容が変わるステップ毎に測り直す。
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardH, setCardH] = useState(0);
  useLayoutEffect(() => {
    if (phase !== 'steps') return;
    setCardH(cardRef.current?.offsetHeight ?? 0);
  }, [phase, idx, rect]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!active || !showIntroOnMount || typeof window === 'undefined') return;
    try {
      if (!window.localStorage.getItem(storageKey)) setPhase('intro');
    } catch { /* localStorage 不可の環境では出さない */ }
  }, [active, showIntroOnMount, storageKey]);

  const finish = useCallback(() => {
    setPhase('hidden');
    try { window.localStorage.setItem(storageKey, new Date().toISOString()); } catch { /* ignore */ }
    // 同じ画面の他のガイド（「前のガイドが終わってから出す」待ち）へ通知する。
    try { window.dispatchEvent(new CustomEvent(GUIDE_FINISHED_EVENT, { detail: { storageKey } })); } catch { /* ignore */ }
  }, [storageKey]);

  // ステップ番号の変化を呼び出し側へ通知する（ガイドを閉じている間は null）。
  // onStepChange は呼び出し側で毎レンダー新しい関数になりがちなので依存には含めない。
  const onStepChangeRef = useRef(onStepChange);
  useEffect(() => { onStepChangeRef.current = onStepChange; }, [onStepChange]);
  const stepIndex = phase === 'steps' ? idx : null;
  useEffect(() => {
    onStepChangeRef.current?.(stepIndex);
    return () => { if (stepIndex !== null) onStepChangeRef.current?.(null); };
  }, [stepIndex]);

  // ヘルプドロワーへの登録と、「ガイドを開始」イベントでの再生（表示済みでも何度でも）。
  useEffect(() => {
    if (!id || !active) return;
    guideRegistry.set(id, { id, label: label ?? introTitle });
    notifyRegistry();
    const onStart = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id?: string } | undefined;
      if (detail?.id !== id) return;
      setIdx(0);
      setPhase('steps');
    };
    window.addEventListener(START_GUIDE_EVENT, onStart);
    return () => {
      guideRegistry.delete(id);
      notifyRegistry();
      window.removeEventListener(START_GUIDE_EVENT, onStart);
    };
  }, [id, label, introTitle, active]);

  // 現在ステップの対象要素の位置を追跡する（スクロール・リサイズ・レイアウト変化に追従）。
  useLayoutEffect(() => {
    if (phase !== 'steps') return;
    const step = steps[idx];
    const el = step?.target ? document.querySelector(step.target) : null;
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const update = () => setRect(el ? el.getBoundingClientRect() : null);
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    // scrollIntoView のアニメーションや遅延レイアウトに追従するための保険
    const iv = window.setInterval(update, 250);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      window.clearInterval(iv);
    };
  }, [phase, idx, steps]);

  // Esc でいつでも終了（終了扱い=以後表示しない）。
  useEffect(() => {
    if (phase === 'hidden') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') finish(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, finish]);

  if (!mounted || phase === 'hidden' || !active) return null;

  // ステップカードの位置: 実際のカード高さ（ref で計測）を使い、下→上の順で収まる側に置く。
  // どちらにも収まらない大きな対象（一覧全体など）では、画面内に収まるようクランプして
  // 対象に重ねて表示する（カードが画面外に切れるのを防ぐのが最優先）。
  const cardPos = (() => {
    if (!rect) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 10;
    const h = cardH || 220; // 初回描画前は概算値。描画後に計測値で再配置される
    const left = Math.min(Math.max(rect.left, 12), Math.max(12, vw - CARD_W - 12));
    let top: number;
    if (rect.bottom + margin + h <= vh - 12) top = rect.bottom + margin;       // 下に収まる
    else if (rect.top - margin - h >= 12) top = rect.top - margin - h;          // 上に収まる
    else top = Math.max(12, vh - h - 12);                                       // 収まらない→画面下端に寄せる
    return { left, top };
  })();

  const step = steps[idx];
  const isLast = idx === steps.length - 1;

  const stepCard = phase === 'steps' && step && (
    <div
      ref={cardRef}
      className="fixed z-[1102] w-[340px] max-w-[calc(100vw-24px)] rounded-lg bg-white p-4 shadow-xl ring-1 ring-black/10 row-fade-in"
      style={cardPos ?? { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      role="dialog"
      aria-label={step.title}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-semibold tracking-wide text-blue-600">ステップ {idx + 1} / {steps.length}</div>
        <button type="button" onClick={finish} className="text-gray-300 hover:text-gray-500 leading-none" aria-label="ガイドを終了" title="ガイドを終了（以後表示しません）">×</button>
      </div>
      <h3 className="mt-0.5 text-sm font-semibold text-gray-900">{step.title}</h3>
      <div className="mt-1.5 text-[13px] leading-relaxed text-gray-600">{step.body}</div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {steps.map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === idx ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {idx > 0 && (
            <button type="button" onClick={() => setIdx(idx - 1)} className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50">戻る</button>
          )}
          {isLast ? (
            <button type="button" onClick={finish} className="rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">ガイドを終了</button>
          ) : (
            <button type="button" onClick={() => setIdx(idx + 1)} className="rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">次へ</button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(
    <>
      {phase === 'intro' && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={introTitle}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl row-fade-in">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">GUIDE</span>
              <h2 className="text-base font-semibold text-gray-900">{introTitle}</h2>
            </div>
            <div className="mt-2 text-sm leading-relaxed text-gray-600">{introBody}</div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={finish}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                title="以後この案内は表示されません"
              >
                今は見ない
              </button>
              <button
                type="button"
                onClick={() => { setIdx(0); setPhase('steps'); }}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {startLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'steps' && (
        <>
          {/* スポットライト: 対象の周囲だけ明るく残し、他は暗幕。対象が無いステップは全面暗幕 */}
          {rect ? (
            <div
              className="fixed z-[1101] rounded-md transition-all duration-200"
              style={{
                left: rect.left - 6,
                top: rect.top - 6,
                width: rect.width + 12,
                height: rect.height + 12,
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.5)',
                pointerEvents: 'none',
              }}
              aria-hidden
            />
          ) : (
            <div className="fixed inset-0 z-[1101] bg-slate-900/50" aria-hidden />
          )}
          {/* 誤クリック防止の透明レイヤー（ガイド中の操作はカードのボタンで進める） */}
          <div className="fixed inset-0 z-[1101]" onClick={() => (isLast ? finish() : setIdx(idx + 1))} aria-hidden />
          {stepCard}
        </>
      )}
    </>,
    document.body,
  );
}
