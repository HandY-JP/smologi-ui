export declare const MM: number;
/** FNSKU とコンディションの間の隙間（コンディションの文字サイズに対する割合。約 0.3 文字）。 */
export declare const CONDITION_GAP_EM = 0.3;
/**
 * 文字サイズ（pt）は Amazon 純正 40 面ラベルの高さ 84.17pt を基準に決め、他の用紙はラベル高さに比例させる。
 * 40 面で FNSKU 9pt（通常）／コンディション 9pt（通常）／商品名 9pt／出品者 SKU 9pt（DEFAULT_LAYOUT_TUNING）。
 */
export declare const REF_LABEL_HEIGHT_PT = 84.17;
/** 1 モジュールの最小幅（0.25mm）。これを下回るとスキャナで読みにくい。 */
export declare const MIN_MODULE_PT: number;
/** 1/300 インチ（pt）。A4 シートのバーコードのモジュール幅はこの整数倍にする（300dpi・600dpi のプリンターで 1 モジュールがドットの整数個になり、にじみで細り太りしても分解可能性が落ちない）。 */
export declare const DOT_300_PT: number;
/**
 * 1/600 インチ（pt）。A4 シートのバーコードの左端の x 座標（用紙原点基準）は、300dpi の格子（= 600dpi の格子の偶数番）にそろえる。
 * 1/600 の格子だと半分は 300dpi のドットの境目（半ドット）に乗り、300dpi の分解可能性が 0.5 に落ちるため（実測）。
 */
export declare const DOT_600_PT: number;
/** 四隅の余白（mm）。 */
export declare const CORNER_PAD_MM = 2;
/**
 * レイアウトの数値（比率・文字サイズ）。既定値は 40 面（Amazon 純正 148.82×84.17pt）の値を比率にしたもの。
 * 用紙ごとに変えたいときは SHEET_LAYOUT_OVERRIDES に「用紙 ID → 変えたい項目だけ」を足す（ここ 1 か所。今は空）。
 */
export interface LayoutTuning {
    /** バー部分の幅（ラベル幅に対する割合）。 */
    barcodeWidthRatio: number;
    /** 何も描かない左右余白の最小値（ラベル幅に対する割合）。 */
    barcodeMinSideRatio: number;
    /** バーの高さ（ラベル高さに対する割合）。 */
    barcodeHeightRatio: number;
    /** 文字領域の左右の余白（ラベル幅に対する割合）。 */
    textSideMarginRatio: number;
    /** 文字サイズ（pt）。REF_LABEL_HEIGHT_PT の高さのときの値で、実際はラベル高さに比例する。 */
    fnSkuSizePt: number;
    conditionSizePt: number;
    nameSizePt: number;
    /** 追加項目（出品者SKU・要期限・◯点入）の文字サイズ。 */
    extraSizePt: number;
    /** 文字の拡縮の基準にするラベル高さ（pt）。null ならそのラベルの高さ（用紙に比例）。値があれば用紙によらず 40 面と同じ pt になる。 */
    fontHeightRefPt: number | null;
    /** 文字サイズの上限・下限（pt）。null は制限なし。 */
    fontPtMax: number | null;
    fontPtMin: number | null;
    /** バーコードの高さの上限（mm）。null は制限なし（高さの割合どおり）。 */
    barcodeMaxHeightMm: number | null;
    /** 商品名の最大行数。 */
    maxNameLines: number;
    /** 商品画像を置けるか。false の用紙は画像オンでも画像なしで描く。 */
    imageAllowed: boolean;
    /** 追加項目の最大数（用紙の高さで更に絞られる。0 は不可）。 */
    maxExtras: number;
    /** 期限シール（横並び: 左に「期限」、右に年・月日の 2 段）の、ラベルの上下・左右に最低限空ける余白（ラベル高さ・幅に対する割合）。 */
    expiryMinVMarginRatio: number;
    expiryMinHMarginRatio: number;
    /** 見出し「期限」の文字サイズ ÷ 年・月日のサイズ。 */
    expiryHeadingRatio: number;
    /** 見出しと日付の間（見出しの文字サイズに対する倍率）。 */
    expiryGapEm: number;
    /** 見た目を上下中央にするための上への補正（ラベル高さに対する割合）。 */
    expiryOpticalShiftRatio: number;
}
export declare const DEFAULT_LAYOUT_TUNING: LayoutTuning;
/** 40 面（A4_40_52x29）のラベル高さ（pt）。「40 面と同じ pt」の基準。 */
export declare const H40_PT: number;
/** Amazon 純正 40 面のバーコードの高さ（mm）。大きい用紙でもこれを超えない。 */
export declare const BARCODE_MAX_HEIGHT_MM = 10.6;
/**
 * 用紙（SheetDef.id）ごとの上書き。変えたい項目だけ書く。40 面（A4_40_52x29）が基準で、ここに無い用紙は既定値。
 * ①40 面並み: ロール 50×30・62×29 ／ ②大きい: 21 面・24 面 ／ ③小さい: 44 面・ロール 50.8×25.4。
 */
