/** @type {import('next').NextConfig} */
const useWasmCompiler = process.env.NEXT_USE_WASM_COMPILER === "1";

const nextConfig = {
  allowedDevOrigins: ["192.168.10.5"],
  basePath: process.env.BASE_PATH ?? "",
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  ...(useWasmCompiler
    ? {
        experimental: {
          useWasmBinary: true
        }
      }
    : {})
};

export default nextConfig;
