'use client';
// ダッシュボードが空のときに真ん中へ出す案内カード。
// 「おすすめをまとめて入れる」（既定配置を 1 回で入れる）と「自分で選ぶ」（複数選択シートへ）の 2 つ。
// 色・枠・ボタンの見た目は呼び出し側のクラスで渡す（部品は色を持たない）。
import type { ReactNode } from 'react';

export interface DashboardStarterProps {
  /** 「おすすめ」に入るウィジェット名（チップで並べる）。 */
  recommendedTitles: readonly string[];
  onRecommend: () => void;
  onPick: () => void;
  title?: string;
  description?: string;
  recommendLabel?: string;
  pickLabel?: string;
  /** 押せない間（保存中など）。 */
  busy?: boolean;
  /** 差し替えアイコン（既定はグリッド＋プラス）。 */
  icon?: ReactNode;
  /** カード本体（破線枠・背景・角丸）。 */
  className: string;
  /** アイコンを入れる角の丸い箱（背景色）。 */
  iconClassName: string;
  /** 主ボタン（おすすめ）。 */
  primaryClassName: string;
  /** 副ボタン（自分で選ぶ）。 */
  secondaryClassName: string;
  /** おすすめ名のチップ。 */
  chipClassName: string;
}

const DEFAULT_ICON = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
    <path d="M17.5 14v7M14 17.5h7" />
  </svg>
);

export function DashboardStarter({
  recommendedTitles,
  onRecommend,
  onPick,
  title = 'ダッシュボードを作りましょう',
  description = '毎日見たいものを選んで並べます。まずはおすすめを入れて、あとから「編集」で入れ替えるのが早いです。',
  recommendLabel = 'おすすめをまとめて入れる',
  pickLabel = '自分で選ぶ',
  busy = false,
  icon = DEFAULT_ICON,
  className,
  iconClassName,
  primaryClassName,
  secondaryClassName,
  chipClassName,
}: DashboardStarterProps) {
  return (
    <section aria-label={title} className={`flex flex-col items-center gap-3.5 px-5 py-9 text-center ${className}`}>
      <div className={`grid h-14 w-14 place-items-center rounded-2xl ${iconClassName}`}>{icon}</div>
      <h3 className="text-xl font-semibold [text-wrap:balance]">{title}</h3>
      <p className="max-w-[34em] text-sm leading-relaxed opacity-70">{description}</p>
      <div className="flex flex-wrap justify-center gap-2.5">
        <button type="button" disabled={busy} onClick={onRecommend} className={`px-5 py-3 text-[15px] ${primaryClassName}`}>{recommendLabel}</button>
        <button type="button" disabled={busy} onClick={onPick} className={`px-5 py-3 text-[15px] ${secondaryClassName}`}>{pickLabel}</button>
      </div>
      {recommendedTitles.length > 0 ? (
        <ul className="flex flex-wrap justify-center gap-1.5" aria-label="おすすめの内容">
          {recommendedTitles.map((t) => (
            <li key={t} className={`rounded-full px-2.5 py-0.5 text-xs ${chipClassName}`}>{t}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
