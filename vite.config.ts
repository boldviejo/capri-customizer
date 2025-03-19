import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { vercelPreset } from '@vercel/remix/vite';

installGlobals({ nativeFetch: true });

export default defineConfig({
  server: {
    port: Number(process.env.PORT || 3000),
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
      presets: [vercelPreset()],
    }),
    tsconfigPaths(),
  ],
  build: {
    assetsInlineLimit: 0,
    outDir: 'public/build',
    cssCodeSplit: true,
  },
  optimizeDeps: {
    include: ["@shopify/polaris"],
  }
}) satisfies UserConfig;
