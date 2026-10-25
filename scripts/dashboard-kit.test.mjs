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
