# Rola

Rola は、スクロールマネジメントライブラリです。
IntersectionObserver によるビューポート内の要素の監視とスクラブ機能をパフォーマンスに考慮して提供します。

Rola は スクロールによる要素の状態を HTML の属性や CSS カスタムプロパティにセットすることにフォーカスしているため、
あとは、あなたの CSS の知見を使って自由にアニメーションを作成することが可能です。

## インストール

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@hilosiva/rola@0.0.1/dist/rola.min.js" defer></script>
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

以下のような CSS を用意しトリガー要素に適用することで、トリガー要素が画面内に入った際にアニメーションを実行することができます。

```css
[data-rola-trigger] {
  --duration: 0.6s;
  --easing: ease-out;
  --property: opacity;

  transition: var(--duration) var(--easing);
  transition-property: var(--property);
}

[data-rola-trigger="fadeIn"] {
  &[data-rola-inview="false"] {
    opacity: 0;
  }
  &[data-rola-inview="true"] {
    opacity: 1;
  }
}

[data-rola-trigger="blurIn"] {
  --property: opacity, filter;

  &[data-rola-inview="false"] {
    filter: blur(8px);
    opacity: 0;
  }
  &[data-rola-inview="true"] {
    filter: blur(0);
    opacity: 1;
  }
}

[data-rola-trigger="slideUpIn"] {
  --property: opacity, translate;

  &[data-rola-inview="false"] {
    translate: 0 3rem;
    opacity: 0;
  }
  &[data-rola-inview="true"] {
    translate: 0 0;
    opacity: 1;
  }
}
```

```html
<div data-rola-trigger="fadeIn">...</div>
```

OS の「視差効果を減らす」機能に対応する場合は、`@media`　の `prefers-reduced-motion` を活用してください。

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *:before,
  *:after {
    transition: none !important;
    animation: none !important;
    scroll-behavior: auto !important;
  }
}
```

### Rola CSS

フェードインや、スライドなどよく利用するスタイルをあらかじめ記述した rola.css も用意しています。

#### バンドラーが CSS に対応している場合

```javascript
import "@hilosiva/rola/dist/rola.css";
```

#### Post CSS や Lightning CSS などで CSS をビルドする場合

```css
@import "@hilosiva/rola";
```

#### CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@hilosiva/rola@0.0.1/dist/rola.css" />
```

この rola.css を使う場合は、ターゲット要素に `data-rola-transition` 属性を使って属性値に `fade-in` などを指定するだけでアニメーション可能です。

```html
<div data-rola-trigger data-rola-transition="fade-in">...</div>
```

利用できる値は以下のとおりです。

- `fade-in`
- `blur-in`
- `slide-up-in`

なお、デュレーションやイージングなどは、`transition` プロパティで上書きしてもいいですが、カスタムプロパティを使って変更できるようになっています。

- `--rola-duration` : `transition-duration` の値（デフォルト: `0.6s`）
- `--rola-easing` : `transition-timing-function` の値 （デフォルト： `cubic-bezier(0.25, 1, 0.5, 1)`）

### ターゲット要素の指定

トリガー要素に、`data-rola-target` 属性を指定すると、`data-rola-inview`属性を付与する要素を変更できます。
これによりビューポート内に表示されたかを監視するトリガー要素と、実際にアニメーションを行うターゲットとなる要素に分けることができます。

```html
<div data-rola-trigger data-rola-target="#sample">...</div>

...

<div id="sample">...</div>
```

## オプション

Rola には以下のオプションが利用できます。

| オプション名                 | 値　                                                                                                                                         | 型                                   |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `root`                       | IntersectionObserver の`root` プロパティで、ビューポートとなる要素を指定する（デフォルト： `null`）                                          | Element、 Document、 null、undefined |
| `rootMargin`                 | IntersectionObserver の `rootMargin` プロパティで、`root` の周りのマージンを指定する（デフォルト： `0px`）                                   | string、undefined                    |
| `threshold`                  | IntersectionObserver の `threshold` プロパティで、ターゲットがどのくらいの割合見えてたらコールバックを実行するを指定する（デフォルト： `0`） | number、 number[]、 undefined        |
| `once`                       | コールバックの実行を 1 度だけにする（デフォルト： `true`）                                                                                   | 　 boolean、 undefined               |
| `scrub`                      | スクラブ機能を有効にする（デフォルト： `false`）                                                                                             | 　 boolean、 undefined               |
| `velocityCustomProperty`     | スクラブ有効時にスクロール速度を表す CSS カスタムプロパティを付与する（デフォルト: `false`）                                                 | boolean、 undefined                  |
| `progressCustomPropertyName` | スクラブ有効時にスクロール進行度を表す CSS カスタムプロパティの名前（デフォルト: `--rola-progress`）                                         | string undefined                     |
| `progressCustomPropertyName` | スクラブ有効時にスクロール速度を表す CSS カスタムプロパティの名前（デフォルト: `--rola-velocity`）                                           | string undefined                     |

