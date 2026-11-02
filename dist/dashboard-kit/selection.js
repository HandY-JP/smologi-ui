function toggleSelected(selected, candidates, id) {
  const c = candidates.find((x) => x.id === id);
  if (!c || c.disabled || c.added) return [...selected];
  return selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
}
function confirmedSelection(selected, candidates) {
  return candidates.filter((c) => !c.disabled && !c.added && selected.includes(c.id)).map((c) => c.id);
}
export {
  confirmedSelection,
  toggleSelected
};
//# sourceMappingURL=selection.js.map