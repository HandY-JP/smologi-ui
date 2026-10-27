// ダッシュボード編集キットの純関数（dist を対象。`npm run build` の後に `npm test`）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../dist/dashboard-kit/index.js';

const defs = [
  { id: 'a', title: 'A', sizes: ['S', 'M'], defaultSize: 'M', defaultOn: true },
  { id: 'b', title: 'B', sizes: ['M', 'L', 'W'], defaultSize: 'L', defaultOn: false },
];

test('draftFor: 同じキーなら下書き、違えば null', () => {
  const items = [{ id: 'a' }];
  assert.equal(m.draftFor({ key: 'A', items }, 'A'), items);
  assert.equal(m.draftFor({ key: 'A', items }, 'B'), null);
  assert.equal(m.draftFor(null, 'A'), null);
  assert.equal(m.draftFor({ key: undefined, items }, undefined), items);
});

test('normalizeItems: 壊れた保存値は既定へ', () => {
  assert.deepEqual(m.normalizeItems(defs, null), m.defaultLayoutFor(defs));
  assert.deepEqual(m.normalizeItems(defs, 'x'), m.defaultLayoutFor(defs));
});

test('normalizeItems: 未知 id は捨て、重複は最初だけ、足りない id は末尾に既定で足す', () => {
  const r = m.normalizeItems(defs, [{ id: 'zzz' }, { id: 'b', on: true, size: 'W' }, { id: 'b', on: false }, null]);
  assert.deepEqual(r, [
    { id: 'b', on: true, size: 'W' },
    { id: 'a', on: true, size: 'M' },
  ]);
});

test('normalizeItems: 選べないサイズは近いものへ、旧 w も読む、on が真偽値でなければ既定', () => {
  const r = m.normalizeItems(defs, [{ id: 'a', on: 'yes', size: 'L' }, { id: 'b', w: 8 }]);
  assert.deepEqual(r, [
    { id: 'a', on: true, size: 'M' },
    { id: 'b', on: false, size: 'L' },
  ]);
});

test('並べ替え・サイズ送り・外す・追加', () => {
  const base = [
    { id: 'a', on: true, size: 'S' },
    { id: 'b', on: true, size: 'M' },
    { id: 'c', on: false, size: 'M' },
  ];
  assert.deepEqual(m.reorderItems(base, 'a', 'b').map((i) => i.id), ['b', 'a', 'c']);
  assert.equal(m.cycleItemSize(base, 'a', defs)[0].size, 'M');
  assert.equal(m.cycleItemSize(m.cycleItemSize(base, 'a', defs), 'a', defs)[0].size, 'S');
  assert.equal(m.removeItem(base, 'a')[0].on, false);
  assert.deepEqual(m.appendItem(base, 'c').map((i) => i.id), ['a', 'b', 'c']);
  assert.equal(m.appendItem(base, 'c')[2].on, true);
});

test('sizeClassFor: S/M=2段・L=4段・W は rows で 1/2 段（既定 1）', () => {
  assert.match(m.sizeClassFor('S'), /row-span-2/);
  assert.match(m.sizeClassFor('M', 1), /row-span-2/);
  assert.match(m.sizeClassFor('L'), /row-span-4/);
  assert.match(m.sizeClassFor('W'), /row-span-1/);
  assert.match(m.sizeClassFor('W', 2), /row-span-2/);
  assert.equal(m.WIDGET_ROW_HEIGHT_PX * 2 + m.WIDGET_GRID_GAP_PX, 220);
  assert.equal(m.WIDGET_ROW_HEIGHT_PX * 4 + m.WIDGET_GRID_GAP_PX * 3, 456);
});

test('normalizeItems: rows は定義側の属性で保存値には入らない', () => {
  const d = [{ id: 'w', title: 'W', sizes: ['W'], defaultSize: 'W', defaultOn: true, rows: 2 }];
  assert.deepEqual(m.normalizeItems(d, null), [{ id: 'w', on: true, size: 'W' }]);
});

