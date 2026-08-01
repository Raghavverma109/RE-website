import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: {
        entry: "server",
      },
      prerender: {
        enabled: true,
      },
    }),

    // Nitro v3 never sniffs the CI provider: with no preset it emits a plain
    // Node server that Vercel has no idea how to run, so every route 404s.
    // The `vercel` preset emits .vercel/output (Build Output API) instead —
    // prerendered pages as static files, SSR fallback as one function.
    // Vercel sets VERCEL=1 during builds; locally we keep the node preset.
    nitro({
      preset: process.env.VERCEL ? "vercel" : undefined,
    }),

    react(),
    tsConfigPaths(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": "/src",
    },
  },

  server: {
    host: "0.0.0.0",
    port: 5173,
  },

  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
