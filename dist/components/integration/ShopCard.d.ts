import type { ReactNode } from 'react';
import type { ShopCardModel } from './types';
/** つないでいるお店 1 件。右端の操作（編集・設定へなど）は action で渡す。 */
export declare function ShopCard({ shop, action }: {
    shop: ShopCardModel;
    action?: ReactNode;
}): import("react").JSX.Element;
export declare function ShopCardList({ shops, renderAction, emptyText, }: {
    shops: ShopCardModel[];
    renderAction?: (shop: ShopCardModel) => ReactNode;
    emptyText?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=ShopCard.d.ts.map