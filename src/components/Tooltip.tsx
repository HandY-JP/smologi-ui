'use client';
import { useState, useRef } from 'react';

function Tooltip({
  content,
  children,
  side = 'top',
  className = '',
  wrap = false,
  wrapWidth = 'w-56',
}: {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'right' | 'left';
  className?: string;
  /** 長文を折り返して表示する（既定は1行 nowrap）。 */
  wrap?: boolean;
  /** wrap 時の幅クラス（既定 w-56）。長文チップで広げたいときに上書きする。 */
  wrapWidth?: string;
}) {
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function open() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(true), 350);
  }
  function close() {
    if (timer.current) clearTimeout(timer.current);
    setShow(false);
  }

  const sideClass = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-1',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1',
    right:  'left-full top-1/2 -translate-y-1/2 ml-1',
    left:   'right-full top-1/2 -translate-y-1/2 mr-1',
  }[side];

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className={`absolute z-50 px-2 py-1 bg-gray-800 text-white text-[11px] rounded pointer-events-none tooltip-fade ${sideClass} ${wrap ? `${wrapWidth} whitespace-normal leading-relaxed text-left` : 'whitespace-nowrap'} ${className}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}

// ヘルプアイコン（hover で説明表示）。長文は wrap で折り返す。
export function HelpHint({
  text,
  className = '',
  side = 'top',
  wrap = true,
  wrapWidth,
}: {
  text: React.ReactNode;
  className?: string;
  side?: 'top' | 'bottom' | 'right' | 'left';
  wrap?: boolean;
  /** wrap 時の幅クラス（未指定は Tooltip の既定 w-56）。 */
  wrapWidth?: string;
}) {
  return (
    <Tooltip content={text} side={side} wrap={wrap} wrapWidth={wrapWidth}>
      <span
        className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold cursor-help hover:bg-gray-300 transition-colors ${className}`}
        aria-label="ヘルプ"
      >
        ?
      </span>
    </Tooltip>
  );
}
