

## v6.18.14a Adventure Learn Move Prompt Handler Hotfix

- 레벨업 후 기술 배우기 선택 UI가 진행되지 않던 문제 수정
- “배운다” 선택 시 기술 습득 후 성장 이벤트 큐가 정상 진행되도록 수정
- “배우지 않는다” 선택 시 다음 성장/진화 흐름으로 정상 진행되도록 수정
- 기술 4개 초과 시 잊을 기술 선택 UI 진행 흐름 보강
- 성장 이벤트 큐의 growthProcessing 잠금 로직 보완
- 기술 습득/거절/교체 후 진화 체크가 정상 실행되도록 수정
- 기술 배우기 UI 버튼에 type="button" 보강
- 버튼 중복 클릭으로 기술이 중복 처리되지 않도록 방어
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능 유지

## Patch Notes - 2026.05.14 (Multi-hit Normal Attack Branch Fix)

### 버그 수정
- 일반 공격기가 1타짜리 다단히트처럼 처리되던 문제 수정
- 다단히트 연출은 `isMultiHit === true` 이벤트에서만 실행되도록 분기 강화
- 일반 기술 damage 이벤트에는 `hitIndex` / `hitCount`가 붙지 않도록 서버 이벤트 정리
- 예비 격투장과 본게임 모두 동일한 분기 기준 적용


## Patch Notes - 2026.05.14 (Multi-hit Completion)

### 다단히트 완성 패치
- 17개 타입별 다단히트 전용 이펙트 PNG를 `public/assets/effects/multihit/`에 추가
- 다단히트 기술은 각 hit마다 작은 타입별 이펙트가 재생되도록 수정
- 각 hit마다 공격 포켓몬이 짧게 전진했다 돌아오는 `multiHitBump` 모션 추가
- 각 hit마다 데미지 팝업과 HP 감소가 순차적으로 보이도록 예비 격투장 연출 보강
- 각 hit마다 독립 급소 판정 결과가 로그/데미지 메시지에 반영되도록 이벤트 정보 보강
- 기절 시 남은 hit는 중단되고, 스케일샷 후속 랭크 변화는 기술 종료 후 1회만 적용
- 페어리 다단히트 이펙트는 현재 페어리 다단히트 기술이 없어 제외

## Patch Notes - 2026.05.14 (Multi-hit Move Patch)

### 다단히트 기술 패치
- 다단히트 공통 엔진 추가
- 더블촙, 두번치기, 락블레스트, 기관총, 고드름침, 본러시, 스케일샷 추가
- 고정 2회 타격과 2~5회 랜덤 타격을 모두 지원
- 타격별 데미지 이벤트와 총 타격 수 로그 추가
- 스케일샷은 2~5회 타격 후 스피드 +1 / 방어 -1 적용
- 예비 격투장에서도 다단히트 로그와 이펙트 순서를 확인할 수 있도록 반영
- 기술 관리자에서 다단히트 기술 카테고리/설명 표시 지원
- 일부 포켓몬 기본 기술 배치에 다단히트 기술을 적절히 반영

## Patch Notes - 2026.05.14 (Admin Hub & Learnable Move Filter)

### 관리자 페이지 통합 및 기술 관리자 안전 필터 패치
- `public/admin.html` 추가: 기술 관리자 / 예비 격투장 / 푸끼몬 크기 관리자 / 신체검사 페이지를 사이드바 기반 통합 관리자 센터에서 열 수 있게 구성
- `move-admin.html` 개선: 선택한 포켓몬이 배울 수 있고 현재 게임에 구현된 기술만 기본 표시
- 배울 수 없는 구현 기술은 “전체 구현 기술 보기” 옵션에서 회색 표시되며 선택 불가
- 기술 저장 API 검증 강화: 포켓몬별 학습 가능 기술이 아닌 경우 저장 차단
- 관리자 저장값은 기존처럼 `data/pokemon_moves_custom.json`에 저장되며 일반 게임에 반영
- 기존 `size-admin.html`, `size-check.html`, `test-arena.html` 유지

## Patch Notes - 2026.05.14 (Move Admin Save Patch)

### 기술 관리자 저장 패치
- `/move-admin.html`을 포켓몬별 기술 4개 세팅 저장 관리자 페이지로 개편
- 구현된 기술만 선택 가능하도록 기술 목록/필터/검색 제공
- 포켓몬별 기본 기술과 관리자 저장 기술을 분리 표시
- 저장 버튼 클릭 시 `data/pokemon_moves_custom.json`에 반영
- 일반 게임의 랜덤 드래프트/팀 선택 기술 세팅에서 관리자 저장값을 우선 적용
- 저장 전 검증 추가: 4개 기술, 미구현 기술, 대폭발 제한, 중복 기술 경고
- 기존 포켓몬 크기 관리자(`/size-admin.html`)와 예비 격투장(`/test-arena.html`) 유지

## Patch Notes - 2026.05.14 (Test Arena Action/Effect Fix)

### 푸끼몬 예비 격투장 실전 순서형 개선
- `/test-arena.html`을 실제 배틀 순서에 가까운 단일 기술 테스트 페이지로 개선
- 기술 사용 액션, 타입별 투사체 이펙트, 데미지 팝업, 상태이상/능력변화/회복 이펙트가 재생되도록 보강
- 서버 테스트 API가 `events`를 상세 반환하도록 개선하여 예비 격투장에서 기술 효과를 눈으로 검증 가능
- 역린/연속자르기처럼 다음 턴 상태가 이어지는 기술을 검증할 수 있도록 테스트 상태 유지형 실행 지원
- 초기화 버튼으로 포켓몬/기술 테스트 상태를 다시 시작 가능

## Patch Notes - 2026.05.14 (Move Expansion + Test Arena)

### B안 기술 확장 패치
- 신규 기술 20종 추가: 드래곤클로, 용의파동, 역린, 용성군, 아이언헤드, 플래시캐논, 폭포오르기, 아쿠아테일, 악의파동, 깜짝베기, 섀도크루, 시저크로스, 연속자르기, 흡혈, 스톤에지, 그로우펀치, 드레인펀치, 인파이트, 기가드레인, 오버히트
- 기존 기술 보강: 깨물어부수기/섀도볼/에너지볼 방어 하락, 오물폭탄/독찌르기 독, 화염방사/불대문자 화상, 10만볼트/번개/용의숨결 마비, 스톤샤워 풀죽음
- 급소율 조정: 일반 급소 10%, 고급소 기술 25%
- 역린 구현: 3턴 강제 사용, 교체 불가, 매 사용 후 최대 HP 8% 감소
- 연속자르기 구현: 연속 사용 시 40 → 80 → 120 → 160 위력 증가
- 흡수기 구현: 기가드레인/드레인펀치/흡혈은 준 피해의 50% 회복
- 리스크 기술 구현: 용성군/오버히트 사용 후 공격 -2, 인파이트 사용 후 방어 -1

### 푸끼몬 예비 격투장 1차
- `/test-arena.html` 추가
- 포켓몬 2마리와 기술 1개를 선택해 단일 기술 테스트 가능
- 데미지/상태/랭크/흡수/역린 리스크 로그 확인 가능
- 초기화 및 로그 복사 기능 추가

### 기술 구현 관리자
- `/move-admin.html` 추가
- 기존 캐시에서 누락되던 앤테이를 필수 추가 포켓몬으로 보강
- 현재 구현된 기술 목록, 타입, 위력, 명중률, 효과, 태그 확인 가능
- 검색/필터/JSON 복사 기능 추가

## Patch Notes - 2026.05.14 (Size Admin v2)

### 포켓몬 크기 관리자 2차 패치
- `/size-admin.html`을 scale 중심 관리자 페이지로 개편
- 내 편 / 상대 / 둘 다 보기 전환 추가
- 흰색 신체검사 격자 배경과 배틀 배경 전환 추가
- 개별 포켓몬 scale +1%, +5%, +10%, -1%, -5%, -10% 조정 지원
- 전체 / 현재 목록 / 선택 포켓몬 scale 일괄 조정 지원
- 선택 체크박스, 현재 목록 선택, 선택 해제 기능 추가
- 변경값만 복사, 전체 JSON 보기, 저장 기능 유지
- 고급 위치/폭 조정은 접이식으로 정리하여 scale 조정 중심으로 사용성 개선
- 저장 시 `data/render_profiles_custom.json`에 반영되며 게임 새로고침 후 로컬에서 즉시 적용

## Patch Notes - 2026.05.14 (Size Admin)

### 포켓몬 크기 관리자 페이지 추가
- `/size-admin.html` 관리자 페이지 추가
- 포켓몬별 `scale`, `offsetX`, `playerOffsetX`, `opponentOffsetX`, `offsetY`, `widthRatio`, `baseHeight` 실시간 조정 지원
- 저장 시 `data/render_profiles_custom.json`에 저장되며, 로컬 게임 새로고침 후 즉시 반영
- 게임 클라이언트와 신체검사 페이지가 `/api/render-profiles/custom` 값을 불러와 기본 렌더 프로필에 병합
- 서버에 `/api/render-profiles/custom`, `POST /api/admin/render-profiles`, `DELETE /api/admin/render-profiles` 추가
- `ADMIN_PASSWORD` 환경변수가 설정된 경우 저장/초기화 API에 관리자 비밀번호 필요
- 기존 전투 로직은 변경하지 않음

## Patch Notes - 2026.05.14 (Full Render Scale Audit)

### 포켓몬 전수 크기 보정 패치
- 사용자가 신체검사 페이지에서 확인한 1~2세대 포켓몬별 퍼센트 보정값을 `renderProfiles.js`에 반영
- `100%`는 현재 유지, `80%`는 현재 대비 20% 축소, `120%`는 현재 대비 20% 확대 방식으로 적용
- 리자몽은 현재 대비 140%로 크게 확대
- 통과로 표시된 포켓몬은 기존 보정값 유지
- 신체검사 페이지에서 `scale`, 내 포켓몬 px 높이, 상대 포켓몬 px 높이, `widthRatio`, X/Y 위치값을 확인할 수 있게 보강
- 한글명 매핑을 확장해 표기 흔들림이 있어도 보정값을 안정적으로 적용
- 전투/서버 로직 변경 없음

## Patch Notes - 2026.05.14 (Pokemon Size Check Page)

### 포켓몬 신체검사 페이지 추가
- 전체 포켓몬 렌더 크기와 위치를 빠르게 확인할 수 있는 `/size-check.html` 페이지 추가
- `public/size-check-data.js`에 현재 1~2세대 포켓몬 검수용 데이터 생성
- 앞모습/뒷모습/양쪽 동시 보기 지원
- 검색, 필터, 정렬, 현재 목록 복사 기능 추가
- 전투 로직 변경 없음

## Patch Notes - 2026.05.14 (Render Tuning Follow-up)

### 포켓몬 렌더 미세조정 패치
- `public/renderProfiles.js`에 1~2세대 최종진화 / 전설 / 체형 특수 포켓몬 보정 확대 유지
- 파이어, 썬더, 프테라, 킹드라를 더 크게 보정
- 무장조는 과대 렌더링을 줄이도록 축소 보정
- 세레비는 더 높게 떠 있도록 `offsetY`를 부유형 기준으로 수정
- 괴력몬은 내 포켓몬일 때 조금 더 오른쪽에 오도록 위치 보정
- 뮤츠는 꼬리 때문에 앞으로 튀어 보이던 문제를 줄이기 위해 왼쪽 이동 보정 강화
- 렌더 프로필에 `playerOffsetX` / `opponentOffsetX` 지원 추가
- `public/index.html`에서 내 포켓몬 / 상대 포켓몬에 서로 다른 X축 오프셋 적용 지원

