'use client';

import { IntegrationLogo } from './IntegrationHeader';
import type { ProviderPickerItem } from './types';

/**
 * 連携先の選択一覧。外枠は既存の Modal の children に入れて使う。
 * comingSoon の項目は押せない（disabled・「準備中」）。
 */
export function ProviderPicker({
  providers,
  onSelect,
}: {
  providers: ProviderPickerItem[];
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="sb-int m-0 grid list-none gap-2 p-0">
      {providers.map(({ meta, description, comingSoon }) => (
        <li key={meta.id}>
          <button
            type="button"
            disabled={comingSoon}
            aria-disabled={comingSoon || undefined}
            onClick={() => {
              if (!comingSoon) onSelect(meta.id);
            }}
            className="sb-int-card sb-int-pick flex w-full items-center gap-3 rounded-[10px] px-3.5 py-3 text-left disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IntegrationLogo meta={meta} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{meta.label}</span>
              {description && <span className="sb-int-muted block text-xs">{description}</span>}
            </span>
            {comingSoon && <span className="sb-int-chip flex-none">準備中</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}
