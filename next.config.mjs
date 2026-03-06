/** @type {import('next').NextConfig} */
const isWebBuild = process.env.NEXT_CONFIG === 'web';

const config = {
  // 移除 output: 'export' 以支持标准的 Next.js 服务器模式
  // output: 'export',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 标准模式下使用 .next 目录
  // distDir: isWebBuild ? 'web-build' : 'out',
  images: {
    // 标准模式下可以使用优化的图片
    unoptimized: false
  },
  basePath: isWebBuild ? '' : '',
  assetPrefix: isWebBuild ? '' : '',
  env: {
    // 全局执行模式：'simulation' (全部模拟执行) | 'backend' (尽可能后端调用)
    NEXT_PUBLIC_EXECUTION_MODE: process.env.NEXT_PUBLIC_EXECUTION_MODE || 'simulation',
  }
};

export default config;
