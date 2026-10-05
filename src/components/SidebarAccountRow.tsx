'use client';

import type { CSSProperties, ReactNode } from 'react';

// 歯車アイコン（heroicons outline の cog）。
const GEAR_ICON_PATH_1 =
  'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z';
const GEAR_ICON_PATH_2 = 'M15 12a3 3 0 11-6 0 3 3 0 016 0z';

/** アバター（画像があれば丸い <img>、無ければ名前の頭文字の灰色丸）。SidebarAccountRow の avatar に渡す。 */
export function SidebarAccountAvatar({ src, name }: { src?: string | null; name?: string | null }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name ?? ''} className="h-7 w-7 flex-shrink-0 rounded-full object-cover" />
  ) : (
    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-600 text-xs font-medium text-white">
      {name?.[0] ?? '?'}
    </span>
  );
}

/** renderName に渡す、名前ボタン（または Link）へ付けるべき属性一式。 */
export type SidebarAccountNameProps = {
  className: string;
  style: CSSProperties;
  title: string;
  'aria-current'?: 'page';
  children: ReactNode;
};

/**
 * サイドバー下部のアカウント行（アバター＋名前＋歯車）。smologi の SidebarAccountMenu の
 * 「行の見た目」だけを純 UI 化したもの（ルーティング・セッション・設定モード判定は呼び出し側）。
 *
 * - 名前側: 既定は <button onClick={onNameClick}>。Link にしたいときは renderName で
 *   渡された属性を <Link> に付けて返す（その場合 onNameClick は使われない）。
 * - 歯車: onGear があり、かつ collapsed でないときだけ出す。gearActive で点灯（.sb-nav-round-active、
 *   aria-pressed）。extraActions は歯車の**左**に並べる（b2b のテーマ切替アイコンなど）。
 * - collapsed: アバターだけ（歯車・名前・extraActions は出さない）。
 * - subText: 名前の下に小さく補助行を出す。省略時は従来どおり 1 行（高さ h-9 のまま）。
 */
export function SidebarAccountRow({
  avatar,
  name,
  subText,
  onNameClick,
  renderName,
  nameActive = false,
  nameTitle = 'アカウント設定を開く',
  onGear,
  gearActive = false,
  gearLabel,
  gearTitle,
  gearDataTour,
  extraActions,
  collapsed = false,
}: {
  avatar: ReactNode;
  name: ReactNode;
  subText?: ReactNode;
  onNameClick?: () => void;
  renderName?: (props: SidebarAccountNameProps) => ReactNode;
  /** 名前側が「いま開いているページ」のとき true（aria-current="page"）。 */
  nameActive?: boolean;
  nameTitle?: string;
  onGear?: () => void;
  /** 歯車の点灯（設定モード中）。aria-pressed にもなる。 */
  gearActive?: boolean;
  /** 歯車の aria-label。既定は gearActive ? '設定を閉じる' : '設定を開く'。 */
  gearLabel?: string;
  /** 歯車の title。既定は gearActive ? '設定を閉じる' : '設定'。 */
  gearTitle?: string;
  /** 歯車へ付ける data-tour 値（ガイドツアー用）。 */
  gearDataTour?: string;
  /** 歯車の左に置く追加アイコン（折りたたみ中は出さない）。 */
  extraActions?: ReactNode;
  collapsed?: boolean;
}) {
  const nameProps: SidebarAccountNameProps = {
    title: nameTitle,
    'aria-current': nameActive ? 'page' : undefined,
    className: `flex h-9 min-w-0 items-center rounded-md transition-colors hover:bg-[var(--sb-hover)] ${
      collapsed ? 'flex-shrink-0 justify-center px-1.5' : 'flex-1 gap-2 px-2'
    } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--sb-text)]`,
    style: { color: 'var(--sb-text)' },
    children: (
      <>
        {avatar}
        {!collapsed && (
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-base">{name}</span>
            {subText != null && <span className="block truncate text-xs" style={{ color: 'var(--sb-label)' }}>{subText}</span>}
          </span>
        )}
      </>
    ),
  };

  return (
    <div className={`flex h-9 w-full items-center rounded-md ${collapsed ? 'justify-center' : 'gap-0.5'}`}>
      {renderName ? renderName(nameProps) : <button type="button" onClick={onNameClick} {...nameProps} />}
      {!collapsed && extraActions}
      {!collapsed && onGear && (
        <button
          type="button"
          onClick={onGear}
          // 「押すと画面が切り替わるボタン」なので、メニューの aria ではなく aria-pressed で状態を伝える。
          aria-pressed={gearActive}
          aria-label={gearLabel ?? (gearActive ? '設定を閉じる' : '設定を開く')}
          title={gearTitle ?? (gearActive ? '設定を閉じる' : '設定')}
          data-tour={gearDataTour}
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--sb-text)] ${
            gearActive ? 'sb-nav-round-active' : 'hover:bg-[var(--sb-hover)]'
          }`}
          style={gearActive ? undefined : { color: 'var(--sb-text)' }}
        >
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={GEAR_ICON_PATH_1} />
            <path strokeLinecap="round" strokeLinejoin="round" d={GEAR_ICON_PATH_2} />
          </svg>
        </button>
      )}
    </div>
  );
}
