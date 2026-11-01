// AppSidebar まわりの純関数と静的描画（dist を対象。`npm run build` の後に `npm test`）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { isSidebarNavItemActive, isZeroCssLength, summarizeSidebarNews } from '../dist/lib/sidebar-nav.js';
import { rectDistanceFromPoint, holdSidebarPeek, releaseSidebarPeek, hasSidebarPeekHold, resetSidebarPeekHolds, sidebarPeekRegionProps } from '../dist/lib/sidebar-peek.js';
import { AppSidebar } from '../dist/components/AppSidebar.js';

test('アクティブ判定: href 配下・activeMatch・exactMatch', () => {
  const orders = { href: '/orders', activeMatch: ['/shipments'] };
  assert.equal(isSidebarNavItemActive(orders, '/orders'), true);
  assert.equal(isSidebarNavItemActive(orders, '/orders/12'), true);
  assert.equal(isSidebarNavItemActive(orders, '/orders-archive'), false, '接頭辞だけ一致は不可');
  assert.equal(isSidebarNavItemActive(orders, '/shipments/3'), true, 'activeMatch 配下');
  assert.equal(isSidebarNavItemActive(orders, '/products'), false);
  const home = { href: '/amazon', exactMatch: true, activeMatch: ['/amazon/x'] };
  assert.equal(isSidebarNavItemActive(home, '/amazon'), true);
  assert.equal(isSidebarNavItemActive(home, '/amazon/sell'), false, 'exactMatch は配下で光らない');
  assert.equal(isSidebarNavItemActive(home, '/amazon/x'), false, 'exactMatch は activeMatch も見ない');
});

test('アクティブ判定: isActive 優先・excludeMatch（Smologi の /new 除外・/customer 完全一致）', () => {
  const orders = { href: '/customer/orders', excludeMatch: ['/customer/orders/new'] };
  assert.equal(isSidebarNavItemActive(orders, '/customer/orders/5'), true);
  assert.equal(isSidebarNavItemActive(orders, '/customer/orders/new'), false);
  assert.equal(isSidebarNavItemActive(orders, '/customer/orders/new/x'), false, '前方一致で除外');
  assert.equal(isSidebarNavItemActive({ href: '/o', excludeMatch: ['/o/new'] }, '/o/newest'), true, '/new は /newest を除外しない');
  const dash = { href: '/customer', isActive: (p) => p === '/customer', exactMatch: false };
  assert.equal(isSidebarNavItemActive(dash, '/customer'), true);
  assert.equal(isSidebarNavItemActive(dash, '/customer/orders'), false);
  const custom = { href: '/x', exactMatch: true, excludeMatch: [], isActive: (p) => p.startsWith('/y') };
  assert.equal(isSidebarNavItemActive(custom, '/y/1'), true, 'isActive は exactMatch より優先');
  assert.equal(isSidebarNavItemActive(custom, '/x'), false);
});

test('閉じた幅が 0 か', () => {
  for (const v of ['0rem', '0px', '0']) assert.equal(isZeroCssLength(v), true, v);
  for (const v of ['3.5rem', '56px']) assert.equal(isZeroCssLength(v), false, v);
});

test('要対応の点の集約', () => {
  const sections = [{ key: 'a', label: '', items: [
    { href: '/a', label: 'A', icon: null },
    { href: '/b', label: 'B', icon: null, dot: true, dotReason: '連絡 2件' },
    { href: '/c', label: 'C', icon: null, dot: true },
  ] }];
  assert.deepEqual(summarizeSidebarNews(sections), { hasNews: true, reason: '要対応: 連絡 2件、C' });
  assert.deepEqual(summarizeSidebarNews([{ key: 'x', label: '', items: [{ href: '/a', label: 'A', icon: null }] }]), { hasNews: false, reason: undefined });
});

test('ピーク領域: 矩形との距離と保持', () => {
  const rect = { left: 0, right: 100, top: 0, bottom: 50 };
  assert.equal(rectDistanceFromPoint(rect, 10, 10), 0);
  assert.equal(rectDistanceFromPoint(rect, 130, 10), 30);
  assert.equal(rectDistanceFromPoint(rect, 103, 54), 5);
  assert.equal(hasSidebarPeekHold(), false);
  holdSidebarPeek('a'); holdSidebarPeek('a');
  assert.equal(hasSidebarPeekHold(), true);
  releaseSidebarPeek('a');
  assert.equal(hasSidebarPeekHold(), false);
  resetSidebarPeekHolds();
  assert.deepEqual(sidebarPeekRegionProps, { 'data-sidebar-peek-region': '' });
});

