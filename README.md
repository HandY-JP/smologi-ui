# @handy-jp/smologi-ui

スモロジ系列アプリ（**Logistic**=smologi / **Seller**=amazon-app / **ポータル**=handy-internal-app /
**B2B**=smologi-b2b）で共有する UI 部品とデザイントークン。

2026-09 に smologi で完成したトップバー再設計・枠なし一覧・浮遊ガラスドックを、
コピーではなくパッケージとして配る。アプリ間の決めごと（複製禁止）に従うための土台。
設計の経緯は smologi の `docs/smologi-ui-package-design-2026-09.md`。

- 中身は **純 UI だけ**。通知・ヘルプ・権限・セッション・お客様キャッシュに触るものは入れない。
- 色は CSS 変数 13 個だけを参照する。アプリは `tokens/` のプリセットを 1 つ読み込む。
- React 19 / Next 16（App Router）前提。`react` / `react-dom` は peerDependencies。
- 中身は smologi `main` の同名ファイルと**機能的に同一**（差分は import だけ。→ 末尾の対応表）。

---

## 導入（消費側のアプリ）

npm レジストリには出していない。**git 参照で入れる**（リポジトリは public なので
トークンも `.npmrc` も要らない）。`dist/` はコミットしてあるので、入れた側でのビルドも不要。

### 1. 依存に足す

```sh
npm i "github:HandY-JP/smologi-ui#v0.1.0"
```

`package.json` にはこう入る:

```json
"dependencies": {
  "@handy-jp/smologi-ui": "github:HandY-JP/smologi-ui#v0.1.0"
}
```

**バージョンは必ずタグで固定する**（`#v0.1.0`）。ブランチ名（`#main`）を指すと
`npm i` の実行タイミングでビルドが変わり、Vercel の本番と手元がずれる。
上げるときは `#v0.1.1` に書き換えて `npm i` し、`package-lock.json` ごとコミットする。

Vercel 側の設定は**何も要らない**（public リポジトリの git 参照なので環境変数もトークンも不要）。

### 2. Tailwind に dist を見せる

クラス名はパッケージの中にあるので、`tailwind.config.ts` の `content` に足す。
足し忘れると**スタイルが当たらない**（部品は出るが見た目が素になる）。

```ts
content: [
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './node_modules/@handy-jp/smologi-ui/dist/**/*.js',   // ← これ
],
```

### 3. `globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import '@handy-jp/smologi-ui/tokens/seller.css';   /* logistic | seller | portal | research */
@import '@handy-jp/smologi-ui/styles.css';          /* 部品が要るカスタム CSS */
@import '@handy-jp/smologi-ui/dark-compat.css';     /* html.theme-dark の互換層（任意） */
```

`styles.css` と `dark-compat.css` は `@tailwind utilities` の**あと**に置くこと
（生のユーティリティを上書きする層なので、先に置くと詳細度の勝負で負けて効かない）。

ダークモードの切り替えは `document.documentElement.classList.toggle('theme-dark')`。
アプリ側の ThemeProvider が行う（**パッケージは DOM を触らない**）。

### 4. ローカルで直しながら試す

公開しないで試すときは、アプリの `package.json` で

```json
"@handy-jp/smologi-ui": "file:../smologi-ui"
```

に差し替えて `npm i`（smologi-ui 側で `npm run build` してから。`dist/` が無いと解決できない）。
`npm link` でもよい。どちらも**コミットしない**こと。

---

## リリース（このリポジトリ）

配布は git 参照なので、**`dist/` をコミットしたうえでタグを打つ**のが 1 リリース。
消費側ではビルドが走らない（`prepare` も `prepack` も置いていない）ので、`dist/` が古いまま
タグを打つと**古いコードが配られる**。順番を守ること。

```sh
# 1. version を上げる
npm version patch --no-git-tag-version   # or minor / major