test('emptyLayoutFor: 全 id が on:false で、normalizeItems を通しても空のまま（[] と違い既定に膨らまない）', () => {
  const empty = m.emptyLayoutFor(defs);
  assert.deepEqual(empty, [
    { id: 'a', on: false, size: 'M' },
    { id: 'b', on: false, size: 'L' },
  ]);
  assert.deepEqual(m.normalizeItems(defs, empty), empty);
  assert.deepEqual(m.normalizeItems(defs, JSON.parse(JSON.stringify(empty))), empty);
  // 参考: [] は既定に膨らむ
  assert.deepEqual(m.normalizeItems(defs, []), m.defaultLayoutFor(defs));
});

test('全 off ↔ おすすめ の往復で defaultOn の意味は変わらない', () => {
  const rec = m.recommendedLayoutFor(defs);
  assert.deepEqual(rec, m.defaultLayoutFor(defs));
  assert.deepEqual(m.visibleItems(rec).map((i) => i.id), ['a']);
  // 空 → 1 つ追加 → 外して空に戻る
  const one = m.appendItem(m.emptyLayoutFor(defs), 'b');
  assert.deepEqual(m.visibleItems(one).map((i) => i.id), ['b']);
  assert.deepEqual(m.visibleItems(m.removeItem(one, 'b')), []);
});

test('hasShownItems: 権限で隠すものは数えない（全部隠れなら空扱い）', () => {
  const rec = m.recommendedLayoutFor(defs);
  assert.equal(m.hasShownItems(rec), true);
  assert.equal(m.hasShownItems(rec, new Set(['a'])), false);
  assert.equal(m.hasShownItems(m.emptyLayoutFor(defs)), false);
});

test('複数選択: 切り替え・ロック候補は選べない・確定は候補順で選べるものだけ', () => {
  const cands = [{ id: 'x' }, { id: 'lock', disabled: true }, { id: 'y' }];
  let sel = [];
  sel = m.toggleSelected(sel, cands, 'y');
  sel = m.toggleSelected(sel, cands, 'lock');
  sel = m.toggleSelected(sel, cands, 'nope');
  sel = m.toggleSelected(sel, cands, 'x');
  assert.deepEqual(sel, ['y', 'x']);
  assert.deepEqual(m.toggleSelected(sel, cands, 'y'), ['x']);
  assert.deepEqual(m.confirmedSelection(sel, cands), ['x', 'y']);
  // 後からロックされた候補は確定時に落ちる
  assert.deepEqual(m.confirmedSelection(['x', 'y'], [{ id: 'x' }, { id: 'y', disabled: true }]), ['x']);
});

test('複数選択: 追加済み(added)は選べず、確定からも落ちる', () => {
  const cands = [{ id: 'x' }, { id: 'done', added: true }, { id: 'y' }];
  assert.deepEqual(m.toggleSelected([], cands, 'done'), []);
  assert.deepEqual(m.toggleSelected(['x'], cands, 'done'), ['x']);
  assert.deepEqual(m.confirmedSelection(['x', 'done', 'y'], cands), ['x', 'y']);
  assert.deepEqual(m.confirmedSelection(['y'], [{ id: 'y', added: true }]), []);
});

test('DashboardStarter: 文言・2 つのボタン・おすすめチップを描く', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const ui = await import('../dist/dashboard-kit/ui.js');
  const html = renderToStaticMarkup(
    createElement(ui.DashboardStarter, {
      recommendedTitles: ['業績', '売れ筋'],
      onRecommend() {},
      onPick() {},
      className: 'c', iconClassName: 'i', primaryClassName: 'p', secondaryClassName: 's', chipClassName: 'chip',
    }),
  );
  for (const t of ['ダッシュボードを作りましょう', 'おすすめをまとめて入れる', '自分で選ぶ', '業績', '売れ筋']) assert.ok(html.includes(t), t);
});
