// StoreAccountSwitcher の静的描画（dist を対象。`npm run build` の後に `npm test`）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StoreAccountSwitcher } from '../dist/components/StoreAccountSwitcher.js';

const groups = [
  { id: 'amz', heading: 'Amazon', items: [
    { id: 'a1', label: 'HandY 本店', checked: true, href: '/a1' },
    { id: 'a2', label: '支店', badge: '未連携', onSelect() {} },
  ] },
  { id: 'rk', heading: '楽天市場', items: [{ id: 'r1', label: '楽天店', disabled: true }] },
];
const footer = [{ id: 'add', label: '＋ アカウントを追加', href: '/add' }];
const render = (props) => renderToStaticMarkup(h(StoreAccountSwitcher, { currentLabel: 'HandY 本店', groups, ...props }));

test('閉じた状態: 表示名と aria、一覧は出ない', () => {
  const html = render({});
  assert.match(html, /aria-haspopup="menu"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /HandY 本店/);
  assert.doesNotMatch(html, /role="menu"/);
  assert.doesNotMatch(html, /rotate-180/);
});

test('開いた状態: 見出し・checked の印・バッジ・フッター・▼回転', () => {
  const html = render({ defaultOpen: true, footerItems: footer });
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /rotate-180/);
  assert.match(html, /Amazon/);
  assert.match(html, /楽天市場/);
  assert.match(html, /今の画面/);
  assert.equal((html.match(/今の画面/g) ?? []).length, 1);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /未連携/);
  assert.match(html, /＋ アカウントを追加/);
  assert.match(html, /disabled=""/);
});

test('state: loading / error / empty は一覧の代わりに文言', () => {
  assert.match(render({ defaultOpen: true, state: 'loading' }), /読み込み中…/);
  assert.match(render({ defaultOpen: true, state: 'error', errorText: 'だめ' }), /だめ/);
  const empty = render({ defaultOpen: true, state: 'empty' });
  assert.match(empty, /登録がありません/);
  assert.doesNotMatch(empty, /Amazon/);
});

test('emptyHref: 欄がリンクになり開かない（橙）', () => {
  const html = render({ emptyHref: '/setup', emptyHint: '連携すると利用できます' });
  assert.match(html, /<a [^>]*href="\/setup"/);
  assert.match(html, /orange-/);
  assert.match(html, /連携すると利用できます/);
  assert.doesNotMatch(html, /aria-haspopup/);
});

test('renderLink が使われる', () => {
  const html = render({ defaultOpen: true, renderLink: (p) => h('a', { 'data-x': '1', href: p.href, className: p.className }, p.children) });
  assert.match(html, /data-x="1"/);
});
