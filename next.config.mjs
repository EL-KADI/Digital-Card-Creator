/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    
    config.externals = config.externals || [];
    config.externals.push({
      canvas: 'canvas',
    });
    
    return config;
  },
};

export default nextConfig;