export declare const SHEET_LAYOUT_OVERRIDES: Record<string, Partial<LayoutTuning>>;
/** 基準の文字サイズ（40 面の値）を、この用紙のラベル高さ（pt）に合わせた pt にする（比例 → 上限・下限）。 */
export declare function scaledPt(basePt: number, heightPt: number, t: LayoutTuning): number;
export declare function layoutTuningFor(sheetId?: string | null): LayoutTuning;
export interface LabelBoxInput {
    /** ラベルの大きさ（mm）。 */
    widthMm: number;
    heightMm: number;
    fnSku: string;
    /** 画像を出すか（画像が取れなかったときは false にして呼ぶ）。用紙が画像不可なら無視する。 */
    withImage: boolean;
    /**
     * コンディション表示。あれば「FNSKU（通常）＋最小の隙間（約0.3文字）＋コンディション（通常）」が、それぞれの文字サイズで行幅に（縮めずに）収まるか（隙間は CONDITION_GAP_EM）を実測し、
     * 収まれば FNSKU と同じ行（FNSKU は左詰め・コンディションは右端に右詰め）、収まらないときだけ次の行に独立させる。null は表示なし。
     */
    condition: string | null;
    /** 文字幅の実測（描画に使うフォント）。 */
    measure: (text: string, fontSize: number, bold: boolean) => number;
    /** 追加項目の文字（選んだ順。この品目で出せるものだけ。出せない項目は含めない）。用紙が追加項目不可・上限超えなら入る分だけ使う。 */
    extras?: readonly string[];
    /** 用紙 ID。SHEET_LAYOUT_OVERRIDES の上書きを引く（無ければ既定値）。A4 シート（kind が sheet）ならバーコードを 300/600dpi の格子にそろえる。 */
    sheetId?: string | null;
    /** ラベルの左端の用紙上の x（mm。微調整オフセット込み）。バーコードの左端を 1/600 インチの格子にそろえるのに使う。無ければ 0。 */
    originXmm?: number;
}
export interface PlacedExtra {
    text: string;
    /** row=自分の行、withCondition=別行のコンディションの行の右端に右詰め。 */
    placement: 'row' | 'withCondition';
}
export interface LabelBox {
    pad: number;
    width: number;
    height: number;
    /** バー部分の領域（左右の余白は含まない。offsetModules は常に 0）。 */
    barcode: {
        x: number;
        y: number;
        w: number;
        h: number;
        moduleW: number;
        offsetModules: number;
    };
    /** 2〜3 段目の領域。 */
    body: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    /** 正方形の画像（2 段分）。出さないときは null。 */
    image: {
        x: number;
        y: number;
        size: number;
    } | null;
    text: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    /** FNSKU の文字サイズ（通常ウェイト）。 */
    fontSize: number;
    lineHeight: number;
    /** コンディションの文字サイズ（通常ウェイト）。 */
    conditionFontSize: number;
    /** 商品名の文字サイズ。 */
    nameFontSize: number;
    /** 追加項目の文字サイズ。 */
    extraFontSize: number;
    /** 商品名に使える行数。 */
    nameLines: number;
    /** コンディションを FNSKU とは別の行にしたか。 */
    conditionOwnLine: boolean;
    /** 実際に置く追加項目（選んだ順）。 */
    extras: PlacedExtra[];
    /** 出したいのに、高さが足りず省略した追加項目の数（必須の項目は削らない・文字は縮めない）。 */
    extrasOmitted: number;
}
export interface SheetCapabilities {
    /** 商品画像を置けるか。 */
    image: boolean;
    /** 選べる追加項目の数（0 は不可）。本文の高さに「FNSKU の行＋商品名 1 行＋追加項目の行」が収まる数（最大 2）。 */
    maxExtras: number;
}
/** 用紙で選べる商品画像・追加項目の数。本文の高さで決める（コンディションが同じ行に収まる最良の場合）。 */
export declare function sheetCapabilities(sheet: {
    id: string;
    labelW: number;
    labelH: number;
}): SheetCapabilities;
/** ラベルの中の配置を決める。用紙が大きいほど文字も画像も大きくなる（用紙のグループごとの上限・下限あり）。 */
export declare function computeLabelBox(input: LabelBoxInput): LabelBox;
/**
 * 商品名を表示する行に分ける（描画・プレビュー共通）。measure は商品名の文字サイズでの文字列の幅（pt）。
 * - 入りきるときは折り返して lines 行まで（普通の 2 行）。
 * - 入りきらない 2 行: 1 行目＝先頭（行幅いっぱい）、2 行目＝「…」＋末尾（行幅いっぱい）。
 * - 入りきらない 1 行: 「先頭…末尾」を 1 行に。
 * どちらも区切り（空白・記号）優先で、英数字の連続の途中では切らない（区切りが無ければ文字単位）。
 */
