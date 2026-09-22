/**
 * サイドバー開閉ドックのアプリ切替ボタン用アイコン（3x3ドットのグリッド）。
 *
 * 元は logistics/ContractedAppsLauncher.tsx にあったが、layout/SidebarToggleDock が
 * logistics 層から借りているのはこのアイコンだけだったため、#455 レビューで layout 層へ
 * 移設して層またぎの依存を1つ減らしてある（ContractedAppsPopover 本体は引き続き logistics 側）。
 */
export declare function AppSwitcherIcon({ className }: {
    className?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=AppSwitcherIcon.d.ts.map