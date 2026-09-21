const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "dist/cli.js",
  platform: "node",
  target: "node20",
  format: "cjs",
  sourcemap: true,
  banner: { js: "#!/usr/bin/env node" },
  logLevel: "info",
}).catch(() => {
  process.exitCode = 1;
});