## LAN 테스트판 - 배틀 필드 이미지 배경 패치

- 기준 코드: p646_lan_test_3pokemon_slot_ui_only
- 전투/서버 로직 변경 없음
- 추가:
  - public/assets/battle-field.png
- 수정:
  - .arena-stage 배경을 CSS 배경 이미지로 교체
  - 기존 CSS 들판 배경 pseudo element는 숨김 처리
- 유지:
  - 3마리 선택 구조
  - 상단 슬롯 UI
  - 4배 데미지/4배 표시
  - 풀죽음
  - faintPending


## LAN 테스트판 - 상단 선택 슬롯 UI만 적용

- 기준 코드: p644_lan_test_3pokemon_full.zip
- 전체 UI는 p644 전버전으로 유지
- 적용한 것:
  - 팀 선택 화면 상단의 선발/교체1/교체2 3개 슬롯만 목업 스타일 적용
  - 가운데 이상한 세로 슬롯/레이아웃 문제 보정
- 롤백한 것:
  - 오른쪽 사이드바 카드형 변경 없음
  - 타입 필터 칩 없음
  - 후보 포켓몬 카드 변경 없음
  - 나머지 UI는 p644 그대로
- 전투/서버 로직 변경 없음


## LAN 테스트판 - 3마리 싱글 배틀

- 기준 코드: p643 p639 안정판 + 4배/풀죽음 + faintPending
- 운영 배포용이 아니라 LAN 테스트용
- 변경 사항:
  - TEAM_SIZE = 3
  - 유저 팀 선택 3마리
  - AI 팀 선택 3마리
  - 첫 번째 선택 포켓몬이 선발
  - 두 번째/세 번째 포켓몬이 교체 후보
  - FORCE_SWITCH는 살아있는 벤치 포켓몬 중 선택
  - 마지막 포켓몬 기절 시 GAME_OVER
- 유지:
  - p639 안정 전투 흐름
  - 4배 데미지/4배 버튼 표시
  - 풀죽음
  - faintPending 선등장 방지
  - spriteLock/criticalTransitionActive 미사용


## p639 안정판 - 기절 후 교체 선등장 방지 패치

- 기준 코드: p642 p639 안정판 + 4배/풀죽음 + 버튼 강조
- 전투/교체 서버 흐름은 그대로 유지
- 추가한 것:
  - faintPending = {p1:false, p2:false}
  - faint 이벤트 이후 해당 player의 sprite를 switch 이벤트 전까지 숨김
  - activePokemon / visualActivePokemon에서 다음 생존 포켓몬 fallback 제거
  - 서버 최신 state가 다음 포켓몬으로 갱신되어도 switch 이벤트 전까지 프론트에서 선렌더링하지 않음
  - switch 이벤트 처리 순간에만 faintPending 해제 후 새 포켓몬 등장
- 목적:
  - 상대 포켓몬 기절 후 다음 포켓몬이 먼저 보였다가 다시 등장하는 버그 방지
- 유지:
  - p639 전투 안정 흐름
  - 4배 데미지 및 4배 버튼 표시
  - 풀죽음
  - 복잡한 spriteLock / criticalTransitionActive 미사용


## p639 안정판 기반 - 풀죽음 타이밍 / 4배 버튼 강조 / 강제교체 연출 보정

- 기준: p641_p639_4x_label_switch_fx_full
- 전투 흐름은 p639 안정판 유지
- 수정 사항:
  1. 풀죽음은 맞은 즉시 다음 턴으로 넘기지 않고, 같은 턴에서 대상의 공격 순서가 왔을 때 1회 스킵
  2. 이미 움직였거나 교체 행동인 대상에게는 풀죽음이 다음 턴까지 남지 않음
  3. 4배 기술 버튼은 eff-ultra 전용 강조 버튼으로 표시
  4. 서버 switch 이벤트에 fromFainted/skipSwitchOut/forceAfterFaint 추가
  5. 기절 후 강제 교체 시 다음 포켓몬이 미리 보였다가 다시 등장하는 현상 완화


## p639 안정판 + 4배 표시 수정 + 교체 연출 최소 보정

- 기준 코드: p639 안정판 + 4배/풀죽음 최소 패치
- 전투 로직은 건드리지 않음
- 수정한 것만:
  1. 프론트 기술 표시/추천 기술의 상성 표기를 4배/0.25배로 표시
  2. 기절 후 강제 교체 시 죽은 포켓몬에게 “돌아와!” switch-out 연출을 하지 않도록 보정
- 유지:
  - p639 전투 흐름
  - 4배 데미지
  - 풀죽음
  - 기존 eventQueue/currentState 구조


## p639 안정판 + 4배 상성 + 풀죽음 최소 패치

- 기준 코드: 사용자가 올린 p639_context_restore_ai_fix_full.zip
- 전투/기절/교체/기술창 렌더링 흐름은 p639 구조 유지
- 추가한 것만:
  1. 4배 / 0.25배 상성 반영
  2. 풀죽음 효과 반영
- 제외한 것:
  - spriteLock
  - criticalTransitionActive
  - renderBattlePanels/renderBattleSprites 대분리
  - currentState pending 지연
  - 기절/교체 연출 구조 변경
- 목적: 정상 구동되던 p639 기반으로 전투 안정성 복구


## v6.3.9 - 안정판 롤백 + AI 진행 원인 수정

- 일반 입장 흐름을 v6.3 안정판 기준으로 복구
- AI 직접 ACTION_SELECT/Watchdog 과다 패치를 제거하고 기존 턴 구조로 복귀
- 실제 원인인 `withRoom()` 전역 컨텍스트 오염 문제 수정
- `emitLobbyState()`/방 요약 생성 중 `currentRoom`이 다른 방으로 바뀌어 예약 호출이 엉뚱한 방에 걸리던 문제 수정
- AI 팀 준비 보정 유지
- AI만 남은 방 자동 정리 유지
- 로그인 모달 겹침 UI 수정 유지
- 기존 로비 UI / 랭킹 / 채팅 기능 유지



## 최신 UI 핫픽스
- 로비 메인 타이틀을 `푸끼몬 챔피언스 온라인`으로 정리
- 로비 설명 문구를 `포켓몬 API를 활용한 푸끼몬 배틀게임`으로 변경
- 방 입장 버튼 문구를 `입장`으로 축약
- `입장` 버튼 글자가 두 줄로 내려가지 않도록 버튼 레이아웃을 보정

# 정승의 푸끼몬 챔피언스 ONLINE

Socket.IO 기반 온라인 멀티플레이 포켓몬 배틀 게임입니다.

## 현재 버전

```text
v6.3
```

## 로컬 실행

```bash
npm install
npm start
```

포트 지정:

```bash
set PORT=3008
npm start
```

상태 확인:

```text
http://localhost:3008/health
```

## Render 배포 설정

Build Command:

```text
corepack enable && corepack prepare pnpm@9.12.3 --activate && pnpm install --prod=false --frozen-lockfile=false
```

Start Command:

```text
node server.js
```

Health Check Path:

```text
/health
```

## PATCH NOTES

### v6.3 - AI 연습전

- 로비 방 카드에 `AI 대전` 버튼 추가
- AI 대전은 유저 P1 / AI P2 고정
- AI전은 랭킹에 반영하지 않는 연습전으로 분리
- AI 이름 랜덤 적용
  - AI 웅이
  - AI 이슬이
  - AI 로켓단
  - AI 챔피언
  - AI 잠만보장인
  - AI 피카츄광인
- AI도 후보 12마리에서 자동으로 2마리 선택
- 안정형 AI 행동 로직 적용
  - 상성 좋은 공격기 우선
  - HP가 낮으면 회복기 우선
  - 명중률과 위력을 고려한 기술 선택
  - 강제 교체 상황에서 자동 교체
- AI전 결과창에 `랭킹 미반영` 안내 표시
- AI전 다시하기 지원
- 기존 로그인 유지 / 중복 접속 방지 / 로비 채팅 / 랭킹 기능 유지

### v6.2.5 - 우측 패널 글씨색 강제 핫픽스

- 랭킹 TOP 10 글씨색이 계속 밝게 표시되던 문제 수정
- CSS 우선순위 충돌을 피하기 위해 랭킹 HTML 생성부에 인라인 색상 적용
- 랭킹 이름 / 점수 / 승패 / 연승 색상 직접 지정
- 로비 채팅 메시지 / 작성자 / 빈 메시지 안내 색상 직접 지정
- 기존 v6.2.4 로그인 유지 / 중복 접속 방지 기능 유지

### v6.2.4 - 우측 패널 가독성 / 로그인 유지 핫픽스

- 랭킹 TOP 10 글씨가 밝게 보여 읽기 어려운 문제 수정
- 로비 채팅 글씨가 밝게 보여 읽기 어려운 문제 수정
- 랭킹 이름 / 점수 / 승패 정보 색상 기준 재정리
- 브라우저별 `clientId` 추가
- 같은 브라우저의 새로고침 / 재접속은 같은 유저로 인정
- 다른 브라우저/기기의 같은 아이디 접속은 계속 차단
- 게임 입장 / 게임 종료 / 새로고침 이후 로그인 반복 요구를 완화
- 기존 v6.2.3 / v6.2.2 기능 유지

### v6.2.3 - 로비 채팅 가독성 핫픽스

- 로비 채팅창 메시지 글씨가 흰색으로 표시되어 보이지 않던 문제 수정
- 로비 채팅 메시지 기본 글씨를 진한 네이비로 변경
- 로비 채팅 작성자 이름을 파란색으로 변경
- 빈 메시지 / 빈 랭킹 안내 문구 색상을 회색 계열로 조정
- 기존 v6.2.2 중복 로그인 방지 / 랭킹 / 로비 채팅 기능 유지

### v6.2.2 - 중복 로그인 핫픽스 / 서버 크래시 수정

- `isUserIdActive is not defined` 서버 크래시 수정
- `reserveUserId is not defined` 서버 크래시 수정
- 중복 로그인 헬퍼 함수 선언 위치를 Socket.IO 연결 코드보다 위로 고정
- `activeUserIds` 기반 아이디 점유 관리 유지
- 서버 시작 시 중복 로그인 헬퍼 존재 여부 검사 추가
- `/health` 검사 통과 확인
- 서버 실행 가능 상태 확인
- 기존 v6.2 랭킹 / 로비 채팅 / 실제 유저 이름 표시 기능 유지

### v6.2.1 - 아이디 중복 접속 방지

- 같은 아이디로 동시 접속 불가 처리
- 이미 접속 중인 아이디로 로그인 시 서버에서 거절
- 로그인 실패 시 클라이언트 로그인창에 오류 표시
- 로그아웃 / 브라우저 종료 / 연결 끊김 시 아이디 점유 해제
- 로그인하지 않은 사용자의 방 입장 차단
- 로그인하지 않은 사용자의 로비 채팅 차단
- 로그인하지 않은 사용자의 방 채팅 차단
- 로그인하지 않은 사용자의 플레이어 참가 차단
- 랭킹은 서버가 승인한 아이디 기준으로만 기록하도록 설계

