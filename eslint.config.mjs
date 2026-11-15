import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

const warningRules = (config) => ({
  ...config,
  rules: Object.fromEntries(
    Object.entries(config.rules ?? {}).map(([rule, setting]) => [
      rule,
      Array.isArray(setting) ? ["warn", ...setting.slice(1)] : "warn",
    ]),
  ),
});

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "config/test-results/**",
      "config/playwright-report/**",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...js.configs.recommended,
  },
  ...tseslint.configs.recommended.map(warningRules),
  {
    files: ["tests/**/*.{js,ts,tsx}"],
    rules: {
      // Failure-path async-iterator fixtures intentionally throw without yielding.
      "require-yield": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
);
