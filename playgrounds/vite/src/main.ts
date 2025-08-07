// import "@hilosiva/rola";
import Rola from "@hilosiva/rola";

new Rola(
  "[data-rola-scrub-trigger]",
  {
    once: false,
    scrub: true,
    breakpointType: "min",
    progressCustomProperty: false,
    targets: [
      {
        selector: (trigger) => trigger.querySelector("p"), // 関数でトリガー内のp要素を指定
        styles: {
          translate: (progress) => `${progress * 100}% `,
          768: {
            translate: (progress) => `${progress * 200}% `,
            color: (progress) => `hsl(${progress * 360}, 70%, 50%)`,
          },
        },
      },
    ],
    styles: {
      transform: "scale(${progress})",
      opacity: "${progress}",
      768: {
        transform: (progress) => `rotate(${progress * 360}deg)`,
        opacity: false, // 768px以上でopacityを削除
      },
      1024: {
        transform: false, // 1024px以上でtransformを削除
      },
    },
  },
  ({ progress }) => {
    console.log("Progress:", progress);
  }
);
new Rola("[data-rola-trigger]", { once: false, rootMargin: "0px 0px -30%" });
new Rola("[data-rola-scrub]", {
  scrub: true,
});
