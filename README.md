# Rola

![Rola](/docs/public/ogp.png)

[![npm version](https://badge.fury.io/js/@hilosiva%2Frola.svg)](https://badge.fury.io/js/@hilosiva%2Frola)

Rola は、スクロールマネジメントライブラリです。
IntersectionObserver によるビューポート内の要素の監視とスクラブ機能をパフォーマンスに考慮して提供します。

Rola は スクロールによる要素の状態を HTML の属性や CSS カスタムプロパティにセットすることにフォーカスしているため、
あとは、あなたの CSS の知見を使って自由にアニメーションを作成することが可能です。

## ドキュメント

Rolaの詳しい使い方は[ドキュメント](https://hilosiva.github.io/rola/)をご確認ください。


## インストール

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@hilosiva/rola@0.2.1/dist/rola.min.js" defer></script>
```

### NPM

```
npm i -D @hilosiva/rola
```

```javascript [main.js]
import Rola from "@hilosiva/rola";
```

## セットアップ

### 基本

スクロールアニメーションをトリガーしたい HTML の要素をセレクターとして、Rola に要素の監視を登録します。

```html
<div data-rola-trigger>...</div>
```

```javascript
new Rola("[data-rola-trigger]");
```

これで、トリガー要素に `data-rola-inview="false"` がセットされ、トリガー要素がビューポート内に入った時に、`data-rola-inview` が　`true` に切り替わります。

## 新機能（v0.2.0）

### 直接スタイル適用

関数を使って動的にスタイルを適用できます：

```javascript
new Rola("[data-rola-trigger]", {
  scrub: true,
  styles: {
    transform: (progress) => `translateX(${progress * 100}px)`,
    opacity: (progress) => `${progress}`
  }
});
```

### 複数ターゲット

複数の要素に個別のスタイルを適用できます：

```javascript
new Rola("[data-rola-trigger]", {
  scrub: true,
  targets: [
    {
      selector: ".element1",
      styles: {
        transform: (progress) => `translateX(${progress * 100}px)`
      }
    },
    {
      selector: ".element2", 
      styles: {
        opacity: (progress) => `${progress}`
      }
    }
  ]
});
```

### 改良されたコールバック

オブジェクト形式でvelocity情報も利用できます：

```javascript
new Rola("[data-rola-trigger]", {
  scrub: true
}, ({ element, progress, velocity }) => {
  console.log(`Progress: ${progress}, Velocity: ${velocity}`);
});
```

### アクセシビリティ対応（v0.2.1）

`prefers-reduced-motion`メディアクエリに対応し、ユーザーの視差効果軽減設定を自動的に尊重します：

```javascript
new Rola("[data-rola-trigger]", {
  scrub: true,
  respectReducedMotion: true, // デフォルト: true
  styles: {
    transform: (progress) => `translateX(${progress * 100}px)`
  }
});
```

ユーザーがシステム設定で「視差効果を減らす」を有効にしている場合、stylesの適用が自動的にスキップされます。強制的にアニメーションを実行したい場合は `respectReducedMotion: false` を設定してください。


## ライセンス

MIT License
