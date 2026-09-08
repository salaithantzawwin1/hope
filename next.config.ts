import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Fully static export: `npm run build` produces a plain `out/` folder
  // that can be uploaded to any hosting (cPanel, shared hosting, etc.).
  output: "export",
  // Emit directory-style output (en/index.html) so plain web servers and
  // cPanel hosts can serve the routes without rewrite rules.
  trailingSlash: true,
  images: {
    // Static export cannot run the Next.js image optimizer on the host,
    // so we ship pre-optimized images as-is.
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);