/**
 * サイドバー開閉ドックのアプリ切替ボタン用アイコン（3x3ドットのグリッド）。
 *
 * 元は logistics/ContractedAppsLauncher.tsx にあったが、layout/SidebarToggleDock が
 * logistics 層から借りているのはこのアイコンだけだったため、#455 レビューで layout 層へ
 * 移設して層またぎの依存を1つ減らしてある（ContractedAppsPopover 本体は引き続き logistics 側）。
 */
export function AppSwitcherIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <circle cx="5" cy="5" r="1.6" /><circle cx="12" cy="5" r="1.6" /><circle cx="19" cy="5" r="1.6" />
      <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
      <circle cx="5" cy="19" r="1.6" /><circle cx="12" cy="19" r="1.6" /><circle cx="19" cy="19" r="1.6" />
    </svg>
  );
}
