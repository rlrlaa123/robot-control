# 로봇 플릿 관제 대시보드

수백~수천 대 로봇의 상태를 실시간으로 감시하는 관제(monitoring) 대시보드.
**Next.js App Router · jotai · 대규모 리스트 성능 최적화 · TDD**를 직접 체득하기 위한 학습 프로젝트.

🔗 **라이브 데모: https://robot-control-topaz.vercel.app/**

---

## 주요 기능

- **실시간 갱신** — 1초 간격 폴링으로 로봇 상태/배터리/작업이 살아 움직임
- **요약 헤더** — 상태별(가동/대기/충전/에러/오프라인) 집계 카드, 에러는 빨강 강조
- **대규모 리스트** — 500대를 가상화 렌더(react-window)로 부드럽게 스크롤
- **검색 / 상태 필터** — 이름 검색(디바운스) + 상태 토글, 빈 상태 처리
- **디테일 패널** — 행 클릭 시 우측(모바일 하단) 슬라이드로 상세 정보
- **배터리 경고** — 20% 이하 앰버 / 10% 미만 빨강 점멸
- **다크 관제 톤 + 접근성** — 상태를 색 + 텍스트로 이중 표현(색각 고려)

> 위치 맵 캔버스(`PositionCanvas`)는 구현돼 있으나 현재 화면에선 숨김 상태입니다.
> 다시 켜려면 `LiveFleet`에 `<PositionCanvas />`를 추가하세요.

## 기술 스택

| 항목 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, 서버 컴포넌트 + Route Handler) |
| 언어 | TypeScript |
| 상태관리 | jotai (`atomFamily`로 행별 구독) |
| 가상화 | react-window (`FixedSizeList`) |
| 스타일 | Tailwind CSS v4 |
| 테스트 | Jest + React Testing Library |
| 배포 | Vercel (main push → 자동 빌드/배포) |

## 아키텍처

```
외부 로봇 API(목) → Next API 라우트(BFF) → 클라이언트 폴링 → jotai → UI
```

- **BFF**: `/api/robots`(전체 스냅샷)·`/api/robots/updates`(변경분)가 외부 출처·키·CORS를
  서버에서 숨긴다. 둘 다 `force-dynamic`으로 캐시를 막아야 폴링이 매번 새 응답을 받는다.
- **실시간 추상화**: `RealtimeSource` 인터페이스 뒤에 `PollingSource`를 둬서, 추후 SSE/WS로
  구현만 갈아끼울 수 있다.
- **성능 설계 (핵심)**:
  - `applyUpdate`는 **바뀐 로봇만 새 객체, 나머지는 기존 참조 유지**(불변성).
  - 각 행은 `robotByIdAtom(id)`으로 **자기 로봇만 구독** + `React.memo`.
  - → 1초마다 바뀐 5~20대만 리렌더되고, react-window로 **보이는 ~15행만 DOM**에 그린다.
  - 이 특성은 `perf.test.tsx`가 회귀 테스트로 보호한다.

자세한 설계 배경은 [`docs/fleet-dashboard-spec.md`](docs/fleet-dashboard-spec.md)(작업 지시서)와
[`docs/fleet-dashboard-ux.md`](docs/fleet-dashboard-ux.md)(UX 설계) 참고.

## 프로젝트 구조

```
src/
  app/
    page.tsx                  서버 컴포넌트: 초기 목록 SSR fetch
    api/robots/route.ts       전체 스냅샷 (BFF)
    api/robots/updates/route.ts  변경분 (폴링 대상)
  domain/                     순수 로직 (TDD)
    robot.ts                  타입
    aggregate.ts              상태별 집계
    update.ts                 변경분 적용 (불변성)
    battery.ts                배터리 등급 분기
  mock/                       목 데이터 생성기 (500대)
  realtime/                   RealtimeSource 인터페이스 + PollingSource
  state/atoms.ts              jotai atoms
  components/                 SummaryBar / Filters / FleetList / RobotRow / DetailPanel / ...
  test/factory.ts            테스트용 makeRobot 헬퍼
```

## 시작하기

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm test         # 테스트 (17개)
npm run build    # 프로덕션 빌드 (Vercel과 동일)
```

## 테스트

총 **17개**. 핵심 순수 함수(`aggregate`/`update`/`battery`)는 TDD(빨강→초록)로 작성:

- 순수 로직 단위 테스트 (도메인)
- 컴포넌트 테스트 (RTL): 요약 카드 집계, 상태 필터 동작
- 성능 회귀 가드 (`perf.test.tsx`): 가상화 + 변경분만 리렌더 검증

## 배포

GitHub `main`에 push하면 Vercel이 자동 빌드·배포한다.
`output: 'export'`는 쓰지 않는다 — 서버 컴포넌트·API 라우트(BFF)를 살려야 하기 때문.

## 알아둘 점

- **폴링 vs WebSocket**: Vercel은 서버리스라 장기 연결(WS 서버)을 직접 띄울 수 없어 폴링을 쓴다.
  실시간성이 더 필요하면 `RealtimeSource`를 SSE/매니지드 서비스 구현으로 교체하면 된다.
- **목 변경분**: 서버는 stateless라 실제 변경분을 모르므로, `/api/robots/updates`가 매 호출마다
  "변한 척" 할 로봇 5~20대를 무작위로 만들어 반환한다. 실서비스라면 DB/메시지큐가 들어갈 자리.
