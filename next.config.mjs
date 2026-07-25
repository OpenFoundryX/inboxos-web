/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return [];
    return [{ source: "/api/:path*", destination: `${api}/v1/:path*` }];
  },
};

export default nextConfig;
