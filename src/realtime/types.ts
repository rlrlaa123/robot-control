import type { RobotUpdate } from "@/domain/robot";

// 실시간 소스 추상화. 지금은 PollingSource, 나중에 SSESource/WS로 교체해도
// 클라이언트 코드는 이 인터페이스만 알면 됨 (출처를 모름).
export interface RealtimeSource {
  subscribe(onUpdate: (msg: RobotUpdate[]) => void): void;
  disconnect(): void;
}
