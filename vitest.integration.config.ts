// vitest.integration.config.ts
// Tests pivot v2 (qa-strategy §4) — runtime KV + AE mocked.

import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  test: {
    include: ["tests/integration/**/*.spec.ts"],
    environment: "node",
    testTimeout: 30_000,
    coverage: { enabled: false },
  },
});