const sections = [
  { key: 'main', label: '', items: [{ href: '/', label: 'ダッシュボード', icon: h('i'), exactMatch: true }] },
  { key: 'work', label: '業務', items: [
    { href: '/orders', label: '受注', icon: h('i'), quickAction: { href: '/orders/new', label: '受注を作る' }, dot: true, dotReason: '未対応 2件' },
    { href: '/reorders', label: '発注', icon: h('i'), count: 3, countTone: 'danger', unlockPill: '連携で開放' },
    { href: '/pro', label: '分析', icon: h('i'), locked: true, lockedReason: 'Plus プランで利用できます' },
    { href: '/soon', label: '近日', icon: h('i'), comingSoon: true },
  ] },
];
const render = (props) => renderToStaticMarkup(h(AppSidebar, { sections, pathname: '/orders/5', ...props }));

test('AppSidebar: 見出し・選択・点・ロック・＋・件数', () => {
  const html = render({ top: h('div', null, 'TOPSLOT'), accountMenu: h('div', null, 'ACCOUNT') });
  assert.match(html, /業務/);
  assert.match(html, /TOPSLOT/);
  assert.match(html, /ACCOUNT/);
  assert.match(html, /aria-current="page"[^>]*>/);
  assert.match(html, /受注（未対応 2件）/, '点の理由が title に入る');
  assert.match(html, /aria-label="受注を作る"/);
  assert.match(html, /aria-label="3件"/);
  assert.match(html, /連携で開放/);
  assert.match(html, /title="Plus プランで利用できます"/);
  assert.match(html, />PRO</);
  assert.match(html, /準備中/);
  assert.match(html, /data-sidebar-peek-region/);
  // 既定の閉じ幅は 0: 初回描画（展開）では hidden/inert にならない
  assert.doesNotMatch(html, /<aside[^>]*inert/);
});

test('AppSidebar: renderLink が全リンクに使われる（ctx.kind も渡る）', () => {
  const kinds = [];
  const html = render({ renderLink: (props, ctx) => { kinds.push(ctx.kind); return h('a', { ...props, 'data-custom': ctx.kind }); } });
  assert.match(html, /data-custom="item"/);
  assert.match(html, /data-custom="quickAction"/);
  assert.ok(kinds.includes('item') && kinds.includes('quickAction'));
});

test('AppSidebar: renderLocked で包める / navDimmed', () => {
  const html = render({ navDimmed: true, renderLocked: (props, item) => h('button', { className: props.className, 'data-locked': item.label }, props.children) });
  assert.match(html, /data-locked="分析"/);
  assert.match(html, /opacity-40/);
});

test('AppSidebar: 上部 slot は関数でも受ける', () => {
  const html = render({ top: ({ collapsed }) => h('div', null, `collapsed=${collapsed}`) });
  assert.match(html, /collapsed=false/);
});

test('AppSidebar: 開閉できる区分（閉じていても dot を見出しに・選択中なら開く）', () => {
  const secs = [{ key: 'int', label: '連携', collapsible: true, items: [
    { href: '/a', label: 'Aアプリ', icon: null, dot: true, dotReason: '要対応' },
  ] }];
  const closed = renderToStaticMarkup(h(AppSidebar, { sections: secs, pathname: '/other' }));
  assert.match(closed, /aria-expanded="false"/);
  assert.doesNotMatch(closed, />Aアプリ</);
  assert.match(closed, /aria-label="中に要対応あり"/);
  const active = renderToStaticMarkup(h(AppSidebar, { sections: secs, pathname: '/a/1' }));
  assert.match(active, /aria-expanded="true"/);
  assert.match(active, />Aアプリ</);
  const open = renderToStaticMarkup(h(AppSidebar, { sections: [{ ...secs[0], defaultOpen: true }], pathname: '/other' }));
  assert.match(open, />Aアプリ</);
});

test('AppSidebar: 選択中に font-semibold を足す・＋の色と区分余白を上書きできる', () => {
  const html = render({ activeClassName: 'amazon-nav-active', quickActionActiveClassName: 'QA-ACTIVE', quickActionClassName: 'QA-IDLE', sectionGapClassName: 'mt-4' });
  assert.match(html, /amazon-nav-active font-semibold/);
  assert.match(html, /QA-ACTIVE/);
  assert.match(html, /<div class="mt-4"><div class="truncate/);
});
