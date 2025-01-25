import starlight from "@astrojs/starlight";
// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://hilosiva.github.io",
  base: "/rola",
  integrations: [
    starlight({
      title: "Rola",
      defaultLocale: "root",
      locales: {
        root: {
          label: "日本語",
          lang: "ja",
        },
      },
      customCss: ["./src/assets/styles/global.css"],
      components: {
        ContentPanel: "./src/components/ContentPanel.astro",
      },
      social: {
        github: "https://github.com/hilosiva/rola",
        "x.com": "https://x.com/hilosiva",
      },
      sidebar: [
        {
          label: "はじめる",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "インストール", slug: "getting-started/installation" },
            { label: "インビュー機能", slug: "getting-started/inview" },
            { label: "スクラブ機能", slug: "getting-started/scrub" },
            { label: "パフォーマンス", slug: "getting-started/performance" },
          ],
        },
        {
          label: "リファレンス",
          autogenerate: { directory: "reference" },
        },
      ],
      lastUpdated: true,
    }),
  ],
});
