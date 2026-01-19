# 몰 봐 (Madcamp View)

## 로컬 개발

`npm run dev` 로 제대로 테스트하려면 **백엔드도 로컬에서 실행**해야 합니다.

### 1. 프론트엔드 (이 프로젝트)

```bash
npm install
npm run dev
```

- 프론트: **http://localhost:3000**
- API 요청/구글 로그인: **http://localhost:8080** (`.env.local` 의 `NEXT_PUBLIC_API_URL` 또는 기본값)

### 2. 백엔드 (madcamp-2026-winter-MV-BACK)

```bash
cd ../madcamp-2026-winter-MV-BACK
./gradlew bootRun
```

- 구글 로그인 후 **프론트로 돌아오려면** 백엔드 실행 시 둘 중 하나:
  - `SPRING_PROFILES_ACTIVE=local`  
  - `FRONTEND_URL=http://localhost:3000`

### 3. Google OAuth (로컬 테스트)

Google Cloud Console → OAuth 2.0 클라이언트 → **Authorized redirect URIs**에 추가:

- `http://localhost:8080/login/oauth2/code/google`

---

- **배포 백엔드**에 연결하려면 `.env.local` 에  
  `NEXT_PUBLIC_API_URL=https://madcamp-view.com` 로 변경 후 `npm run dev` 재시작.