### v6.2.0 - 랭킹 / 로비 채팅 / 실제 이름 표시

- 랭킹 TOP 10 추가
- 기본 점수 1000점 적용
- 승리 시 +30점
- 패배 시 -10점
- 정상 게임오버 결과 랭킹 반영
- 항복 결과 랭킹 반영
- 한 경기에서 승패 중복 기록 방지
- 로비 채팅방 추가
- 로비 최근 채팅 메시지 유지
- 방 카드에 P1/P2 실제 로그인 아이디 표시
- 게임창 안에서 `플레이어 1`, `플레이어 2` 대신 로그인 아이디 중심으로 표시
- 결과창에 점수 변화 표시
- 기존 온라인 로비 / 4룸 / 관전자 기능 유지

### v6.1.3 - 로그인 전체 교체판

- 로그인 모달 직접 삽입
- 아이디 / 비밀번호 / 비밀번호 확인 입력 구조 적용
- 아이디 2~12자 제한
- 비밀번호 4자 이상 제한
- 비밀번호 확인 불일치 시 입장 차단
- 로그인 성공 시 `localStorage`에 아이디 저장
- 서버 `loginUser` 이벤트 추가
- 로비 접속자 현황 추가
- 방 카드에 접속자 이름 표시
- 채팅 이름을 로그인 아이디 기준으로 표시
- 로그인 전 방 입장 버튼 비활성화

### v6.0 - 온라인 배포 준비판

- ONLINE v6.0 버전명 적용
- Railway / Render 배포를 위한 기본 구조 정리
- `railway.json` 추가
- `Procfile` 추가
- `.gitignore` 추가
- `DEPLOY_GUIDE.md` 추가
- 서버 상태 확인용 `/health` 엔드포인트 추가
- v5.9 기술 배치 개편 유지
- 메타몽 / 마자용 / 루브도 후보 제외
- 전설 / 환상 후보 최대 1마리 제한
- 온라인 멀티플레이 4룸 구조 유지

### v5.9 - 기술 배치 / 온라인 안정화

- 후보 리롤 방지
- 팀 선택 중 나가도 후보 12마리 유지
- 배틀 중 나가면 기존 팀 유지
- 승패 안내 타이밍 조정
- 초반 저효율 기술 대부분 제외
- 포켓몬별 대표 기술표 우선 적용
- 우선도 기술 추가
- 잠자기 / 우유마시기 / 광합성 / HP회복 추가
- 잠만보 잠자기 필수
- 푸크린 노래하기 / 멸망의노래 반영
- 전설 / 환상 프리미엄 기술 최대 2개 제한


### 2026.05.14 - 포켓몬 렌더 크기 보정 패치

- 포켓몬별 렌더 프로필 시스템을 추가했습니다.
- API height/weight 정보를 기반으로 기본 체급을 자동 분류합니다.
- 소형 포켓몬은 과확대를 줄여 픽셀 깨짐을 완화했습니다.
- 대형/전설/날개형 포켓몬은 더 위엄 있게 보이도록 크기와 가로폭 제한을 보정했습니다.
- `scale`, `offsetX`, `offsetY`, `widthRatio` 기반으로 크기와 위치를 함께 조정합니다.
- 1차 보정 대상: 뮤, 세레비, 피카츄, 이브이, 푸린, 토게피, 리자몽, 프테라, 칠색조, 루기아, 크로뱃, 무장조, 파이어, 썬더, 프리져, 갸라도스, 잠만보, 망나뇽, 마기라스, 라프라스, 강철톤, 롱스톤.
- 포켓몬 렌더 보정값은 `public/renderProfiles.js`로 분리했습니다.

## 현재 주요 기능

- 아이디 기반 간이 로그인
- 아이디 동시 중복 접속 방지
- 4개 룸 로비
  - 태초마을
  - 회색시티
  - 블루시티
  - 무지개시티
- 플레이어 자동 배정
- 관전자 입장
- 관전자가 빈 플레이어 자리로 참가 가능
- 로비 접속자 현황
- 로비 채팅
- 방 채팅
- 랭킹 TOP 10
- 승패 점수 반영
- 1~2세대 포켓몬 기반 배틀
- 상태이상 / 능력치 랭크 표시
- 사망 / 교체 / 기술 연출

## 운영 메모

- 무료 Render 인스턴스는 일정 시간 접속이 없으면 잠들 수 있습니다.
- 첫 접속은 30초~1분 정도 지연될 수 있습니다.
- 서버 메모리 랭킹은 서버 재시작 시 초기화될 수 있습니다.
- 영구 랭킹은 추후 Supabase 같은 외부 DB 연결이 필요합니다.

## 업데이트 방법

코드 수정 후:

```bash
git add .
git commit -m "Update game"
git push
```

Render가 GitHub 변경을 감지해 자동 배포합니다.

## Patch Note - Multi-hit event flag fix
- Fixed multi-hit damage events incorrectly sending `isMultiHit: false` because `move.multiHit` is an object, not boolean `true`.
- Multi-hit damage events now use `isMultiHit: !!move.multiHit`, allowing per-hit effects, per-hit bump animation, and per-hit HP updates to run correctly.
- Normal single-hit attacks remain separated from multi-hit attacks.


## Patch Note - Champions lobby gate redesign
- Redesigned the main lobby into a Champions Lobby style game gate.
- Added SEASON 1 badge, live online/room status badge, emblem-style title area, and stronger game lobby copy.
- Reworked room cards into arena cards with themed visual headers for 태초마을, 회색시티, 블루시티, 무지개시티.
- Upgraded right-side lobby panels, ranking panel, online users, and lobby chat to a game HUD style.
- Added hover glow, floating room icons, deeper blue arena background, and responsive layout refinements.
- Preserved existing room join, AI match, login, ranking, and lobby chat logic.


## Patch Notes - v6.6 Premium Champions Lobby HUD

- 로비 메인 패널을 밝은 웹 카드 느낌에서 딥블루 반투명 HUD 스타일로 고급화했습니다.
- 도시 선택 카드를 프리미엄 배틀 아레나 카드 톤으로 재정리하고, STARTER/ROCK/AQUA/EVENT ARENA 라벨을 추가했습니다.
- 우측 접속자/랭킹/채팅 패널을 네이비 글래스 HUD로 통일했습니다.
- 버튼 그림자와 광택을 조정해 장난감 같은 느낌을 줄이고 게임 CTA 느낌을 강화했습니다.
- 하단 안내 문구를 `ONLINE · ARENA · 챔피언을 향한 첫 전장` 형태로 변경했습니다.
- 기능 로직은 변경하지 않고 로비 UI 빌드업 중심으로 패치했습니다.


## Patch Notes - v6.8 Battle HUD Visibility + Team Select Cleanup

- 로비 채팅 / 랭킹 렌더링에서 어두운 패널과 충돌하던 인라인 글자색을 제거하고 밝은 HUD 톤으로 통일했습니다.
- 팀 선택 상단 3개 슬롯에서 `메인 포켓몬 / 벤치 1 / 벤치 2` 문구를 제거했습니다.
- 팀 선택 슬롯의 포켓몬명, Lv.50, HP 정보가 어두운 배경에서도 잘 보이도록 색상을 보정했습니다.
- 배틀 화면의 교체 포켓몬 영역에 선택한 팀 포켓몬 스프라이트, Lv.50, HP, 타입 정보를 작게 표시하도록 개선했습니다.
- 배틀 화면의 사이드 패널, 기술 설명, 로그, 채팅창을 딥블루 HUD 톤으로 통일했습니다.
- 어두운 배경 위의 텍스트 가독성을 우선으로 조정했습니다.

## Patch Notes - v6.11 Lobby Image Asset Integration

- Added lobby image assets under `public/assets/lobby/`.
- Applied the generated lobby background to the main lobby screen.
- Replaced city card header art with generated 2:1 banner images.
- Replaced city card emoji icons with generated city emblem assets.
- Added the generated title emblem image to the lobby title area while keeping fallback text for accessibility.
- Kept gameplay and battle logic unchanged; this patch only updates lobby visual presentation and README notes.


## Patch Notes - v6.12 Championship Lobby Visual Refresh

- 메인 로비 배경을 챔피언십 스타디움형 신규 이미지 `lobby-main-bg-v2.png`로 교체했습니다.
- 좌측 상단 대표 엠블럼을 신규 `lobby-main-emblem-v2.png` 이미지로 교체했습니다.
- 기존 상단 타이틀 로고와 도시 카드 배너/엠블럼은 유지했습니다.
- 새 배경 위에서도 로비 카드와 사이드 패널 가독성이 유지되도록 딥블루 오버레이와 글래스 패널 톤을 보정했습니다.
- 게임 로직은 변경하지 않았습니다.

## Patch Notes - Spectator Sync + Recoil Move Update

- 관전자 모드에서도 포켓몬 공격 움직임, 기술 이펙트, 데미지 팝업, HP 감소 연출이 플레이어 화면과 동일하게 재생되도록 수정했습니다.
- 관전자는 행동 입력만 제한되고, 배틀 이벤트 재생은 P1/P2와 같은 흐름을 사용합니다.
- 배틀 상단 HUD의 작은 방패 아이콘을 메인 로비 엠블럼 `lobby-main-emblem-v2.png`로 교체했습니다.
- 상단 중앙 정보 패널의 하얀 카드톤을 제거하고 네이비 글래스 HUD 톤으로 정리했습니다.
- 역린의 자기 피해 리스크를 최대 HP 8%에서 12%로 상향했습니다.
- 신규 자기 HP 소모/반동 기술 6종을 추가했습니다: 브레이브버드, 플레어드라이브, 와일드볼트, 우드해머, 양날박치기, 이판사판태클.
- 반동 피해는 실제로 준 피해량 기준으로 계산되며, 반동으로 자신의 포켓몬도 기절할 수 있습니다.
- 예비 격투장과 기술 관리자에서 신규 반동 기술 및 반동 설명이 표시되도록 반영했습니다.


## v6.13 Mobile Mode Foundation Patch

- 상단에 모바일/PC 모드 전환 버튼을 추가했습니다.
- 선택한 UI 모드는 localStorage에 저장되어 새로고침 후에도 유지됩니다.
- 모바일 모드에서 로비는 1열 카드형으로 표시됩니다.
- 모바일 모드에서 팀 선택 화면은 2열 후보 카드와 작은 선택 슬롯 구조로 조정됩니다.
- 모바일 모드에서 배틀 화면은 세로형 구조로 표시되며 포켓몬 스프라이트 크기를 축소했습니다.
- 모바일 모드에서 배틀 로그와 채팅은 접이식/축소형으로 처리됩니다.
- 게임 로직은 변경하지 않았습니다.


## Patch Notes - v6.14 Mobile Selection & Battle UI Rebuild

