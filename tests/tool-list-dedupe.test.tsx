// @vitest-environment jsdom
// 2026-11-12: 「▾」の一覧に、帯に出ている道具を重ねて出さない。
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { TopToolCapsule, type TopToolItem } from '../src/components/TopToolCapsule';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
const mount = (node: ReactNode) => act(() => { root.render(node); });

beforeEach(() => {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  document.body.innerHTML = '';
});

const icon = h('svg');
const tool = (key: string, label: string, extra: Partial<TopToolItem> = {}): TopToolItem => ({
  key, label, icon, onClick: () => {}, ...extra,
});

const handle = () => host.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"].sb-tool-caret');

describe('TopToolCapsule の「▾」一覧', () => {
  it('帯に出ている道具は一覧に出さず、帯に無い道具だけを出す', () => {
    mount(h(TopToolCapsule, {
      ariaLabel: '商品ツール',
      items: [
        tool('new', '出品を作成', { primary: true }),
        tool('csv', 'CSV 入出力'),
        tool('bulk', 'Amazonから削除', { placement: 'list' }),
      ],
    }));
    const btn = handle();
    expect(btn).not.toBeNull();
    act(() => { btn!.click(); });
    const panel = document.querySelector('[aria-label="道具の一覧"]');
    expect(panel).not.toBeNull();
    const text = panel!.textContent ?? '';
    expect(text).toContain('Amazonから削除');
    expect(text).not.toContain('出品を作成');
    expect(text).not.toContain('CSV 入出力');
  });

  it('全部が帯に出ていて設定リンクも無ければ「▾」を出さない', () => {
    mount(h(TopToolCapsule, {
      ariaLabel: '商品ツール',
      items: [tool('new', '出品を作成', { primary: true }), tool('csv', 'CSV 入出力')],
    }));
    expect(handle()).toBeNull();
  });

  it('全部が帯に出ていても、関連する設定があれば「▾」を出す', () => {
    mount(h(TopToolCapsule, {
      ariaLabel: '商品ツール',
      items: [tool('new', '出品を作成', { primary: true })],
      settingsLinks: [{ label: '表示設定', onClick: () => {} }],
    }));
    expect(handle()).not.toBeNull();
  });
});
