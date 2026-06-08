import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      sourceType: "module"
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettierPlugin
    },
    rules: {
      // Allow your formatting style
      "prettier/prettier": "off",

      // Useful TS rules
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "off",

      // Optional: cleaner imports
      "sort-imports": [
        "warn",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false
        }
      ]
    }
  }
];