# 2. ビルドして dist / tokens ごとコミット
npm run build
git add -A
git commit -m "chore: v0.1.1 リリース"

# 3. タグを打って push
git tag v0.1.1
git push origin main
git push origin v0.1.1
```

その後、各アプリの `package.json` の `#v0.1.0` を `#v0.1.1` に書き換えて `npm i`。

---

## トークン

部品が読む CSS 変数は 13 個。`src/tokens/_contract.css` に一覧と意味がある。

| プリセット | アクセント | 用途 |
| --- | --- | --- |
| `tokens/logistic.css` | 青 `#2563eb` | smologi（管理・お客様） |
| `tokens/seller.css` | 橙 `#ea580c` | amazon-app |
| `tokens/portal.css` | スレート `#475569` | handy-internal-app |
| `tokens/research.css` | 金 `#b7791f` | Research 拡張 |
| `tokens/b2b.css` | 青 `#2563eb` | smologi-b2b（売り手画面） |

各ファイルは `:root`（ライト）と `html.theme-dark`（ダーク）の 2 ブロックを持つ。

`--accent-ring` を**値として**持っているのが要点。Tailwind v3 は `ring-[var(--x)]/15` のような
`var()` 相手の透過修飾子を黙って捨てる（ユーティリティごと出力されない）ので、
透過はトークン側で用意しないと効かない。

> **B2B のダークだけ発火クラスが2つある。** smologi-b2b は `html.dark` でダークにしており、
> アプリ側の変数（Tailwind の gray を差し替える `--neutral-*` の反転ランプ・`--surface`）も
> `html.dark` に紐付いている。部品 CSS（`styles.css`）は系列共通の `html.theme-dark` で書いて
> あるので、`tokens/b2b.css` は **両方のセレクタ**を受けるようにしてあり、
> smologi-b2b 側の ThemeToggle が `dark` と `theme-dark` を**同時に**付け外しする。
>
> また smologi-b2b は `dark-compat.css` を**読み込まない**。B2B は gray を反転ランプへ
> 差し替える方式なので、生の gray ユーティリティを暗転させる互換層を重ねると二重反転になる
> （代わりに、部品が使う素の `bg-white` だけを b2b の globals.css が売り手スコープで受ける）。

---

## 部品

### トップバー

```tsx
'use client';
import { FloatingGlassDock, TopToolCapsule, ProcessSegment } from '@handy-jp/smologi-ui';

<FloatingGlassDock
  tools={[
    { key: 'import', label: '取込', icon: <ImportIcon />, onClick: openImport },
    { key: 'export', label: '書き出し', icon: <ExportIcon />, onClick: openExport },
  ]}
  stages={[
    { key: 'all', label: 'すべて', count: 128 },
    { key: 'working', label: '作業中', count: 12 },
  ]}
  activeStage={stage}
  onStageChange={setStage}
/>
```

`FloatingGlassDock` は畳み時（スクロール後）の 3 カプセル（左=道具／中=工程／右=検索）。
通常時の道具バーだけが要るなら `TopToolCapsule`、工程タブだけなら `ProcessSegment` を直接使う。
どちらに入るか（バー本体かオーバーフローメニューか）は `lib/top-tool-placement` が幅から決める。

トップバーの実寸（検索ピルの幅など）を測って畳み判定に渡すのは `useTopBarFit`、
スクロール量から「畳む／戻す」を決めるのは `useTopbarCompaction`。
どちらも `ChromeProvider`（`app-chrome`）の state と組で使う。

検索ピルは `TopbarSearchDock`。差し込み先のスロット ID はアプリごとに違うので、起動時に登録する:

```ts
import { configureTopbarDockSlots } from '@handy-jp/smologi-ui';
configureTopbarDockSlots(['amazon-topbar-dock']);   // Seller の場合
```

### 一覧