- 모바일 로비 UI는 유지하고, 모바일 팀 선택/배틀 화면 구조를 재정리했습니다.
- 모바일 팀 선택 화면에서 상단 정보창을 제거하고 `상대 포켓몬 → 후보 선택 → 선택한 포켓몬 → 이대로 출전` 순서로 변경했습니다.
- 모바일 배틀 화면에서 상단 정보창을 제거하고 얇은 전투 요약 바를 추가했습니다.
- 모바일 전투 요약 바에 양쪽 포켓몬 이름과 HP 바가 표시되도록 했습니다.
- 모바일 배틀에서는 기술 선택을 우선 배치하고, 기술 설명/교체 포켓몬/로그/채팅은 접이식으로 정리했습니다.
- 교체 포켓몬 영역에는 현재 출전 포켓몬을 제외한 벤치 2마리만 표시되도록 정리했습니다.
- PC UI와 게임 로직은 최대한 유지했습니다.

## Patch Notes - v6.15 Move Balance, PP & Struggle

- 기본 기술 세트를 최신 커스텀 JSON 기준으로 교체했습니다.
- 수면 기술을 너프했습니다: 수면가루 55%, 최면술 50%, 노래하기 50%, 일반 수면 지속 1~2턴.
- HP회복 / 우유마시기 / 광합성 회복량을 최대 HP 50%에서 33%로 낮췄습니다.
- 잠자기는 기존처럼 HP 전체 회복 후 수면 상태가 됩니다.
- 모든 기술에 PP / 최대 PP를 추가하고, 사용 시 PP가 1 감소합니다.
- PP가 0인 기술은 선택할 수 없으며, 모든 기술 PP가 0이면 발버둥이 발동됩니다.
- 발버둥은 노말 타입 위력 50 / 명중 100 기술이며, 사용 후 내 최대 HP의 25% 반동 피해를 입습니다.
- AI도 PP가 없는 기술을 선택하지 않도록 조정했습니다.
- PC/모바일 기술 버튼과 기술 설명 패널에 PP 표시를 추가했습니다.

## Patch Notes - v6.16 Balance Admin Page

- 관리자키 기반 기술 밸런스 관리자 페이지 `/admin-balance.html`을 추가했습니다.
- 관리자키는 서버 환경변수 `ADMIN_KEY`로 검증하며, 조회/저장 API 모두에서 다시 확인합니다.
- `data/move_balance_overrides.json`을 추가해 `moveLibrary.js` 원본을 직접 수정하지 않고 기술 위력/명중률/PP/회복량/반동/설명을 덮어쓸 수 있게 했습니다.
- `data/battle_balance.json`을 추가해 수면 턴, 발버둥 위력/명중/반동, 기본 PP 값을 관리할 수 있게 했습니다.
- 관리자 페이지에서 기술 검색, 타입 필터, 숫자 유효성 검사, 저장 전 확인창을 지원합니다.
- 기존 PC/모바일 게임 UI와 전투 흐름은 최대한 유지했습니다.


## Patch Notes - v6.16.1 Admin Balance Integration Hotfix

- 기존 관리자 센터 `/admin.html`에 관리자키 인증 게이트를 추가했습니다.
- 로컬 기본 관리자키를 `2467`로 설정했으며, 배포 환경에서는 `ADMIN_KEY` 환경변수로 변경할 수 있습니다.
- 독립 페이지로 추가했던 기술 밸런스 관리를 기존 관리자 센터 메뉴의 `기술 밸런스 관리` 탭으로 통합했습니다.
- `/move-admin.html`, `/size-admin.html`, `/size-check.html`, `/test-arena.html`, `/admin-balance.html`은 관리자키가 없으면 `/admin.html`로 이동되도록 보호했습니다.
- 기술/크기 저장 API도 관리자키를 검증하도록 정리했습니다.
- `move_balance_overrides.json`, `battle_balance.json` 구조와 기존 게임 로직은 유지했습니다.

## v6.18 Adventure Mode Real Clone Rebuild Patch

- 이전 모험모드 실패 코드 정리
- 오전 최종본 ZIP 기준으로 모험모드 새 출발
- 기존 일반 선택창 구조를 최대한 복사한 adventure 전용 스타터 선택창 추가
- 스타터 선택은 가운데 1칸만 사용하는 구조로 변경
- 미진화체/기본형 우선 랜덤 12마리 후보 구조 추가
- Lv5 스타터 약한 기술 세트 분리
- 기존 일반 배틀창 구조를 최대한 복사한 adventure 전용 배틀 흐름 추가
- 모험모드에서 기존 타입 상성 배율 안내 재사용
- 모험모드에서 기존 기술 버튼 색상/상성 표시 재사용
- 모험모드에서 기존 기술 설명창 재사용
- 모험모드에서 기존 공격/피격/HP 감소/기절/등장 모션 재사용
- 모험모드에서 기존 배틀 이펙트 재사용
- 모험모드에서 채팅 영역 대신 가방 패널 사용
- 배틀 승리 후 하단 영역에서 보상 3택 표시
- 보상 선택 후 바로 다음 야생 포켓몬 등장
- 패배 시 모험 실패 화면 표시
- 기존 관리자 2467 인증 및 기술 밸런스 관리자 유지
- 기존 대전모드 / AI 대전 / 관전 / 로비 / 모바일 모드 유지


## v6.18.1 Adventure Mode Start Routing Hotfix

- 모험모드 시작 시 `currentRoomId` 전역 참조가 strict-mode adventure 스크립트에서 ReferenceError를 발생시키던 문제를 수정했습니다.
- 로비에서 모험모드 클릭 시 오류 alert 후 일반 배틀 로딩 화면으로 떨어지던 진입 오류를 수정했습니다.
- 스타터 선택 전에는 배틀 화면으로 넘어가지 않고 adventure 전용 스타터 선택창으로 진입하도록 라우팅을 보정했습니다.
- 모험모드 종료 시에도 `window.currentRoomId`를 안전하게 초기화하도록 수정했습니다.

## v6.18.2 Adventure Mode Stability + Battle Logic Alignment Patch

- 모험모드 카드 버튼을 1개로 정리했습니다.
- 로비 마을/방 3개(상록시티, 연분홍시티, 보라타운)를 추가했습니다.
- 모험모드 스타터 후보를 미진화체 허용 ID 목록 기반으로 제한했습니다.
- 전설/환상 포켓몬 및 진화체가 스타터 후보에 섞이지 않도록 보강했습니다.
- 포획 성공 후 상대 포켓몬이 필드에 남아 있던 문제를 수정했습니다.
- 포획 성공 시 상대 스프라이트 제거 및 보상 선택 상태 전환을 정리했습니다.
- 보상 UI를 기존 기술창 스타일의 2x2 4버튼 구조로 변경했습니다.
- 모험모드 데미지 계산을 기존 battleEngine 공식에 더 가깝게 조정했습니다.
- 다단히트 기술 처리와 다단히트 이벤트 로그/HP 감소 이벤트를 추가했습니다.
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능은 유지했습니다.

### 남은 TODO

- drain, recoil, selfDestruct, statChance, flinchChance, recharge, lockedMove, furyCutter 등 일부 고급 기술 효과는 추가 검증과 단계적 이식이 필요합니다.
- 수면/마비/화상/독의 턴 종료 처리와 행동 제한은 기존 battleEngine 기준으로 추가 정렬이 필요합니다.

## v6.18.3 Adventure Mode Pool + Capture Animation + Reward UI Patch

- 모험모드 스타터 후보가 3마리만 표시되던 문제를 수정했습니다.
- 현재 데이터 기준 기본형/단일형 포켓몬 풀을 재구성해 스타터 후보 12마리 표시를 보장했습니다.
- `data/adventure_basic_pokemon.json`을 id + name + apiName 병행 구조로 확장했습니다.
- 스타터 후보와 야생 포켓몬 풀을 분리했습니다.
- 야생 포켓몬이 무우마/글라이거/니로우 3마리만 반복되던 문제를 개선했습니다.
- 최근 출현한 야생 포켓몬 3마리는 다음 출현 후보에서 우선 제외하도록 보정했습니다.
- 스타터 선택창에서 모험 실패 오버레이가 뜨지 않도록 phase 가드를 추가했습니다.
- 포획 성공 시 상대 포켓몬이 볼 안으로 빨려 들어가듯 사라지는 capture-out 연출을 추가했습니다.
- 포획 성공 후 연출 종료 뒤 상대 필드에서 제거하고 보상 선택 상태로 전환하도록 정리했습니다.
- 보상 UI를 기존 기술 선택창과 유사한 2x2 대형 버튼 구조로 확대했습니다.
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능은 유지했습니다.

### 남은 TODO

- 현재 로컬 포켓몬 데이터가 대부분 최종진화체 중심이라, 진짜 전국도감식 미진화체 후보를 늘리려면 원본 포켓몬 데이터 자체에 기본형 포켓몬을 더 추가해야 합니다.
- drain, recoil, selfDestruct, statChance, flinchChance, recharge, lockedMove, furyCutter 등 고급 기술 효과는 추가 검증과 단계적 이식이 필요합니다.

## v6.18.4 Adventure Core Loop Stability Patch

- 포획 성공 후 보상 선택 시 다음 야생 포켓몬이 등장하지 않거나 phase/state가 꼬일 수 있던 흐름을 정리했습니다.
- 포획 성공 → 보상 선택 → 보상 적용 → 다음 층 이동 → 새 야생 포켓몬 생성 흐름을 `advanceAdventureStage()` 중심으로 안정화했습니다.
- 보상 선택 중 중복 클릭으로 보상이 중복 적용되지 않도록 `rewardApplying` 상태 잠금을 추가했습니다.
- 보상 적용 실패 시 콘솔과 전투 로그에 오류를 남기고 reward phase로 복구되도록 보강했습니다.
- 현재 포켓몬이 기절했을 때 팀에 살아 있는 포켓몬이 있으면 즉시 모험 실패가 아니라 교체 선택 UI가 표시되도록 수정했습니다.
- 살아 있는 포켓몬이 0마리일 때만 모험 실패가 발생하도록 패배 판정을 팀 전체 기준으로 정리했습니다.
- select/reward/capture/teamReplace/switch/loading 계열 phase에서 잘못된 모험 실패 오버레이가 뜨지 않도록 phase 가드를 강화했습니다.
- 포획 후 팀이 3마리를 초과하는 경우 기존 팀 중 한 마리를 선택해 교체한 뒤 reward phase로 이어지도록 처리했습니다.
- 보상 UI를 기존 기술 선택창에 더 가깝게 넓은 2x2 대형 버튼 영역으로 확대했습니다.
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능은 유지했습니다.

### 남은 TODO

- 기술 보상/기술 교체 시스템은 다음 패치에서 별도 추가가 필요합니다.
- drain, recoil, selfDestruct, statChance, flinchChance, recharge, lockedMove, furyCutter 등 고급 기술 효과는 추가 검증과 단계적 이식이 필요합니다.


## v6.18.5 Adventure Battle Bugfix + Switch + EXP Growth Foundation Patch

