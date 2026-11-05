// @vitest-environment jsdom
// usePrompt / ConfirmProvider.panelClassName と、EmptyState・ErrorBanner・Skeleton・TonePill の追加 props。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { ConfirmProvider, useConfirm, usePrompt, type ConfirmFn, type PromptFn } from '../src/components/ConfirmProvider';
import { EmptyState } from '../src/components/EmptyState';
import { ErrorBanner } from '../src/components/ErrorBanner';
import { Skeleton } from '../src/components/Skeleton';
import { TonePill } from '../src/components/TonePill';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
let prompt: PromptFn;
let confirm: ConfirmFn;
const Probe = () => { prompt = usePrompt(); confirm = useConfirm(); return null; };
const mount = (node: ReactNode) => act(() => { root.render(node); });
const buttonByText = (text: string) =>
  Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === text) as HTMLButtonElement | undefined;
const click = (el: Element | undefined) => act(() => { el!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
const press = (key: string) => act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })); });
const field = () => document.querySelector<HTMLInputElement | HTMLTextAreaElement>('[role="alertdialog"] input, [role="alertdialog"] textarea')!;
function type(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  act(() => {
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
const keyDown = (el: Element, init: KeyboardEventInit) => act(() => { el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init })); });
function ask(options: Parameters<PromptFn>[0]) {
  const out: { value?: string | null; done: boolean } = { done: false };
  act(() => { void prompt(options).then((v) => { out.value = v; out.done = true; }); });
  return out;
}

