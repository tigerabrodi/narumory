import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import type { Plugin } from "vite";
import { defaultClientConditions, defaultServerConditions, defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Make it type-safe by explicitly typing it as a Vite Plugin
const prismaFixPlugin: Plugin = {
  name: 'prisma-fix',
  enforce: 'post', // Now TypeScript knows this must be 'pre' | 'post' | undefined
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
  },
  plugins: [prismaFixPlugin, reactRouter(), tsconfigPaths()],
}));