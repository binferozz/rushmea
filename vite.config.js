import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/rushmea/",
  plugins: [react()],
  build: {
    outDir: "dist",
  },
});