```tsx
import {
  ADMIN_FLAT_LIST, ADMIN_FLAT_TABLE, ADMIN_FLAT_TABLE_HEAD, ADMIN_FLAT_PAGE,
  StickySectionHeader, ListFooter, GroupSelectCheckbox, BulkActionPill,
} from '@handy-jp/smologi-ui';

<div className={ADMIN_FLAT_PAGE}>
  <div className={ADMIN_FLAT_LIST}>
    <div className="overflow-x-auto sb-thin-scrollbar">
      <table className={`${ADMIN_FLAT_TABLE} ${ADMIN_FLAT_TABLE_HEAD}`}>
        <thead>…</thead>
        <tbody>
          <StickySectionHeader colSpan={9} label="2026-09-23（月）" />
          …
        </tbody>
      </table>
    </div>
    <ListFooter total={total} page={page} pageSize={pageSize}
                onPageChange={setPage} onPageSizeChange={setPageSize} />
  </div>
</div>
```

枠あり（カード）の一覧を続けるなら `LIST_CARD_CLASS` / `listCardClass(extra)` を使う。
`ListFooter` は末尾 sticky のページャ。囲みに `overflow-hidden` を付けないこと
（スクロールコンテナができて `sticky bottom-0` が効かなくなる）。

`BulkActionPill` は画面下中央の一括操作ピル（反転ガラス）。道具バー＝選択不要の操作、
このピル＝選択した行への操作、という切り分け。押せない操作は消さず disabled ＋理由を出す。

`SectionJumpNav` は見出しの一覧へ飛ぶチップ列。`useLastStuckSection` は
「いま追従している見出し」を返すので、現在地チップの表示に使う。

### 絞り込み

```tsx
import { FilterPopover, SearchFilterBar, FilterSection, FilterChipToggle } from '@handy-jp/smologi-ui';

<SearchFilterBar value={q} onChange={setQ} placeholder="商品名・コード・JAN">
  <FilterPopover label="状態" activeCount={statuses.length}>
    <FilterSection title="基本" first columns={2}>…</FilterSection>
  </FilterPopover>
</SearchFilterBar>
```

`FilterPopover` は開いたチップを、`FilterChipsHostProvider` が張ったホスト
（トップバーの 2 段目や検索ドックの中）へ portal する。
`SearchFilterBar` / `TopbarSearchDock` / `FloatingGlassDock` が
そのホストと `CollapsedFilterTriggerProvider` を用意するので、
ページ側はチップをどこに出すか考えなくてよい。

### 設定画面

```tsx
import { SettingsPage, SettingsSection, SettingsRow, SettingsToggle } from '@handy-jp/smologi-ui';

<SettingsPage>
  <SettingsSection title="出荷" description="…" searchText="出荷 送り状 ヤマト">
    <SettingsRow label="送り状の既定">…</SettingsRow>
  </SettingsSection>
</SettingsPage>
```

枠なし・横罫線 1 本・左ラベル 200px の 2 カラム。`searchText` を渡しておくと
「設定を検索」（`setSettingsSearchQuery`）で当たらない区画が自分で消える。

### モーダル

```tsx
import { Modal, LargeModal, ConfirmDialog } from '@handy-jp/smologi-ui';

<Modal open={open} onClose={close} title="原価を改定">…</Modal>
<LargeModal open={open} onClose={close} title="出荷詳細">…</LargeModal>
<ConfirmDialog open={open} onCancel={close} onConfirm={run}
               title="削除しますか" tone="danger" />
```

`Modal` はオーバーレイ `bg-black/40`・パネル `rounded-xl shadow-xl`・`max-h-[85vh]` で
本文だけ内部スクロール。重ねるときは `layer` を上げる。

### 小物

`Toast`（`ToastProvider` + `useToast()`）、`Tooltip`、`CellPopover`（セルの中身をその場で出す）、
`SearchableSelect`、`GuideTour`、`SummaryTile`、`EmptyState`、`ErrorBanner`、
`SortIndicator`、`Skeleton`、`ProductThumb`。

