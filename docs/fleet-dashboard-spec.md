# 로봇 플릿 관제 대시보드 — 작업 지시서

> Claude Code remote(모바일) 작업용. 결과물은 **Vercel**에 자동 배포(git push → 자동 빌드).
> 이 파일을 레포 루트에 두고 `M0`부터 순서대로 진행한다. 마일스톤 하나 = 모바일 세션 하나가 목표.
> **핵심: Next.js를 "제대로" 쓴다 — App Router 서버 컴포넌트 + API 라우트를 BFF로 활용.**

---

## 0. 이 프로젝트의 목적

실시간 플릿 관제 대시보드를 직접 만들며 **Next.js App Router / jotai / Jest(TDD) / 대규모 리스트 성능 최적화**를 손으로 체득한다.
- AI에 통째로 맡기지 말고, 핵심은 직접 짜서 워크플로우를 몸에 익히는 게 1순위
- 결과물은 Vercel에 올려 실제로 돌아가는 데모로 남긴다

**규칙: 핵심 순수 함수와 테스트 최소 3개는 반드시 직접 손으로 TDD(빨강→초록) 돌린다.** 나머지는 AI 활용 OK.

---

## 1. 기술 스택 & 제약

| 항목 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | Next.js (App Router) | 서버 컴포넌트 + API 라우트까지 풀로 사용 |
| 백엔드 | Next API 라우트(Route Handler)를 BFF로 | 외부 API 프록시 / 키 은닉 / CORS 제거 |
| 언어 | TypeScript | 서버↔클라이언트 타입 공유 |
| 상태관리 | jotai | 원자 단위 상태로 리렌더 범위 최소화 |
| 테스트 | Jest + React Testing Library | 순수 로직 + 컴포넌트 단위 테스트 |
| 가상화 | react-window | 대규모 플릿 리스트 성능 |
| 스타일 | Tailwind CSS | 모바일 작업 효율 |
| 배포 | **Vercel** (GitHub 연동 자동배포) | Next 풀기능 지원. push 한 번에 배포 |

### Vercel 배포 세팅 (M0에서)
- GitHub 레포를 Vercel에 연결 → `main` push 시 자동 빌드/배포 (Actions 불필요)
- `output: 'export'` **쓰지 않는다.** 서버 컴포넌트·API 라우트를 살려야 BFF가 됨
- env(외부 API 키 등)는 Vercel 대시보드 환경변수에 넣고 서버 측에서만 사용

### 실시간 처리 제약 (중요)
- Vercel은 **서버리스**라 장기 연결(WebSocket 서버)을 직접 못 띄운다 → **폴링(polling)으로 간다**
- 클라이언트가 1초마다 BFF API(`/api/robots/updates`)를 폴링. 소스는 인터페이스로 추상화(아래 2번)
- 진짜 WS가 필요하면 전용 상주 서버(Express+ws)나 매니지드(Pusher/Ably)가 필요 — 데모는 폴링으로 간다

### 기술 선택 근거 (각 선택을 왜)

**jotai를 쓰는데 왜 `React.memo`도 필요한가** — 둘은 푸는 문제가 다르다.
- jotai = "누가 이 상태를 구독하느냐"를 좁힌다 → 리렌더 **트리거 범위**를 줄임
- memo = "props가 그대로면 리렌더를 건너뛴다" → 리렌더 **전파**를 끊음
- 문제 상황: 로봇 1대만 바뀌어도 `robots` 배열 참조가 바뀌면 리스트 전체가 리렌더된다. jotai만으론 안 막힌다.
- 해법: ① 행(`RobotRow`)을 `memo`로 감싸 안 바뀐 로봇은 스킵, ② jotai를 **로봇별 atom으로 쪼개**(`atomFamily`) 바뀐 행만 자기 atom 구독. 본 프로젝트는 둘 다 쓴다(부록 A 참고).
- 핵심 원리: **변경된 로봇만 새 객체 참조를 만들고, 안 바뀐 로봇은 기존 참조를 유지**하면 jotai가 `Object.is`로 리렌더를 자동 bail-out 한다. → `applyUpdate`의 불변성이 성능의 열쇠.