`root`、`rootMargin`、`threshold` の詳細は、IntersectionObserver のドキュメントなどをご確認ください。

[交差オブザーバー API | Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/Intersection_Observer_API)

```javascript
new Rola("[data-trigger]", { rootMargin: "0px 0px -30%" });
```

### once

`once` オプションを `false` にすることで、要素がビューポートに入るたびにコールバックを実行します。

```javascript
new Rola("[data-trigger]", { once: false });
```

### scrub

`scrub` オプションを `true` にするとスクラブ機能が有効になります。

スクラブ機能を有効にすると、ターゲット要素に `--rola-progress` という名前の CSS カスタムプロパティが付加されます。

この、`--rola-progress`は、トリガー要素のビューポート内のスクロール進行度に応じて `0`（ビューポートの下部） ~ `1` （スクラブアニメーションの終了）に変化し、スクラブアニメーションの進捗度を表します。

デフォルトでは、トリガー要素の上部がビューポートの下部に入った時に `0` となり、
トリガー要素の下部がビューポートの上部に辿り着いた時に `1` となります。

スクラブ機能を有効にしたトリガー要素に、`data-rola-scrub-start`属性を指定するとスクラブの進捗を開始する位置を指定できます。
属性値は、`要素の基準点 ビューポートの基準点`を、それぞれ パーセンテージ、または `top`、`center`、`bottom` で指定します。
値が一つの場合は、`要素の基準点` として扱われ、`ビューポートの基準点` は、`bottom` が指定されます。

この 2 つの基準点が交差した位置から進行が開始します。

また、`data-rola-scrub-end`属性を指定するとスクラブの進捗を終了する位置を指定できます。
属性値は、`要素の基準点 ビューポートの基準点`を、それぞれ パーセンテージ、または `top`、`center`、`bottom` で指定します。
値が一つの場合は、`要素の基準点` として扱われ、`ビューポートの基準点` は、`top` が指定されます。

この 2 つの基準点が交差した位置で進行が終了します。

```html
<figure data-rola-trigger data-rola-scrub-start="top 90%" data-rola-scrub-end="bottom 10%">
  <img src="pizza.jpg" alt="" decoding="async" loading="lazy" />
</figure>
```

```javascript
new Rola("[data-rola-trigger]", { once: false, scrub: true });
```

上記の例では、トリガー要素の上部が、ビューポートの上から 90% の位置で `--rola-progress` が `0` となり、トリガー要素の下部がビューポートの上から 10%の位置で `--rola-progress` が `1` になります。

以下のような CSS を用意しターゲット要素に適用することで、 `--rola-progress` に合わせてスクラブアニーメンションを実行できます。

```css
@media (prefers-reduced-motion: no-preference) {
  [data-effect="fadeIn"] {
    opacity: var(--rola-progress, 0);
  }

  [data-effect="parallax"] {
    --range: 300;
    --translate: calc((var(--range) * -1px) + (var(--range) * 2px) * var(--rola-progress, 0));

    translate: 0 var(--translate);
  }

  [data-effect="clip"] {
    clip-path: inset(calc((1 - var(--rola-progress)) * 30%));
  }

  [data-effect="textClipIn"] {
    color: transparent;
    background-image: linear-gradient(90deg, #000 50%, #ccc 50%, #ccc 100%);
    background-position: calc(100% * (1 - var(--rola-progress))) 0;
    background-clip: text;
    background-size: 200% 100%;
  }
}
```

```html
<figure class="h-screen overflow-hidden" data-rola-trigger data-rola-scrub-start="top 90%" data-rola-scrub-end="bottom 10%">
  <img src="pizza.jpg" class="h-full w-full object-cover" alt="" decoding="async" loading="lazy" data-effect="parallax" />
</figure>
```

rola.css 　を使っている場合は、ターゲット要素に `data-rola-animation` 属性を使って `fade-in` などの属性値を指定することでアニメーションできます。
利用できる値は以下のとおりです。

- `fade-in`
- `fade-out`
- `scale-in`
- `scale-out`
- `parallax`

## コールバック

Rola の 3 つ目の引数はコールバック関数を受け取ることができます。

```javascript
const callBack = (element, isInView, options, progress) => {
  if (isInView) {
    console.log(`トリガー要素がビューポートに入った`);
  } else {
    console.log(`トリガー要素がビューポートから出た`);
  }
};

new Rola("[data-rola-trigger]", { rootMargin: "0px 0px -30%" }, callBack);
```

### コールバック関数の引数

#### element

型： Element

トリガー要素

#### isInView

型: boolean

トリガー要素がビューポート内であれば `true` そうでなければ `false`

#### options

型: EntryOptions | undefined

トリガー要素のオプション

#### progress

型 : number | undefined

スクラブ機能を利用時の現在の進捗度
