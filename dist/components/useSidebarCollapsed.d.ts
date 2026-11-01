import { type SetStateAction, type PointerEvent as ReactPointerEvent, type FocusEvent as ReactFocusEvent } from 'react';
/** 既定の保存キー（Smologi / Seller と同じ値。アプリごとに分けたいときは options.storageKey）。 */
export declare const DEFAULT_SIDEBAR_STORAGE_KEY = "handy-sidebar-collapsed-v1";
export declare const SIDEBAR_TOGGLE_INSET = "3.5rem";
export declare function useSidebarCollapsed(expandedWidth?: string, collapsedWidth?: string, options?: {
    storageKey?: string;
    syncDockInset?: boolean;
}): {
    collapsed: boolean;
    persistedCollapsed: boolean;
    peeking: boolean;
    widthMotionClass: string;
    setCollapsed: (next: SetStateAction<boolean>) => void;
    openPeek: () => void;
    edgeTriggerHandlers: {
        onPointerEnter: () => void;
        onFocus: () => void;
        'data-sidebar-peek-region': string;
    };
    peekHandlers: {
        onPointerEnter: (event: ReactPointerEvent<HTMLElement>) => void;
        onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => void;
        onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
        onMouseEnter: () => void;
        onMouseLeave: () => void;
        onMouseDown: () => void;
        onFocus: () => void;
        onBlur: (event: ReactFocusEvent<HTMLElement>) => void;
        'data-sidebar-peek-region': string;
    };
};
//# sourceMappingURL=useSidebarCollapsed.d.ts.map