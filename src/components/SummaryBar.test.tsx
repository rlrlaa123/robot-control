import { render, screen } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { robotsMapAtom } from "@/state/atoms";
import { makeRobot } from "@/test/factory";
import { SummaryBar } from "./SummaryBar";

// 테스트 4: 요약 카드가 집계 결과를 렌더하는지 (사용자가 보는 텍스트로 검증)
describe("SummaryBar", () => {
  it("상태별 집계 숫자를 카드에 렌더한다", () => {
    const store = createStore();
    store.set(robotsMapAtom, {
      "RBT-0001": makeRobot("RBT-0001", { status: "error" }),
      "RBT-0002": makeRobot("RBT-0002", { status: "error" }),
      "RBT-0003": makeRobot("RBT-0003", { status: "moving" }),
    });

    render(
      <Provider store={store}>
        <SummaryBar />
      </Provider>,
    );

    expect(screen.getByText("에러")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // error = 2 (유일)
    expect(screen.getByText("3")).toBeInTheDocument(); // total = 3
  });
});