**react-window (가상화)** — "화면에 안 보이는 행은 DOM에 안 그린다".
- 500개를 전부 `<div>`로 그리면 DOM 노드 500개. 가상화하면 화면에 보이는 15~20개만 그리고 스크롤 시 재활용.
- 매초 갱신되는 관제 화면에서 효과 큼(안 보이는 480개를 매초 리렌더할 이유 없음).
- 행 높이가 일정하므로 `FixedSizeList` 사용(가변 높이 `VariableSizeList`는 복잡하니 피함).

**Tailwind CSS** — 모바일(Claude Code remote) 작업에 최적.
- 클래스를 마크업에 바로 박아 CSS 파일 왕복이 없음(파일 전환 번거로운 모바일에 유리).
- 상태 색상 체계(error=빨강, charging=앰버 등)를 `bg-red-500` 같은 토큰으로 일관 관리.
- 대안 비교: CSS Modules(파일 분리 → 모바일 불리), styled-components(런타임 비용 + 서버 컴포넌트 궁합 애매).

**Jest + React Testing Library** — 경쟁이 아니라 역할 분담.
- Jest = 테스트 실행기(엔진). 순수 함수(`aggregateStatus` 등)는 Jest만으로 충분.
- RTL = React 컴포넌트를 **사용자가 보는 대로** 테스트(내부 state가 아니라 화면 텍스트/클릭으로 검증).
- 이점: 내부 구현을 리팩터링(useState→jotai)해도 화면 결과가 같으면 테스트가 안 깨짐 → 구현에 덜 묶임.
- Enzyme은 내부 인스턴스를 들여다봐서 잘 깨지고 최신 React 지원도 끊김 → 현재 표준은 RTL.

---

## 2. 핵심 아키텍처 — BFF + 실시간 데이터 추상화

데이터 흐름: **외부 로봇 API(목) → Next API 라우트(BFF) → 클라이언트 폴링 → jotai**

BFF가 외부 소스를 가리므로, 클라이언트는 출처를 모른다. 소스도 인터페이스로 추상화한다.

```ts
// src/realtime/types.ts
export interface RealtimeSource {
  subscribe(onUpdate: (msg: RobotUpdate[]) => void): void;
  disconnect(): void;
}
```

- 지금: `PollingSource` — 1초마다 `/api/robots/updates`(BFF)를 fetch해서 onUpdate 호출
- BFF 내부: 외부 벤더 API를 호출(지금은 목 생성기). **키·CORS·출처를 서버에서 숨김**
- 나중: `SSESource` 또는 전용 WS 서버로 교체 — 인터페이스 동일하니 구현만 바꿈

### 서버리스에서 "변경분"을 어떻게 만드나 (중요한 함정)

서버리스는 stateless라 "지난번 상태 대비 뭐가 바뀌었나"를 서버가 기억할 수 없다. 그래서:
- **데모 방식**: `/api/robots/updates`는 매 호출마다 **"변한 척" 할 로봇 5~20대를 무작위로 골라** 그럴듯한 변경분(`RobotUpdate[]`)을 생성해 반환. 서버는 아무 상태도 저장하지 않는다.
- 클라이언트가 그 변경분을 `applyUpdate`로 자기 메모리의 로봇 맵에 반영 → 화면이 살아있는 것처럼 보임.
- **진짜라면**: DB/시계열 저장소 + 메시지 큐(Kafka 등)가 실제 변경분을 들고 있고, 서버는 그걸 조회해 내려줌. 데모는 이 부분을 목으로 대체한 것.
- Next 라우트 핸들러는 기본 캐시될 수 있으므로 **`export const dynamic = 'force-dynamic'`** 필수(안 그러면 폴링이 같은 응답만 받음).

---

## 3. 데이터 모델

```ts
// src/domain/robot.ts
export type RobotStatus = 'idle' | 'moving' | 'charging' | 'error' | 'offline';

export interface Robot {
  id: string;          // "RBT-0001"
  name: string;
  status: RobotStatus;
  battery: number;     // 0-100
  position: { x: number; y: number };  // 0-1000 그리드 좌표
  currentTask: string | null;
  lastUpdate: number;  // epoch ms
}

export interface RobotUpdate {
  id: string;
  status?: RobotStatus;
  battery?: number;
  position?: { x: number; y: number };
  currentTask?: string | null;
}
```

