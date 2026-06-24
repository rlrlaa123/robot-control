import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { Robot, RobotUpdate } from "@/domain/robot";

// id → Robot 맵. 개별 로봇 조회를 O(1)로, 행별 atom 구독을 가능하게.
export const robotsMapAtom = atom<Record<string, Robot>>({});

// 렌더 순서 고정용. 실시간 갱신해도 행이 재정렬돼 튀지 않게 (UX 문서 7번).
export const robotIdsAtom = atom<string[]>([]);

// 각 행이 "자기 로봇"만 구독 → 안 바뀐 로봇은 같은 참조라 리렌더 bail-out.
export const robotByIdAtom = atomFamily((id: string) =>
  atom((get) => get(robotsMapAtom)[id]),
);

// 폴링 변경분 반영. M1 applyUpdate와 같은 불변성 원칙(맵 버전):
// 바뀐 로봇만 새 객체, 나머지는 기존 참조 유지 → jotai가 리렌더를 자동 절약.
export const applyUpdatesAtom = atom(
  null,
  (get, set, updates: RobotUpdate[]) => {
    const map = { ...get(robotsMapAtom) };
    for (const u of updates) {
      const cur = map[u.id];
      if (cur) map[u.id] = { ...cur, ...u, lastUpdate: Date.now() }; // 모르는 id는 무시
    }
    set(robotsMapAtom, map);
  },
);
