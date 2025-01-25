# Rola

Rola は、スクロールマネジメントライブラリです。
IntersectionObserver によるビューポート内の要素の監視とスクラブ機能をパフォーマンスに考慮して提供します。

Rola は スクロールによる要素の状態を HTML の属性や CSS カスタムプロパティにセットすることにフォーカスしているため、
あとは、あなたの CSS の知見を使って自由にアニメーションを作成することが可能です。

## ドキュメント

Rolaの詳しい使い方は[ドキュメント](https://hilosiva.github.io/rola/)をご確認ください。


## インストール

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@hilosiva/rola@0.1.2/dist/rola.min.js" defer></script>
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


## ライセンス

MIT License
