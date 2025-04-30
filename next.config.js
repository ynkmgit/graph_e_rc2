/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Docker用にスタンドアロンビルドを有効化
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'], // 必要に応じて画像ドメインを追加
  },
  // Supabaseホスティング用の設定（必要に応じて）
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
