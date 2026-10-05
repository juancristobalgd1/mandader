/** @type {import('next').NextConfig} */
// Web estática (GitHub Pages): la búsqueda corre en el navegador.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};
export default nextConfig;
