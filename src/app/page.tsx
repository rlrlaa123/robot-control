import { headers } from "next/headers";
import type { Robot } from "@/domain/robot";
import { aggregateStatus } from "@/domain/aggregate";

// 서버 컴포넌트에서 BFF(/api/robots)를 fetch → 첫 화면이 스피너 없이 채워짐.
// 자기 라우트 호출이라 절대 URL이 필요 → 요청 헤더에서 호스트를 얻는다.
// (대안: generateRobots를 직접 import. 여기선 BFF 경유 패턴을 학습용으로 사용)
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
  const robots = await getInitialRobots();
  const counts = aggregateStatus(robots);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-neutral-950 text-neutral-100">
      <h1 className="text-4xl font-semibold tracking-tight">Hello Fleet 🤖</h1>
      <p className="text-neutral-400">
        서버에서 BFF로 <b className="text-neutral-100">{robots.length}</b>대 로딩됨
      </p>
      <pre className="rounded bg-neutral-900 px-4 py-3 text-sm text-neutral-300">
        {JSON.stringify(counts, null, 2)}
      </pre>
    </main>
  );
}