목 데이터: 로봇 **500대** 생성기로 시작(가상화 효과 확인엔 충분).

---

## 4. 화면 / 기능 명세 (MVP)

1. **요약 헤더**: 전체 / 가동(moving+idle) / 충전 / 에러 / 오프라인 카운트 카드
2. **로봇 리스트**: 가상화된 테이블. 행 = 이름·상태배지·배터리바·현재작업. 1초 간격 실시간 갱신
3. **검색/필터**: 이름 검색 + 상태 필터 토글
4. **디테일 패널**: 행 클릭 시 우측(모바일은 하단) 슬라이드. 선택 로봇 상세
5. **배터리 경고**: 20% 이하 빨강, 10% 이하 깜빡임

**제외(여유 시):** 2D 캔버스 위치맵, 지도/3D. MVP 범위 밖이라 후순위.

---

## 5. 테스트 목록 (TDD — 먼저 짠다)

> 아래 1~3은 순수 함수. **테스트 먼저 → 실패 확인 → 구현 → 통과**를 직접 손으로.

1. `aggregateStatus(robots): Record<RobotStatus, number>` — 상태별 집계
2. `applyUpdate(robots, update): Robot[]` — 해당 로봇만 불변 업데이트(나머지 참조 유지 확인)
3. `getBatteryLevel(battery): 'normal'|'warning'|'critical'` — 임계값 분기
4. (RTL) 요약 카드가 집계 결과를 렌더하는지 1개
5. (RTL) 상태 필터 클릭 시 리스트가 줄어드는지 1개

---

## 6. 마일스톤 (각 = 모바일 세션 1회)

### M0 — 셋업 + Vercel 배포 먼저 뚫기
- `create-next-app`(TS, App Router, Tailwind), jotai/jest/RTL/react-window 설치
- GitHub 레포 생성 → Vercel 연결
- **빈 "Hello Fleet" 페이지가 Vercel URL에 뜨는 것까지 확인** (배포부터 먼저 뚫어두면 나중에 안 막힘)
- ✅ 검증: 실제 Vercel URL 접속 성공 / 커밋 `chore: setup + vercel deploy`

### M1 — 도메인 + 목 데이터 + 집계 (TDD)
- `domain/robot.ts`, `mock/generateRobots.ts`(500대)
- 테스트 1~3 작성→실패→구현→통과 (직접)
- ✅ 검증: `npm test` 초록 / 커밋 `feat: domain model + status aggregation (TDD)`

### M2 — BFF API 라우트
- `app/api/robots/route.ts` — 전체 로봇 목록 반환(목 생성기 호출). 서버에서만 실행
- `app/api/robots/updates/route.ts` — 변경분만 반환(폴링 대상)
- 페이지 초기 목록은 **서버 컴포넌트에서 fetch** (클라이언트 로딩 스피너 없이 첫 화면)
- ✅ 검증: `/api/robots` 직접 호출 시 JSON 응답 / 커밋 `feat: BFF route handlers`

### M3 — 실시간 추상화(폴링)
- `RealtimeSource` 인터페이스 + `PollingSource`(1초마다 `/api/robots/updates` fetch)
- jotai atom: `robotsAtom`, `subscribe`로 `applyUpdate` 연결
- ✅ 검증: 화면 값이 1초마다 바뀜 / 커밋 `feat: realtime polling source`

### M4 — 대시보드 UI
- 요약 헤더 카드 + 로봇 리스트(아직 가상화 전, 일반 렌더)
- ✅ 검증: 브라우저에서 숫자/배터리 움직임 / 커밋 `feat: dashboard summary + robot list`

### M5 — 가상화 + 성능 최적화
- `react-window`로 리스트 가상화
- `React.memo`로 행 메모이제이션, 불필요 리렌더 차단
- ✅ 검증: 500대에서 스크롤 부드러움 / 커밋 `perf: virtualize fleet list`