---

## 入っていないもの（アプリ側に残す）

| 部品 | 残す理由 |
| --- | --- |
| `AdminTopBar` / `CustomerTopBar` / `PortalTopBar` / `AmazonTopBar` | 通知ドロワー・ヘルプ・フィードバックを直に持つ。**中の並びは同じ**なので、各アプリでパッケージの部品を組み合わせて作る |
| `SidebarToggleDock` / `SidebarFooter` | next-auth のセッション、契約アプリランチャー、通知バッジに依存 |
| `use-notification-badge` / `use-workspace-switch` | お客様キャッシュ・権限・ルーティングに依存 |
| `CommandPalette` | 検索対象がアプリ固有（ページ一覧） |
| `RowContextMenu` | コピー項目の定義がアプリ固有 |
| `CompletionPulse` | ジョブ完了イベントの購読がアプリ固有 |
| `use-intent-prefetch` / `sidebar-peek` | サイドバーの挙動と組。サイドバー本体が入っていないので 0.2.0 で判断 |

---

## smologi との対応表

このパッケージの各ファイルは smologi の `main`（**1b2259b2** / 2026-09-23 第 3 バッチ反映後）から
取ったもの。「差分」列が **import のみ** のものは、`@/…` を相対パスに書き換えただけで
**中身は 1 文字も変えていない**（再同期するときは同じ書き換えをかけて diff を取れば分かる）。

