/** @type {import("prettier").Config} */
const config = {
  // 기본 포매팅
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf",

  // JSX
  jsxSingleQuote: false,

  overrides: [
    {
      // JSON / YAML은 트레일링 쉼표 없이
      files: ["*.json", "*.yaml", "*.yml"],
      options: { trailingComma: "none" },
    },
    {
      // Prisma 스키마 포매터
      files: "*.prisma",
      options: { parser: "prisma-parse" },
    },
  ],
}

export default config
