/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASE_PATH ?? "",
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
