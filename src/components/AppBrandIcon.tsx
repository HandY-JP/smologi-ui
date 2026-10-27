// Smologi / Seller 向けのアプリブランドロゴタイル（このパッケージが正典）。
// ポータルの `src/components/ui/AppBrandLogos.tsx` が元（ポータルのロゴ追加・変更はまずそちら）で、
// Smologi / Seller 系アプリはこのパッケージの AppBrandIcon を使う（アプリ側にコピーを持たない）。
// ポータル未定義の appId（'smologi-b2b' / 'portal'）の分はここで持つ。
//
// 画像（*-logo-transparent-512.png）はパッケージに含めない。各アプリの public/brand に置き、
// AppBrandIcon の assetBase（既定 '/brand'）で参照元を差し替える。
//
// Smologi ファミリーアプリのブランドロゴタイル。
// 各アプリ固有のグラデーション背景＋リキッドガラス質感＋ホワイトグリフで構成する。

type LogoProps = { className?: string; assetBase: string };

const TILE_RADIUS = 12; // viewBox 48 基準 (=25%)

function Tile({
  id,
  from,
  to,
  rim = 'rgba(255,255,255,0.28)',
  children,
  className,
}: {
  id: string;
  from: string;
  to: string;
  rim?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const gradId = `appTileGrad-${id}`;
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx={TILE_RADIUS} fill={`url(#${gradId})`} />
      {/* リキッドガラスの天面ハイライト */}
      <path d="M0 0h48v14.5c-15.5 5.5-32.5 5.5-48 0Z" fill="#fff" opacity="0.14" />
      {children}
      {/* ガラスのリム */}
      <rect x="0.75" y="0.75" width="46.5" height="46.5" rx={TILE_RADIUS - 0.75} fill="none" stroke={rim} strokeWidth="1.5" />
    </svg>
  );
}

/** Smologi 本体: ライトグラスタイル＋ブランドキューブロゴ */
function SmologiBrandLogo({ className, assetBase }: LogoProps) {
  return (
    <Tile id="smologi" from="#ffffff" to="#dbeafe" rim="rgba(147,197,253,0.45)" className={className}>
      <image href={`${assetBase}/smologi-logo-transparent-512.png`} x="9" y="9" width="30" height="30" />
    </Tile>
  );
}

/** Smologi Client: エメラルド系の色違いタイル＋ブランドキューブロゴ */
function SmologiClientBrandLogo({ className, assetBase }: LogoProps) {
  return (
    <Tile id="smologi-client" from="#ecfdf5" to="#5eead4" rim="rgba(45,212,191,0.45)" className={className}>
      <image href={`${assetBase}/smologi-logo-transparent-512.png`} x="9" y="9" width="30" height="30" />
    </Tile>
  );
}

/** Portal（ハンディポータル）: 白タイル＋スレートのリム＋ポータルの新マーク（スレート2トーンのキューブ） */
function PortalBrandLogo({ className, assetBase }: LogoProps) {
  return (
    <Tile id="portal" from="#ffffff" to="#f1f5f9" rim="rgba(100,116,139,0.45)" className={className}>
      <image href={`${assetBase}/portal-logo-transparent-512.png`} x="9" y="9" width="30" height="30" />
    </Tile>
  );
}

/** Seller (Amazon 管理): ホワイトグラスタイル＋オレンジのブランドキューブ
 *  2026-08-31: amazon-app 側でアイコンがオレンジ2トーンのキューブに刷新されたため、
 *  旧「縞オーニングの店構え」SVG からアセット参照へ差し替え。ランチャーに並んだときに
 *  amazon-app 本体と同じ絵にする（タイルの地・角丸・寸法は他アプリと共通のまま）。
 *  ※ ポータル（AppBrandLogos.tsx）にも同じ差し替えを入れること（このファイルは一方向コピー）。 */
function SellerBrandLogo({ className, assetBase }: LogoProps) {
  return (
    <Tile id="seller" from="#ffffff" to="#ffedd5" rim="rgba(251,146,60,0.45)" className={className}>
      <image href={`${assetBase}/seller-logo-transparent-512.png`} x="9" y="9" width="30" height="30" />
    </Tile>
  );
}

/** Ads (Amazon広告調整): ブラック＋オレンジの上昇バーチャート＋トレンド矢印 */
function AdsBrandLogo({ className }: LogoProps) {
  return (
    <Tile id="ads" from="#26221c" to="#050505" rim="rgba(251,146,60,0.4)" className={className}>
      <defs>
        <linearGradient id="appTileGlyph-ads" x1="0" y1="39" x2="0" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c2410c" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      {/* 上昇するバーチャート */}
      <rect x="10" y="28" width="7" height="11" rx="1.8" fill="url(#appTileGlyph-ads)" opacity="0.75" />
      <rect x="20" y="22" width="7" height="17" rx="1.8" fill="url(#appTileGlyph-ads)" opacity="0.88" />
      <rect x="30" y="15" width="7" height="24" rx="1.8" fill="url(#appTileGlyph-ads)" />
      {/* トレンドライン＋矢印 */}
      <path
        d="M11 24.5L24 17l13.5-7.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31.5 8.2l6-.7-.2 6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Tile>
  );
}

