/// <reference types="vitest/config" />
import { defineConfig } from "vite";

// Optional environment variables for remote development, for example:
//   VITE_HOST=0.0.0.0 VITE_HMR_HOST=my-machine.local npm run dev
const host = process.env.VITE_HOST || "localhost";
const hmrHost = process.env.VITE_HMR_HOST || host;

export default defineConfig({
  server: {
    host,
    port: 5173,
    strictPort: true,
    hmr: { host: hmrHost, port: 5173 }
  },

  // The build goes to dist/. The Docker image copies it into the server's wwwroot/.
  build: {
    outDir: "dist",
    emptyOutDir: true
  },

  test: {
    environment: "node",
    include: ["src/**/*.test.ts"]
  }
});
