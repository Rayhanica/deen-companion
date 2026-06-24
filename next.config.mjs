/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep development artifacts separate from production build output.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
