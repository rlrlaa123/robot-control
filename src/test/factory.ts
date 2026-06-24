import type { Robot } from "@/domain/robot";

/** 테스트용 로봇 생성기. 기본값을 채우고 필요한 필드만 override 한다. */
export function makeRobot(id: string, overrides: Partial<Robot> = {}): Robot {
  return {
    id,
    name: id,
    status: "idle",
    battery: 100,
    position: { x: 0, y: 0 },
    currentTask: null,
    lastUpdate: 0,
    ...overrides,
  };
}
