import type { RobotStatus, RobotUpdate } from "@/domain/robot";

const STATUSES: RobotStatus[] = [
  "idle",
  "moving",
  "charging",
  "error",
  "offline",
];

/**
 * 폴링용 목 변경분. 서버는 stateless라 "진짜 변경분"을 모르므로,
 * robotCount대 중 5~20대를 무작위로 골라 그럴듯한 변경분을 만들어 낸다.
 * (실서비스라면 DB/메시지큐에서 실제 변경분을 조회해 내려줄 자리)
 */
export function generateUpdates(robotCount = 500): RobotUpdate[] {
  const n = 5 + Math.floor(Math.random() * 16); // 5~20대
  return Array.from({ length: n }, () => {
    const idNum = 1 + Math.floor(Math.random() * robotCount);
    return {
      id: `RBT-${String(idNum).padStart(4, "0")}`,
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      battery: Math.floor(Math.random() * 101), // 0~100
    };
  });
}
