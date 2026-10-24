import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  transpilePackages: ["@nordaun/color", "@nordaun/theme"],
  reactCompiler: true,
  typedRoutes: true,
  devIndicators: false,
  experimental: {
    typedEnv: true,
  },
  logging: {
    browserToTerminal: true,
    serverFunctions: false,
  },
};

export default withNextIntl(nextConfig);
