/** @type {import('next').NextConfig} */
const isWebBuild = process.env.NEXT_CONFIG === 'web';

const config = {
  output: 'export',
  trailingSlash: true,
  distDir: isWebBuild ? 'web-build' : 'out',
  images: {
    unoptimized: true
  },
  basePath: isWebBuild ? '' : '',
  assetPrefix: isWebBuild ? '' : ''
};

export default config;
