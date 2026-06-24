"use client";

import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { robotsMapAtom, robotIdsAtom, selectedIdAtom } from "@/state/atoms";
import type { RobotStatus } from "@/domain/robot";

const SIZE = 360; // 캔버스 표시 크기(px)
const GRID = 1000; // 로봇 좌표 범위 0~1000

// canvas는 Tailwind 클래스가 아니라 실제 색상값이 필요 → 팔레트와 동일한 hex.
const STATUS_COLOR: Record<RobotStatus, string> = {
  moving: "#34d399", // emerald-400
  idle: "#a1a1aa", // zinc-400
  charging: "#fbbf24", // amber-400
  error: "#ef4444", // red-500
  offline: "#525252", // neutral-600
};

export function PositionCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const map = useAtomValue(robotsMapAtom);
  const ids = useAtomValue(robotIdsAtom);
  const selectedId = useAtomValue(selectedIdAtom);
  const setSelected = useSetAtom(selectedIdAtom);

  // map/선택이 바뀔 때마다 다시 그린다. 500점이라도 canvas엔 부담 없음(DOM 500개와 대비).
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);

    // 옅은 그리드 (100 단위)
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 10; i++) {
      const p = (i / 10) * SIZE;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, SIZE);
      ctx.moveTo(0, p);
      ctx.lineTo(SIZE, p);
      ctx.stroke();
    }

    const scale = SIZE / GRID;
    for (const id of ids) {
      const r = map[id];
      if (!r) continue;
      const x = r.position.x * scale;
      const y = r.position.y * scale;
      const isSel = id === selectedId;
      ctx.beginPath();
      ctx.arc(x, y, isSel ? 5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = STATUS_COLOR[r.status];
      ctx.fill();
      if (isSel) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#38bdf8"; // sky-400
        ctx.stroke();
      }
    }
  }, [map, ids, selectedId]);

  // 클릭 지점에서 가장 가까운 로봇(12px 이내)을 선택.
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const scale = SIZE / GRID;

    let best: string | null = null;
    let bestDist = Infinity;
    for (const id of ids) {
      const r = map[id];
      if (!r) continue;
      const dx = r.position.x * scale - px;
      const dy = r.position.y * scale - py;
      const d = dx * dx + dy * dy;
      if (d < bestDist) {
        bestDist = d;
        best = id;
      }
    }
    if (best && bestDist <= 12 * 12) setSelected(best);
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <canvas
        ref={ref}
        onClick={handleClick}
        style={{ width: SIZE, height: SIZE }}
        className="cursor-crosshair rounded-lg border border-neutral-800 bg-neutral-950"
      />
      <p className="text-xs text-neutral-500">위치 맵 · 점 클릭 시 선택</p>
    </div>
  );
}