- 포획 후 다음 층 상대 포켓몬 sprite가 표시되지 않던 문제를 보강했습니다.
- multiHit 기술의 선행 단일 이펙트 중복 문제를 수정했습니다.
- 교체 포켓몬 선택 후 필드에 포켓몬이 렌더링되지 않던 문제를 보강했습니다.
- 전투 중 포켓몬 교체 버튼을 추가했습니다.
- 일반 교체는 턴을 소비하고 상대 행동으로 이어지도록 처리했습니다.
- 기절 후 교체는 살아 있는 포켓몬이 있을 때 강제 교체로 처리합니다.
- 살아 있는 포켓몬이 0마리일 때만 모험 실패 처리하도록 유지했습니다.
- 승리/포획 EXP 지급과 base_experience 기반 모험모드 EXP 계산을 추가했습니다.
- PokeAPI base stats 기반 레벨업 능력치 재계산 구조를 추가했습니다.
- 레벨업 및 스탯 상승 기초를 추가했습니다.
- 진화 시스템 데이터 구조를 준비했습니다.
- 포켓몬별 타입 기반 초기 기술 다양화 기반을 추가했습니다.
- PokeAPI 기반 adventure 데이터 수집 스크립트를 추가했습니다.
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능은 유지합니다.

### v6.18.5 TODO

- 기술 보상 선택 추가
- 기술 4개 초과 시 기술 교체 UI
- 보스 보상 강화
- 진화 선택 UI
- 층별 보스전
- PokeAPI 수집 데이터 정식 반영 및 한글 기술명 매핑 고도화

## v6.18.6 Adventure Battle Mode Extension Sync + Equipment UI Patch

- 모험모드를 기존 배틀모드의 확장판 구조로 재정리했습니다.
- 기존 공통 기술 데이터 우선, `adventure_moves` fallback 구조를 유지하면서 모험모드 전용 약기술/보상기술 레이어를 분리했습니다.
- PokeAPI 기반 약한 기술 수집/정제 구조를 위한 `adventure_moves_raw`, `adventure_move_tiers`, `adventure_blocked_moves`, `build_adventure_moves` 기반을 추가했습니다.
- 벌크업, 철벽, 그로우펀치, 칼춤, 고속이동, 울음소리, 겁나는얼굴, 싫은소리 등 핵심 랭크 효과를 `adventure_move_effect_map`으로 보정했습니다.
- 랭크 변화가 데미지 계산에 반영되도록 유지하고, 상태창에 기본 수치/랭크/실효 수치를 표시하도록 개선했습니다.
- 잠자기를 초반 랜덤/스타터 기술 풀에서 제외하고, 회복기 남발을 줄이도록 상대 AI 선택 점수를 보정했습니다.
- 상처약/좋은상처약은 heal 이벤트를 사용하도록 유지하고, 능력치 아이템은 영구 보너스 계열로 정리했습니다.
- EXP바와 EXP 현재값/필요값 표시를 플레이어 상태창에 추가했습니다.
- 단백질/철분/스피드업/사포닌이 `adventureBonusStats`에 누적되고 레벨업 후에도 유지되도록 반영했습니다.
- 장비형 보상 시스템의 기초를 추가했습니다.
- 힘의머리띠와 박식안경은 현재 공격력 중심 구조에 맞춰 같은 공격 기술 위력 +10% 장비로 처리했습니다.
- 목탄, 신비의물방울, 기적의씨, 자석 등 타입 강화 장비와 조개껍질방울, 먹다남은음식을 추가했습니다.
- 장비 중첩과 데미지/회복 효과 일부를 모험모드에 반영했습니다.
- 플레이어 상태창에서 “최근 행동 / 모험모드 기존 상태창 스타일” 문구를 제거하고 장비 보유 현황을 표시하도록 변경했습니다.
- 보상 테이블을 성장/회복/포획/장비 보상으로 정리했습니다.
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능은 유지했습니다.

### v6.18.6 TODO

- 기술 보상 선택 및 기술 4개 초과 시 교체 UI 추가
- PokeAPI raw 기술 데이터의 실제 대량 수집 및 한글명 매핑 고도화
- 진화 선택 UI와 자동 진화 연출 추가
- 보스층 보상 강화 및 장비 등급/희귀도 분리
- 날씨/필드/룸 등 blocked 기술의 장기 지원 여부 검토

## v6.18.7 Adventure Rule Fix + Random Reward + Capture Rate + Wild Balance Patch

- 전투 중 교체 버튼 실제 동작 보강
- 교체 실패 시 내 기술 선택창으로 복귀하도록 수정
- 전투 중 아이템 사용 시 턴 소모 처리
- 포획 무조건 성공 문제 수정
- PokeAPI capture_rate 기반 포획률 구조 추가
- 포획 실패 시 상대 턴 진행
- 보상 4개를 고정 카테고리가 아닌 실제 랜덤 보상으로 변경
- 상태이상 치료제 보상 풀 추가
- 장비 종류별 최대 6중첩 제한 추가
- 장비별 중첩 수에 따른 효과 적용
- 스타터 풀과 야생 포켓몬 풀 분리 확인 및 보강
- 야생 포켓몬이 스타터 12마리 안에서만 반복되지 않도록 수정
- 초반 야생 포켓몬을 BST 기준으로 제한
- 10층 단위 난이도 상승 구조 추가
- 강한 기본형 포켓몬의 초반 출현 제한
- 모험모드 중 로비로 돌아가기 버튼 추가
- 관리자 페이지에 모험모드센터 메뉴/탭 뼈대 추가
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능 유지

### TODO

- v6.18.8 관리자 모험모드센터 실제 기능 구현
- 레벨업 시뮬레이터
- 데미지 계산기
- 기술 효과 테스트기
- 장비 효과 테스트기
- 보상 생성 테스트기
- 포획률 테스트기
- 야생 포켓몬 출현 풀 테스트
- v6.18.9 기술 보상 / 기술 교체 UI / 진화 선택 UI


## v6.18.8 Adventure Status Engine Sync + Early Balance + Evolvable Starter Patch

- 모험모드 상태이상 처리 동기화
- 수면 / 마비 / 독 / 화상 턴 처리 정상화
- 상대 포켓몬 상태이상 UI 및 이펙트 반영 보강
- 상태이상 포획률 보정 반영
- 야생 포켓몬 레벨을 내 포켓몬 레벨 기준으로 조정
- 1~5층은 내 레벨 -2 ~ +0 범위로 완화
- 6~39층은 내 레벨 -3 ~ +1 범위로 완화
- 40층 이후는 내 레벨 -2 ~ +3 범위 허용
- 초반 HP 보정 추가
- 초반 선공기 위력 보정 추가
- 초반 기술 풀 재조정
- 초반 BST 제한 강화
- 스피드업을 일반 보상 풀에서 제외
- 이상한사탕 보상 추가
- 스타터 후보를 3단 진화 라인의 1단계 포켓몬 중심으로 변경
- 진화 데이터 구조 보강
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능 유지

TODO:
- v6.18.9 기술 보상 / 기술 교체 UI
- v6.18.10 진화 선택 UI
- 관리자 모험모드센터 실제 기능 확장
- 선공/회피/행동 순서 시스템 강화 후 스피드업 보상 재도입 검토

## v6.18.8.1 Lobby Adventure/City Card Asset Replacement Patch

- 모험모드 로비 카드 이미지 교체
- 모험모드 로비 엠블럼 교체
- 상록시티 카드 이미지 및 엠블럼 교체
- 연분홍시티 카드 이미지 및 엠블럼 교체
- 보라타운 카드 이미지 및 엠블럼 교체
- 기존 로비 기능 / 일반 대전 / AI 대전 / 모험모드 / 관리자 기능 유지


## v6.18.8b Lobby Card Banner Ratio Sync Patch

- 로비 카드 상단 배너 이미지 비율/크롭/정렬 방식 통일
- 상록시티/연분홍시티/보라타운 카드의 배너 렌더링 방식을 기준으로 기존 카드 UI 동기화
- 태초마을 / 회색시티 / 블루시티 / 무지개시티 카드의 배너 표시 균형 조정
- 카드 상단 엠블럼 크기/위치/비율 정렬 개선
- 로비 카드 전체의 시각적 통일감 개선
- 기존 로비 기능 / 일반 대전 / AI 대전 / 관전 / 모바일 / 관리자 기능 유지


## v6.18.8d Adventure Balance Hotfix + Admin Pokemon Preview

- 스타터 후보에 `undefined` 이름이 표시되던 문제를 방어적으로 보정
- 포켓몬 이름 fallback 매핑을 추가해 한글 이름 표시 안정화
- 그로우펀치가 상대를 쓰러뜨린 경우에도 공격 랭크 +1이 적용되도록 수정
- 초반 야생 포켓몬 BST 범위를 더 낮춰 약한 미진화 포켓몬 위주로 등장하도록 조정
- 초반 wildPool을 안전한 미진화/기본형 후보 위주로 제한
- 경험치 획득량을 3배로 상향
- 먹다남은음식 회복량을 포켓몬 본가 기준인 최대 HP의 1/16 회복으로 조정하고 중첩 반영
- 단백질 / 철분 / 사포닌 / 스피드업을 일반 아이템/보상 풀에서 제거
- 관리자 모험모드센터에 포켓몬 sprite/이름/BST 확인용 포켓몬 탭 추가
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능 유지

## v6.18.8d Adventure Starter Pool Diversity Fix Patch

- 스타터 후보가 fallback 단일 기본형에 과하게 치우치던 문제 수정
- 3단 진화 1단계 / 2단 진화 1단계 / 진화 가능한 미진화 포켓몬 우선순위 재정리
- 단일 기본형 fallback은 마지막 보충용으로 제한
- 강한 단일 기본형 포켓몬을 스타터 후보에서 제외
- 스타터 후보 12마리 구성 비율 개선
- adventure_starter_pool.json 구조 보강
- 최근 표시된 스타터 후보 반복 방지 로직 추가
- 스타터 후보 생성 디버그 로그 강화
- starterPool과 wildPool 분리 확인
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능 유지


## v6.18.8e Adventure Switch Capture Wild EXP Field Patch

- 모험모드 교체 버튼이 실제로 동작하지 않던 문제 수정
- 교체 실패 시 기술 선택창으로 정상 복귀하도록 수정
- 포획률이 100%처럼 체감되던 문제 점검 및 수정
- 포획 실패 시 상대 턴이 진행되도록 수정
- 기술 빗나감 로그/연출 복구
- 야생 포켓몬이 일부 포켓몬만 반복되던 문제 수정
- wildPool에 starterPool 후보도 포함 가능하도록 완화
- 초반 wildPool 최소 후보 수 확보
- 초반 난이도 추가 완화
- 경험치 획득량 3배 증가
- 레벨업 시 HP 25% 회복 추가
- 먹다남은음식 회복량을 최대 체력의 1/8 기준으로 변경
- 모험모드 층별 배틀 필드 배경 변경 구조 추가
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능 유지

## v6.18.8e Adventure Switch Repair + Early Baby/Bug Pool + Evolution Activation Patch

- 모험모드 교체 UI 클릭 흐름을 event binding + 공통 교체 함수 기반으로 정리
- 교체 처리 시 activePokemonIndex / activePokemon / team 상태 동기화 보강
- 기절 후 강제 교체 시 새 포켓몬이 필드에 표시되지 않던 문제 수정
- 일반 교체 시 턴 소비 후 상대 행동으로 이어지도록 정리
- 교체 실패 시 switch phase에 갇히지 않고 행동 선택창으로 복귀하도록 수정
- 교체 후 상태창 / 필드 sprite / 기술 버튼 / 교체 목록 렌더링 갱신 보강
- 1~10층을 초반 안정 파밍 구간으로 조정
- 1~10층 야생 포켓몬을 아기 포켓몬 + 약한 벌레 미진화체 중심으로 제한
- 단단지를 1~10층 초반 야생 풀에서 제외
- 1~10층 적 레벨을 내 active 포켓몬보다 1~2 낮게 생성
- 레벨업 후 진화 조건 체크 추가
- 레벨 조건 만족 시 자동 진화 처리 추가
- 진화 후 이름 / 스프라이트 / 타입 / 스탯 / 상태창 갱신
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능 유지

