import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import type { Plugin } from "vite";
import { defaultClientConditions, defaultServerConditions, defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// This plugin fixes Vite 6's module resolution conditions which changed from v5
// React Router sets conditions: [] which breaks @prisma/client resolution
// See: https://github.com/remix-run/react-router/pull/12644
const prismaFixPlugin: Plugin = {
  name: 'prisma-fix',
  enforce: 'post',
  config() {
    return {
      resolve: {
        conditions: [...defaultClientConditions],
      },
      ssr: {
        resolve: {
          conditions: [...defaultServerConditions],
          externalConditions: [...defaultServerConditions]
        }
      }
    }
  }
};

export default defineConfig(({ isSsrBuild, command }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./server/app.ts",
                 // Mark Prisma as external to prevent Vite from trying to bundle it
          // This avoids ESM/CJS conflicts during build
          external: ['@prisma/client-generated']
        }
      : undefined,
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  ssr: {
    noExternal: command === "build" ? true : undefined,
        // Keep Prisma external in SSR to avoid __dirname issues
    // since Prisma uses __dirname which isn't available in ESM
    external: ['@prisma/client-generated']
  },
  plugins: [prismaFixPlugin, reactRouter(), tsconfigPaths()],
}));