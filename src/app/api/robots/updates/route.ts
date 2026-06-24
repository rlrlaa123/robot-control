import { NextResponse } from "next/server";
import { generateUpdates } from "@/mock/generateUpdates";

// 폴링 대상 → 매번 새 변경분을 만들어야 하므로 캐시 절대 금지
export const dynamic = "force-dynamic";

// 변경분만 반환 (1초마다 클라이언트가 폴링)
export async function GET() {
  return NextResponse.json(generateUpdates(500));
}
