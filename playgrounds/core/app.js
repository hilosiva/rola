// パターン1: トリガー要素自体にスタイル
new Rola("[data-rola-trigger]", { 
  scrub: true,
  styles: {
    transform: (progress) => `translateX(${progress * 100}px)`,
    opacity: (progress) => `${progress}`
  }
});

// パターン2: 詳細なターゲット設定
new Rola("[data-rola-test]", { 
  scrub: true,
  targets: [
    {
      selector: ".element1",
      styles: {
        transform: (progress) => `translateX(${progress * 100}px)`,
        opacity: (progress) => `${progress}`
      }
    },
    {
      selector: ".element2",
      styles: {
        transform: (progress) => `translateY(${progress * 50}px)`,
        backgroundColor: (progress) => `hsl(${progress * 360}, 50%, 50%)`
      }
    }
  ]
});

// パターン3: 両方使用
new Rola("[data-trigger2]", { 
  scrub: true,
  styles: { // トリガー要素
    opacity: (progress) => `${progress}`
  },
  targets: [ // 他の要素
    {
      selector: ".other-element",
      styles: {
        transform: (progress) => `scale(${1 + progress * 0.5})`
      }
    }
  ]
});

// パターン4: 文字列のみ（属性 + プロパティ）
new Rola("[data-rola-scrub]", { 
  scrub: true,
  targets: [".element3", ".element4"] // data-rola-inview + --rola-progress
});

// パターン4 + progressCustomProperty: false
new Rola("[data-rola-scrub-parara]", { 
  scrub: true,
  progressCustomProperty: false,
  targets: [".element5", ".element6"] // data-rola-inview のみ
});

// 後方互換性テスト - 従来のtargetオプション
new Rola("[data-legacy-test]", { 
  scrub: true,
  target: ".legacy-element" // 単一文字列
});

new Rola("[data-legacy-test2]", { 
  scrub: true,
  target: [".legacy1", ".legacy2"] // 文字列配列
});

// 新しいオブジェクト形式のコールバック
new Rola("[data-callback-test]", { 
  scrub: true
}, ({ element, isInView, progress, velocity, options }) => {
  console.log("New callback:", { element, isInView, progress, velocity });
});

// 従来形式のコールバック（後方互換性）
new Rola("[data-callback-legacy]", { 
  scrub: true
}, (el, isInView, options, progress) => {
  console.log("Legacy callback:", { el, isInView, progress });
});
