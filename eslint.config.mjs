import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"
import prettierConfig from "eslint-config-prettier"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  // Next.js 권장 규칙 (Core Web Vitals + TypeScript)
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // ── TypeScript ──────────────────────────────────────────────
      // 미사용 변수 금지 (언더스코어 접두사 예외)
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // any 사용 경고
      "@typescript-eslint/no-explicit-any": "warn",
      // import type 강제 (타입 전용 import는 type 키워드 사용)
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // non-null assertion 경고
      "@typescript-eslint/no-non-null-assertion": "warn",

      // ── React ───────────────────────────────────────────────────
      // 자식/속성 없는 컴포넌트 셀프 클로징 강제 (<Foo /> 형태)
      "react/self-closing-comp": "error",
      // 불필요한 JSX 중괄호 제거 (prop="value" 대신 prop={"value"} 금지)
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],

      // ── 일반 ────────────────────────────────────────────────────
      // console.log 경고 (warn·error는 허용)
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // var 사용 금지
      "no-var": "error",
      // let 대신 const 권장
      "prefer-const": "error",
      // 중복 import 금지
      "no-duplicate-imports": "error",
    },
  },

  {
    // 테스트 파일 규칙 완화
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  {
    // ESLint 검사 제외 대상
    ignores: [".next/", "node_modules/", "out/", "public/", "next.config.*"],
  },

  // Prettier와 충돌하는 ESLint 규칙 비활성화 (항상 마지막에 위치)
  prettierConfig,
]

export default eslintConfig
