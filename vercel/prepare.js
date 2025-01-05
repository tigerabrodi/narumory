import * as fsp from "node:fs/promises";

await fsp.rm(".vercel", { recursive: true }).catch(() => {});
await fsp.mkdir(".vercel/output/static", { recursive: true });

await fsp.cp("vercel/output/", ".vercel/output", { recursive: true });
await fsp.cp("build/client/", ".vercel/output/static", { recursive: true });
await fsp.cp("build/server/", ".vercel/output/functions/index.func", {
  recursive: true,
});

// Copy the generated Prisma client to Vercel's function directory
// This ensures the client is available at runtime in Vercel's environment
// Without this, Node won't find the client package in the deployed function
await fsp.cp(
  "node_modules/@prisma/client-generated", 
  ".vercel/output/functions/index.func/node_modules/@prisma/client-generated", 
  { recursive: true }
);