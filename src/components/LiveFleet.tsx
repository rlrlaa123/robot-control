"use client";

import { useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import {
  robotsMapAtom,
  robotIdsAtom,
  applyUpdatesAtom,
} from "@/state/atoms";
import { aggregateStatus } from "@/domain/aggregate";
import { PollingSource } from "@/realtime/PollingSource";
import type { Robot, RobotStatus } from "@/domain/robot";

const LABELS: Record<RobotStatus, string> = {
  moving: "가동",
  idle: "대기",
  charging: "충전",
  error: "에러",
  offline: "오프라인",
};

export function LiveFleet({ initialRobots }: { initialRobots: Robot[] }) {
  // SSR로 받은 초기 목록으로 atom을 한 번 채운다 (스피너 없이 첫 화면).
  useHydrateAtoms([
    [robotsMapAtom, Object.fromEntries(initialRobots.map((r) => [r.id, r]))],
    [robotIdsAtom, initialRobots.map((r) => r.id)],
  ]);

  const applyUpdates = useSetAtom(applyUpdatesAtom);
  const [lastBatch, setLastBatch] = useState<number | null>(null);
  const [ticks, setTicks] = useState(0);

  // 마운트 시 폴링 시작, 언마운트 시 정리.
  useEffect(() => {
    const source = new PollingSource(1000);
    source.subscribe((updates) => {
      applyUpdates(updates);
      setLastBatch(updates.length);
      setTicks((t) => t + 1);
    });
    return () => source.disconnect();
  }, [applyUpdates]);

  const robotsMap = useAtomValue(robotsMapAtom);
  const counts = aggregateStatus(Object.values(robotsMap));
  const total = Object.keys(robotsMap).length;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Card label="전체" value={total} />
        {(Object.keys(LABELS) as RobotStatus[]).map((s) => (
          <Card key={s} label={LABELS[s]} value={counts[s]} />
        ))}
      </div>
      <p className="flex items-center gap-2 text-sm text-neutral-400">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        실시간 폴링 중 · {ticks}회 갱신
        {lastBatch !== null && ` · 방금 ${lastBatch}대 변경`}
      </p>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20 rounded-lg bg-neutral-900 px-4 py-3 text-center">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-neutral-400">{label}</div>
    </div>
  );
}