TODO:
- 진화 선택 UI 추가
- 진화 취소 기능 추가
- 진화 후 신규 기술 습득 UI 추가
- 도구 진화 / 교환 진화 / 친밀도 진화 처리
- 관리자 모험모드센터에 진화 테스트 기능 추가

## v6.18.9 Adventure Reward Rework + EXP Share + TM + Move Scaling Patch

- EXP +n 직접 보상 제거
- 단백질 / 철분 / 사포닌 / 스피드업 보상 제거
- 성장 보상을 이상한사탕 / 학습장치 중심으로 재정리
- 학습장치 시스템 추가
- 대기 포켓몬 전투/포획 경험치 획득 추가
- 기절한 포켓몬도 학습장치 경험치 일부 획득
- 기절한 포켓몬이 레벨업하면 maxHp 25%로 부활
- 작은부활씨앗 / 기력의조각 / 기력의덩어리 추가
- 대규모 부활 / 생명의샘 / 포켓몬센터 이용권 추가
- 기술머신 보상 추가
- 기술머신 대상 포켓몬 선택 UI 추가
- 기술 4개 초과 시 기술 교체 UI 추가
- 현재 팀이 배울 수 있는 기술머신만 보상으로 등장하도록 조정
- 야생 포켓몬 기술 구성을 층수/레벨 기준으로 스케일링
- 30층 이후에도 약한 기술만 사용하는 문제 수정
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능 유지

### TODO

- 레벨업 기술 습득 UI
- 진화 후 신규 기술 습득 UI
- 진화 선택/취소 UI
- 관리자 모험모드센터 기술 테스트
- 보스층 전용 희귀 기술머신
- 도구 진화 / 교환 진화 / 친밀도 진화
- 능력치 +1 계열 보상은 추후 필요 시 관리자 테스트용으로만 재검토

## v6.18.9a Adventure Switch Visual State Repair Patch

- 모험모드 교체 후 이전 포켓몬이 잠깐 다시 등장하던 시각 버그 수정
- 교체 성공 직후 player visual state 초기화
- 교체 후 상대 턴 대상이 새 active 포켓몬을 참조하도록 보강
- 교체 전 snapshot이 상대 턴 연출에 재사용되지 않도록 수정
- player sprite의 fainted/hidden/defeated/switch 관련 class 정리
- 지연 렌더/애니메이션 queue가 이전 포켓몬을 다시 그리지 않도록 render token 방어 추가
- 일반 교체 / 강제 교체 모두 새 active 포켓몬 기준으로 렌더링되도록 수정
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능 유지

## v6.18.10 Adventure Admin Center + Reward JSON Editor + Move Layout Manager Patch

- 관리자 페이지에 모험모드센터 1차를 추가했습니다.
- 보상 관리 / 보상 효과 수치 / JSON 편집기 / 층별 밸런스 / 크기 보정 / 레벨업·진화 / 기술 배치 / 포획률 탭을 추가했습니다.
- 보상 효과 수치를 관리자에서 확인하고 수정할 수 있는 구조를 추가했습니다.
- 보상 관련 JSON을 복사/붙여넣기하고 서버에서 검증 후 저장할 수 있게 했습니다.
- 모험모드 전용 포켓몬 기술 배치 JSON을 추가했습니다.
- 스타터 기술, 야생 기술, 포획 기술, 레벨업 기술, 기술머신 허용 목록을 관리할 수 있는 기반을 추가했습니다.
- PokeAPI 기반 레벨업 기술 수집 스크립트 뼈대를 추가했습니다.
- 가방에서 보유 아이템이 우선 보이도록 정렬을 개선했습니다.
- 패배 시 모험 실패 오버레이와 다시하기 / 새 모험 시작 / 로비로 돌아가기 버튼을 복구했습니다.
- 포켓몬 3마리 초과 포획 시 교체 또는 포기 UI를 보강했습니다.
- 같은 기술 중복 방지와 층수/레벨 기반 기술 구성 보강을 추가했습니다.
- 기존 일반 대전 / AI 대전 / 관전 / 모바일 / 관리자 인증 구조를 유지했습니다.

### TODO
- 레벨업 시 실제 신규 기술 습득 UI 연결
- 진화 후 신규 기술 습득 UI
- 모험모드센터 데미지 계산기
- 모험모드센터 장비 효과 테스트
- 모험모드센터 100층 시뮬레이터
- PokeAPI learnset 전체 수집 및 한글 기술명 매핑 보강

## v6.18.11a Adventure Capture Throw Tuning + Enemy Reappear Hotfix

- 포획볼 투척 연출 크기를 축소했습니다.
- 포획볼이 직선 탄환처럼 날아가지 않고 포물선을 그리며 날아가도록 수정했습니다.
- 포획볼 투척 속도를 완화했습니다.
- 포획 연출 수치를 `public/data/adventure_effect_settings.json`에서 조정할 수 있도록 추가했습니다.
- 포획 성공 후 다음 상대 포켓몬이 필드에 보이지 않던 문제를 수정했습니다.
- 포획 성공/실패 후 enemy sprite visual state 초기화를 보강했습니다.
- capture effect overlay 정리 및 지연 callback 방어를 추가했습니다.
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능을 유지했습니다.

### TODO
- 관리자 모험모드센터에서 포획 이펙트 수치 편집 기능 추가
- 볼 종류별 궤적 차별화
- 포획 성공 시 카메라 흔들림/줌 연출 고도화

## v6.18.12a Adventure Rare Candy Reward Boost + Evolution Access Patch

- 이상한사탕 보상 등장률을 상향했습니다.
- 초중반 진화 접근성을 개선했습니다.
- 보스층 이상한사탕 등장 보정을 추가했습니다.
- 성장 보상을 이상한사탕 / 학습장치 중심으로 유지했습니다.
- 직접 EXP 보상 제거 상태를 유지했습니다.
- 이상한사탕 사용 시 기존 레벨업 / 스탯 재계산 / 진화 체크 흐름을 타도록 보강했습니다.
- 이상한사탕 보상 weight를 `data/adventure_reward_balance.json`에서 조정할 수 있도록 정리했습니다.
- 모험모드 포획볼 표시 크기를 더 키우고, `public/data/adventure_effect_settings.json`에서 조정 가능한 최대 범위를 확장했습니다.
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능을 유지했습니다.

### TODO
- 이상한사탕 대상 포켓몬 선택 UI 고도화
- 진화 취소 UI
- 진화 후 신규 기술 습득 UI
- 관리자 모험모드센터에서 이상한사탕 확률 슬라이더 추가
- 관리자 모험모드센터에서 포획 이펙트 수치 편집 기능 추가


## v6.18.13 Adventure Growth Loop Boost + Level-Up Move Learning Patch

- 전투 승리 EXP 대폭 상향
- 포획 EXP 대폭 상향
- 필요 경험치 공식 완화
- EXP 밸런스 JSON 추가
- 초중반 레벨업 및 진화 접근성 개선
- 학습장치 EXP 분배 유지/상향
- 레벨업 시 새 기술 습득 체크 추가
- 포켓몬별 레벨업 기술표 JSON 추가
- 새 기술을 배울지 선택하는 UI 추가
- 기술 4개 초과 시 잊을 기술 선택 UI 추가
- 같은 기술 중복 습득 방지
- 기술 습득 후 진화 체크 순서로 성장 이벤트 정리
- 진화 연출 강화
- 진화 후 이름 / sprite / 타입 / 스탯 / 상태창 갱신 보강
- 이상한사탕 상향 유지
- 직접 EXP 보상 제거 상태 유지
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능 유지

README TODO:
- 관리자 모험모드센터에서 EXP 밸런스 수치 편집
- 관리자 모험모드센터에서 레벨업 기술표 편집
- 진화 후 신규 기술 습득 UI
- 진화 취소 UI
- PokeAPI learnset 전체 수집 및 한글 기술명 매핑 보강

## v6.18.14 Adventure Admin Encounter Simulator + Wild Balance Control + Hall of Fame Patch

- 관리자 모험모드센터에 야생 포켓몬 출현 시뮬레이터 추가
- 층수별 출현 후보 / 제외 / 가중치 설정 구조 추가
- `data/adventure_encounter_rules.json` 추가
- 90층 이후 특정 포켓몬이 반복 등장하던 문제 완화
- wildPool 후보 부족 시 fallback 완화 규칙 추가
- 최근 등장 포켓몬 패널티 추가
- 야생 기술 생성 테스트 구조 추가
- 층수별 야생 기술 스케일링 강화
- 견제기는 실제 해당 포켓몬이 배울 수 있는 기술 안에서만 허용하도록 정리
- 포켓몬별 허용 기술 관리 구조 추가
- 100층 최종보스 구조 준비
- 기존 배틀모드 cry 재사용 방향 정리
- 100층 클리어 시 명예의 전당 화면 추가
- 이번 런에서 사용했던 포켓몬을 front sprite로 표시
- 기절한 포켓몬도 명예의 전당에 포함
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능 유지

README TODO:
- 관리자 모험모드센터에서 모든 encounter JSON 직접 저장 기능 고도화
- 보스 등장 연출 강화
- 100층 최종보스 전용 배경/사운드 추가
- 포켓몬 cry 테스트 완전 구현
- 명예의 전당 스크린샷 저장 기능
- 명예의 전당 통계 표시

## v6.18.15 Adventure Status Move Null HP Fix + Full Learnset Sync + Admin Growth Lab Patch

- 싫은소리 사용 시 HP가 null 또는 NaN이 되던 문제 수정
- 방어태세 사용 시 전투가 멈추던 문제 수정
- 변화기 / 상태기 / 랭크기 데미지 0 처리 보강
- HP 값이 비정상적으로 오염되지 않도록 방어 로직 추가
- 여러 레벨이 한 번에 오를 때 기술 습득 / 진화 조건을 누락하지 않도록 레벨업 함수 개선
- 캐터피 / 뿔충이 등 진화 조건 레벨을 지난 포켓몬도 정상 진화하도록 수정
- 현재 구현된 포켓몬의 레벨업 기술표 동기화 구조 추가
- PokeAPI 기반 레벨업 기술 수집 스크립트 추가
- 관리자 모험모드센터에 성장 실험실 추가
- 관리자에서 포켓몬 선택 후 레벨업 / 기술 습득 / 진화 / 스탯 상승 확인 가능
- 전체 포켓몬 learnset 검증표 추가
- 특정 층 출현 가능 포켓몬 전체 조회 기능 추가
- 포켓몬 크기 보정 관리자 기본 구조 추가
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능 유지

README TODO:
- PokeAPI 한글 기술명 매핑 확대
- 관리자에서 learnset 직접 편집/저장 고도화
- 포켓몬 크기 보정 시각 미리보기 고도화
- 모든 포켓몬 진화 조건 세부 검증
- 관리자 성장 실험실에서 실제 전투 상황 재현

