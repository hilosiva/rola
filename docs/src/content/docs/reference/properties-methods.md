---
title: メソッド
description: A reference page in my new Starlight docs site.
---


## スタティックメソッド

| メソッド | 説明 |
| --- | --- |
| `Rola.scrubStart()` | スクラブを開始します。`requestAnimationFrame` を呼び出し、ビューポート内にあるスクラブ要素を監視します。すでにスクラブ中の場合はスキップされます。 |
| `Rola.scrubStop()` | スクラブを停止し、`requestAnimationFrame` を破棄します。 |
| `Rola.update()` | ビューポート内にあるスクラブ要素の状態を更新します。更新後コールバック関数を呼び出します。 |
| `Rola.refresh()` | ウインドウの高さやスクラブ要素の大きさ、位置情報などを更新します。 |
| `Rola.destroy()` | 全てのオブザーバーや `requestAnimationFrame` 、監視対象の要素を破棄します。 |
