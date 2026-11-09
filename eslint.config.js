// ESLint flat config (eslint 9) for the portfolio site.
// Scope: top-level CommonJS server files + the browser service worker + tests.
// Rule posture: correctness first (no-undef, no-unused-vars, suspicious code);
// stylistic churn left off so this file lands without a reformatting wave.
const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    // views/const/*.js = bundled third-party analytics/consent scripts shipped
    // into page templates. Vendored code: linting it would bury the app
    // findings. Reviewed separately if a script is ever edited by hand.
    ignores: ["views/**"],
  },
  js.configs.recommended,
  {
    files: ["*.js", "test/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
    rules: {
      "no-unused-vars": ["warn", { args: "after-used" }],
    },
  },
  {
    // The service worker runs in the SW global scope, not Node.
    files: ["sw.js", "public/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.serviceworker },
    },
    rules: {
      "no-unused-vars": ["warn", { args: "after-used" }],
    },
  },
];
