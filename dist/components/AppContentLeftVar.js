import { jsx } from "react/jsx-runtime";
const APP_CONTENT_LEFT_CSS = "html:root{--app-content-left:var(--sidebar-width,0px)}";
function AppContentLeftVar() {
  return /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: APP_CONTENT_LEFT_CSS } });
}
export {
  APP_CONTENT_LEFT_CSS,
  AppContentLeftVar
};
//# sourceMappingURL=AppContentLeftVar.js.map
