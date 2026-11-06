// @vitest-environment jsdom
// v0.21.0: スージーの共通部品（星・起動ボタン・見出しの丸・右ペイン）。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { SuzySparkle } from '../src/components/SuzySparkle';
import { SuzyLauncher } from '../src/components/SuzyLauncher';
import { SuzyOrb } from '../src/components/SuzyOrb';
import { SUZY_PANE_BREAKPOINT, SUZY_PANE_WIDTH, useSuzyPane, useSuzyPaneActive } from '../src/lib/suzy-pane';
import * as pkg from '../src/index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
const mount = (node: ReactNode) => act(() => { root.render(node); });

type MqListener = () => void;
let wideNow = false;
const mqListeners = new Set<MqListener>();

beforeEach(() => {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  wideNow = false;
  mqListeners.clear();
  window.matchMedia = ((query: string) => ({
    get matches() { return query.includes(`${SUZY_PANE_BREAKPOINT}px`) ? wideNow : false; },
    media: query,
    addEventListener: (_: string, fn: MqListener) => mqListeners.add(fn),
    removeEventListener: (_: string, fn: MqListener) => mqListeners.delete(fn),
  })) as unknown as typeof window.matchMedia;
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  document.documentElement.style.removeProperty('--bottom-bar-h');
});

describe('SuzySparkle', () => {
  it('大きいサイズは宝石の面とクリップつきの完成形、13px 以下は簡略形', () => {
    const full = renderToStaticMarkup(h(SuzySparkle, { size: 22 }));
    expect(full).toContain('data-suzy-glyph="full"');
    expect(full).toContain('clipPath');
    expect(full).toContain('suzy-twinkle');
    const small = renderToStaticMarkup(h(SuzySparkle, { size: 12 }));
    expect(small).toContain('data-suzy-glyph="simple"');
    expect(small).not.toContain('clipPath');
    expect(small).not.toContain('suzy-glint');
    expect(renderToStaticMarkup(h(SuzySparkle, { size: 13 }))).toContain('data-suzy-glyph="simple"');
    expect(renderToStaticMarkup(h(SuzySparkle, { size: 14 }))).toContain('data-suzy-glyph="full"');
  });

  it('white は白塗り（グラデーションなし）、color は SVG id がインスタンスごとに違う', () => {
    const white = renderToStaticMarkup(h(SuzySparkle, { tone: 'white' }));
    expect(white).toContain('fill="#fff"');
    expect(white).not.toContain('linearGradient');
    mount(h('div', null, h(SuzySparkle, null), h(SuzySparkle, null)));
    const ids = Array.from(host.querySelectorAll('linearGradient')).map((el) => el.id);
    expect(ids.length).toBeGreaterThanOrEqual(2);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^suzy-[gm]-[a-zA-Z0-9]+$/);
  });

  it('state はクラスに出る。night に月のマークは出ない', () => {
    for (const state of ['idle', 'notice', 'thinking', 'night'] as const) {
      expect(renderToStaticMarkup(h(SuzySparkle, { state }))).toContain(`suzy-sparkle--${state}`);
    }
    const night = renderToStaticMarkup(h(SuzySparkle, { state: 'night' }));
    expect(night).not.toContain('moon');
    expect(night).toContain('aria-hidden="true"');
  });

  it('title があれば読み上げ名になる', () => {
    expect(renderToStaticMarkup(h(SuzySparkle, { title: 'スージー' }))).toContain('aria-label="スージー"');
  });
});

