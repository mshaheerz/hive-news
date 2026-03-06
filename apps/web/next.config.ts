import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@jaurnalist/shared', '@jaurnalist/db', '@jaurnalist/api'],
};

export default nextConfig;
