import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";

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
