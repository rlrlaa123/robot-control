"use client";

import { useEffect, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import { searchQueryAtom, statusFilterAtom } from "@/state/atoms";
import type { RobotStatus } from "@/domain/robot";

const STATUS_BUTTONS: { status: RobotStatus; label: string; on: string }[] = [
  { status: "moving", label: "가동", on: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/50" },
  { status: "idle", label: "대기", on: "bg-zinc-500/20 text-zinc-200 ring-zinc-400/50" },
  { status: "charging", label: "충전", on: "bg-amber-500/20 text-amber-300 ring-amber-500/50" },
  { status: "error", label: "에러", on: "bg-red-500/20 text-red-300 ring-red-500/50" },
  { status: "offline", label: "오프라인", on: "bg-neutral-500/20 text-neutral-300 ring-neutral-500/50" },
];

export function Filters() {
  const setQuery = useSetAtom(searchQueryAtom);
  const [filter, setFilter] = useAtom(statusFilterAtom);
  const [text, setText] = useState("");

  // 입력은 즉시 반영하되 atom 쓰기는 200ms 디바운스 (매 키 입력마다 필터링 방지).
  useEffect(() => {
    const t = setTimeout(() => setQuery(text), 200);
    return () => clearTimeout(t);
  }, [text, setQuery]);

  const toggle = (s: RobotStatus) => {
    setFilter((prev: Set<RobotStatus>) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="이름 검색 (예: RBT-0042)"
        className="flex-1 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
      />
      <div className="flex flex-wrap gap-1.5">
        {STATUS_BUTTONS.map(({ status, label, on }) => {
          const active = filter.has(status);
          return (
            <button
              key={status}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(status)}
              className={`rounded-full px-3 py-1 text-xs ring-1 transition-colors ${
                active
                  ? on
                  : "bg-neutral-900 text-neutral-400 ring-neutral-800 hover:text-neutral-200"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
