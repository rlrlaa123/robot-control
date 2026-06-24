import { NextResponse } from "next/server";
import { generateRobots } from "@/mock/generateRobots";

// 캐시 방지: 안 그러면 매 요청이 빌드타임 스냅샷으로 굳어버림
export const dynamic = "force-dynamic";

// 전체 스냅샷 (초기 로드용). 서버에서만 실행 → 목/벤더 출처를 클라이언트가 모름
export async function GET() {
  return NextResponse.json(generateRobots(500));
}
