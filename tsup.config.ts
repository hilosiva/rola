import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    minify: true,
    sourcemap: true,
    clean: true,
    cjsInterop: true,
    external: [],
    target: "es2020",
    banner: {
      js: `/**
 * Rola - A library for managing IntersectionObserver and scroll-based animations.
 *
 * @license MIT
 *
 * GitHub Repository: https://github.com/hilosiva/rola
 */
    `,
    },
    esbuildOptions: (options) => {
      options.legalComments = "none"; // 不要なコメントを削除
    },
  },

  {
    entry: {
      rola: "src/cdn.ts",
    },
    format: ["iife"],
    minify: true,
    sourcemap: true,
    clean: true,
    target: "es2020",
    outDir: "dist",
    outExtension: () => ({ js: ".min.js" }),
    banner: {
      js: `/**
 * Rola - A library for managing IntersectionObserver and scroll-based animations.
 *
 * @license MIT
 *
 * GitHub Repository: https://github.com/hilosiva/rola
 */
    `,
    },
    esbuildOptions: (options) => {
      options.legalComments = "none"; // 不要なコメントを削除
    },
  },
  {
    entry: {
      rola: "src/rola.css",
    },
    minify: true,
    sourcemap: false,
    clean: true,
    target: "es2020",
    outDir: "dist",
  },
]);
