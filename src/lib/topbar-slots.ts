/**
 * トップバー下段の差し込み先スロット ID。
 *
 * smologi では customer / admin の 2 系統があり、どちらのレイアウトに載っているかで
 * 差し込み先が変わる。パッケージ側はスロット ID を知らないので、アプリが起動時に
 * `configureTopbarDockSlots([...])` で登録する（登録がなければ既定値を使う）。
 * 1 か所だけに差したいときは、部品の `slotId` prop で直接指定すればよい。
 */
let SLOT_IDS: string[] = ['customer-topbar-dock', 'admin-topbar-dock'];

export function configureTopbarDockSlots(ids: string[]): void {
  SLOT_IDS = ids;
}

export function topbarDockSlotIds(): string[] {
  return SLOT_IDS;
}