## v6.18.16 Adventure Full Learnset Validation + Bench Item Targeting + Special Evolution + Shared Sprite Scale Patch

- PokeAPI 기반 full learnset 수집 구조 추가
- 포켓몬별 level-up / machine / tutor / egg 기술 구분 저장
- 야생 기술 / 기술머신 / 견제기 / 보스 기술이 실제 배울 수 있는 기술 안에서만 나오도록 검증
- 꾸꾸리에게 물대포 같은 불가능한 기술이 배치되지 않도록 수정
- 후반 야생 포켓몬 기술폭 확장
- 벤치 포켓몬에게 상처약 / 좋은상처약 / 고급상처약 사용 가능
- 기절한 벤치 포켓몬에게 작은부활씨앗 / 기력의조각 / 기력의덩어리 사용 가능
- 아이템 대상 선택 UI 추가
- 진화의돌 / 연결의끈 / 진화의빛 보상 추가
- 통신교환 진화 포켓몬을 연결의끈으로 진화 가능하게 추가
- 돌 진화 포켓몬을 진화의돌로 진화 가능하게 추가
- 이브이 분기 진화 UI 추가
- 진화의돌 사용 시 이브이 → 샤미드 / 쥬피썬더 / 부스터 선택 가능
- 진화의빛 사용 시 이브이 → 에브이 / 블래키 선택 가능
- 기존 푸끼몬 크기 관리자 확장
- 모험모드 구현 포켓몬도 크기 관리자에 표시
- 크기 관리자 scale / offset 값을 배틀모드와 모험모드에 공통 적용
- 미진화 / 중간진화 / 최종진화 포켓몬 크기 보정 추가
- 브케인 / 꾸꾸리 / 페이검 / 알통몬 등 미진화 포켓몬 크기 보정
- 진화 후 포켓몬 크기가 더 작아지는 문제 방지
- 관리자에서 full learnset / 특수진화 / 공통 크기 보정 확인 가능

README TODO:
- full learnset 한글 기술명 매핑 확대
- 특수진화 아이템 세부 돌 종류 분리
- 특수진화 보상 밸런스 추가 조정
- 관리자 크기 보정 저장 기능 고도화
- 포켓몬별 체급 기반 자동 scale 계산 개선
- 명예의 전당 전용 크기 표시 조정

## v6.18.16a Starter Evolution Guard + Legal Move Fallback + Size Admin Full Roster Hotfix

- 스타터 후보에 중간진화/최종진화 포켓몬이 등장하던 문제 수정
- evolutionStage 누락 포켓몬도 진화 데이터 기반으로 진화체 여부를 판정하도록 보강
- 타입/스탯이 비어 있는 포켓몬이 노말 타입으로 둔갑해 후보에 등장하지 않도록 수정
- 스타터 후보 최종 안전 필터 추가
- 1~10층 야생 후보에도 basic-only guard 적용
- 전광석화 / 아쿠아제트 / 몸통박치기 fallback이 무분별하게 적용되던 문제 수정
- fallback 기술도 실제 배울 수 있는 기술인지 검증하도록 수정
- 아쿠아제트를 공통 fallback에서 제거
- 포켓몬별 allowedMoves가 없을 때 경고 처리 강화
- 푸끼몬 크기 관리자에 누락된 구현 포켓몬이 표시되도록 데이터 소스 확장
- 파라스 / 꼬렛 / 왕눈해 / 아보 / 케이시 등 누락 포켓몬 표시 보강
- size-check-data의 types / stats / evolutionStage 누락 데이터 보강
- 크기 관리자에 데이터 불완전 / 크기 미설정 / 진화 크기 이상 필터 보강
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능 유지

## v6.18.17 Adventure Master Roster + Auto Learnset + One-Shot Hotfix + Scale Baseline Patch

- 1~2세대 전체 포켓몬 마스터 목록(`pokemon_master_gen1_2.json`) 추가
- 관리자 / 크기 관리자 / 모험모드 포켓몬 목록 기준을 master roster로 통일
- 신규 포켓몬 추가 시 관리자와 크기 관리자에 자동 표시되도록 구조 개선
- PokeAPI 기반 full learnset 수집/정제 스크립트 보강
- level-up / machine / tutor / egg 기술 구분 저장 구조 정리
- 포켓몬별 allowedMoves 검증 강화
- 레벨업 시 기술 자동 습득 방식 적용
- 기술 4개 초과 시 낮은 티어 / 오래된 기술 자동 교체 규칙 추가
- 자동 습득한 기술을 즉시 전투 moves 배열에 반영
- 야생 포켓몬 기술 구성을 full learnset / allowedMoves 기반으로 개선
- 실제 배울 수 없는 기술이 들어가지 않도록 검증 강화
- 1층 원샷 / 효과가 뛰어난 기술 사용 후 전투가 멈추던 문제 방어 로직 추가
- enemy faint / EXP / 성장 / 보상 흐름 안정화
- 사용자가 제공한 1~2세대 포켓몬 크기 스케일링 표를 기본 render profile로 적용
- 배틀모드 / 모험모드 / 명예의 전당 크기 기준 공통화
- 신규 포켓몬 크기 추천 규칙 및 누락 검증 스크립트 추가
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능 유지

README TODO:
- 3세대 이후 master roster 확장
- PokeAPI 수집 후 unmapped move 한글명 매핑 추가
- 자동 기술 교체 규칙 세부 밸런스 조정
- 관리자 원샷 전투 테스트 자동화
- 포켓몬 height 기반 scale 추천 고도화

## v6.18.17a Learn Move Choice Restore + Real Learnset Validation Hotfix

- 레벨업 시 자동 기술 습득 로직 제거
- 기술 4개 초과 시 자동 교체 로직 제거
- 포켓몬 원작식 “배운다 / 배우지 않는다” 선택 UI 복구
- 기술 4개 보유 시 잊을 기술 선택 UI 복구
- 여러 레벨이 한 번에 올라도 기술 습득 이벤트가 순서대로 처리되도록 보강
- 기술 습득/거절/교체 후 진화 체크가 정상 이어지도록 수정
- 기술 배우기 UI에서 진행이 멈추지 않도록 growthQueue / phase / lock 보강
- 레벨업 기술은 실제 level-up learnset 기반으로만 표시
- allowedMoves 검증을 통과한 기술만 배울 수 있도록 유지
- 1층 원샷 / 효과가 뛰어난 기술 후 faint / EXP / 기술 선택 / 보상 흐름 안정성 유지
- 관리자 성장 실험실에서 기술 선택 흐름 검증 가능
- 기존 master roster / scale baseline / 크기 관리자 개선 유지
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능 유지

README TODO:
- 기술 배우기 UI 디자인 고도화
- 기술 정보 카드 상세화
- 관리자에서 learnset 원본/정제 비교 기능 추가
- 기술머신 사용 시 잊을 기술 선택 UI 공통화

## v6.18.19 Adventure Move Level Gate + Player Faint Resolution Hotfix

- 모험모드 초기 포켓몬/야생 포켓몬 기술 구성 시 현재 레벨 이하 level-up 기술만 사용하도록 보강
- machine / tutor / egg 기술이 초기 기술에 섞이지 않도록 방어
- level_learned_at <= 0 또는 현재 레벨보다 높은 기술이 초기 기술에 들어가지 않도록 수정
- 저레벨 케이시 사이코키네시스, 저레벨 피카츄 번개 등 조기 고위력 기술 배정 방지
- 1~10층 야생 포켓몬 고위력 기술 gate 강화
- 기술 후보가 부족할 때만 약한 기본기 fallback을 사용하도록 정리
- 내 active 포켓몬 HP 0 이후 playerFainting 흐름 추가
- 벤치 생존 포켓몬이 있으면 교체 흐름으로 이동하도록 보강
- 팀 전체 전멸 시 fail phase / game over overlay가 확실히 표시되도록 수정
- player faint 후 아무것도 진행되지 않던 상태 방지
- 기존 enemy faint / reward / floor advance guard 유지
- 기존 기술 선택 UI / master roster / scale baseline / 관리자 / 모바일 / 일반 대전 / AI 대전 / 관전 기능 유지

README TODO:

- 층수별 야생 기술 티어 세부 밸런스 조정
- player faint 연출 고도화
- 강제 교체 UI UX 개선
- 관리자 전투 상태 디버거 UI 고도화
- PokeAPI full learnset 재수집 결과 상세 검증

## v6.18.19c Adventure Start Runtime Error + Move Gate + Player Faint Minimal Hotfix

- 모험모드 시작 중 `adventureLevelUpMovesForLevel` 미정의로 발생하던 ReferenceError를 현재 ZIP의 실제 함수 구조 기준으로 수정
- `getAdventureLevelUpMovesForLevel()`이 참조하던 level-up learnset row 조회 helper를 안전하게 보강
- 초기 포켓몬/야생 포켓몬 기술 구성 시 현재 레벨 이하 level-up 기술만 사용하도록 생성 경로를 정리
- `sanitizeIllegalMovesForPokemon()`이 allowedMoves/full learnset으로 기술을 억지로 4개 채우던 흐름을 차단
- machine / tutor / egg 기술과 현재 레벨보다 높은 기술이 초기 기술에 섞이지 않도록 방어
- 1~10층 야생 포켓몬 고위력 기술 gate 및 약한 fallback 흐름 유지
- 내 active 포켓몬 HP 0 이후 fail/game over 또는 교체 흐름으로 이어지는 기존 player faint guard 유지
- 기존 enemy faint / reward / floor advance guard 유지
- 기존 기술 선택 UI / master roster / scale baseline / 관리자 / 모바일 / 일반 대전 / AI 대전 / 관전 기능 유지

TODO:

- 브라우저 콘솔에서 모험모드 시작 ReferenceError/TypeError 미발생 수동 확인
- 층수별 야생 기술 티어 세부 밸런스 조정
- player faint 연출 고도화
- 강제 교체 UI UX 개선
- 관리자 전투 상태 디버거 UI 고도화

## v6.18.20 Adventure Enemy HP Canonical Source + Reward Revalidation Hotfix

- 모험모드에서 상대 HP가 남아 있는데 reward phase가 뜨던 문제 방어
- 전투 계산용 enemy와 렌더링 enemy의 HP source 불일치 탐지 로그 추가
- reward 진입 직전 canonical enemy HP를 재검증하도록 보강
- canonical enemy HP가 1 이상이면 enemyFaintResolved flag가 true여도 reward / EXP / floor clear 차단
- enemy HP가 1 이상인데 enemyFaintResolved가 true인 경우 flag를 되돌리고 전투 흐름으로 복구
- 데미지 적용 후 enemy.hp/currentHp에 clamp 결과를 반영하도록 보강
- enemy HP가 NaN/null/undefined일 때 reward로 보내지 않고 차단 로그를 남기도록 방어
- reward UI 렌더링 및 보상 선택 시점에도 enemy HP 재검증
- 기존 enemy faint / reward / floor advance guard 유지
- 기존 기술 선택 UI / master roster / scale baseline / 관리자 / 모바일 / 일반 대전 / AI 대전 / 관전 기능 유지

TODO:

- adventure_levelup_learnsets.json 전체 재정리
- Gen2 포켓몬 adventure 데이터 무결성 검사
- 데미지 공식 / 스탯 fallback 밸런스 검증
- 전투 상태 디버거 UI 고도화

