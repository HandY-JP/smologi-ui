// computePeriodState / PeriodProgress / SettingsToggle（dist 対象。`npm run build` の後に `npm test`）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { computePeriodState } from '../dist/lib/period.js';
import { PeriodProgress } from '../dist/components/PeriodProgress.js';
import { SettingsToggle } from '../dist/components/SettingsRow.js';

const D = (s) => new Date(s);

test('期間中: あと◯日と進み具合', () => {
  const s = computePeriodState({ start: D('2026-11-01T00:00:00Z'), end: D('2026-11-11T00:00:00Z'), now: D('2026-11-04T00:00:00Z') });
  assert.equal(s.phase, 'active');
  assert.equal(s.daysLeft, 7);
  assert.equal(s.label, 'あと7日');
  assert.ok(Math.abs(s.ratio - 0.3) < 1e-9);
});
test('残り 24 時間未満は本日まで、端数は切り上げ', () => {
  const a = computePeriodState({ start: D('2026-11-01T00:00:00Z'), end: D('2026-11-04T12:00:00Z'), now: D('2026-11-04T00:00:00Z') });
  assert.equal(a.label, '本日まで');
  const b = computePeriodState({ start: D('2026-11-01T00:00:00Z'), end: D('2026-11-08T00:00:00Z'), now: D('2026-11-04T12:00:00Z') });
  assert.equal(b.daysLeft, 4);
});
test('開始前: ◯日後に開始、ratio 0', () => {
  const s = computePeriodState({ start: D('2026-11-10T00:00:00Z'), end: D('2026-11-20T00:00:00Z'), now: D('2026-11-07T06:00:00Z') });
  assert.equal(s.phase, 'upcoming');
  assert.equal(s.label, '3日後に開始');
  assert.equal(s.ratio, 0);
});
test('終了後: 終了、ratio 1。ちょうど終了時刻も終了', () => {
  const s = computePeriodState({ start: D('2026-11-01T00:00:00Z'), end: D('2026-11-05T00:00:00Z'), now: D('2026-11-05T00:00:00Z') });
  assert.equal(s.phase, 'ended');
  assert.equal(s.label, '終了');
  assert.equal(s.ratio, 1);
});
test('終了日なし・不正な日付', () => {
  assert.equal(computePeriodState({ start: D('2026-11-01T00:00:00Z'), now: D('2026-11-02T00:00:00Z') }).label, '終了日なし');
  assert.equal(computePeriodState({ start: 'x', end: null, now: D('2026-11-02T00:00:00Z') }).phase, 'unknown');
});
test('PeriodProgress: progressbar の aria', () => {
  const html = renderToStaticMarkup(h(PeriodProgress, { start: '2026-11-01T00:00:00Z', end: '2026-11-11T00:00:00Z', now: '2026-11-04T00:00:00Z' }));
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuenow="30"/);
  assert.match(html, /あと7日/);
});
test('SettingsToggle: role=switch と aria-checked、生の白指定なし', () => {
  const on = renderToStaticMarkup(h(SettingsToggle, { checked: true, onChange() {}, label: '自動発行' }));
  assert.match(on, /role="switch"/);
  assert.match(on, /aria-checked="true"/);
  assert.match(on, /aria-label="自動発行"/);
  assert.doesNotMatch(on, /#fff/i);
  const off = renderToStaticMarkup(h(SettingsToggle, { checked: false, onChange() {}, label: 'x', disabled: true }));
  assert.match(off, /aria-checked="false"/);
  assert.match(off, /disabled/);
});
