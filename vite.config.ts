import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import type { Plugin } from "vite";
import { defaultClientConditions, defaultServerConditions, defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

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
    external: ['@prisma/client-generated']
  },
  plugins: [prismaFixPlugin, reactRouter(), tsconfigPaths()],
}));