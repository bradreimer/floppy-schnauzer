import { defineConfig } from "vite";
import path from "path";

// Optional environment variables for remote dev
// Example usage when running on schnnode:
//   VITE_HOST=0.0.0.0 VITE_HMR_HOST=schnode.local npm run dev
const host = process.env.VITE_HOST || "localhost";
const hmrHost = process.env.VITE_HMR_HOST || host;

export default defineConfig({
  root: ".",
  publicDir: "public",

  server: {
    host, // defaults to localhost, can be overridden
    port: 5173,
    strictPort: true,
    hmr: {
      host: hmrHost, // safe: no hostname hard‑coded in repo
      port: 5173
    }
  },

  // The build goes to dist/. The Docker image copies it into the server's wwwroot/.
  build: {
    outDir: "dist",
    emptyOutDir: true
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
