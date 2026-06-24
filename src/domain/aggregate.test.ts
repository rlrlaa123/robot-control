import { aggregateStatus } from "./aggregate";
import { makeRobot } from "@/test/factory";

describe("aggregateStatus", () => {
  it("빈 배열이면 모든 상태가 0 (결정 A)", () => {
    expect(aggregateStatus([])).toEqual({
      idle: 0,
      moving: 0,
      charging: 0,
      error: 0,
      offline: 0,
    });
  });

  it("상태별로 세고, 없는 상태는 0으로 채운다", () => {
    const robots = [
      makeRobot("RBT-0001", { status: "moving" }),
      makeRobot("RBT-0002", { status: "moving" }),
      makeRobot("RBT-0003", { status: "error" }),
    ];
    expect(aggregateStatus(robots)).toEqual({
      idle: 0,
      moving: 2,
      charging: 0,
      error: 1,
      offline: 0,
    });
  });
});
