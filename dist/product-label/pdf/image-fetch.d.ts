export declare const IMAGE_TIMEOUT_MS = 5000;
export declare const MAX_IMAGE_BYTES: number;
export declare function isPrivateAddress(address: string): boolean;
type Resolver = (host: string) => Promise<{
    address: string;
}[]>;
/** 解決した全アドレスが公開のときだけ、接続に使うアドレスを返す（DNS rebinding 対策で、この 1 つに接続を固定する）。 */
export declare function resolveSafeImageAddress(hostname: string, resolve?: Resolver): Promise<{
    address: string;
    family: 4 | 6;
} | null>;
export declare function isSafeImageHost(hostname: string, resolve?: Resolver): Promise<boolean>;
/** 画像を取り、react-pdf が確実に読める PNG/JPEG にそろえて返す。取れなければ null。 */
export declare function fetchLabelImage(url: string | null | undefined): Promise<Buffer | null>;
export {};
//# sourceMappingURL=image-fetch.d.ts.map