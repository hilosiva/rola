// import "@hilosiva/rola";
import Rola from "@hilosiva/rola";

new Rola(
  "[data-rola-scrub-trigger]",
  {
    once: false,
    scrub: true,
    progressCustomProperty: false,
    targets: [
      {
        selector: "h1",
        styles: {
          translate: (progress) => `${progress * 100}% `,
        },
      },
    ],
    styles: {
      transform: "scale(${progress})",
      opacity: "${progress}",
    },
  },
  ({ progress }) => {
    console.log(progress);
  }
);
new Rola("[data-rola-trigger]", { once: false, rootMargin: "0px 0px -30%" });
