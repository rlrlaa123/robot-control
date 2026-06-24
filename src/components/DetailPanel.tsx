"use client";

import { useAtom, useAtomValue } from "jotai";
import { selectedIdAtom, robotByIdAtom } from "@/state/atoms";
import { getBatteryLevel } from "@/domain/battery";

export function DetailPanel() {
  const [selectedId, setSelectedId] = useAtom(selectedIdAtom);
  if (!selectedId) return null;
  return <Panel id={selectedId} onClose={() => setSelectedId(null)} />;
}

function Panel({ id, onClose }: { id: string; onClose: () => void }) {
  const robot = useAtomValue(robotByIdAtom(id));
  if (!robot) return null;

  const level = getBatteryLevel(robot.battery);
  const levelText = { normal: "정상", warning: "경고", critical: "위험" }[level];

  return (
    <aside className="fixed inset-x-0 bottom-0 z-20 max-h-[60vh] overflow-y-auto border-t border-neutral-800 bg-neutral-900 p-5 sm:inset-y-0 sm:left-auto sm:right-0 sm:bottom-auto sm:max-h-none sm:w-80 sm:border-l sm:border-t-0">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-lg text-neutral-100">{robot.id}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="rounded px-2 py-0.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
        >
          ✕
        </button>
      </div>
      <dl className="space-y-2 text-sm">
        <Row label="상태" value={robot.status} />
        <Row label="배터리" value={`${robot.battery}% (${levelText})`} />
        <Row label="위치" value={`x ${robot.position.x}, y ${robot.position.y}`} />
        <Row label="현재 작업" value={robot.currentTask ?? "없음"} />
        <Row
          label="마지막 갱신"
          value={new Date(robot.lastUpdate).toLocaleTimeString("ko-KR")}
        />
      </dl>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right text-neutral-200">{value}</dd>
    </div>
  );
}
