'use client';

import type { ReactNode } from 'react';
import { TonePill } from '../TonePill';
import { IntegrationLogo } from './IntegrationHeader';
import type { ShopCardModel } from './types';

const PILL_TONE = { ok: 'ok', warn: 'warn', bad: 'bad', off: 'mute' } as const;
const MAX_MARKS = 3;

/** つないでいるお店 1 件。右端の操作（編集・設定へなど）は action で渡す。 */
export function ShopCard({ shop, action }: { shop: ShopCardModel; action?: ReactNode }) {
  const marks = (shop.marks ?? []).slice(0, MAX_MARKS);
  return (
    <div className="sb-int sb-int-card flex items-center gap-3 rounded-[10px] px-3.5 py-3">
      <IntegrationLogo meta={shop.meta} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{shop.name}</div>
        {shop.subtitle && <div className="sb-int-muted truncate text-xs">{shop.subtitle}</div>}
        {marks.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {marks.map((m) => (
              <TonePill key={m.label} tone={PILL_TONE[m.tone]}>{m.label}</TonePill>
            ))}
          </div>
        )}
      </div>
      {action && <div className="flex-none">{action}</div>}
    </div>
  );
}

export function ShopCardList({
  shops,
  renderAction,
  emptyText = 'まだお店がありません。',
}: {
  shops: ShopCardModel[];
  renderAction?: (shop: ShopCardModel) => ReactNode;
  emptyText?: string;
}) {
  if (shops.length === 0) return <p className="sb-int sb-int-muted text-[13px]">{emptyText}</p>;
  return (
    <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))' }}>
      {shops.map((s) => (
        <ShopCard key={s.id} shop={s} action={renderAction?.(s)} />
      ))}
    </div>
  );
}
