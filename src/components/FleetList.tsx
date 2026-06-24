"use client";

import { useAtomValue } from "jotai";
import { robotsMapAtom, robotIdsAtom } from "@/state/atoms";
import { RobotRow } from "./RobotRow";

// M4(현재): robotsMapAtom을 통째로 구독 → 매 틱 전체 리스트가 리렌더된다.
// 순서는 robotIdsAtom으로 고정해 실시간 갱신에도 행이 재정렬돼 튀지 않음(UX 7번).
// M5에서 react-window 가상화 + 행 memo로 "불필요 리렌더/DOM"을 걷어낼 예정.
export function FleetList() {
  const ids = useAtomValue(robotIdsAtom);
  const map = useAtomValue(robotsMapAtom);

  return (
    <div className="h-[55vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950">
      {ids.map((id) => {
        const robot = map[id];
        return robot ? <RobotRow key={id} robot={robot} /> : null;
      })}
    </div>
  );
}
