import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  // Next.js recommended rules
  ...nextVitals,
  ...nextTs,

  // 🔧 MVP rule relaxations
  {
    rules: {
      // JSX quotes like "don't", "you're"
      "react/no-unescaped-entities": "off",

      // Allow any during MVP
      "@typescript-eslint/no-explicit-any": "off",

      // Warnings instead of CI-breaking errors
      "@typescript-eslint/no-unused-vars": "warn",

      // Don’t block builds on hook deps yet
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // 🚫 Ignore generated + config files
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // config files
    "tailwind.config.js",
    "postcss.config.js",
    "next.config.js",
  ]),
]);
