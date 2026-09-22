"use client";
import { useSyncExternalStore } from "react";
let query = "";
const listeners = /* @__PURE__ */ new Set();
function emit() {
  for (const listener of listeners) listener();
}
function setSettingsSearchQuery(next) {
  if (query === next) return;
  query = next;
  emit();
}
function getSettingsSearchQuery() {
  return query;
}
function clearSettingsSearchQuery() {
  setSettingsSearchQuery("");
}
function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function useSettingsSearchQuery() {
  return useSyncExternalStore(subscribe, getSettingsSearchQuery, () => "");
}
function matchesSettingsSearch(query2, ...texts) {
  const q = query2.trim().toLowerCase();
  if (!q) return true;
  return texts.some((text) => !!text && text.toLowerCase().includes(q));
}
export {
  clearSettingsSearchQuery,
  getSettingsSearchQuery,
  matchesSettingsSearch,
  setSettingsSearchQuery,
  useSettingsSearchQuery
};
//# sourceMappingURL=settings-search-store.js.map