export declare function nameRows(name: string, widthPt: number, measure: (text: string) => number, lines: number): string[];
export interface ExpiryBox {
    /** 「期」「限」の文字サイズ（縦書き。1 字ずつ縦に並べる）。 */
    headingSize: number;
    /** 見出し 1 字ぶんの行の高さ（2 字を縦に並べる）。 */
    headingLineH: number;
    /** 年・月日の文字サイズ（2 段とも同じ）。 */
    bigSize: number;
    /** 見出しの幅（全角 1 字）。 */
    headingW: number;
    /** 見出しと日付の間。 */
    gap: number;
    /** 日付の列の幅（最も長い「12月31日」の太字の幅。2 段ともこの幅の中で中央に置く）。 */
    columnW: number;
    /** 見出し＋日付のまとまり全体の幅・高さ（左右はラベルの中央）。 */
    blockW: number;
    blockH: number;
    /** まとまりの上下の中心（ラベル上端からの pt）。下端の FNSKU の上の領域の中央（見た目の補正込み）。 */
    centerY: number;
    /** 下端の FNSKU（通常ウェイト・中央寄せ。バーコードは入れない）。y は行の上端。 */
    footer: {
        size: number;
        lineH: number;
        y: number;
    };
}
export declare const EXPIRY_LINE = 1.15;
/**
 * 期限シールの文字サイズ。左に縦書きの「期限」（日付の約 70%・日付 2 段の高さの中央）、右に年・月日の 2 段（同じ大きさ）、下端に小さく FNSKU。
 * 見出し＋日付のまとまりは「上の余白 ≥ 高さの 15%」「左右の余白 ≥ 幅の 10%」を保ち、FNSKU の行の上に収まる範囲で最大にし、その領域の中央に置く。
 */
export declare function computeExpiryBox(widthMm: number, heightMm: number, sheetId?: string | null): ExpiryBox;
//# sourceMappingURL=label-layout.d.ts.map