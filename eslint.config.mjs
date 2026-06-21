import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Apostrophes/quotes in JSX text are valid content — this rule is noise.
      "react/no-unescaped-entities": "off",
      // React 19's strict rule. Our remaining cases are intentional optimistic
      // prop-sync and server-action-result effects; keep as a warning, not a build break.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
