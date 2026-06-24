"use client";

import { memo } from "react";
import { useAtomValue } from "jotai";
import { robotByIdAtom } from "@/state/atoms";
import { getBatteryLevel } from "@/domain/battery";
import type { RobotStatus } from "@/domain/robot";

// UX 5번: 색 + 점 + 텍스트 병기 (색각 고려). 빨강은 error에만.
const STATUS_STYLE: Record<RobotStatus, { dot: string; text: string; label: string }> = {
  moving: { dot: "bg-emerald-400", text: "text-emerald-300", label: "가동" },
  idle: { dot: "bg-zinc-400", text: "text-zinc-300", label: "대기" },
  charging: { dot: "bg-amber-400", text: "text-amber-300", label: "충전" },
  error: { dot: "bg-red-500", text: "text-red-400", label: "에러" },
  offline: { dot: "bg-neutral-600", text: "text-neutral-500", label: "오프라인" },
};

const BATTERY_BAR: Record<"normal" | "warning" | "critical", string> = {
  normal: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500 animate-pulse",
};

// memo + robotByIdAtom: 이 행은 "자기 로봇"만 구독한다.
// applyUpdatesAtom이 바뀐 로봇만 새 객체로 만들고 나머지는 참조를 유지하므로,
// 안 바뀐 행은 파생값이 그대로(Object.is) → 리렌더 bail-out.
// id(문자열)는 안정적이라 memo가 부모 리렌더로 인한 재렌더도 막아준다.
export const RobotRow = memo(function RobotRow({ id }: { id: string }) {
  const robot = useAtomValue(robotByIdAtom(id));
  if (!robot) return null;

  const s = STATUS_STYLE[robot.status];
  const level = getBatteryLevel(robot.battery);

  return (
    <div className="flex h-full items-center gap-3 border-b border-neutral-800 px-3 text-sm">
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
});
