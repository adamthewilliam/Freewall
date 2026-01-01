import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["utils/**/*.ts"],
      exclude: ["**/*.d.ts", "**/types.ts"],
    },
    globals: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
});
