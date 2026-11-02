import type { ReactNode } from 'react';
import type { IntegrationTone } from './types';
/** 要対応の帯。文と、対処ボタン 1 つ。bad=赤 / warn=琥珀（ok・off は淡い灰）。 */
export declare function IntegrationAlert({ tone, children, actionLabel, onAction, actionBusy, }: {
    tone?: IntegrationTone;
    children: ReactNode;
    actionLabel?: string;
    onAction?: () => void;
    actionBusy?: boolean;
}): import("react").JSX.Element;
//# sourceMappingURL=IntegrationAlert.d.ts.map