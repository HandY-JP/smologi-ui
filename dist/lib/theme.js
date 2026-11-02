const THEMES = {
  light: {
    name: "\u30DB\u30EF\u30A4\u30C8",
    swatch: "#e2e8f0",
    vars: {
      "--sb-bg": "#f6f7fb",
      "--sb-border": "#e7ebf0",
      "--sb-hover": "#e9edf4",
      "--sb-text": "#334155",
      "--sb-label": "#64748b",
      "--sb-heading": "#0f172a",
      "--sb-accent-bg": "#2563eb",
      "--accent-hover": "#1d4ed8",
      "--accent-ring": "rgba(37, 99, 235, 0.15)",
      "--accent-subtle": "#eff6ff",
      "--accent-light": "#eff6ff",
      "--accent-on": "#ffffff",
      "--page-bg": "#f6f7fb"
    }
  },
  navy: {
    name: "\u30D6\u30EB\u30FC",
    swatch: "#2563eb",
    vars: {
      "--sb-bg": "#1e293b",
      "--sb-border": "#334155",
      "--sb-hover": "#2d3f55",
      "--sb-text": "#cbd5e1",
      "--sb-label": "#94a3b8",
      "--sb-heading": "#ffffff",
      "--sb-accent-bg": "#2563eb",
      "--accent-hover": "#1d4ed8",
      "--accent-ring": "rgba(37, 99, 235, 0.15)",
      "--accent-subtle": "#eff6ff",
      "--accent-light": "#eff6ff",
      "--accent-on": "#ffffff",
      "--page-bg": "#f0f5ff"
    }
  },
  charcoal: {
    name: "\u30D1\u30FC\u30D7\u30EB",
    swatch: "#7c3aed",
    vars: {
      "--sb-bg": "#2e1065",
      // violet-950 — はっきり紫が分かる濃さ
      "--sb-border": "#3c1a78",
      "--sb-hover": "#4c1d95",
      // violet-900
      "--sb-text": "#ddd6fe",
      // violet-200
      "--sb-label": "#a78bfa",
      // violet-400
      "--sb-heading": "#ffffff",
      "--sb-accent-bg": "#7c3aed",
      // violet-600
      "--accent-hover": "#6d28d9",
      "--accent-ring": "rgba(124, 58, 237, 0.15)",
      "--accent-subtle": "#f5f3ff",
      "--accent-light": "#f5f3ff",
      "--accent-on": "#ffffff",
      "--page-bg": "#f8f5ff"
    }
  },
  forest: {
    name: "\u30B0\u30EA\u30FC\u30F3",
    swatch: "#047857",
    vars: {
      "--sb-bg": "#0f2418",
      "--sb-border": "#1a3626",
      "--sb-hover": "#1e4030",
      "--sb-text": "#d1fae5",
      "--sb-label": "#6ee7b7",
      "--sb-heading": "#ffffff",
      "--sb-accent-bg": "#047857",
      "--accent-hover": "#065f46",
      "--accent-ring": "rgba(4, 120, 87, 0.15)",
      "--accent-subtle": "#ecfdf5",
      "--accent-light": "#ecfdf5",
      "--accent-on": "#ffffff",
      "--page-bg": "#f0fdf4"
    }
  },
  dark: {
    name: "\u30C0\u30FC\u30AF",
    swatch: "#0f172a",
    vars: {
      "--sb-bg": "#020617",
      "--sb-border": "#1e293b",
      "--sb-hover": "#1e293b",
      "--sb-text": "#cbd5e1",
      "--sb-label": "#64748b",
      "--sb-heading": "#ffffff",
      "--sb-accent-bg": "#3b82f6",
      "--accent-hover": "#2563eb",
      "--accent-ring": "rgba(59, 130, 246, 0.15)",
      "--accent-subtle": "#1e3a8a",
      "--accent-light": "#1e3a8a",
      "--accent-on": "#ffffff",
      "--page-bg": "#0f172a"
    }
  },
  pink: {
    name: "\u30D4\u30F3\u30AF\u30B7\u30E3\u30DC\u30F3",
    swatch: "#ec4899",
    vars: {
      "--sb-bg": "#5e1f3d",
      "--sb-border": "#73294c",
      "--sb-hover": "#7d2f55",
      "--sb-text": "#fce7f3",
      "--sb-label": "#f9a8d4",
      "--sb-heading": "#ffffff",
      "--sb-accent-bg": "#ec4899",
      "--accent-hover": "#db2777",
      "--accent-ring": "rgba(236, 72, 153, 0.15)",
      "--accent-subtle": "#fdf2f8",
      "--accent-light": "#fdf2f8",
      "--accent-on": "#ffffff",
      "--page-bg": "#fff5fa"
    }
  },
  rose: {
    name: "\u30D4\u30F3\u30AF",
    swatch: "#ec4899",
    vars: {
      "--sb-bg": "#fdf2f8",
      // pink-50 — 明るい（ダークでない）ピンク
      "--sb-border": "#fbcfe8",
      // pink-200
      "--sb-hover": "#fce7f3",
      // pink-100
      "--sb-text": "#9d174d",
      // pink-800（明色背景で読める濃ピンク）
      "--sb-label": "#db2777",
      // pink-600
      "--sb-heading": "#831843",
      // pink-900
      "--sb-accent-bg": "#ec4899",
      // pink-500
      "--accent-hover": "#db2777",
      "--accent-ring": "rgba(236, 72, 153, 0.15)",
      "--accent-subtle": "#fdf2f8",
      "--accent-light": "#fdf2f8",
      "--accent-on": "#ffffff",
      "--page-bg": "#fff5fa"
    }
  },
  dq: {
    name: "\u30B9\u30E9\u30A4\u30E0",
    swatch: "#2f8fd6",
    vars: {
      "--sb-bg": "#0c1d4d",
      "--sb-border": "#1b2f66",
      "--sb-hover": "#1a2f6e",
      "--sb-text": "#dbe4ff",
      "--sb-label": "#9fb3e6",
      "--sb-heading": "#ffffff",
      "--sb-accent-bg": "#2f8fd6",
      "--accent-hover": "#2575b5",
      "--accent-ring": "rgba(47, 143, 214, 0.15)",
      "--accent-subtle": "#eaf4fc",
      "--accent-light": "#eaf4fc",
      "--accent-on": "#ffffff",
      "--page-bg": "#eef3fb"
    }
  }
};
const DARK_THEME = "dark";
const CUSTOMER_DEFAULT_THEME = "forest";
const DEFAULT_THEME = "light";
const ACTIVE_THEMES = [DEFAULT_THEME, CUSTOMER_DEFAULT_THEME, DARK_THEME];
function isCustomerAreaPath(pathname) {
  return !!pathname && (pathname === "/customer" || pathname.startsWith("/customer/"));
}
function areaDefaultTheme(pathname) {
  return isCustomerAreaPath(pathname) ? CUSTOMER_DEFAULT_THEME : DEFAULT_THEME;
}
function resolveTheme(pathname, dark) {
  return dark ? DARK_THEME : areaDefaultTheme(pathname);
}
const SMOLOGI_CLIENT_THEME_VARS = {
  "--sb-bg": "#052e2b",
  "--sb-border": "#134e4a",
  "--sb-hover": "#0f766e",
  "--sb-text": "#ccfbf1",
  "--sb-label": "#5eead4",
  "--sb-heading": "#ffffff",
  "--sb-accent-bg": "#14b8a6",
  "--accent-hover": "#0d9488",
  "--accent-ring": "rgba(20, 184, 166, 0.15)",
  "--accent-subtle": "#ccfbf1",
  "--accent-light": "#ccfbf1",
  "--accent-on": "#ffffff",
  "--page-bg": "#f0fdfa"
};
const SMOLOGI_CLIENT_DARK_ACCENT_VARS = {
  "--sb-accent-bg": "#14b8a6",
  "--accent-hover": "#0d9488",
  "--accent-ring": "rgba(20, 184, 166, 0.2)",
  "--accent-subtle": "#134e4a",
  "--accent-light": "#134e4a",
  "--accent-on": "#ffffff"
};
const SEMANTIC = {
  /** 完了・確定・成功（emerald-600） */
  confirm: "#059669",
  /** 注意・要確認（amber-500） */
  warn: "#f59e0b",
  /** エラー・破壊的操作（rose-600） */
  danger: "#e11d48",
  /** 情報・補足（blue-600） */
  info: "#2563eb"
};
export {
  ACTIVE_THEMES,
  CUSTOMER_DEFAULT_THEME,
  DARK_THEME,
  DEFAULT_THEME,
  SEMANTIC,
  SMOLOGI_CLIENT_DARK_ACCENT_VARS,
  SMOLOGI_CLIENT_THEME_VARS,
  THEMES,
  areaDefaultTheme,
  isCustomerAreaPath,
  resolveTheme
};
//# sourceMappingURL=theme.js.map