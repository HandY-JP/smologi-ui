class LabelPrintError extends Error {
  status;
  constructor(message, status = 400) {
    super(message);
    this.name = "LabelPrintError";
    this.status = status;
  }
}
export {
  LabelPrintError
};
//# sourceMappingURL=errors.js.map