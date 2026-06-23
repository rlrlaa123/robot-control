import type { Config } from "jest";
import nextJest from "next/jest.js";

// next/jest: next.config / .env / TS·JSX 변환 / CSS·이미지 목을 자동 처리
const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // tsconfig의 "@/*" 별칭을 Jest 모듈 해석에도 맞춰줌
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default createJestConfig(config);