describe('SuzyLauncher', () => {
  it('既定は 44px の星だけの丸。ラベル・輪・バッジは出ない', () => {
    mount(h(SuzyLauncher, { onClick: () => {} }));
    const btn = host.querySelector('button')!;
    expect(btn.className).toContain('suzy-launcher');
    expect(btn.className).not.toContain('suzy-launcher--label');
    expect(btn.getAttribute('aria-label')).toBe('スージーに質問');
    expect(host.querySelector('[data-testid="suzy-ring"]')).toBeNull();
    expect(host.querySelector('.suzy-launcher__badge')).toBeNull();
    expect(host.textContent).toBe('');
    expect(btn.querySelector('svg')!.getAttribute('width')).toBe('22');
  });

  it('showLabel でピルになり「スージーに質問」が出る', () => {
    mount(h(SuzyLauncher, { showLabel: true }));
    expect(host.querySelector('button')!.className).toContain('suzy-launcher--label');
    expect(host.textContent).toBe('スージーに質問');
  });

  it('thinking で輪が出る。notice では出ない', () => {
    mount(h(SuzyLauncher, { state: 'thinking' }));
    expect(host.querySelector('[data-testid="suzy-ring"]')).not.toBeNull();
    mount(h(SuzyLauncher, { state: 'notice' }));
    expect(host.querySelector('[data-testid="suzy-ring"]')).toBeNull();
    expect(host.querySelector('.suzy-sparkle--notice')).not.toBeNull();
  });

  it('バッジ・aria-label・クリック・hidden', () => {
    const onClick = vi.fn();
    mount(h(SuzyLauncher, { badge: '3+', badgeTestId: 'b', 'aria-label': 'スージーに質問する。お知らせが3件あります', onClick, hidden: true }));
    expect(host.querySelector('[data-testid="b"]')!.textContent).toBe('3+');
    const btn = host.querySelector('button')!;
    expect(btn.getAttribute('aria-label')).toContain('お知らせが3件');
    expect(host.querySelector('.suzy-launcher-wrap')!.getAttribute('data-hidden')).toBe('true');
    act(() => btn.click());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('placement=inline はボタンだけを返す（固定ボックスなし）', () => {
    mount(h(SuzyLauncher, { placement: 'inline', className: 'x' }));
    expect(host.querySelector('.suzy-launcher-wrap')).toBeNull();
    expect(host.querySelector('button.x')).not.toBeNull();
  });

  it('固定配置のあいだ --bottom-bar-h を測る（inline では測らない）', () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { cb(0); return 1; });
    mount(h(SuzyLauncher, null));
    expect(document.documentElement.style.getPropertyValue('--bottom-bar-h')).toBe('0px');
    act(() => root.unmount());
    host.remove();
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    mount(h(SuzyLauncher, { placement: 'inline' }));
    expect(document.documentElement.style.getPropertyValue('--bottom-bar-h')).toBe('');
    raf.mockRestore();
  });

  it('初回だけ光る輪（旧 intro pulse）は出さない', () => {
    mount(h(SuzyLauncher, null));
    expect(host.innerHTML).not.toContain('animate-pulse');
    expect(host.innerHTML).not.toContain('ring-accent');
  });
});

describe('SuzyOrb', () => {
  it('32px の丸に白い星 16px。thinking のときだけ輪', () => {
    mount(h(SuzyOrb, null));
    const orb = host.querySelector<HTMLElement>('.suzy-orb')!;
    expect(orb.style.width).toBe('32px');
    expect(orb.querySelector('svg')!.getAttribute('width')).toBe('16');
    expect(host.querySelector('[data-testid="suzy-ring"]')).toBeNull();
    mount(h(SuzyOrb, { thinking: true }));
    expect(host.querySelector('[data-testid="suzy-ring"]')).not.toBeNull();
  });
});

describe('useSuzyPane', () => {
  function Probe({ open }: { open: boolean }) {
    const { isPane, active } = useSuzyPane({ open });
    const seen = useSuzyPaneActive();
    return h('span', { 'data-probe': '', 'data-pane': String(isPane), 'data-active': String(active), 'data-seen': String(seen) });
  }
  const probe = () => host.querySelector<HTMLElement>('[data-probe]')!;
  const rootEl = document.documentElement;

  it('1440px 未満ではペインにしない（変数は 0px）', () => {
    mount(h(Probe, { open: true }));
    expect(probe().dataset.pane).toBe('false');
    expect(probe().dataset.active).toBe('false');
    expect(rootEl.style.getPropertyValue('--suzy-pane-w')).toBe('0px');
    expect(rootEl.hasAttribute('data-suzy-pane')).toBe(false);
  });

  it('1440px 以上で開くと --suzy-pane-w が 380px になり、閉じると 0px に戻る', () => {
    wideNow = true;
    mount(h(Probe, { open: true }));
    expect(probe().dataset.pane).toBe('true');
    expect(probe().dataset.active).toBe('true');
    expect(probe().dataset.seen).toBe('true');
    expect(rootEl.style.getPropertyValue('--suzy-pane-w')).toBe(`${SUZY_PANE_WIDTH}px`);
    expect(rootEl.getAttribute('data-suzy-pane')).toBe('open');
    mount(h(Probe, { open: false }));
    expect(probe().dataset.active).toBe('false');
    expect(probe().dataset.seen).toBe('false');
    expect(rootEl.style.getPropertyValue('--suzy-pane-w')).toBe('0px');
  });

  it('画面幅が変わったら追従する', () => {
    mount(h(Probe, { open: true }));
    expect(probe().dataset.active).toBe('false');
    wideNow = true;
    act(() => mqListeners.forEach((fn) => fn()));
    expect(probe().dataset.active).toBe('true');
  });

  it('アンマウントで変数と状態を片づける', () => {
    wideNow = true;
    mount(h(Probe, { open: true }));
    act(() => root.unmount());
    host.remove();
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    expect(rootEl.style.getPropertyValue('--suzy-pane-w')).toBe('');
    expect(rootEl.hasAttribute('data-suzy-pane')).toBe(false);
  });
});

describe('パッケージ index', () => {
  it('スージーの部品を export している', () => {
    for (const name of ['SuzySparkle', 'SuzyLauncher', 'SuzyOrb', 'useSuzyPane', 'useSuzyPaneActive']) {
      expect((pkg as Record<string, unknown>)[name], name).toBeTypeOf('function');
    }
  });
});