| パッケージ | smologi | 差分 |
| --- | --- | --- |
| `lib/theme.ts` | `src/lib/theme.ts` | なし |
| `lib/flat-table.ts` | `src/components/layout/AdminFlatTable.ts` | なし（ファイル名のみ） |
| `lib/list-card.ts` | `src/components/ui/list-card.ts` | なし |
| `lib/list-page-size.ts` | `src/lib/list-page-size.ts` | なし |
| `lib/filter-controls.ts` | `src/lib/filter-controls.ts` | なし |
| `lib/top-tool-placement.ts` | `src/lib/top-tool-placement.ts` | なし |
| `lib/topbar-compaction.ts` | `src/lib/topbar-compaction.ts` | なし |
| `lib/settings-search-store.ts` | `src/lib/settings-search-store.ts` | なし |
| `lib/product-thumbnail-url.ts` | `src/lib/product-thumbnail-url.ts` | なし（`ProductThumb` の内部用。index からは出さない） |
| `components/app-chrome.tsx` | `src/components/layout/app-chrome.tsx` | なし |
| `components/AppMainTopVar.tsx` | `src/components/layout/AppMainTopVar.tsx` | なし |
| `components/AppContentLeftVar.tsx` | `src/components/layout/AppContentLeftVar.tsx` | なし |
| `components/TopToolCapsule.tsx` | `src/components/layout/TopToolCapsule.tsx` | import のみ |
| `components/ProcessSegment.tsx` | `src/components/layout/ProcessSegment.tsx` | import のみ |
| `components/FloatingGlassDock.tsx` | `src/components/layout/FloatingGlassDock.tsx` | import のみ |
| `components/useTopbarCompaction.ts` | `src/components/layout/useTopbarCompaction.ts` | import のみ |
| `components/useTopBarFit.ts` | `src/components/layout/useTopBarFit.ts` | import のみ |
| `components/StickySectionHeader.tsx` | `src/components/layout/StickySectionHeader.tsx` | なし |
| `components/SectionJumpNav.tsx` | `src/components/layout/SectionJumpNav.tsx` | import のみ |
| `components/section-jump-measure.ts` | `src/components/layout/section-jump-measure.ts` | import のみ |
| `components/useLastStuckSection.ts` | `src/components/layout/useLastStuckSection.ts` | なし |
| `components/GroupSelectCheckbox.tsx` | `src/components/layout/GroupSelectCheckbox.tsx` | なし |
| `components/BulkActionPill.tsx` | `src/components/layout/BulkActionPill.tsx` | なし |
| `components/ListFooter.tsx` | `src/components/ui/ListFooter.tsx` | import のみ |
| `components/Pagination.tsx` | `src/components/ui/Pagination.tsx` | import のみ |
| `components/SettingsSection.tsx` | `src/components/layout/SettingsSection.tsx` | import のみ |
| `components/SettingsRow.tsx` | `src/components/layout/SettingsRow.tsx` | なし |
| `components/FilterPopover.tsx` | `src/components/ui/FilterPopover.tsx` | import のみ |
| `components/SearchFilterBar.tsx` | `src/components/ui/SearchFilterBar.tsx` | import のみ |
| `components/SearchableSelect.tsx` | `src/components/ui/SearchableSelect.tsx` | なし |
| `components/Modal.tsx` | `src/components/ui/Modal.tsx` | なし |
| `components/ConfirmDialog.tsx` | `src/components/ui/ConfirmDialog.tsx` | import のみ |
| `components/LargeModal.tsx` | `src/components/layout/LargeModal.tsx` | import のみ |
| `components/Toast.tsx` | `src/components/ui/Toast.tsx` | import のみ |
| `components/Tooltip.tsx` | `src/components/ui/Tooltip.tsx` | なし |
| `components/CellPopover.tsx` | `src/components/ui/CellPopover.tsx` | なし |
| `components/GuideTour.tsx` | `src/components/ui/GuideTour.tsx` | なし |
| `components/ProductThumb.tsx` | `src/components/logistics/ProductThumb.tsx` | import のみ |
| `components/SummaryTile.tsx` | `src/components/ui/SummaryTile.tsx` | なし |
| `components/ErrorBanner.tsx` | `src/components/ui/ErrorBanner.tsx` | なし |
| `components/SortIndicator.tsx` | `src/components/ui/SortIndicator.tsx` | なし |
| `components/Skeleton.tsx` | `src/components/ui/Skeleton.tsx` | なし |
| `components/SidebarNewDot.tsx` | `src/components/layout/SidebarNewDot.tsx` | なし |
| `components/ThemeIcon.tsx` | `src/components/layout/ThemeIcon.tsx` | なし |
| `components/AppSwitcherIcon.tsx` | `src/components/layout/AppSwitcherIcon.tsx` | なし |
| `components/TopbarSearchDock.tsx` | `src/components/customer/TopbarSearchDock.tsx` | **props 化**: スロット ID 2 つの直接 import をやめ、`configureTopbarDockSlots()` で登録した ID を順に探す（`slotId` prop での直接指定は従来どおり） |
| `components/WorkspaceSwitch.tsx` | `src/components/layout/WorkspaceSwitch.tsx` | **props 化**: `WorkspaceKind` 型を `lib/workspace` から取る（遷移は従来どおり `onSwitch` prop） |
| `components/EmptyState.tsx` | （smologi では削除済み） | smologi は参照ゼロになったため 2026-09 に削除した。amazon-app には現役の複製（53 行）があるので、載せ替え先として同梱している |
| `styles/components.css` | `src/app/globals.css` L806-816 / L986-996 / L1037-1090 / L1608-2268 | 抜き出しのみ（各ブロックの先頭行がアンカー） |
| `styles/dark-compat.css` | `src/app/globals.css` L125-803 | 抜き出しのみ |
| `lib/topbar-slots.ts` / `lib/workspace.ts` | （パッケージ専用） | 上の props 化の受け皿 |

### まだ入れていない（0.2.0 の候補）

`SidebarToggleDock`（器だけ）/ `RowContextMenu` / `CommandPalette` / `TopBarTabs` /
`Breadcrumb` / `admin-topbar-slot`。いずれも `next/link` `next/navigation` か
アプリ固有の定義を 1〜3 か所で参照しているので、props 化してから足す。
0.1.0 を smologi へ載せ替えて見た目が一致することを確かめてからにする。

