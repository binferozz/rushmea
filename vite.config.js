import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/rushmea/" : "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        storefront: resolve(projectRoot, "index.html"),
        admin: resolve(projectRoot, "Rushadmin.html"),
      },
    },
  },
}));
