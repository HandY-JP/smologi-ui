import { describe, expect, it, vi } from 'vitest';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  DeliveryHistoryTable, IntegrationAlert, IntegrationHeader, OutOfScopeList, ProcessToggleList,
  ProviderPicker, ShopCardList, StatusTileGrid,
} from '../src/components/integration';
import type { DeliveryHistoryRow, IntegrationProviderMeta } from '../src/components/integration';

const amazon: IntegrationProviderMeta = { id: 'amazon', label: 'Amazon', logoText: 'a', accentVar: '--brand-amazon' };
const rakuten: IntegrationProviderMeta = { id: 'rakuten', label: '楽天市場', logoText: 'R', accentVar: '--brand-rakuten' };
const r = (x: ReturnType<typeof h>) => renderToStaticMarkup(x);

describe('integration kit', () => {
  it('ヘッダー: 名前・状態ピル・説明・操作枠・accentVar', () => {
    const html = r(h(IntegrationHeader, { meta: amazon, statusLabel: '接続済み', statusTone: 'ok', description: '説明文', actions: h('button', null, '開く') }));
    expect(html).toContain('Amazon');
    expect(html).toContain('接続済み');
    expect(html).toContain('説明文');
    expect(html).toContain('<button>開く</button>');
    expect(html).toContain('var(--brand-amazon');
  });

  it('タイル: tone ごとのクラスと lastSuccessAt', () => {
    const html = r(h(StatusTileGrid, { tiles: [
      { label: 'a', tone: 'ok', value: '正常' },
      { label: 'b', tone: 'warn', value: '注意' },
      { label: 'c', tone: 'bad', value: '失敗中', lastSuccessAt: '10/31 23:35' },
      { label: 'd', tone: 'off', value: '未使用', sub: 'メモ' },
    ] }));
    for (const t of ['ok', 'warn', 'bad', 'off']) expect(html).toContain(`sb-int-tile--${t}`);
    expect(html).toContain('最終成功 10/31 23:35');
    expect(html).toContain('メモ');
  });

  it('アラート: tone クラスと対処ボタン', () => {
    const html = r(h(IntegrationAlert, { tone: 'warn', actionLabel: '入れ替える', onAction: vi.fn() }, '期限が近い'));
    expect(html).toContain('sb-int-alert--warn');
    expect(html).toContain('入れ替える');
    expect(html).not.toContain('role="alert"');
    expect(r(h(IntegrationAlert, { tone: 'bad' }, 'x'))).toContain('role="alert"');
  });

  it('トグル一覧: readOnly の行にスイッチが無い', () => {
    const html = r(h(ProcessToggleList, { onToggle: vi.fn(), items: [
      { id: 'a', label: '送り状', checked: true },
      { id: 'b', label: '取り込み', checked: false, readOnly: true },
      { id: 'c', label: '保存中の行', checked: true, saving: true },
    ] }));
    expect((html.match(/role="switch"/g) ?? []).length).toBe(2);
    expect(html).toContain('常に行います');
    expect(html).not.toContain('aria-label="取り込み"');
    expect(html).toContain('disabled=""');
  });

  const rows: DeliveryHistoryRow[] = [
    { id: '1', at: '11/02', ref: 'AAA', trackingNo: '111', destination: 'Amazon', result: 'ok', resultLabel: '反映済み' },
    { id: '2', at: '11/02', ref: 'BBB', trackingNo: '222', destination: 'Amazon', result: 'bad', resultLabel: '失敗', error: '一致しません' },
  ];

  it('履歴表: 既定は全行、失敗だけで失敗行のみ、再送ボタンは失敗行だけ', () => {
    const all = r(h(DeliveryHistoryTable, { rows, onResend: vi.fn(), onResendAll: vi.fn() }));
    expect(all).toContain('AAA');
    expect(all).toContain('BBB');
    expect((all.match(/>再送</g) ?? []).length).toBe(1);
    expect(all).toContain('失敗をまとめて再送');
    expect(all).toContain('overflow-x-auto');
    const only = r(h(DeliveryHistoryTable, { rows, defaultFailedOnly: true }));
    expect(only).not.toContain('AAA');
    expect(only).toContain('BBB');
    expect(only).toContain('一致しません');
    expect(r(h(DeliveryHistoryTable, { rows, failedOnly: false, defaultFailedOnly: true }))).toContain('AAA');
  });

  it('対象外リスト・ショップ一覧（印は 3 つまで）', () => {
    expect(r(h(OutOfScopeList, { items: ['在庫の反映'] }))).toContain('在庫の反映');
    const marks = ['m1', 'm2', 'm3', 'm4'].map((label) => ({ label, tone: 'ok' as const }));
    const html = r(h(ShopCardList, { shops: [{ id: 's', meta: rakuten, name: '楽天店', marks }] }));
    expect(html).toContain('m3');
    expect(html).not.toContain('m4');
    expect(r(h(ShopCardList, { shops: [] }))).toContain('まだお店がありません');
  });

  it('ProviderPicker: comingSoon は押せない', () => {
    const html = r(h(ProviderPicker, { onSelect: vi.fn(), providers: [
      { meta: amazon },
      { meta: rakuten, comingSoon: true },
    ] }));
    const buttons = html.match(/<button[^>]*>/g) ?? [];
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).not.toMatch(/\sdisabled(=|\s|>)/);
    expect(buttons[1]).toMatch(/\sdisabled(=|\s|>)/);
    expect(html).toContain('準備中');
  });
});
