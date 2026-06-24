// getBatteryLevel을 "실제 구현을 유지한 jest.fn"으로 대체 → 호출 수로 렌더 수를 센다.
// (RobotRow는 렌더마다 getBatteryLevel을 정확히 1회 호출. Profiler의 렌더 카운트 대용)
jest.mock("@/domain/battery", () => {
  const actual = jest.requireActual<typeof import("@/domain/battery")>(
    "@/domain/battery",
  );
  return { __esModule: true, ...actual, getBatteryLevel: jest.fn(actual.getBatteryLevel) };
});

import { render, act } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { getBatteryLevel } from "@/domain/battery";
import { robotsMapAtom, robotIdsAtom, applyUpdatesAtom } from "@/state/atoms";
import { makeRobot } from "@/test/factory";
import { FleetList } from "./FleetList";

const renderCount = getBatteryLevel as unknown as jest.Mock;

function seed(store: ReturnType<typeof createStore>, n: number) {
  const map: Record<string, ReturnType<typeof makeRobot>> = {};
  const ids: string[] = [];
  for (let i = 1; i <= n; i++) {
    const id = `RBT-${String(i).padStart(4, "0")}`;
    map[id] = makeRobot(id, { status: "moving", battery: 50 });
    ids.push(id);
  }
  store.set(robotsMapAtom, map);
  store.set(robotIdsAtom, ids);
}

beforeEach(() => renderCount.mockClear());

describe("성능 검증: 가상화 + 변경분만 리렌더", () => {
  it("[Elements 대응] 500대를 시드해도 마운트되는 행은 보이는 ~15개뿐 (react-window)", () => {
    const store = createStore();
    seed(store, 500);

    const { container } = render(
      <Provider store={store}>
        <FleetList />
      </Provider>,
    );

    const rendered = renderCount.mock.calls.length;
    const domRows = container.querySelectorAll('[class*="cursor-pointer"]').length;
    console.log(`[진단] 마운트 렌더 호출=${rendered}, 실제 DOM 행 노드=${domRows}`);

    // Elements 대응: 실제 DOM에 박힌 행 노드 수가 핵심. 500이면 가상화 미적용.
    expect(domRows).toBeGreaterThan(10);
    expect(domRows).toBeLessThan(30);
  });

  it("[Profiler 대응] 1초 갱신(3대 변경) 시 그 3행만 리렌더 (memo + atomFamily + 불변성)", () => {
    const store = createStore();
    seed(store, 500);
    render(
      <Provider store={store}>
        <FleetList />
      </Provider>,
    );

    renderCount.mockClear(); // 초기 렌더 제외, 여기서부터 카운트
    act(() => {
      store.set(applyUpdatesAtom, [
        { id: "RBT-0001", battery: 10 }, // 인덱스 0 (보이는 윈도우)
        { id: "RBT-0003", battery: 20 }, // 인덱스 2
        { id: "RBT-0005", battery: 5 }, // 인덱스 4
      ]);
    });

    expect(renderCount.mock.calls.length).toBe(3); // 500이면 memo 미적용
  });

  it("[대조군] 안 보이는 행을 변경하면 리렌더 0 (마운트조차 안 됨)", () => {
    const store = createStore();
    seed(store, 500);
    render(
      <Provider store={store}>
        <FleetList />
      </Provider>,
    );

    renderCount.mockClear();
    act(() => {
      store.set(applyUpdatesAtom, [{ id: "RBT-0400", battery: 1 }]); // 윈도우 밖
    });
    expect(renderCount.mock.calls.length).toBe(0);
  });
});
