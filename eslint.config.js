import tseslint from "typescript-eslint";

export default tseslint.config({
  files: ["src/FloppySchnauzer.Api/wwwroot/**/*.ts"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      project: "./tsconfig.json"
    },
    globals: {
      window: "readonly",
      document: "readonly",
      navigator: "readonly",
      GPUBufferUsage: "readonly",
      requestAnimationFrame: "readonly"
    }
  },
  rules: {
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    eqeqeq: ["error", "always"],
    curly: ["error", "all"]
  }
});