### M6 — 디테일 패널 + 필터 + 폴리싱
- 검색/상태 필터, 디테일 패널, 배터리 경고 스타일
- RTL 테스트 4~5
- ✅ 검증: 전체 흐름 동작 / 커밋 `feat: filters, detail panel, battery alerts`

### (옵션) M7 — 2D 위치 캔버스 / SSE 업그레이드
- `<canvas>`에 position 점 찍기, 또는 폴링→SSE 교체로 추상화 검증

---

## 7. 모바일 작업 운영 규칙

- 한 세션 = 한 마일스톤. 끝나면 반드시 커밋 + 배포 확인 후 종료
- 큰 변경 전 Claude Code에 "이 파일들 뭘 바꿀 건지 먼저 요약해" 시키고 승인 후 실행
- TDD 마일스톤(M1)은 AI에 위임하지 말고 테스트 코드 줄을 직접 읽고 이해
- 막히면 그 세션 범위만 롤백, 다음 세션으로

---

## 부록 A. 구현 스켈레톤 (Claude Code 참고용)

> 그대로 베끼지 말고 구조 가이드로. 특히 순수 함수(aggregate/update/battery)는 부록의 테스트를 먼저 짜고 직접 구현.

### A-1. 폴더 구조

```
src/
  app/
    layout.tsx
    page.tsx                 # 서버 컴포넌트: 초기 목록 fetch → 클라이언트에 전달
    api/
      robots/
        route.ts             # 전체 스냅샷 (초기 로드용)
        updates/route.ts     # 변경분 (폴링용)
  domain/
    robot.ts                 # 타입 (섹션 3)
    aggregate.ts  aggregate.test.ts
    update.ts     update.test.ts
    battery.ts    battery.test.ts
  mock/
    generateRobots.ts
  realtime/
    types.ts                 # RealtimeSource (섹션 2)
    PollingSource.ts
  state/
    atoms.ts                 # jotai
  components/
    SummaryBar.tsx
    FleetList.tsx            # react-window
    RobotRow.tsx             # memo
    DetailPanel.tsx
    Filters.tsx
```

마일스톤 매핑: A-2~A-3 → M1 / A-4 → M2 / A-5~A-6 → M3 / A-7~A-9 → M4·M5

### A-2. 순수 함수 시그니처 (M1, TDD)

```ts
// domain/aggregate.ts
export function aggregateStatus(robots: Robot[]): Record<RobotStatus, number>;
// domain/update.ts  — 불변성이 핵심
export function applyUpdate(robots: Robot[], updates: RobotUpdate[]): Robot[];
// domain/battery.ts
export function getBatteryLevel(battery: number): 'normal' | 'warning' | 'critical';
//   > 20 normal / 10~20 warning / < 10 critical
```

### A-3. 테스트 스켈레톤 (먼저 짜고 → 빨강 → 구현)

```ts
// domain/update.test.ts — 안 바뀐 로봇은 "참조 유지"가 핵심
it('변경 로봇만 새 객체, 나머지는 참조 유지', () => {
  const a = makeRobot('RBT-0001');
  const b = makeRobot('RBT-0002');
  const next = applyUpdate([a, b], [{ id: 'RBT-0001', battery: 10 }]);
  expect(next[1]).toBe(b);        // 같은 참조 (memo가 스킵할 수 있게)
  expect(next[0]).not.toBe(a);    // 새 객체
  expect(next[0].battery).toBe(10);
});

// domain/battery.test.ts
it.each([[50,'normal'],[15,'warning'],[5,'critical']] as const)(
  'battery %i → %s', (b, exp) => expect(getBatteryLevel(b)).toBe(exp)
);
```

### A-4. BFF 라우트 (M2)

