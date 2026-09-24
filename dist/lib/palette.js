const PALETTE_THEMES = [
  {
    key: "light",
    name: "\u30E9\u30A4\u30C8",
    scheme: "light",
    description: "\u65E2\u5B9A\u3002\u767D\u3044\u9762\u3068\u9752\u306E\u30A2\u30AF\u30BB\u30F3\u30C8",
    swatch: { canvas: "246 247 251", surface: "255 255 255", accent: "37 99 235" }
  },
  {
    key: "dark",
    name: "\u30C0\u30FC\u30AF",
    scheme: "dark",
    description: "\u6697\u3044\u5730\u306B\u6FC3\u3044\u9752\u306E\u30A2\u30AF\u30BB\u30F3\u30C8",
    swatch: { canvas: "15 17 21", surface: "23 27 36", accent: "37 99 235" }
  },
  {
    key: "midnight",
    name: "\u30DF\u30C3\u30C9\u30CA\u30A4\u30C8",
    scheme: "dark",
    description: "\u7D3A\u306E\u5730\u306B\u85CD\u8272\u306E\u30A2\u30AF\u30BB\u30F3\u30C8\u3002\u591C\u9593\u5411\u3051\u306E\u843D\u3061\u7740\u3044\u305F\u30C0\u30FC\u30AF",
    swatch: { canvas: "10 16 34", surface: "16 25 50", accent: "79 70 229" }
  },
  {
    key: "sepia",
    name: "\u30BB\u30D4\u30A2",
    scheme: "light",
    description: "\u7D19\u3068\u30A4\u30F3\u30AF\u306E\u8272\u3002\u307E\u3076\u3057\u3055\u3092\u6291\u3048\u305F\u6696\u8272\u306E\u30E9\u30A4\u30C8",
    swatch: { canvas: "245 240 231", surface: "252 249 243", accent: "146 84 34" }
  },
  {
    key: "forest",
    name: "\u30D5\u30A9\u30EC\u30B9\u30C8",
    scheme: "light",
    description: "\u751F\u6210\u308A\u306E\u5730\u306B\u6DF1\u7DD1\u306E\u30A2\u30AF\u30BB\u30F3\u30C8",
    swatch: { canvas: "243 241 232", surface: "251 250 244", accent: "22 96 64" }
  },
  {
    key: "sakura",
    name: "\u30B5\u30AF\u30E9",
    scheme: "light",
    description: "\u767D\u5730\u306B\u6DE1\u3044\u30D4\u30F3\u30AF\u3002\u3084\u308F\u3089\u304B\u3044\u5370\u8C61",
    swatch: { canvas: "252 245 247", surface: "255 255 255", accent: "190 24 93" }
  },
  {
    key: "contrast",
    name: "\u30CF\u30A4\u30B3\u30F3\u30C8\u30E9\u30B9\u30C8",
    scheme: "light",
    description: "\u9ED2\u6587\u5B57\u30FB\u6FC3\u3044\u7F6B\u7DDA\u3002\u672C\u6587\u3068\u72B6\u614B\u8272\u306F 7:1 \u4EE5\u4E0A\uFF08AAA\uFF09",
    swatch: { canvas: "255 255 255", surface: "255 255 255", accent: "0 56 184" }
  }
];
const DEFAULT_PALETTE_THEME = "light";
const PALETTE_THEME_CLASS_NAMES = Array.from(
  new Set(PALETTE_THEMES.flatMap((t) => [`theme-${t.key}`, "theme-dark"]))
);
function paletteThemeClassNames(key) {
  const theme = PALETTE_THEMES.find((t) => t.key === key);
  if (!theme || theme.key === "light") return [];
  if (theme.key === "dark") return ["theme-dark"];
  return theme.scheme === "dark" ? ["theme-dark", `theme-${theme.key}`] : [`theme-${theme.key}`];
}
function applyPaletteTheme(key, root = document.documentElement) {
  root.classList.remove(...PALETTE_THEME_CLASS_NAMES);
  root.classList.add(...paletteThemeClassNames(key));
  root.style.colorScheme = PALETTE_THEMES.find((t) => t.key === key)?.scheme ?? "light";
}
const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;
const status = (s) => ({ soft: c(`${s}-soft`), ink: c(`${s}-ink`), solid: c(`${s}-solid`) });
const paletteColors = {
  canvas: c("canvas"),
  surface: { DEFAULT: c("surface"), subtle: c("surface-subtle"), muted: c("surface-muted") },
  ink: { DEFAULT: c("ink"), muted: c("ink-muted"), faint: c("ink-faint") },
  line: { DEFAULT: c("line"), strong: c("line-strong") },
  accent: { DEFAULT: c("accent"), soft: c("accent-soft"), ink: c("accent-ink") },
  "on-accent": c("on-accent"),
  success: status("success"),
  warning: status("warning"),
  danger: status("danger"),
  cat: Object.fromEntries(
    Array.from({ length: 8 }, (_, i) => [String(i + 1), status(`cat-${i + 1}`)])
  )
};
const tailwindPreset = {
  theme: { extend: { colors: paletteColors } }
};
export {
  DEFAULT_PALETTE_THEME,
  PALETTE_THEMES,
  PALETTE_THEME_CLASS_NAMES,
  applyPaletteTheme,
  paletteColors,
  paletteThemeClassNames,
  tailwindPreset
};
//# sourceMappingURL=palette.js.map