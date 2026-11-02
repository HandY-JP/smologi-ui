'use client';

/** 「Smologi で扱わないもの」。相手のサービス側で行うことを並べる。 */
export function OutOfScopeList({
  items,
  title = 'Smologi で扱わないもの',
  hint = '相手のサービス側で行います',
}: {
  items: string[];
  title?: string;
  hint?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="sb-int grid gap-1.5 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-4">
      <div>
        <p className="text-[13.5px] font-semibold">{title}</p>
        <p className="sb-int-muted text-xs">{hint}</p>
      </div>
      <ul className="sb-int-muted m-0 grid list-none gap-1 p-0 text-[12.5px]">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
