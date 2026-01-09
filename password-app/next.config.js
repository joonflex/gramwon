/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/passwords',
  output: 'standalone',
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig
