import { render, screen, fireEvent } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { robotsMapAtom, robotIdsAtom } from "@/state/atoms";
import { makeRobot } from "@/test/factory";
import { Filters } from "./Filters";
import { FleetList } from "./FleetList";

// 테스트 5: 상태 필터 클릭 시 리스트가 해당 상태만 남는지
describe("상태 필터", () => {
  it("'에러' 토글을 켜면 error 로봇만 리스트에 남는다", () => {
    const store = createStore();
    store.set(robotsMapAtom, {
      "RBT-0001": makeRobot("RBT-0001", { status: "error" }),
      "RBT-0002": makeRobot("RBT-0002", { status: "moving" }),
    });
    store.set(robotIdsAtom, ["RBT-0001", "RBT-0002"]);

    render(
      <Provider store={store}>
        <Filters />
        <FleetList />
      </Provider>,
    );

    // 처음엔 둘 다 보인다
    expect(screen.getByText("RBT-0001")).toBeInTheDocument();
    expect(screen.getByText("RBT-0002")).toBeInTheDocument();

    // "에러" 필터 토글 클릭
    fireEvent.click(screen.getByRole("button", { name: "에러" }));

    // error 로봇만 남고 moving 로봇은 사라진다
    expect(screen.getByText("RBT-0001")).toBeInTheDocument();
    expect(screen.queryByText("RBT-0002")).not.toBeInTheDocument();
  });
});
