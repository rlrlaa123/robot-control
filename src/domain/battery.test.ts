import { getBatteryLevel } from "./battery";

// "배터리 숫자 → 등급" 규칙을 표로 적고, 각 줄을 자동 검증한다.
// 규칙: > 20 normal / 10~20 warning / < 10 critical
describe("getBatteryLevel", () => {
  it.each([
    [50, "normal"],
    [21, "normal"],
    [20, "warning"], // 경계: 20은 "> 20"이 아니므로 normal 아님
    [15, "warning"],
    [10, "warning"], // 경계: 10은 "< 10"이 아니므로 critical 아님
    [9, "critical"],
    [0, "critical"],
  ] as const)("배터리 %i%% → %s", (battery, expected) => {
    expect(getBatteryLevel(battery)).toBe(expected);
  });
});
