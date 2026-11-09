// 商品ラベル印刷で、利用者に見せてよいエラー（HTTP ステータスつき）。
export class LabelPrintError extends Error {
  readonly status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'LabelPrintError';
    this.status = status;
  }
}
