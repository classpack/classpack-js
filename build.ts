import Bun from "bun";

Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: "dist",
  format: "cjs",
  minify: true,
});