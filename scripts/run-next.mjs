import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const jsToolchainFlag = "--js-toolchain";
const args = process.argv.slice(2);
const useJsToolchain = args.includes(jsToolchainFlag);
const nextArgs = args.filter((arg) => arg !== jsToolchainFlag);

if (nextArgs.length === 0) {
  console.error("Usage: node scripts/run-next.mjs <dev|build> [--js-toolchain]");
  process.exit(1);
}

if (useJsToolchain && !nextArgs.includes("--webpack")) {
  nextArgs.push("--webpack");
}

const child = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), ...nextArgs],
  {
    env: {
      ...process.env,
      ...(useJsToolchain ? { NEXT_USE_WASM_COMPILER: "1" } : {})
    },
    stdio: "inherit"
  }
);

child.on("error", (error) => {
  console.error(`Failed to start Next.js: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
