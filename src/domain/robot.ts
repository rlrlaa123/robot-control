export type RobotStatus = "idle" | "moving" | "charging" | "error" | "offline";

export interface Robot {
  id: string; // "RBT-0001"
  name: string;
  status: RobotStatus;
  battery: number; // 0-100
  position: { x: number; y: number }; // 0-1000 그리드 좌표
  currentTask: string | null;
  lastUpdate: number; // epoch ms
}

export interface RobotUpdate {
  id: string;
  status?: RobotStatus;
  battery?: number;
  position?: { x: number; y: number };
  currentTask?: string | null;
}
