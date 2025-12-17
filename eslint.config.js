import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "brace-style": ["error", "1tbs"],
      quotes: ["error", "double", { avoidEscape: true }],
      semi: ["error", "always"],
      indent: ["error", 2],
      "comma-dangle": ["error", "only-multiline"],
      "arrow-spacing": "error",
      "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1 }],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "space-before-blocks": "error",
      "keyword-spacing": "error",
    },
  },
  {
    ignores: [
      "_site/**",
      "node_modules/**",
      "*.bundle.js",
      "*.min.js",
      "eaikw-cms/**",
      ".sanity/**",
    ],
  },
];
