'use client';

import { useState } from 'react';
import { SETTINGS_GHOST_BUTTON_CLASS } from '../SettingsRow';
import { TonePill } from '../TonePill';
import type { DeliveryHistoryRow } from './types';

const HEADS = ['送った時刻', '注文・納品番号', '送り状番号', '送り先', '結果'];

/**
 * 送信履歴の表。「失敗だけ」切替（controlled にも uncontrolled にもできる）と、再送・まとめて再送。
 * 表は横スクロール枠に入れる（スマホで崩れない）。
 */
export function DeliveryHistoryTable({
  rows,
  failedOnly,
  defaultFailedOnly = false,
  onFailedOnlyChange,
  onResend,
  onResendAll,
  resendingIds = [],
  emptyText = '送信履歴はまだありません。',
}: {
  rows: DeliveryHistoryRow[];
  failedOnly?: boolean;
  defaultFailedOnly?: boolean;
  onFailedOnlyChange?: (next: boolean) => void;
  onResend?: (id: string) => void;
  onResendAll?: () => void;
  resendingIds?: string[];
  emptyText?: string;
}) {
  const [inner, setInner] = useState(defaultFailedOnly);
  const only = failedOnly ?? inner;
  const setOnly = (next: boolean) => {
    if (failedOnly === undefined) setInner(next);
    onFailedOnlyChange?.(next);
  };
  const failCount = rows.filter((r) => r.result === 'bad').length;
  const shown = only ? rows.filter((r) => r.result === 'bad') : rows;

  return (
    <div className="sb-int">
      <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
        <button type="button" aria-pressed={!only} className="sb-int-filter" onClick={() => setOnly(false)}>
          すべて
        </button>
        <button type="button" aria-pressed={only} className="sb-int-filter" onClick={() => setOnly(true)}>
          失敗だけ{failCount > 0 ? `（${failCount}）` : ''}
        </button>
        {failCount > 0 && onResendAll && (
          <button type="button" onClick={onResendAll} className={`${SETTINGS_GHOST_BUTTON_CLASS} ml-auto !h-7 !px-2.5 !text-[12px] leading-[18px]`}>
            失敗をまとめて再送
          </button>
        )}
      </div>
      <div className="sb-int-table-wrap overflow-x-auto rounded-[10px]">
        <table className="w-full min-w-[620px] border-collapse text-[13px] leading-[20px]">
          <thead>
            <tr>
              {HEADS.map((h) => (
                <th key={h} scope="col" className="sb-int-th px-3 py-2 text-left text-[12px] leading-[18px] font-medium">{h}</th>
              ))}
              <th className="sb-int-th w-px px-3 py-2"><span className="sr-only">操作</span></th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={6} className="sb-int-muted sb-int-td px-3 py-4 text-center">{emptyText}</td></tr>
            )}
            {shown.map((r) => (
              <tr key={r.id}>
                <td className="sb-int-td px-3 py-2 align-top tabular-nums">{r.at}</td>
                <td className="sb-int-td px-3 py-2 align-top tabular-nums">{r.ref}</td>
                <td className="sb-int-td px-3 py-2 align-top tabular-nums">{r.trackingNo}</td>
                <td className="sb-int-td px-3 py-2 align-top">{r.destination}</td>
                <td className="sb-int-td px-3 py-2 align-top">
                  <TonePill tone={r.result === 'ok' ? 'ok' : r.result === 'bad' ? 'bad' : 'warn'}>{r.resultLabel}</TonePill>
                  {r.error && <div className="sb-int-bad-text mt-1 text-[12px] leading-[18px]">{r.error}</div>}
                </td>
                <td className="sb-int-td px-3 py-2 align-top">
                  {r.result === 'bad' && onResend && (
                    <button
                      type="button"
                      disabled={resendingIds.includes(r.id)}
                      onClick={() => onResend(r.id)}
                      className={`${SETTINGS_GHOST_BUTTON_CLASS} !h-7 !px-2.5 !text-[12px] leading-[18px]`}
                    >
                      再送
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
