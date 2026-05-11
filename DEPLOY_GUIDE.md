# 정승의 푸끼몬 챔피언스 ONLINE v6.2 배포 가이드

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

## v6.2 포함 기능

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