/** Mobile (スマホ現場アプリ・PWA): スカイ→ブルー、スマートフォンのシンプル線画（ヘッダーの MobilePhoneIcon と同形） */
function MobileBrandLogo({ className }: LogoProps) {
  return (
    <Tile id="mobile" from="#38bdf8" to="#1e40af" className={className}>
      <g transform="translate(7.2 7.2) scale(1.4)" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </g>
    </Tile>
  );
}

/** Tasks (タスク管理): クリムゾンレッド、クリップボード×チェックのシンプル線画（ナビの TaskIcon と同形） */
function TasksBrandLogo({ className }: LogoProps) {
  return (
    <Tile id="tasks" from="#ef4444" to="#991b1b" className={className}>
      <g transform="translate(7.2 7.2) scale(1.4)" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </g>
    </Tile>
  );
}

// PageOne AI のタイル定義は 2026-09-23 に撤去（ポータルから PageOne を抹消する決定に合わせ、
// smologi 側の契約アプリランチャー＝ContractedAppsLauncher からも外す）。
// AppBrandIcon の呼び出し元はこの ContractedAppsLauncher 1箇所だけなので、他所への影響なし。

/**
 * POIZON: ダークバイオレットタイル＋ブランドキューブロゴの紫ネオン版。
 * 2026-09-23: 旧スニーカーの線画から、他アプリと同じ Tile+PNG 方式（キューブの紫ネオン版）へ差し替え。
 * 発光の雰囲気は `appTileGlow-poizon` フィルタでぼかしたコピーを下に敷いて残す。
 * 素材 `/brand/poizon-logo-transparent-512.png` はスモロジのキューブPNGを紫ネオン2トーンへ差し替えたもの。
 */
function PoizonBrandLogo({ className, assetBase }: LogoProps) {
  return (
    <Tile id="poizon" from="#2e1065" to="#0c0618" rim="rgba(192,132,252,0.35)" className={className}>
      <defs>
        <filter id="appTileGlow-poizon" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <image href={`${assetBase}/poizon-logo-transparent-512.png`} x="9" y="9" width="30" height="30" opacity="0.85" filter="url(#appTileGlow-poizon)" />
      <image href={`${assetBase}/poizon-logo-transparent-512.png`} x="9" y="9" width="30" height="30" />
    </Tile>
  );
}

/**
 * スモロジ側だけの追加（ポータル未定義）。
 * ランチャーが持つ appId 'smologi-b2b' 用のタイル。ポータルには専用ロゴがなく
 * DefaultBrandLogo のグリッドにフォールバックしてしまうため、
 * B2B のブランドキューブ（バイオレット版）を他アプリと同じ Tile+PNG 方式で描く。
 * 素材 `/brand/b2b-logo-transparent-512.png` は smologi-b2b リポジトリの
 * 公開ロゴ（スモロジ青キューブのバイオレット版）と同一。
 */
function SmologiB2BBrandLogo({ className, assetBase }: LogoProps) {
  return (
    <Tile id="smologi-b2b" from="#ffffff" to="#ede9fe" rim="rgba(139,92,246,0.45)" className={className}>
      <image href={`${assetBase}/b2b-logo-transparent-512.png`} x="9" y="9" width="30" height="30" />
    </Tile>
  );
}

/** フォールバック: スレートタイル＋グリッド */
function DefaultBrandLogo({ className }: LogoProps) {
  return (
    <Tile id="default" from="#64748b" to="#334155" className={className}>
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={12 + col * 9}
            y={12 + row * 9}
            width="6"
            height="6"
            rx="1.6"
            fill="#fff"
            opacity={row === 1 && col === 1 ? 1 : 0.7}
          />
        )),
      )}
    </Tile>
  );
}

/** アプリID→ブランドロゴのマッピング（ポータルの AppBrandLogo と同一＋ 'portal' / 'smologi-b2b'）。 */
export function AppBrandIcon({
  appId,
  className,
  assetBase = '/brand',
}: {
  appId: string;
  className?: string;
  /** ロゴ画像（*-logo-transparent-512.png）の置き場所。アプリの public/brand を指す。末尾の / は付けない。 */
  assetBase?: string;
}) {
  const p = { className, assetBase };
  if (appId === 'smologi') return <SmologiBrandLogo {...p} />;
  if (appId === 'smologi-client') return <SmologiClientBrandLogo {...p} />;
  if (appId === 'portal') return <PortalBrandLogo {...p} />;
  if (appId === 'amazon') return <SellerBrandLogo {...p} />;
  if (appId === 'amazon-ads') return <AdsBrandLogo {...p} />;
  if (appId === 'smologi-mobile' || appId === 'mobile-app') return <MobileBrandLogo {...p} />;
  if (appId === 'tasks') return <TasksBrandLogo {...p} />;
  // PageOne（page-creation）はポータルから抹消済み（2026-09-23）。フォールバックに委ねる。
  if (appId === 'poizon') return <PoizonBrandLogo {...p} />;
  if (appId === 'smologi-b2b') return <SmologiB2BBrandLogo {...p} />;
  return <DefaultBrandLogo {...p} />;
}