---

## ★ 変更時の約束（2026-09〜）

- ここは色の唯一の出所。消費アプリ（smologi / amazon-app / B2B / ポータル）側の globals.css に
  `html.theme-dark .xxx{}` のような個別ダーク上書きを増やさない運用にしているので、ダーク色の不具合は
  まずアプリ側ではなくここ（`tokens/<app>.css` の `--dc-*` 変数、または `dark-compat.css`）を疑う
- 変数を増減・改名するときは `tokens/_contract.css`（このファイル冒頭のコメント）を必ず同期する。
  部品はここに書かれた変数名しか参照しない
- 新テーマ（新アプリ・新アクセント色）を追加するときは `tokens/` に 1 ファイル、
  `:root` と `html.theme-dark` の 2 ブロックを持つプリセットを足すだけ（上の「トークン」節の表に追記）
- `dist/` を作り直してからタグを打つこと（「リリース」節の手順どおり）。忘れると古いコードが配られる

---

## 開発

```sh
npm install
npm run build      # esbuild/tsup（bundle なし）→ tsc で .d.ts → styles/ tokens/ をコピー
npm run typecheck
npm pack --dry-run # 同梱物の確認
```

`bundle: false`（1 ファイル → 1 ファイルの変換だけ）にしてあるのは

1. **`'use client'` をファイル先頭に残すため**。バンドルすると esbuild が先頭ディレクティブを
   落とし、Next の RSC 境界が壊れる（全部 Server Component 扱いになって `useState` で落ちる）。
   `npm run build` の最後にこれを自己点検している。
2. アプリ側の Tailwind が dist からクラス名を拾えるようにするため。
3. ツリーシェイクはアプリ側のバンドラに任せられるため（ESM のみ・`sideEffects` は CSS だけ）。

型（`.d.ts`）は tsup の `dts` ではなく `tsc --emitDeclarationOnly` で出す
（tsup の dts は rollup-plugin-dts でバンドルを伴い、1 の制約と噛み合わない）。

`node_modules` があれば tsup、無ければ esbuild を直接叩く（`scripts/build.mjs`）。
後者は npm が使えない環境でもビルドを通すための逃がし口で、
`SMOLOGI_UI_FALLBACK_MODULES`（既定 `../smologi/node_modules`）から esbuild と tsc を借りる。
どちらの経路でも出力は同じ（相対 import への `.js` 付与まで含めて後段で揃えている）。

**`dist/` と `tokens/` はコミットする**（git 参照で配るため。`.gitignore` に入れないこと）。
`package.json` に `prepare` / `prepack` は置いていない — 消費側（npm が git からクローンした先）で
ビルドを走らせないための意図的な選択で、
そのぶん「dist を作り直してからタグを打つ」のがリリース手順になる（上の「リリース」節）。
GitHub Actions のワークフロー（CI / publish）は `ci/workflows` ブランチに置いてあるだけで
`main` には入れていない（git 参照配布では publish が要らないため）。

Storybook は入れない。使用例はこの README に置き、見た目の確認は
各アプリのプレビューデプロイで行う。

### smologi から取り直すとき

1. smologi の `main` を最新にする
2. 上の対応表のとおりファイルをコピーし、`@/lib/x` → `../lib/x`、
   `@/components/(layout|ui|customer|logistics)/X` → `./X` に書き換える
   （`@/components/layout/AdminFlatTable` → `../lib/flat-table`、
   `@/components/ui/list-card` → `../lib/list-card`、
   `@/lib/workspace-switch-routes` → `../lib/workspace`）
3. `TopbarSearchDock` と `WorkspaceSwitch` の props 化を当て直す（上の表）
4. CSS は globals.css の同じアンカー行で切り直す（`styles/*.css` の先頭コメントに行番号がある）
5. `npm run build` が通り、対応表の「差分」が増えていないことを確かめる
