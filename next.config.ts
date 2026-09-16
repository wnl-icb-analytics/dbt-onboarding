import type { NextConfig } from "next";

// Static dbt docs v2 site published from dbt-analytics main (see lib/dbt-docs.ts).
const DBT_DOCS_ORIGIN = (
  process.env.DBT_DOCS_ORIGIN ?? "https://wnl-icb-analytics.github.io/dbt-analytics"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Pages are prerendered where they can be; data caching is declared with "use cache".
  cacheComponents: true,
  // Same-origin, so /models can frame the docs and sync their theme.
  async rewrites() {
    return [
      {
        source: "/dbt-docs/:path*",
        destination: `${DBT_DOCS_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
