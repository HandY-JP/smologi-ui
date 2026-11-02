import type { ReactNode } from 'react';
import type { IntegrationProviderMeta, IntegrationTone } from './types';
/** 連携先のロゴ（文字の仮置き）。色は accentVar で受ける。 */
export declare function IntegrationLogo({ meta, size }: {
    meta: IntegrationProviderMeta;
    size?: 'sm' | 'lg';
}): import("react").JSX.Element;
/** 連携ページの頭。ロゴ・名前・状態ピル・説明・操作ボタン枠（actions）。 */
export declare function IntegrationHeader({ meta, statusLabel, statusTone, description, actions, }: {
    meta: IntegrationProviderMeta;
    statusLabel?: string;
    statusTone?: IntegrationTone;
    description?: ReactNode;
    actions?: ReactNode;
}): import("react").JSX.Element;
//# sourceMappingURL=IntegrationHeader.d.ts.map