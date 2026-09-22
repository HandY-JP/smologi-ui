'use client';
// 設定モードの検索ピル（「設定を検索」）の入力値を、**別ツリーの2箇所**で共有するための小さな箱。
//
// なぜ context ではないか: 検索ピルはトップバー（#app-main の中）へ portal され、絞り込む相手の
// 左メニューはサイドバー（<aside>・ChromeProvider の別の枝）に居る。共通の祖先まで Provider を
// 持ち上げると admin レイアウト全体が再レンダーの巻き添えになるので、購読した所だけが再描画される
// 外部ストア（useSyncExternalStore）にしてある。
//
// 検索は API を叩かない（2026-09-23 ユーザー決定）。左メニューの項目名と、区分の中の見出しを
// 絞り込むだけ。

import { useSyncExternalStore } from 'react';

let query = '';
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function setSettingsSearchQuery(next: string): void {
  if (query === next) return;
  query = next;
  emit();
}

export function getSettingsSearchQuery(): string {
  return query;
}

/** 設定モードを抜けるときに呼ぶ（次に入ったとき前回の絞り込みが残らないように）。 */
export function clearSettingsSearchQuery(): void {
  setSettingsSearchQuery('');
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** いまの検索語を購読する。SSR では常に空文字（サーバーとクライアントで初期値を揃える）。 */
export function useSettingsSearchQuery(): string {
  return useSyncExternalStore(subscribe, getSettingsSearchQuery, () => '');
}

/**
 * 検索語に当たるか（区分の中の見出しを絞り込む側が使う）。
 * 空の検索語では常に true＝何も隠さない。
 */
export function matchesSettingsSearch(query: string, ...texts: (string | undefined | null)[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return texts.some((text) => !!text && text.toLowerCase().includes(q));
}
