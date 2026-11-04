// @handy-jp/smologi-ui — Tailwind v3 用の任意 preset（設定ファイルのあるアプリ向け）。
//
//   // tailwind.config.js
//   module.exports = { presets: [require('@handy-jp/smologi-ui/tailwind-preset')], … };
//
// 足すもの: text-meta / text-note / text-label / text-body / text-item / text-title / text-heading / text-figure
// （サイズ + 行の高さ）と font-sans / font-mono（tokens/typography.css の変数）。
// 既存の text-sm などは消さない（移行中は併用できる）。preset が無いアプリは
// src/lib/typography.ts の TEXT（任意値クラス）を使えばよい。
// 変数が読み込まれていなくても崩れないよう、既定値を fallback に持つ。
const STEPS = {
  meta: [11, 16],
  note: [12, 18],
  label: [13, 20],
  body: [14, 22],
  item: [15, 22],
  title: [18, 26],
  heading: [22, 30],
  figure: [28, 36],
};

const fontSize = {};
for (const [name, [px, lh]] of Object.entries(STEPS)) {
  fontSize[name] = [
    `var(--sm-text-${name}, ${px}px)`,
    { lineHeight: `var(--sm-leading-${name}, ${lh}px)` },
  ];
}

module.exports = {
  theme: {
    extend: {
      fontSize,
      fontFamily: {
        sans: 'var(--sm-font-sans)',
        mono: 'var(--sm-font-mono)',
      },
    },
  },
};
