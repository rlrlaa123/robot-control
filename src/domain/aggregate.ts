import type { Robot, RobotStatus } from "@/domain/robot";

export function aggregateStatus(robots: Robot[]): Record<RobotStatus, number> {
  // 결정 A: 5개 상태를 0으로 미리 깔아둔다 → 안 나온 상태도 0으로 보장.
  const counts: Record<RobotStatus, number> = {
    idle: 0,
    moving: 0,
    charging: 0,
    error: 0,
    offline: 0,
  };
  for (const robot of robots) {
    counts[robot.status]++;
  }
  return counts;
}
