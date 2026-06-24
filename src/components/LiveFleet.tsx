"use client";

import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { robotsMapAtom, robotIdsAtom, applyUpdatesAtom } from "@/state/atoms";
import { PollingSource } from "@/realtime/PollingSource";
import { SummaryBar } from "./SummaryBar";
import { FleetList } from "./FleetList";
import type { Robot } from "@/domain/robot";

export function LiveFleet({ initialRobots }: { initialRobots: Robot[] }) {
  // SSR로 받은 초기 목록으로 atom을 한 번 채운다 (스피너 없이 첫 화면).
  useHydrateAtoms([
    [robotsMapAtom, Object.fromEntries(initialRobots.map((r) => [r.id, r]))],
    [robotIdsAtom, initialRobots.map((r) => r.id)],
  ]);

  const applyUpdates = useSetAtom(applyUpdatesAtom);
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const source = new PollingSource(1000);
    source.subscribe((updates) => {
      applyUpdates(updates);
      setTicks((t) => t + 1);
    });
    return () => source.disconnect();
  }, [applyUpdates]);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <SummaryBar />
      <FleetList />
      <p className="flex items-center gap-2 text-xs text-neutral-500">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        실시간 폴링 중 · {ticks}회 갱신
      </p>
    </div>
  );
}
