"use client";

import { useAtomValue } from "jotai";
import { robotsMapAtom } from "@/state/atoms";
import { aggregateStatus } from "@/domain/aggregate";
import type { RobotStatus } from "@/domain/robot";

// 요약 카드 정의. error는 시선을 끌도록 빨강 강조, 나머지는 차분하게(UX 2번).
const CARDS: { key: RobotStatus | "total"; label: string; accent: string }[] = [
  { key: "total", label: "전체", accent: "text-neutral-100" },
  { key: "moving", label: "가동", accent: "text-emerald-300" },
  { key: "charging", label: "충전", accent: "text-amber-300" },
  { key: "idle", label: "대기", accent: "text-zinc-300" },
  { key: "error", label: "에러", accent: "text-red-400" },
  { key: "offline", label: "오프라인", accent: "text-neutral-400" },
];

export function SummaryBar() {
  const map = useAtomValue(robotsMapAtom);
  const counts = aggregateStatus(Object.values(map));
  const total = Object.keys(map).length;

  return (
    <div className="flex w-full max-w-2xl flex-wrap items-center justify-center gap-2">
      {CARDS.map(({ key, label, accent }) => {
        const value = key === "total" ? total : counts[key];
        const isError = key === "error" && value > 0;
        return (
          <div
            key={key}
            className={`min-w-20 flex-1 rounded-lg px-3 py-2 text-center ${
              isError ? "bg-red-950/60 ring-1 ring-red-500/40" : "bg-neutral-900"
            }`}
          >
            <div className={`text-2xl font-semibold tabular-nums ${accent}`}>
              {value}
            </div>
            <div className="text-xs text-neutral-500">{label}</div>
          </div>
        );
      })}
    </div>
  );
}
