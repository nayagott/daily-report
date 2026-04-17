import { setupServer } from "msw/node"
import { handlers } from "./handlers"

// 테스트용 MSW 서버
// 실제 핸들러는 handlers.ts 에 등록
export const server = setupServer(...handlers)
