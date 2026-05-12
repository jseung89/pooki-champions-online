# 정승의 푸끼몬 챔피언스 ONLINE v6.3 배포 가이드

## 추천 배포
Railway 단독 배포를 추천합니다.

## 로컬 실행

```bash
npm install
npm start
```

포트를 바꾸고 싶으면:

```bash
set PORT=3008
npm start
```

## Railway 배포 순서

1. 이 폴더를 GitHub 저장소로 업로드
2. Railway 접속
3. New Project
4. Deploy from GitHub Repo
5. 저장소 선택
6. 배포 완료 후 Railway 도메인 접속

## Railway 설정

Build Command:

```text
npm install
```

Start Command:

```text
npm start
```

Health Check:

```text
/health
```

## 상태 확인

```text
https://배포주소/health
```

정상 응답에 `"ok": true`가 나오면 서버가 살아있는 상태입니다.

## v6.3 포함 기능

- 4룸 로비
- 태초마을 / 회색시티 / 블루시티 / 무지개시티
- Socket.IO 멀티플레이
- 관전자 / 플레이어 자리 참가
- 후보 리롤 방지
- v5.9 기술배치 개편
- 메타몽 / 마자용 / 루브도 제외
- 전설/환상 후보 최대 1마리
- 서버 상태 확인용 /health


## Render 권장 설정

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


## 최신 패치

```text
v6.3
```

- 중복 로그인 방지 함수 누락으로 발생하던 서버 크래시 수정
- README PATCH NOTES 최신순 정리
- Render 권장 설정 유지


## v6.3 - 로비 채팅 가독성 핫픽스

- 로비 채팅 메시지 글씨 색상 수정
- README PATCH NOTES 최신순 갱신


## v6.3 - 우측 패널 가독성 / 로그인 유지 핫픽스

- 오른쪽 랭킹/로비 채팅 글씨색 수정
- clientId 기반 같은 브라우저 재접속 허용


## v6.3 - 우측 패널 글씨색 강제 핫픽스

- 랭킹/로비 채팅 글씨색을 인라인 스타일로 강제 적용


## v6.3 - AI 연습전

- 로비 방 카드에 AI 대전 버튼 추가
- AI전은 랭킹 미반영 연습전
- README PATCH NOTES 최신순 갱신


## v6.3.9 - 안정판 롤백 + AI 진행 원인 수정

- withRoom 컨텍스트 복구로 일반 입장/AI 턴 진행 오류 수정


## p639 안정판 + 4배 상성 + 풀죽음 최소 패치

- p639 기준
- 4배 상성
- 풀죽음만 추가


## p639 안정판 + 4배 표시 수정 + 교체 연출 최소 보정

- 프론트 4배 표시
- 기절 후 강제 교체 switch-out 생략


## 풀죽음 타이밍 / 4배 버튼 강조 / 강제교체 연출 보정

- p639 안정판 기반 최소 수정
