// @vitest-environment jsdom
// v0.18.0: スモロジ本体から取り込んだ部品の新しい props（Modal dirty / Toast action / ConfirmDialog closeOnBackdrop ほか）。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { Modal } from '../src/components/Modal';
import { LargeModal } from '../src/components/LargeModal';
import { ConfirmDialog } from '../src/components/ConfirmDialog';
import { ToastProvider, useToast } from '../src/components/Toast';
import { SummaryTile } from '../src/components/SummaryTile';
import { BulkActionPill } from '../src/components/BulkActionPill';
import { SettingsRow } from '../src/components/SettingsRow';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
const mount = (node: ReactNode) => act(() => { root.render(node); });
const overlay = () => document.querySelector<HTMLElement>('[role="presentation"]')!;
const mouseDown = (el: Element) => act(() => { el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); });
const press = (key: string) => act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })); });
const buttonByText = (text: string) =>
  Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === text) as HTMLButtonElement | undefined;

beforeEach(() => {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  // Toast 内の useBottomBarHeightVar が使う（jsdom には無い）
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
});

describe('Modal', () => {
  it('既定: 背景クリックで onClose（dirty なし）', () => {
    const onClose = vi.fn();
    mount(h(Modal, { open: true, onClose, title: 'T' }, '本文'));
    mouseDown(overlay());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closeOnBackdrop=false なら背景クリックでは閉じない', () => {
    const onClose = vi.fn();
    mount(h(Modal, { open: true, onClose, title: 'T', closeOnBackdrop: false }, '本文'));
    mouseDown(overlay());
    expect(onClose).not.toHaveBeenCalled();
  });

  it('dirty: 背景クリックで確認バー → 「続ける」で戻り、「閉じる」で onClose', () => {
    const onClose = vi.fn();
    mount(h(Modal, { open: true, onClose, title: 'T', dirty: true }, '本文'));
    expect(document.body.textContent).not.toContain('入力内容が失われます');
    mouseDown(overlay());
    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('入力内容が失われます。閉じますか');
    act(() => buttonByText('続ける')!.click());
    expect(document.body.textContent).not.toContain('入力内容が失われます');
    expect(onClose).not.toHaveBeenCalled();
    mouseDown(overlay());
    act(() => buttonByText('閉じる')!.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('dirty: Escape でも即閉じず確認バー。× は従来どおり即閉じる', () => {
    const onClose = vi.fn();
    mount(h(Modal, { open: true, onClose, title: 'T', dirty: true }, '本文'));
    press('Escape');
    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('入力内容が失われます');
    act(() => document.querySelector<HTMLButtonElement>('button[aria-label="閉じる"]')!.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('headerAside はタイトルの横に出る。compactHeader で薄いヘッダー', () => {
    mount(h(Modal, { open: true, onClose: () => {}, title: 'T', headerAside: '3枚' }, '本文'));
    expect(document.body.textContent).toContain('3枚');
    expect(document.querySelector('.min-h-11')).toBeNull();
    mount(h(Modal, { open: true, onClose: () => {}, title: 'T', compactHeader: true }, '本文'));
    expect(document.querySelector('.min-h-11')).not.toBeNull();
  });
});

describe('LargeModal', () => {
  it('既定は背景クリックで閉じない（従来どおり）。closeOnBackdrop で開ける。dirty も効く', () => {
    const onClose = vi.fn();
    mount(h(LargeModal, { open: true, onClose, title: 'T' }, '本文'));
    mouseDown(overlay());
    expect(onClose).not.toHaveBeenCalled();
    mount(h(LargeModal, { open: true, onClose, title: 'T', closeOnBackdrop: true, dirty: true }, '本文'));
    mouseDown(overlay());
    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('入力内容が失われます');
  });

  it("size='wide' で幅クラスが変わる", () => {
    mount(h(LargeModal, { open: true, onClose: () => {}, title: 'T', size: 'wide' }, '本文'));
    expect(document.querySelector('[role="dialog"]')!.className).toContain('1280px');
  });
});

describe('ConfirmDialog', () => {
  const base = { open: true, title: '削除しますか', onConfirm: () => {} };
  it('closeOnBackdrop 省略時は従来どおり背景クリックで閉じる', () => {
    const onClose = vi.fn();
    mount(h(ConfirmDialog, { ...base, onClose }));
    mouseDown(overlay());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it('closeOnBackdrop=false なら背景クリックでは閉じない（Escape・キャンセルは残る）', () => {
    const onClose = vi.fn();
    mount(h(ConfirmDialog, { ...base, onClose, closeOnBackdrop: false }));
    mouseDown(overlay());
    expect(onClose).not.toHaveBeenCalled();
    act(() => buttonByText('キャンセル')!.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Toast', () => {
  function Probe({ onReady }: { onReady: (t: ReturnType<typeof useToast>) => void }) {
    onReady(useToast());
    return null;
  }
  const setup = (props: Record<string, unknown> = {}) => {
    let api!: ReturnType<typeof useToast>;
    mount(h(ToastProvider, props, h(Probe, { onReady: (t) => { api = t; } })));
    return api;
  };

  it('action ボタン: 押すと onClick が呼ばれてトーストが消える', () => {
    const api = setup();
    const onClick = vi.fn();
    act(() => api.showSuccess('出力しました', { action: { label: 'ダウンロード', onClick } }));
    expect(document.body.textContent).toContain('出力しました');
    act(() => buttonByText('ダウンロード')!.click());
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(document.body.textContent).not.toContain('出力しました');
  });

  it('passThrough: 指定したトーストだけクリックが下へ通る（action 付きでは無視）', () => {
    const api = setup();
    act(() => api.showSuccess('通す', { passThrough: true }));
    act(() => api.showSuccess('通さない'));
    act(() => api.showSuccess('ボタン付き', { passThrough: true, action: { label: '開く', onClick: () => {} } }));
    const card = (text: string) => Array.from(document.querySelectorAll<HTMLElement>('[data-toast-type]')).find((e) => e.textContent?.includes(text))!;
    expect(card('通す').className).toContain('pointer-events-none');
    expect(card('通さない').className).toContain('pointer-events-auto');
    expect(card('ボタン付き').className).toContain('pointer-events-auto');
  });

  it('既定の表示時間は 3 秒（従来どおり）。数値の第2引数・{durationMs} は個別に上書きできる', () => {
    vi.useFakeTimers();
    const api = setup();
    act(() => api.showInfo('A'));
    act(() => api.showWarning('B', 8000));
    act(() => api.showError('C', { durationMs: 500 }));
    act(() => { vi.advanceTimersByTime(600); });
    expect(document.body.textContent).toContain('A');
    expect(document.body.textContent).not.toContain('C');
    act(() => { vi.advanceTimersByTime(2500); });
    expect(document.body.textContent).not.toContain('A');
    expect(document.body.textContent).toContain('B');
    act(() => { vi.advanceTimersByTime(5000); });
    expect(document.body.textContent).not.toContain('B');
  });

  it('アクション付きの既定は長め（10 秒）。Provider の defaultDurationMs で既定を変えられる', () => {
    vi.useFakeTimers();
    const api = setup({ defaultDurationMs: 6000 });
    act(() => api.showInfo('X'));
    act(() => api.showInfo('Y', { action: { label: '開く', onClick: () => {} } }));
    act(() => { vi.advanceTimersByTime(5900); });
    expect(document.body.textContent).toContain('X');
    act(() => { vi.advanceTimersByTime(200); });
    expect(document.body.textContent).not.toContain('X');
    expect(document.body.textContent).toContain('Y');
    act(() => { vi.advanceTimersByTime(4000); });
    expect(document.body.textContent).not.toContain('Y');
  });

  it('ホバー中は消えず、外れると残り時間で消える', () => {
    vi.useFakeTimers();
    const api = setup();
    act(() => api.showInfo('H'));
    const el = document.querySelector<HTMLElement>('[data-toast-type="info"]')!;
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); });
    act(() => { vi.advanceTimersByTime(10000); });
    expect(document.body.textContent).toContain('H');
    act(() => { el.dispatchEvent(new MouseEvent('mouseout', { bubbles: true })); });
    act(() => { vi.advanceTimersByTime(2100); });
    expect(document.body.textContent).not.toContain('H');
  });
});

describe('SSR で確認できる props', () => {
  it("SummaryTile variant='flat' は枠・角丸なし。既定は従来の枠付き", () => {
    const flat = renderToStaticMarkup(h(SummaryTile, { label: 'L', value: 1, variant: 'flat' }));
    const card = renderToStaticMarkup(h(SummaryTile, { label: 'L', value: 1 }));
    expect(flat).not.toContain('rounded-xl');
    expect(card).toContain('rounded-xl');
    expect(card).toContain('border-[rgb(var(--line))]');
  });

  it('BulkActionPill: statusText は「N件選択」の代わり。selectedCount は省略可。data-bottom-bar が付く', () => {
    const html = renderToStaticMarkup(h(BulkActionPill, { ariaLabel: '一括操作', statusText: '2026年9月 ・ 締められます' }));
    expect(html).toContain('2026年9月 ・ 締められます');
    expect(html).not.toContain('件選択');
    expect(html).toContain('data-bottom-bar');
    const sel = renderToStaticMarkup(h(BulkActionPill, { ariaLabel: '一括操作', selectedCount: 3 }));
    expect(sel).toContain('3件選択');
  });

  it("SettingsRow layout='wide' は xl 以上で 2 カラム。既定は sm 以上", () => {
    expect(renderToStaticMarkup(h(SettingsRow, { label: 'a' }, 'x'))).toContain('sm:grid-cols-[200px_minmax(0,1fr)]');
    expect(renderToStaticMarkup(h(SettingsRow, { label: 'a', layout: 'wide' }, 'x'))).toContain('xl:grid-cols-[200px_minmax(0,720px)]');
  });
});
