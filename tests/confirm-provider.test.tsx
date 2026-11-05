// @vitest-environment jsdom
// ConfirmProvider / useConfirm / useNotice: window.confirm・alert の Promise 版。
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { isConfirmDialogOpen } from '../src/components/ConfirmDialog';
import { ConfirmProvider, useConfirm, useConfirmOnce, useNotice, descriptionToLines, type ConfirmFn, type NoticeFn } from '../src/components/ConfirmProvider';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
let confirm: ConfirmFn;
let notice: NoticeFn;
const Probe = () => { confirm = useConfirm(); notice = useNotice(); return null; };
const mount = (node: ReactNode) => act(() => { root.render(node); });
const buttonByText = (text: string) =>
  Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === text) as HTMLButtonElement | undefined;
const click = (el: Element | undefined) => act(() => { el!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
const press = (key: string) => act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })); });
const dialogText = () => document.querySelector('[role="alertdialog"]')?.textContent ?? '';
// confirm() の Promise を act の中で起こし、結果を後から読む
function ask(...args: Parameters<ConfirmFn>) {
  const out: { value?: boolean } = {};
  act(() => { void confirm(...args).then((v) => { out.value = v; }); });
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

const base = { title: 'この注文を削除しますか？', confirmLabel: '削除する' };

describe('useConfirm', () => {
  it('title・description・ボタン文言を出し、実行で true', async () => {
    const out = ask({ ...base, description: '元に戻せません。\n在庫は戻ります。', tone: 'danger' });
    expect(dialogText()).toContain('この注文を削除しますか？');
    expect(dialogText()).toContain('元に戻せません。');
    expect(dialogText()).toContain('在庫は戻ります。');
    expect(buttonByText('あとで')).toBeTruthy();
    click(buttonByText('削除する'));
    await act(async () => {});
    expect(out.value).toBe(true);
    expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it('キャンセル文言を差し替えられ、押すと false', async () => {
    const out = ask({ ...base, cancelLabel: 'やめる' });
    click(buttonByText('やめる'));
    await act(async () => {});
    expect(out.value).toBe(false);
  });

  it('Escape は false', async () => {
    const out = ask(base);
    press('Escape');
    await act(async () => {});
    expect(out.value).toBe(false);
    expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it('背景クリックは false', async () => {
    const out = ask(base);
    const overlay = document.querySelector<HTMLElement>('[role="presentation"]')!;
    act(() => { overlay.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); });
    await act(async () => {});
    expect(out.value).toBe(false);
  });

  it('重なった呼び出しは順番に出る（前が閉じてから次）', async () => {
    const a = ask({ title: '1つ目？', confirmLabel: '実行1' });
    const b = ask({ title: '2つ目？', confirmLabel: '実行2' });
    expect(dialogText()).toContain('1つ目？');
    expect(dialogText()).not.toContain('2つ目？');
    expect(b.value).toBeUndefined();
    click(buttonByText('実行1'));
    await act(async () => {});
    expect(a.value).toBe(true);
    expect(dialogText()).toContain('2つ目？');
    press('Escape');
    await act(async () => {});
    expect(b.value).toBe(false);
  });

  it('danger は赤、既定は通常色のボタン', () => {
    ask({ ...base, tone: 'danger' });
    expect(buttonByText('削除する')!.className).toContain('--danger-solid');
    click(buttonByText('あとで'));
    ask({ title: '送信しますか？', confirmLabel: '送信する' });
    expect(buttonByText('送信する')!.className).not.toContain('--danger-solid');
  });

  it('初期フォーカス: danger はキャンセル、それ以外は実行ボタン（Enter = OK）', () => {
    ask({ ...base, tone: 'danger' });
    expect(document.activeElement).toBe(buttonByText('あとで'));
    click(buttonByText('あとで'));
    ask({ title: '送信しますか？', confirmLabel: '送信する' });
    expect(document.activeElement).toBe(buttonByText('送信する'));
    click(buttonByText('あとで'));
    act(() => { void notice({ title: '完了しました' }); });
    expect(document.activeElement).toBe(buttonByText('OK'));
  });

  it('isConfirmDialogOpen: 開いている間だけ true（キュー待ちの切り替えでも途切れない）', async () => {
    expect(isConfirmDialogOpen()).toBe(false);
    ask(base);
    expect(isConfirmDialogOpen()).toBe(true);
    // window の capture で Escape を拾う画面側リスナーの想定
    let seen: boolean | null = null;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') seen = isConfirmDialogOpen(); };
    window.addEventListener('keydown', onKey, true);
    press('Escape');
    window.removeEventListener('keydown', onKey, true);
    await act(async () => {});
    expect(seen).toBe(true);
    expect(isConfirmDialogOpen()).toBe(false);
  });

  it('useConfirmOnce: 開いている間の再呼び出しは積まずに false、閉じたらまた呼べる', async () => {
    let once!: ConfirmFn;
    const OnceProbe = () => { once = useConfirmOnce(); return null; };
    mount(h(ConfirmProvider, null, h(Probe), h(OnceProbe)));
    const first: { value?: boolean } = {};
    const second: { value?: boolean } = {};
    act(() => { void once(base).then((v) => { first.value = v; }); });
    act(() => { void once(base).then((v) => { second.value = v; }); });
    await act(async () => {});
    expect(second.value).toBe(false);
    expect(document.querySelectorAll('[role="alertdialog"]').length).toBe(1);
    expect(first.value).toBeUndefined();
    click(buttonByText('あとで'));
    await act(async () => {});
    expect(first.value).toBe(false);
    const third: { value?: boolean } = {};
    act(() => { void once(base).then((v) => { third.value = v; }); });
    click(buttonByText('削除する'));
    await act(async () => {});
    expect(third.value).toBe(true);
  });

  it('Provider が外れたら待っている確認は false で終わる', async () => {
    const out = ask(base);
    act(() => root.unmount());
    await Promise.resolve();
    expect(out.value).toBe(false);
    root = createRoot(host); // afterEach の unmount 用
  });

  it('Provider の外で使うと分かりやすく失敗する', () => {
    const Bare = () => { useConfirm(); return null; };
    const errors = console.error;
    console.error = () => {};
    try {
      expect(() => act(() => { root.render(h(Bare)); })).toThrow('ConfirmProvider');
    } finally { console.error = errors; }
    root = createRoot(host);
  });
});

describe('useNotice', () => {
  it('ボタンは1つ（既定「OK」）で、押すと解決する', async () => {
    let done = false;
    act(() => { void notice({ title: '保存できませんでした', description: '時間をおいてもう一度お試しください。' }).then(() => { done = true; }); });
    expect(dialogText()).toContain('保存できませんでした');
    expect(Array.from(document.querySelectorAll('button')).filter((b) => b.textContent?.trim() === 'OK')).toHaveLength(1);
    expect(buttonByText('あとで')).toBeUndefined();
    click(buttonByText('OK'));
    await act(async () => {});
    expect(done).toBe(true);
  });

  it('Escape でも解決し、closeLabel を変えられる', async () => {
    let done = false;
    act(() => { void notice({ title: 'お知らせ', closeLabel: '閉じる' }).then(() => { done = true; }); });
    expect(buttonByText('閉じる')).toBeTruthy();
    press('Escape');
    await act(async () => {});
    expect(done).toBe(true);
  });

  it('confirm と notice も同じキューで順に出る', async () => {
    const out = ask(base);
    let done = false;
    act(() => { void notice({ title: '次の案内' }).then(() => { done = true; }); });
    expect(dialogText()).not.toContain('次の案内');
    click(buttonByText('削除する'));
    await act(async () => {});
    expect(dialogText()).toContain('次の案内');
    click(buttonByText('OK'));
    await act(async () => {});
    expect(out.value).toBe(true);
    expect(done).toBe(true);
  });
});

describe('descriptionToLines', () => {
  it('改行ごとに段落にし、空行は捨てる', () => {
    expect(descriptionToLines('a\n\n b \n')).toEqual(['a', 'b']);
    expect(descriptionToLines(undefined)).toEqual([]);
  });
});
