import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const isGitHubPages = process.env.NEXT_PUBLIC_BASE_PATH === "/banny";
const basePath = isGitHubPages ? "/banny" : "";
const assetPrefix = isGitHubPages ? "/banny/" : "";

const nextConfig: NextConfig = {
    output: "export",
    basePath,
    assetPrefix,
    trailingSlash: true,
};

export default withNextIntl(nextConfig);
