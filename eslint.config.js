// eslint.config.js (root, ESM)

import path from "node:path";
import { fileURLToPath } from "node:url";

import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";

// Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  {
    files: ["frontend/src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["./frontend/tsconfig.json"],
        tsconfigRootDir: __dirname
      }
    },
    plugins: {
      "@typescript-eslint": tseslint,
      import: importPlugin,
      prettier: prettierPlugin
    },
    rules: {
      // ⭐⭐⭐ Your requested style rules go RIGHT HERE ⭐⭐⭐
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "comma-dangle": ["error", "only-multiline"],
      "prettier/prettier": [
        "error",
        {
          semi: true,
          singleQuote: false,
          trailingComma: "none"
        }
      ],

      // Additional useful rules
      "@typescript-eslint/no-unused-vars": "warn",
      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true }
        }
      ]
    }
  }
];
