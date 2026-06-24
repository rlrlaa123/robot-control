import type { Robot, RobotUpdate } from "@/domain/robot";

export function applyUpdate(robots: Robot[], updates: RobotUpdate[]): Robot[] {
  // 변경분을 id로 빠르게 찾도록 맵으로 모은다. (O(n+m))
  const byId = new Map<string, RobotUpdate>();
  for (const u of updates) byId.set(u.id, u);

  return robots.map((robot) => {
    const update = byId.get(robot.id);
    if (!update) return robot; // 규칙1: 안 바뀜 → 같은 참조 유지
    return { ...robot, ...update }; // 규칙1: 바뀜 → 새 객체로 병합
    // 규칙2: byId에만 있고 robots에 없는 id는 여기서 자연히 무시됨
  });
}
