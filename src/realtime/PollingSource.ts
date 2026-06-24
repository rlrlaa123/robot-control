import type { RealtimeSource } from "./types";
import type { RobotUpdate } from "@/domain/robot";

// 1초마다 /api/robots/updates(BFF)를 폴링해 변경분을 onUpdate로 흘려보낸다.
// (브라우저에서 실행되므로 상대경로 fetch면 충분)
export class PollingSource implements RealtimeSource {
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private intervalMs = 1000) {}

  subscribe(onUpdate: (msg: RobotUpdate[]) => void) {
    this.timer = setInterval(async () => {
      try {
        const res = await fetch("/api/robots/updates");
        if (res.ok) onUpdate(await res.json());
      } catch {
        /* 일시적 실패는 다음 틱에 자연 재시도 */
      }
    }, this.intervalMs);
  }

  disconnect() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
