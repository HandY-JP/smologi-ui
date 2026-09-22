export declare function setSettingsSearchQuery(next: string): void;
export declare function getSettingsSearchQuery(): string;
/** 設定モードを抜けるときに呼ぶ（次に入ったとき前回の絞り込みが残らないように）。 */
export declare function clearSettingsSearchQuery(): void;
/** いまの検索語を購読する。SSR では常に空文字（サーバーとクライアントで初期値を揃える）。 */
export declare function useSettingsSearchQuery(): string;
/**
 * 検索語に当たるか（区分の中の見出しを絞り込む側が使う）。
 * 空の検索語では常に true＝何も隠さない。
 */
export declare function matchesSettingsSearch(query: string, ...texts: (string | undefined | null)[]): boolean;
//# sourceMappingURL=settings-search-store.d.ts.map