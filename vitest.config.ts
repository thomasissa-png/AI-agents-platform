import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// Vitest unit config — cible 80 % branches sur lib/ + middleware/
// Source : qa-strategy.md §1.3
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.spec.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/api/lib/**/*.ts", "src/api/middleware/**/*.ts"],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    globals: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
