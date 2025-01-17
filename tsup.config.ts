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
  },
]);
