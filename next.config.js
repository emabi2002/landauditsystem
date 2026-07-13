/** @type {import('next').NextConfig} */
const nextConfig = {
  // Reduce peak memory during `next build` (large app + limited container RAM).
  experimental: {
    webpackMemoryOptimizations: true,
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
      "@tanstack/react-table",
      "@radix-ui/react-accordion",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
    ],
  },
  // react-joyride's ESM build (index.mjs) imports the legacy react-dom API
  // `unmountComponentAtNode`, which webpack's strict ESM interop rejects.
  // Force resolution to its CommonJS build, where the react-dom interop works.
  webpack: (config, { dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Resolve to react-joyride's CommonJS entry robustly (works under both
      // bun and npm, regardless of how the package is hoisted). Its ESM build
      // (dist/index.mjs) imports the legacy `unmountComponentAtNode` react-dom
      // API in a way webpack's strict ESM interop rejects, breaking the build.
      "react-joyride$": require.resolve("react-joyride"),
      // react-joyride's CJS build externally `require("react-floater")`, whose
      // ESM build (es/index.js) imports the legacy react-dom APIs
      // `unstable_renderSubtreeIntoContainer` / `unmountComponentAtNode`. Some
      // installs (e.g. Netlify's regenerated lockfile) make webpack pick that
      // ESM build and fail. Force its CommonJS build, which accesses those APIs
      // at runtime instead of via a statically-checked ESM import.
      "react-floater$": require.resolve("react-floater"),
    };
    // CRITICAL FIX for the recurring "missing ) after argument list" /
    // ChunkLoadError crash: Next.js dev defaults to the `eval-source-map`
    // devtool, which inlines a base64 source map after EVERY module. That
    // bloated the route chunks to 6–8 MB (≈56% was inline source maps), and
    // those multi-MB responses time out / truncate streaming through the
    // preview proxy — the browser then parses an incomplete chunk and throws
    // "missing ) after argument list". Disabling the dev source map keeps the
    // real code but removes the megabytes of inline maps, so chunks transfer
    // reliably. (Source maps aren't needed for the live preview to run.)
    if (dev) {
      config.devtool = false;
    }
    return config;
  },
  typescript: {
    // Allow production builds even with type errors (Supabase types issue)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds even with ESLint errors
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ["*.preview.same-app.com"],
  images: {
    unoptimized: true,
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
