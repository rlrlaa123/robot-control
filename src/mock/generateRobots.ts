import type { Robot, RobotStatus } from "@/domain/robot";

// 관제실다운 분포: 대부분 가동/대기, 에러·오프라인은 소수.
// 가중치 합으로 누적 구간을 만들어 랜덤 추출한다.
const STATUS_WEIGHTS: [RobotStatus, number][] = [
  ["moving", 55],
  ["idle", 25],
  ["charging", 12],
  ["offline", 5],
  ["error", 3],
];

const TASKS = [
  "픽업 → A-12",
  "운반 → 도크 3",
  "적재 → 랙 B7",
  "순찰 → 구역 4",
  "복귀 → 충전소",
  "분류 → 컨베이어 2",
];

function pickStatus(): RobotStatus {
  const total = STATUS_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [status, w] of STATUS_WEIGHTS) {
    if ((r -= w) < 0) return status;
  }
  return "idle";
}

function batteryFor(status: RobotStatus): number {
  // charging은 낮게 시작, offline은 폭넓게, 나머지는 대체로 건강.
  if (status === "charging") return Math.floor(Math.random() * 40); // 0-39
  if (status === "offline") return Math.floor(Math.random() * 100);
  return 20 + Math.floor(Math.random() * 80); // 20-99
}

/** 목 로봇 count대 생성. id는 RBT-0001 형식으로 1부터 증가. */
export function generateRobots(count: number, now = Date.now()): Robot[] {
  return Array.from({ length: count }, (_, i): Robot => {
    const id = `RBT-${String(i + 1).padStart(4, "0")}`;
    const status = pickStatus();
    const hasTask = status === "moving" || status === "error";
    return {
      id,
      name: id,
      status,
      battery: batteryFor(status),
      position: {
        x: Math.floor(Math.random() * 1001),
        y: Math.floor(Math.random() * 1001),
      },
      currentTask: hasTask ? TASKS[Math.floor(Math.random() * TASKS.length)] : null,
      lastUpdate: now,
    };
  });
}
