// 列見出しメニューの純関数（dist を対象。`npm run build` の後に `npm test`）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../dist/lib/column-header.js';

test('nextColumnSortDir: 1回目→逆順→解除', () => {
  assert.equal(m.nextColumnSortDir({ dir: null }), 'asc');
  assert.equal(m.nextColumnSortDir({ dir: 'asc' }), 'desc');
  assert.equal(m.nextColumnSortDir({ dir: 'desc' }), null);
  assert.equal(m.nextColumnSortDir({ dir: null, firstDir: 'desc' }), 'desc');
  assert.equal(m.nextColumnSortDir({ dir: 'desc', firstDir: 'desc' }), 'asc');
  assert.equal(m.nextColumnSortDir({ dir: 'asc', firstDir: 'desc' }), null);
});

test('nextColumnSortDir: 片方の向きしか無い列は その向き ↔ 解除', () => {
  assert.equal(m.nextColumnSortDir({ dir: null, available: ['desc'] }), 'desc');
  assert.equal(m.nextColumnSortDir({ dir: null, firstDir: 'asc', available: ['desc'] }), 'desc');
  assert.equal(m.nextColumnSortDir({ dir: 'desc', available: ['desc'] }), null);
  assert.deepEqual(m.availableColumnSortDirs({ available: [] }), ['asc', 'desc']);
});

test('isColumnFilterActive / clearColumnFilter', () => {
  const calls = [];
  const filters = [
    { kind: 'text', value: ' a ', onChange: (v) => calls.push(v) },
    { kind: 'numberRange', min: '', max: '5', onChange: (v) => calls.push(v) },
    { kind: 'enum', options: [], value: ['x'], onChange: (v) => calls.push(v) },
    { kind: 'boolean', value: false, trueLabel: 'はい', onChange: (v) => calls.push(v) },
    { kind: 'dateRange', from: '2026-01-01', to: '', onChange: (v) => calls.push(v) },
  ];
  assert.ok(filters.every(m.isColumnFilterActive));
  filters.forEach(m.clearColumnFilter);
  assert.deepEqual(calls, ['', { min: '', max: '' }, [], null, { from: '', to: '' }]);
  assert.equal(m.isColumnFilterActive({ kind: 'boolean', value: null, trueLabel: 'x', onChange() {} }), false);
  assert.equal(m.anyColumnFilterActive(undefined), false);
});

test('数値入力の正規化と範囲エラー', () => {
  assert.equal(m.normalizeColumnNumberInput('１,２００円'), '1200');
  assert.equal(m.normalizeColumnNumberInput('1.5'), '1');
  assert.equal(m.normalizeColumnNumberInput('1.5', true), '1.5');
  assert.equal(m.normalizeColumnNumberInput(''), '');
  assert.equal(m.columnNumberRangeError('10', '2'), '下限が上限より大きくなっています');
  assert.equal(m.columnNumberRangeError('2', ''), null);
  assert.equal(m.columnDateRangeError('2026-02-01', '2026-01-01'), '開始日が終了日より後です');
});

test('columnFilterSummary', () => {
  assert.equal(m.columnFilterSummary({ kind: 'numberRange', min: '100', max: '', unit: '¥', onChange() {} }), '¥100以上');
  assert.equal(m.columnFilterSummary({ kind: 'numberRange', min: '1', max: '3', unit: '日', onChange() {} }), '1日〜3日');
  assert.equal(
    m.columnFilterSummary({ kind: 'enum', options: [{ value: 'a', label: 'A' }], value: ['a', 'b'], onChange() {} }),
    'A・b',
  );
  assert.equal(m.columnFilterSummary({ kind: 'text', value: '', onChange() {} }), null);
});

test('単一 enum / フラグの写像', () => {
  assert.deepEqual(m.singleEnumValue(''), []);
  assert.deepEqual(m.singleEnumValue('FBA'), ['FBA']);
  assert.equal(m.singleEnumFromValues([]), '');
  assert.equal(m.singleEnumFromValues(['a', 'b']), 'b');
  assert.equal(m.flagFilterValue(false), null);
  assert.equal(m.flagFromFilterValue(true), true);
  assert.equal(m.flagFromFilterValue(false), false);
});
