"use client";
import { jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
const HELP_DRAWER_ID = "smologi-help-drawer";
const DEFAULT_TOP_BAR_FIT = { pillWidthPx: null, processInRow2: false };
const ChromeCtx = createContext(null);
function ChromeProvider({ children }) {
  const [panel, setPanel] = useState(null);
  const [topBarCollapsed, setTopBarCollapsed] = useState(false);
  const [topBarFit, setTopBarFit] = useState(DEFAULT_TOP_BAR_FIT);
  return /* @__PURE__ */ jsx(ChromeCtx.Provider, { value: { panel, setPanel, topBarCollapsed, setTopBarCollapsed, topBarFit, setTopBarFit }, children });
}
function useChrome() {
  const ctx = useContext(ChromeCtx);
  if (!ctx) throw new Error("useChrome must be used within ChromeProvider");
  return ctx;
}
function useChromeOptional() {
  return useContext(ChromeCtx);
}
function ChromeMain({
  className = "",
  children
}) {
  const { panel } = useChrome();
  return (
    // ドロワー（Help/HelpCenter）の開閉アニメーションを撤去したのに合わせ、
    // 押しのけ側のマージン遷移も外して即時に揃える（レビュー指摘）。
    /* @__PURE__ */ jsx(
      "main",
      {
        id: "app-main",
        className: `${className} min-w-0 ${panel ? "sm:ml-0 sm:mr-[384px]" : "sm:ml-[var(--chrome-left-panel-width,0px)] sm:mr-[var(--chrome-right-panel-width,0px)]"}`,
        children
      }
    )
  );
}
export {
  ChromeMain,
  ChromeProvider,
  DEFAULT_TOP_BAR_FIT,
  HELP_DRAWER_ID,
  useChrome,
  useChromeOptional
};
//# sourceMappingURL=app-chrome.js.map
