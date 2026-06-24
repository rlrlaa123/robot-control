"use client";

import { getBatteryLevel } from "@/domain/battery";
import type { Robot, RobotStatus } from "@/domain/robot";

// UX 문서 5번: 색만으로 구분하지 않고 점(dot) + 텍스트 라벨 병기 (색각 고려).
// 빨강은 오직 error에만. moving=녹색(안심), idle=회색, charging=앰버, offline=흐릿.
const STATUS_STYLE: Record<RobotStatus, { dot: string; text: string; label: string }> = {
  moving: { dot: "bg-emerald-400", text: "text-emerald-300", label: "가동" },
  idle: { dot: "bg-zinc-400", text: "text-zinc-300", label: "대기" },
  charging: { dot: "bg-amber-400", text: "text-amber-300", label: "충전" },
  error: { dot: "bg-red-500", text: "text-red-400", label: "에러" },
  offline: { dot: "bg-neutral-600", text: "text-neutral-500", label: "오프라인" },
};

// 배터리: >20 정상(녹색) / 10~20 경고(앰버) / <10 위험(빨강+점멸)
const BATTERY_BAR: Record<"normal" | "warning" | "critical", string> = {
  normal: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500 animate-pulse",
};

export function RobotRow({ robot }: { robot: Robot }) {
  const s = STATUS_STYLE[robot.status];
  const level = getBatteryLevel(robot.battery);

  return (
    <div className="flex items-center gap-3 border-b border-neutral-800 px-3 py-2 text-sm">
      <span className="w-20 shrink-0 font-mono text-neutral-300">{robot.id}</span>
      <span className={`flex w-20 shrink-0 items-center gap-1.5 ${s.text}`}>
        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
        {s.label}
      </span>
      <span className="flex w-32 shrink-0 items-center gap-2">
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-800">
          <span
            className={`block h-full ${BATTERY_BAR[level]}`}
            style={{ width: `${robot.battery}%` }}
          />
        </span>
        <span className="w-9 text-right tabular-nums text-neutral-400">
          {robot.battery}%
        </span>
      </span>
      <span className="flex-1 truncate text-neutral-500">
        {robot.currentTask ?? "—"}
      </span>
    </div>
  );
}