```ts
// app/api/robots/route.ts — 전체 스냅샷
import { NextResponse } from 'next/server';
import { generateRobots } from '@/mock/generateRobots';
export const dynamic = 'force-dynamic';          // 캐시 방지
export async function GET() {
  return NextResponse.json(generateRobots(500));
}

// app/api/robots/updates/route.ts — 변경분(목)
import { NextResponse } from 'next/server';
import type { RobotUpdate, RobotStatus } from '@/domain/robot';
export const dynamic = 'force-dynamic';
const STATUSES: RobotStatus[] = ['idle','moving','charging','error','offline'];
export async function GET() {
  const n = 5 + Math.floor(Math.random() * 15);   // 5~20대
  const updates: RobotUpdate[] = Array.from({ length: n }, () => {
    const id = `RBT-${String(1 + Math.floor(Math.random()*500)).padStart(4,'0')}`;
    return { id, status: STATUSES[Math.floor(Math.random()*5)], battery: Math.floor(Math.random()*100) };
  });
  return NextResponse.json(updates);
}
```

### A-5. PollingSource (M3)

```ts
// realtime/PollingSource.ts
import type { RealtimeSource } from './types';
import type { RobotUpdate } from '@/domain/robot';
export class PollingSource implements RealtimeSource {
  private timer: ReturnType<typeof setInterval> | null = null;
  constructor(private intervalMs = 1000) {}
  subscribe(onUpdate: (msg: RobotUpdate[]) => void) {
    this.timer = setInterval(async () => {
      try {
        const res = await fetch('/api/robots/updates');
        if (res.ok) onUpdate(await res.json());
      } catch { /* 다음 틱에 재시도 */ }
    }, this.intervalMs);
  }
  disconnect() { if (this.timer) clearInterval(this.timer); this.timer = null; }
}
```

### A-6. jotai 상태 (M3) — 핵심 패턴

```ts
// state/atoms.ts
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import type { Robot, RobotUpdate } from '@/domain/robot';

export const robotsMapAtom = atom<Record<string, Robot>>({}); // id → Robot
export const robotIdsAtom  = atom<string[]>([]);              // 순서 고정 (재정렬 방지)

// 행이 자기 로봇만 구독 → 안 바뀐 로봇은 같은 참조라 리렌더 bail-out
export const robotByIdAtom = atomFamily((id: string) =>
  atom((get) => get(robotsMapAtom)[id])
);

// 폴링 변경분 반영 — 바뀐 로봇만 새 객체로
export const applyUpdatesAtom = atom(null, (get, set, updates: RobotUpdate[]) => {
  const map = { ...get(robotsMapAtom) };
  for (const u of updates) {
    const cur = map[u.id];
    if (cur) map[u.id] = { ...cur, ...u, lastUpdate: Date.now() };
  }
  set(robotsMapAtom, map);
});
```

### A-7. 메모이즈된 행 (M4·M5)

```tsx
// components/RobotRow.tsx
import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { robotByIdAtom } from '@/state/atoms';

export const RobotRow = memo(function RobotRow({ id }: { id: string }) {
  const robot = useAtomValue(robotByIdAtom(id));
  if (!robot) return null;
  // 상태 배지(색+텍스트 병기, 색각 고려) / 배터리 바 / 현재작업
  return (/* ... */ null);
});
```

### A-8. 가상화 리스트 (M5)

```tsx
// components/FleetList.tsx
import { FixedSizeList } from 'react-window';
import { useAtomValue } from 'jotai';
import { robotIdsAtom } from '@/state/atoms';
import { RobotRow } from './RobotRow';

export function FleetList() {
  const ids = useAtomValue(robotIdsAtom);   // 순서 고정 → 실시간 갱신해도 행 안 튐
  return (
    <FixedSizeList height={600} width="100%" itemCount={ids.length} itemSize={48}>
      {({ index, style }) => (
        <div style={style}><RobotRow id={ids[index]} /></div>
      )}
    </FixedSizeList>
  );
}
```

### A-9. Jest + Next 설정 메모 (M0/M1)

- `next/jest`로 설정 생성: `jest.config.ts`에서 `createJestConfig` 사용
- `testEnvironment: 'jsdom'`, `jest.setup.ts`에 `import '@testing-library/jest-dom'`
- 경로 별칭 `@/`는 `tsconfig.json`의 paths + jest `moduleNameMapper` 양쪽에 맞춰야 함
- 설치: `npm i jotai react-window` / `npm i -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/react-window`
