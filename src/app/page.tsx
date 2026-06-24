import { headers } from "next/headers";
import type { Robot } from "@/domain/robot";
import { LiveFleet } from "@/components/LiveFleet";

// 서버 컴포넌트에서 BFF(/api/robots)를 fetch → 첫 화면이 스피너 없이 채워짐.
// 자기 라우트 호출이라 절대 URL이 필요 → 요청 헤더에서 호스트를 얻는다.
async function getInitialRobots(): Promise<Robot[]> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/robots`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function Home() {
  const initialRobots = await getInitialRobots();

  return (
    <main className="flex flex-1 flex-col items-center gap-4 bg-neutral-950 px-4 py-6 text-neutral-100">
      <h1 className="text-2xl font-semibold tracking-tight">로봇 플릿 관제</h1>
      <LiveFleet initialRobots={initialRobots} />
    </main>
  );
}
