const LIST_CARD_CLASS = "overflow-clip rounded-lg border border-gray-200 bg-white";
function listCardClass(extra) {
  const base = LIST_CARD_CLASS.replace(/\bbg-white\b/, "").replace(/\bborder-gray-200\b/, "").replace(/\s+/g, " ").trim();
  return extra ? `${base} ${extra}` : base;
}
export {
  LIST_CARD_CLASS,
  listCardClass
};
//# sourceMappingURL=list-card.js.map
