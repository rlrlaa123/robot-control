import { applyUpdate } from "./update";
import { makeRobot } from "@/test/factory";

describe("applyUpdate", () => {
  it("규칙1: 바뀐 로봇만 새 객체, 안 바뀐 로봇은 참조 유지", () => {
    const a = makeRobot("RBT-0001", { battery: 80 });
    const b = makeRobot("RBT-0002", { battery: 90 });
    const next = applyUpdate([a, b], [{ id: "RBT-0001", battery: 10 }]);

    expect(next[1]).toBe(b); // 안 바뀐 로봇 → 같은 참조 (memo가 스킵 가능)
    expect(next[0]).not.toBe(a); // 바뀐 로봇 → 새 객체
    expect(next[0].battery).toBe(10); // 변경분 반영
    expect(next[0].id).toBe("RBT-0001"); // 나머지 필드는 보존
  });

  it("여러 필드를 한 번에 병합한다", () => {
    const a = makeRobot("RBT-0001", { status: "idle", battery: 50 });
    const next = applyUpdate(
      [a],
      [{ id: "RBT-0001", status: "error", battery: 5 }],
    );
    expect(next[0].status).toBe("error");
    expect(next[0].battery).toBe(5);
  });

  it("규칙2: 목록에 없는 id는 무시한다", () => {
    const a = makeRobot("RBT-0001");
    const next = applyUpdate([a], [{ id: "RBT-9999", battery: 0 }]);
    expect(next).toHaveLength(1); // 새 로봇으로 추가되지 않음
    expect(next[0]).toBe(a); // 아무것도 안 바뀌었으니 참조 그대로
  });
});
