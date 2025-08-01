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

- 型：`Record<string, StyleValue | Record<number, Record<string, StyleValue | false>>> | undefined`
- デフォルト: `undefined`

トリガー要素に直接スタイルを適用できます。関数、テンプレート文字列、ブレイクポイント対応が可能です。

```javascript
new Rola("[data-trigger]", {
  scrub: true,
  breakpointType: 'min',
  styles: {
    // ベーススタイル（全ブレイクポイントに適用）
    transform: (progress) => `translateX(${progress * 100}px)`,
    opacity: "scale(${progress})", // テンプレート文字列も可能
    
    // ブレイクポイント指定（min-width: 768px以上）
    768: {
      transform: (progress) => `rotate(${progress * 360}deg)`,
      opacity: false, // プロパティを削除
      backgroundColor: (progress) => `rgba(255, 0, 0, ${progress})`
    },
    
    // より大きなブレイクポイント（min-width: 1024px以上）
    1024: {
      transform: false, // transformを削除
      fontSize: (progress) => `${16 + progress * 8}px`
    }
  }
});
```

**ブレイクポイントの動作:**
- 数値キーがブレイクポイントとして認識されます
- `breakpointType: 'min'` の場合、小さいブレイクポイントから順に適用されます
- `false` を指定するとそのプロパティがstyle属性から削除されます
- CSSと同様のカスケード方式で上書きされます

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

## breakpointType

- 型：`'min' | 'max'`
- デフォルト: `'min'`

ブレイクポイントの動作タイプを指定します。

- `'min'`: `min-width` メディアクエリを使用（768 → `(min-width: 768px)`）
- `'max'`: `max-width` メディアクエリを使用（768 → `(max-width: 768px)`）

```javascript
new Rola("[data-trigger]", {
  scrub: true,
  breakpointType: 'min', // デフォルト
  styles: {
    transform: "scale(${progress})",
    768: {
      transform: (progress) => `rotate(${progress * 360}deg)`
    }
  }
});
```

---

## targets

- 型：`(string | Element | ((trigger: HTMLElement) => Element | Element[] | null) | { selector: string | Element | ((trigger: HTMLElement) => Element | Element[] | null), styles?: Record<string, StyleValue | Record<number, Record<string, StyleValue | false>>> })[] | undefined`
- デフォルト: `undefined`

複数のターゲット要素に個別のスタイルを適用できます。セレクター、Element、関数が使用可能です。

```javascript
new Rola("[data-trigger]", {
  scrub: true,
  targets: [
    // 文字列セレクター
    ".element1",
    
    // Element直接指定
    document.querySelector('.element2'),
    
    // 関数セレクター（トリガー要素からの相対指定）
    (trigger) => trigger.querySelector('.child'),
    
    // 設定付き
    {
      selector: (trigger) => trigger.nextElementSibling,
      styles: {
        transform: (progress) => `translateX(${progress * 100}px)`,
        768: {
          transform: (progress) => `translateY(${progress * 50}px)`,
          opacity: false // 768px以上でopacityを削除
        }
      }
    }
  ]
});
```

:::note
`targets` オプションは `target` オプションより優先されます。関数セレクターを使用することで、同じコンポーネント内の特定の要素のみを対象にできます。
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

## respectReducedMotion

- 型：`boolean | undefined`
- デフォルト: `true`

`true` にすると、ユーザーのシステム設定で「視差効果を減らす」（`prefers-reduced-motion: reduce`）が有効になっている場合、`styles` オプションや `targets` のスタイル適用を自動的にスキップします。

```javascript
new Rola("[data-trigger]", {
  scrub: true,
  respectReducedMotion: true, // デフォルト
  styles: {
    transform: (progress) => `translateX(${progress * 100}px)`
  }
});
```

アクセシビリティを考慮し、通常はデフォルトの `true` のままにすることを推奨します。強制的にアニメーションを実行したい場合のみ `false` に設定してください。

:::note
この設定は `matchMedia` を使用してリアルタイムで監視され、ユーザーがシステム設定を変更した場合も即座に反映されます。v0.2.2からは、スクラブ実行中に設定を変更した場合、既に適用されているスタイルも自動的にクリアされます。
:::

---

## velocityCustomPropertyName

- 型：`string | undefined`
- デフォルト: `"--rola-velocity"`

スクロール速度（前回のスクロール値と現在のスクロール値の差）を、ターゲット要素に付与するカスタムプロパティの名前を変更できます。
