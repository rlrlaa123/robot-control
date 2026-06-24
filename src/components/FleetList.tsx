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
const CONTENT_WIDTH = 640; // 행 컬럼 합계 폭. 좁은 화면에선 래퍼가 가로 스크롤.

// 필터 결과(filteredIds)만 구독. 필터가 없으면 robotIdsAtom 원본이라 참조 안정.
// react-window: 보이는 ~13행 + 오버스캔만 DOM에 그림. 각 RobotRow는 memo + robotByIdAtom.
export function FleetList() {
  const ids = useAtomValue(filteredIdsAtom);
  const setQuery = useSetAtom(searchQueryAtom);
  const setFilter = useSetAtom(statusFilterAtom);

  if (ids.length === 0) {
    return (
      <div className="flex h-[520px] w-full max-w-[640px] flex-col items-center justify-center gap-3 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-500">
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

  // 바깥 래퍼가 가로 스크롤 담당(좁은 화면), 안쪽 FixedSizeList가 세로 스크롤 담당.
  return (
    <div className="w-full max-w-[640px] overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950">
      <FixedSizeList
        height={LIST_HEIGHT}
        width={CONTENT_WIDTH}
        itemCount={ids.length}
        itemSize={ROW_HEIGHT}
      >
        {({ index, style }: ListChildComponentProps) => (
          <div style={style}>
            <RobotRow id={ids[index]} />
          </div>
        )}
      </FixedSizeList>
    </div>
  );
}