beforeEach(() => {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  mount(h(ConfirmProvider, null, h(Probe)));
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

const base = { title: '差し戻し理由', confirmLabel: '差し戻す' };

describe('usePrompt', () => {
  it('入力した文字列で解決し、入力欄に初期フォーカスが当たる', async () => {
    const out = ask({ ...base, label: '理由', placeholder: '例: 書類不足', description: '申請者に通知されます。' });
    expect(document.querySelector('[role="alertdialog"]')?.textContent).toContain('申請者に通知されます。');
    expect(document.querySelector('label')?.textContent).toBe('理由');
    expect(field().placeholder).toBe('例: 書類不足');
    expect(document.activeElement).toBe(field());
    type(field(), '  書類不足 ');
    click(buttonByText('差し戻す'));
    await act(async () => {});
    expect(out.value).toBe('  書類不足 '); // 加工しない（trim は呼び出し側）
    expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it('defaultValue が初期値で、何も打たずに確定してもそれが返る', async () => {
    const out = ask({ ...base, defaultValue: '山田商店' });
    expect(field().value).toBe('山田商店');
    click(buttonByText('差し戻す'));
    await act(async () => {});
    expect(out.value).toBe('山田商店');
  });

  it('キャンセル・Escape は null、キャンセル文言は既定「あとで」', async () => {
    const a = ask(base);
    expect(buttonByText('あとで')).toBeTruthy();
    click(buttonByText('あとで'));
    await act(async () => {});
    expect(a.value).toBeNull();
    const b = ask({ ...base, cancelLabel: 'やめる' });
    press('Escape');
    await act(async () => {});
    expect(b.value).toBeNull();
  });

  it('required は空白だけの間は実行できず、Enter でも送れない', async () => {
    const out = ask({ ...base, required: true });
    expect(buttonByText('差し戻す')!.disabled).toBe(true);
    type(field(), '   ');
    expect(buttonByText('差し戻す')!.disabled).toBe(true);
    keyDown(field(), { key: 'Enter' });
    await act(async () => {});
    expect(out.done).toBe(false);
    type(field(), '理由');
    expect(buttonByText('差し戻す')!.disabled).toBe(false);
    keyDown(field(), { key: 'Enter' });
    await act(async () => {});
    expect(out.value).toBe('理由');
  });

  it('1行入力は Enter で確定（IME 変換中は送らない）', async () => {
    const out = ask(base);
    type(field(), 'あ');
    keyDown(field(), { key: 'Enter', isComposing: true });
    await act(async () => {});
    expect(out.done).toBe(false);
    keyDown(field(), { key: 'Enter' });
    await act(async () => {});
    expect(out.value).toBe('あ');
  });

  it('multiline は textarea で、Enter は改行のまま・Ctrl+Enter で確定', async () => {
    const out = ask({ ...base, multiline: true });
    expect(field().tagName).toBe('TEXTAREA');
    type(field(), '1行目\n2行目');
    keyDown(field(), { key: 'Enter' });
    await act(async () => {});
    expect(out.done).toBe(false);
    keyDown(field(), { key: 'Enter', ctrlKey: true });
    await act(async () => {});
    expect(out.value).toBe('1行目\n2行目');
  });

  it('confirm と同じキューで順に出て、次の prompt に前の入力を持ち越さない', async () => {
    const first = ask({ ...base, defaultValue: 'A' });
    const second = ask({ ...base, title: '2つ目' });
    type(field(), 'A+');
    click(buttonByText('差し戻す'));
    await act(async () => {});
    expect(first.value).toBe('A+');
    expect(field().value).toBe('');
    click(buttonByText('差し戻す'));
    await act(async () => {});
    expect(second.value).toBe('');
  });

  it('Provider が外れると待っている prompt は null で終わる', async () => {
    const out = ask(base);
    act(() => root.unmount());
    await act(async () => {});
    expect(out.value).toBeNull();
    root = createRoot(host);
    mount(h(ConfirmProvider, null, h(Probe)));
  });
});

describe('ConfirmProvider panelClassName', () => {
  const panel = () => document.querySelector('[role="alertdialog"]')!;
  it('Provider の既定を全ダイアログに当て、呼び出しごとの指定が優先される', async () => {
    mount(h(ConfirmProvider, { panelClassName: 'rakuten-theme' }, h(Probe)));
    act(() => { void confirm({ title: 'A', confirmLabel: 'はい' }); });
    expect(panel().className).toContain('rakuten-theme');
    click(buttonByText('はい'));
    act(() => { void confirm({ title: 'B', confirmLabel: 'はい', panelClassName: 'other-theme' }); });
    expect(panel().className).toContain('other-theme');
    expect(panel().className).not.toContain('rakuten-theme');
    click(buttonByText('はい'));
    act(() => { void prompt({ title: 'C', confirmLabel: 'はい' }); });
    expect(panel().className).toContain('rakuten-theme');
  });
});

describe('EmptyState 追加 props', () => {
  it('従来の呼び方は見た目が変わらない', () => {
    const html = renderToStaticMarkup(h(EmptyState, { message: 'なし' }, h('a', null, '登録')));
    expect(html).toContain('rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-10');
    expect(html).not.toContain('font-semibold');
    expect(html).toContain('<a>登録</a>');
  });
  it('icon・description で見出し＋補足の形になり、bare は枠を外す', () => {
    const html = renderToStaticMarkup(h(EmptyState, { message: '該当なし', description: '条件を変えてください', icon: h('svg'), bare: true, className: 'py-12' }));
    expect(html).toContain('font-semibold');
    expect(html).toContain('条件を変えてください');
    expect(html).toContain('rounded-full');
    expect(html).not.toContain('border-[rgb(var(--line))]');
  });
  it('loading 中は補足を出さない', () => {
    const html = renderToStaticMarkup(h(EmptyState, { description: '補足', loading: true }));
    expect(html).toContain('読み込み中');
    expect(html).not.toContain('補足');
  });
});

describe('ErrorBanner onRetry', () => {
  it('role=alert のまま再試行ボタンが出て、押すと onRetry', () => {
    const onRetry = vi.fn();
    mount(h(ErrorBanner, { message: '読み込めません', onRetry }));
    expect(document.querySelector('[role="alert"]')).toBeTruthy();
    click(buttonByText('再試行'));
    expect(onRetry).toHaveBeenCalledOnce();
  });
  it('sm は文中の下線リンク、retryLabel を変えられる、onRetry なしならボタンなし', () => {
    const sm = renderToStaticMarkup(h(ErrorBanner, { message: 'x', size: 'sm', onRetry: () => {}, retryLabel: 'もう一度' }));
    expect(sm).toContain('underline');
    expect(sm).toContain('もう一度');
    expect(renderToStaticMarkup(h(ErrorBanner, { message: 'x' }))).not.toContain('<button');
  });
});

describe('Skeleton / TonePill', () => {
  it('Skeleton の tone で背景だけ変わる（既定は従来どおり）', () => {
    expect(renderToStaticMarkup(h(Skeleton, { className: 'h-3' }))).toContain('bg-[rgb(var(--surface-muted))]');
    expect(renderToStaticMarkup(h(Skeleton, { tone: 'subtle' }))).toContain('bg-[rgb(var(--surface-subtle))]');
    expect(renderToStaticMarkup(h(Skeleton, { tone: 'accent' }))).toContain('bg-[var(--accent-subtle)]');
  });
  it('TonePill の size md・solid・ariaLabel（件数バッジ用）', () => {
    const html = renderToStaticMarkup(h(TonePill, { tone: 'solid', size: 'md', ariaLabel: '3件' }, '3'));
    expect(html).toContain('aria-label="3件"');
    expect(html).toContain('h-[22px]');
    expect(html).toContain('bg-[var(--sb-accent-bg)]');
    expect(renderToStaticMarkup(h(TonePill, { tone: 'ok' }, 'x'))).toContain('px-2 py-px text-[11px]');
  });
});
