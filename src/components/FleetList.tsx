"use client";

import { FixedSizeList, type ListChildComponentProps } from "react-window";
import { useAtomValue, useSetAtom } from "jotai";
import {
  filteredIdsAtom,
  searchQueryAtom,
  statusFilterAtom,
} from "@/state/atoms";
import { RobotRow } from "./RobotRow";

const ROW_HEIGHT = 40;
const LIST_HEIGHT = 520;

// 필터 결과(filteredIds)만 구독. 필터가 없으면 robotIdsAtom 원본이라 참조 안정.
// react-window: 보이는 ~13행 + 오버스캔만 DOM에 그림. 각 RobotRow는 memo + robotByIdAtom.
export function FleetList() {
  const ids = useAtomValue(filteredIdsAtom);
  const setQuery = useSetAtom(searchQueryAtom);
  const setFilter = useSetAtom(statusFilterAtom);

  if (ids.length === 0) {
    return (
      <div className="flex h-[520px] w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-500">
        <p>조건에 맞는 로봇이 없습니다</p>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setFilter(new Set());
          }}
          className="rounded-md border border-neutral-700 px-3 py-1 text-sm text-neutral-300 hover:bg-neutral-800"
        >
          필터 초기화
        </button>
      </div>
    );
  }

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
