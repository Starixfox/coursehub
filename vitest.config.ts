import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Allow unit tests to import modules guarded by `server-only`.
      "server-only": path.resolve(__dirname, "tests/mocks/server-only.ts"),
    },
  },
});
