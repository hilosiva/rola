---
title: オプション
description: A reference page in my new Starlight docs site.
---

Rolaインスタンス作成時にさまざまなオプションを設定できます。

```javascript
// main.js
new Rola(selector, {
  // オプション
});
```

## root

- 型：`Element | Document | null | undefined`
- デフォルト: `null`

`IntersectionObserver` の `root` プロパティで、ビューポートとして利用される要素です。


詳細は、[交差オブザーバー API | Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/Intersection_Observer_API) を参照してください。

---

## rootMargin

- 型：`string |undefined`
- デフォルト: `"0px"`

`IntersectionObserver` の `rootMargin` プロパティで、`root` の周りのマージンを指定します。


詳細は、[交差オブザーバー API | Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/Intersection_Observer_API) を参照してください。

---

## threshold

- 型：`number | number[] | undefined`
- デフォルト: `0`

`IntersectionObserver` の `threshold` プロパティで、ターゲットがどのくらいの割合見えてたら、`IntersectionObserver` のコールバックを実行するを指定します。


詳細は、[交差オブザーバー API | Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/Intersection_Observer_API) を参照してください。

---

## once

- 型：`boolean | undefined`
- デフォルト: `false`

`true` にすると `IntersectionObserver` のコールバックの実行を1度だけにすることができます。


:::note
トリガー要素に `data-rola-once` 属性を使うことで要素単位で、`once` オプションを切り替えることができます。
:::

---

## scrub

- 型：`boolean | undefined`
- デフォルト: `false`

`true` にするとスクラブ機能を有効にすることができ、ターゲット要素に `--rola-progress` カスタムプロパティが付与され進行度が提供されます。

カスタムプロパティ名は [`progressCustomPropertyName`](#progresscustompropertyname) オプションで変更できます。



:::note
トリガー要素に `data-rola-scrub` 属性を使うことで要素単位で、`scrub` オプションを切り替えることができます。
:::

---

## progressCustomProperty

- 型：`boolean | undefined`
- デフォルト: `true`

`false` にすると、スクラブ機能有効時でも `--rola-progress` カスタムプロパティが付与されなくなります。パフォーマンス向上に有効です。

:::note
トリガー要素に `data-rola-progress-custom-property` 属性を使うことで要素単位で切り替えることができます。
:::

---

## styles

- 型：`Record<string, (progress: number, velocity?: number) => string> | undefined`
- デフォルト: `undefined`

トリガー要素に直接スタイルを適用できます。関数でprogressとvelocityを受け取り、CSSの値を返します。

```javascript
new Rola("[data-trigger]", {
  scrub: true,
  styles: {
    transform: (progress) => `translateX(${progress * 100}px)`,
    opacity: (progress) => `${progress}`
  }
});
```

:::caution
スクラブ機能を有効にしておく必要があります。
:::

---

## target

- 型：`string | string[] | Element | Element[] | undefined`
- デフォルト: `undefined`

ターゲット要素を指定します。指定された要素に `data-rola-inview` 属性やカスタムプロパティが付与されます。

```javascript
// 単一セレクタ
new Rola("[data-trigger]", {
  target: ".my-target"
});

// 複数セレクタ
new Rola("[data-trigger]", {
  target: [".target1", ".target2"]
});
```

:::note
HTML属性 `data-rola-target` でも指定できます。
:::

---

## targets

- 型：`(string | { selector: string, styles?: Record<string, (progress: number, velocity?: number) => string> })[] | undefined`
- デフォルト: `undefined`

複数のターゲット要素に個別のスタイルを適用できます。

```javascript
new Rola("[data-trigger]", {
  scrub: true,
  targets: [
    {
      selector: ".element1",
      styles: {
        transform: (progress) => `translateX(${progress * 100}px)`
      }
    },
    ".element2" // スタイルなしも可
  ]
});
```

:::note
`targets` オプションは `target` オプションより優先されます。
:::

---

## velocityCustomProperty

- 型：`boolean | undefined`
- デフォルト: `false`

`true` にすると、スクラブ機能有効時にスクロール速度（前回のスクロール値と現在のスクロール値の差）を、ターゲット要素に `--rola-velocity` カスタムプロパティによって提供されます。


カスタムプロパティ名は [`velocityCustomPropertyName`](#velocitycustompropertyname) オプションで変更できます。


:::caution
スクラブ機能を有効にしておく必要があります。
:::


:::note
トリガー要素に `data-rola-velocity` 属性を使うことで要素単位で、`velocityCustomProperty` オプションを切り替えることができます。
:::



---

## progressCustomPropertyName

- 型：`string | undefined`
- デフォルト: `"--rola-progress"`

ターゲット要素に進行度を付与するカスタムプロパティの名前を変更できます。


---

## velocityCustomPropertyName

- 型：`string | undefined`
- デフォルト: `"--rola-velocity"`

スクロール速度（前回のスクロール値と現在のスクロール値の差）を、ターゲット要素に付与するカスタムプロパティの名前を変更できます。
