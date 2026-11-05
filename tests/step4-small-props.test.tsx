// @vitest-environment jsdom
// Modal の mobileSheet / footerClassName、ProductThumb の framed。
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { Modal } from '../src/components/Modal';
import { ProductThumb } from '../src/components/ProductThumb';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
const mount = (node: ReactNode) => act(() => { root.render(node); });

beforeEach(() => {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  document.body.innerHTML = '';
});

const overlay = () => document.querySelector<HTMLElement>('[role="presentation"]')!;

describe('Modal mobileSheet / footerClassName', () => {
  it('既定は縦中央。mobileSheet で狭い画面だけ下端に寄る', () => {
    mount(h(Modal, { open: true, onClose: () => {}, title: 'T' }, 'x'));
    expect(overlay().className).toContain('items-center');
    expect(overlay().className).not.toContain('items-end');
    mount(h(Modal, { open: true, onClose: () => {}, title: 'T', mobileSheet: true }, 'x'));
    expect(overlay().className).toContain('items-end sm:items-center');
  });

  it('フッターは既定で右寄せ。footerClassName="block" で幅いっぱい', () => {
    mount(h(Modal, { open: true, onClose: () => {}, title: 'T', footer: h('span', null, 'f') }, 'x'));
    let footer = document.querySelector('[role="dialog"] > div:last-child') as HTMLElement;
    expect(footer.className).toContain('flex justify-end gap-2');
    mount(h(Modal, { open: true, onClose: () => {}, title: 'T', footer: h('span', null, 'f'), footerClassName: 'block' }, 'x'));
    footer = document.querySelector('[role="dialog"] > div:last-child') as HTMLElement;
    expect(footer.className).toContain('block');
    expect(footer.className).not.toContain('justify-end');
  });

  it('subtitle に div を渡しても入れ子の警告にならない（div で包む）', () => {
    mount(h(Modal, { open: true, onClose: () => {}, title: 'T', subtitle: h('div', null, 's') }, 'x'));
    expect(document.querySelector('[role="dialog"] p')).toBeNull();
  });
});

describe('ProductThumb framed', () => {
  const html = (framed?: boolean) => renderToStaticMarkup(h(ProductThumb, { src: 'https://e.test/a.jpg', alt: 'a', enlargeOnClick: false, framed }));
  it('既定は囲いなし、framed で枠線と地が付く', () => {
    expect(html()).not.toContain('border-[rgb(var(--line))]');
    expect(html(true)).toContain('border border-[rgb(var(--line))] bg-[rgb(var(--surface))]');
  });
  it('画像が無いプレースホルダーにも枠が付く', () => {
    const ph = (framed?: boolean) => renderToStaticMarkup(h(ProductThumb, { src: null, alt: 'a', framed }));
    expect(ph()).not.toContain('border-[rgb(var(--line))]');
    expect(ph(true)).toContain('border border-[rgb(var(--line))]');
  });
});
