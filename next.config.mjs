/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  poweredByHeader: false,
  experimental: { globalNotFound: true },
};

export default nextConfig;
