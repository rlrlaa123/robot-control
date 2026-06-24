"use client";

import { FixedSizeList, type ListChildComponentProps } from "react-window";
import { useAtomValue } from "jotai";
import { robotIdsAtom } from "@/state/atoms";
import { RobotRow } from "./RobotRow";

const ROW_HEIGHT = 40;
const LIST_HEIGHT = 520;

// 순서(ids)만 구독 → 폴링 갱신으로 robotsMap이 바뀌어도 이 컴포넌트는 리렌더 안 됨.
// react-window: 500행 중 화면에 보이는 ~13행 + 오버스캔만 DOM에 그리고 스크롤 시 재활용.
// 각 RobotRow는 memo + robotByIdAtom이라, 바뀐 로봇 행만 리렌더된다.
export function FleetList() {
  const ids = useAtomValue(robotIdsAtom);

  return (
    <FixedSizeList
      height={LIST_HEIGHT}
      width="100%"
      itemCount={ids.length}
      itemSize={ROW_HEIGHT}
      className="w-full max-w-2xl rounded-lg border border-neutral-800 bg-neutral-950"
    >
      {({ index, style }: ListChildComponentProps) => (
        <div style={style}>
          <RobotRow id={ids[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