## v6.18.21 PokeAPI Level-Up Learnset Review Export

- PokeAPI 기준 `heartgold-soulsilver` version_group의 level-up 기술만 수집하는 검수 스크립트 추가
- `machine` / `tutor` / `egg` / `event` / `level 0` 기술은 이번 level-up 검수 데이터에서 제외
- 기존 `data/adventure_levelup_learnsets.json`은 덮어쓰지 않음
- 게임 전투 로직 / 모험모드 로직은 수정하지 않음
- 검수용 JSON / CSV / 샘플 CSV / unmapped report / validation summary 생성 경로를 분리
- 미뇽, 피카츄, 케이시, 모래두지, 마릴, 코산호 등 주요 샘플 포켓몬의 레벨업 기술 검수 기반 마련

생성/출력 파일:

- `data/review_levelup_learnsets_hgss.json`
- `data/review_levelup_learnsets_hgss.csv`
- `data/review_levelup_learnsets_samples_hgss.csv`
- `data/review_levelup_unmapped_report_hgss.json`
- `data/review_levelup_validation_summary_hgss.txt`
- `scripts/fetch_pokeapi_levelup_learnsets_review.js`

주의:

- 이 스크립트는 실행 환경에서 `https://pokeapi.co` DNS/네트워크 접근이 가능해야 실제 검수 데이터를 생성한다.
- 네트워크 접근이 불가능한 환경에서는 preflight 단계에서 실패 보고서만 생성하고 종료한다.
- 게임 연결은 사용자가 샘플 CSV를 확인한 뒤 다음 패치에서 진행한다.

TODO:

- 사용자가 샘플 CSV 검수
- 검수 완료 후 `adventure_levelup_learnsets.json` 교체 패치 진행
- 초기 기술 / 야생 기술 / 레벨업 UI를 새 level-up 데이터에 연결
- TM / tutor / egg 기술 시스템은 별도 패치에서 검토


## v6.18.22 Adventure HGSS Level-Up Learnset Apply + Move Coverage Implementation Patch

- PokeAPI heartgold-soulsilver 기준 level-up 런셋을 게임용 `data/adventure_levelup_learnsets.json`에 적용했습니다.
- 기존 `data/adventure_levelup_learnsets.json`은 `data/adventure_levelup_learnsets.backup_pre_v6.18.22.json`으로 보존했습니다.
- TM / tutor / egg / event 기술은 레벨업 런셋에서 제외했고, level 0 기술도 이번 적용에서 제외했습니다.
- HGSS level-up 런셋에 등장하는 기술을 게임 배틀엔진 기준으로 coverage audit 했습니다.
- 구현 가능한 단순 공격기 / 상태이상 / 능력치 변화 / 회복 기술을 기존 move schema에 맞춰 추가했습니다.
- 위험한 특수효과 기술은 deferred report에 남기고 게임 적용에서 제외했습니다.
- 한글 기술명 매핑 누락을 보강하고 mapping gap report를 생성했습니다.
- 저레벨 미뇽 용의파동, 저레벨 케이시 사이코키네시스, 저레벨 피카츄 번개, 모래두지 Lv8 지진 등 기존 오염 런셋 문제를 제거했습니다.
- 스타팅 / 야생 / 레벨업 UI가 현재 레벨 이하 level-up 기술만 사용하도록 기존 guard를 유지했습니다.
- 기존 enemy HP canonical reward guard / player faint guard / 관리자 / 모바일 / 일반 대전 / AI 대전 / 관전 기능을 유지했습니다.

생성/갱신 파일:

- `data/adventure_levelup_learnsets.json`
- `data/adventure_levelup_learnsets.backup_pre_v6.18.22.json`
- `data/review_hgss_move_coverage.csv`
- `data/review_hgss_move_missing_simple_attacks.csv`
- `data/review_hgss_move_deferred_special_effects.csv`
- `data/review_hgss_move_korean_name_gaps.csv`
- `data/review_hgss_move_apply_report.json`

TODO:

- deferred special effect 기술의 단계적 구현
- TM / tutor / egg 별도 시스템 설계
- level 0 기본기 정책 별도 정리
- 기술 이펙트/애니메이션 매핑 고도화
- 배틀엔진 특공/특방/명중률/회피율 확장 검토

## v6.18.23 Adventure Smooth Startup + Roster JSON Response Guard Hotfix

- 모험모드 시작 시 `/data/pokemon_master_gen1_2.json` 요청이 HTML/404를 반환해 JSON parse 오류가 발생하던 문제를 방어했습니다.
- `pokemon_master_gen1_2.json`을 서버의 adventure data allowlist에 추가해 브라우저에서 JSON으로 응답되도록 보강했습니다.
- master roster JSON fetch 시 `response.ok`와 `content-type`을 검증하는 안전 fetch guard를 추가했습니다.
- JSON이 아닌 응답은 무리하게 파싱하지 않고 조용히 fallback 처리하도록 정리했습니다.
- `[Adventure/Moves] level gate result` 등 반복 디버그 로그를 기본 비활성화했습니다.
- `window.ADVENTURE_DEBUG_MOVES = true`일 때만 세부 기술 gate 로그가 출력되도록 변경했습니다.
- 모험모드 시작 중 반복되는 level gate 계산에 최소 캐시를 적용했습니다.
- 모험모드 시작 성능 측정 로그 `[Adventure/Startup] timing`을 추가했습니다.
- 모험모드 버튼 클릭 직후 `모험 준비 중...` 상태 문구를 표시해 초기 응답성을 개선했습니다.
- 기존 HGSS level-up 런셋, 기술 구현, enemy HP reward guard, player faint guard는 유지했습니다.
- 기존 관리자 / 모바일 / 일반 대전 / AI 대전 / 관전 기능은 유지했습니다.

TODO:

- 모험모드 데이터 preloading 구조 정리
- 관리자용 성능 디버거 UI 추가
- 초기 진입 이미지/sprite lazy loading 최적화
- level-up 기술 후보 캐시 영속화 검토

## v6.18.24 Adventure Move Animation Fallback + Capture GrowthQueue Sequencing Hotfix

- 일부 기술 사용 시 기술 연출/피격/HP 감소 표시가 생략되고 바로 보상으로 넘어가던 문제를 방어했습니다.
- 염동력(confusion), 할퀴기(scratch), 꼬리흔들기류 변화기처럼 전용 이펙트가 없거나 약한 기술도 공통 fallback 연출을 거치도록 보강했습니다.
- 변화기 이벤트에서 variation 이펙트가 탐지되었지만 실제 연출을 재생하지 않고 즉시 종료하던 흐름을 수정했습니다.
- move animation / damage render 완료 전 reward phase로 진입하지 않도록 animation guard를 추가했습니다.
- 포획 성공 후 EXP/레벨업/기술 배우기 UI가 끼어들어 다음 진행 callback이 유실될 수 있던 growthQueue 재진입 조건을 보강했습니다.
- capture success → growthQueue → learnMove/replaceMove/evolution → postBattleContinuation 순서가 한 번만 이어지도록 continuation guard를 추가했습니다.
- learnMove UI의 배운다/배우지 않는다/잊을 기술 선택 종료 경로에서 growthQueue가 계속 이어지도록 기존 흐름을 유지하면서 로그를 보강했습니다.
- 기존 HGSS level-up 런셋, 원활함 패치, enemy HP canonical reward guard, player faint guard를 유지했습니다.

TODO:

- 타입별 전용 기술 이펙트 매핑 고도화
- 보류 특수효과 기술의 단계적 구현
- 전투 상태 디버거 UI에 animation/growthQueue/continuation 상태 표시 추가
- 포획 연출 UX 개선

## v6.18.24 Adventure Event Queue Isolation + Move Animation Fallback Hotfix

- 모험모드 기술 사용 중 일반 대전 `renderOverlay`가 호출되어 `null.style` 오류가 발생하던 문제를 방어했습니다.
- 일반 대전 `renderOverlay`에 overlay DOM null guard를 추가해 모험모드/비전투 화면에서 TypeError가 발생하지 않도록 했습니다.
- 모험모드 기술 이벤트 처리에 `enqueueAdventureEventsSafely` wrapper를 추가해 일반 대전 event queue 실패 시 adventure 전용 fallback animation을 실행하도록 보강했습니다.
- 전용 이펙트가 없는 기술도 최소 공통 타격 연출을 거친 뒤 HP 렌더와 결과 처리를 진행하도록 보강했습니다.
- 염동력(confusion)처럼 전용 이펙트가 약한 기술 사용 시 기술 연출 없이 reward로 넘어가는 흐름을 방어했습니다.
- event queue 실패 시 바로 reward/victory로 점프하지 않고 fallback animation → HP 렌더 → canonical HP 검증 → faint 처리 순서로 복구합니다.
- reward 진입 전 move animation / damage render / enemy faint animation 완료 조건을 강화했습니다.
- 기존 enemy HP canonical reward guard / player faint guard / HGSS level-up 런셋 / 원활함 패치를 유지했습니다.
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능을 유지했습니다.

TODO:

- psychic 타입 전용 모험모드 이펙트 추가
- 타입별 모험모드 전용 이펙트 매핑 고도화
- 일반 대전 큐와 모험모드 큐 완전 분리 리팩토링
- animation timeline 디버거 추가

## v6.18.25 Adventure Battle Background Visual Update Patch

- 모험모드 배틀 배경 이미지를 10층 단위 신규 이미지로 교체
- 1~100층까지 층수에 따라 서로 다른 배틀 배경이 표시되도록 정리
- 1~50층은 따뜻한 초원/마을/산기슭 진행감 유지
- 51~100층은 높은 산을 오르는 느낌, 설산과 정상부로 향하는 progression 강화
- 포켓몬 좌측/우측 전투 위치가 잘 보이도록 제작된 신규 배경 적용
- 기존 일반 대전 / AI 대전 / 관전 / 관리자 / 모바일 기능은 유지
- 기존 HGSS level-up 런셋 / reward guard / player faint guard / 연출 안정화 패치 유지
- 전투 로직, 데미지 공식, 기술 데이터는 변경하지 않음

생성/교체 이미지:

- `public/assets/adventure/backgrounds/adventure-battle-bg-floor-001-010.png`
- `public/assets/adventure/backgrounds/adventure-battle-bg-floor-011-020.png`
- `public/assets/adventure/backgrounds/adventure-battle-bg-floor-021-030.png`
- `public/assets/adventure/backgrounds/adventure-battle-bg-floor-031-040.png`
- `public/assets/adventure/backgrounds/adventure-battle-bg-floor-041-050.png`
- `public/assets/adventure/backgrounds/adventure-battle-bg-floor-051-060.png`
- `public/assets/adventure/backgrounds/adventure-battle-bg-floor-061-070.png`
- `public/assets/adventure/backgrounds/adventure-battle-bg-floor-071-080.png`
- `public/assets/adventure/backgrounds/adventure-battle-bg-floor-081-090.png`
- `public/assets/adventure/backgrounds/adventure-battle-bg-floor-091-100.png`

TODO:

- 포켓몬 스프라이트 위치와 신규 배경 전투판 좌표 정밀 조정
- 모바일 화면에서 배경 crop 최적화
- 보스층 전용 배경/연출 추가 검토
- 배경 프리로드 최적화 검토

