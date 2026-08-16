import js from "@eslint/js"
import tseslint from "typescript-eslint"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import jsxA11y from "eslint-plugin-jsx-a11y"
import importPlugin from "eslint-plugin-import"
import prettier from "eslint-config-prettier"

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "drizzle/**",
      ".vercel/**",
      // Vendored: shadcn/ui writes these and rewrites them on every
      // `shadcn add`. They don't satisfy strictTypeChecked, and fixing them
      // just gets reverted by the next CLI run. Lint our code, not theirs.
      "src/components/ui/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    plugins: {
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": ["error", { ignoreVoid: true }],
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-expect-error": "allow-with-description" },
      ],
      "import/no-default-export": "error",
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: "detect" },
    },
  },
  // Next.js requires default exports for route segment files (page, layout,
  // template, error, loading, not-found, route, etc.). Allow them under app/.
  {
    files: [
      "src/app/**/*.{ts,tsx}",
      "src/middleware.ts",
      "next.config.*",
      // drizzle-kit reads the config via default export.
      "drizzle.config.*",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },
  // Root-level config files are ESM/JS outside the tsconfig project, so the
  // type-aware rules can't resolve them. Lint them without type information.
  {
    files: ["**/*.mjs", "**/*.js"],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      "import/no-default-export": "off",
    },
  },
  prettier,
)
