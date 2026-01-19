# "Failed to fetch" 에러 분석 및 해결 방안

## 현재 에러 상황
```
[API] Network error: {}
[useAuth] Error fetching user: {}
```
- 에러 객체가 비어있음 (`{}`)
- "Failed to fetch" 에러 발생
- 네트워크 요청 실패

---

## 🔴 코드 측에서 발생할 수 있는 오류

### 1. API_BASE_URL 잘못 설정
**위치**: `lib/api/types.ts:9`
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

**문제점**:
- 기본값이 `http://localhost:3000`으로 설정되어 있음
- 백엔드 서버는 보통 `http://localhost:8080`에서 실행됨
- 포트 불일치로 인한 연결 실패

**확인 방법**:
```javascript
// 브라우저 콘솔에서 확인
console.log('[API] API_BASE_URL:', API_BASE_URL);
```

**해결 방안**:
1. `.env.local` 파일 생성 및 설정:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```
2. 또는 `lib/api/types.ts`에서 기본값 변경:
   ```typescript
   export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
   ```
3. 개발 서버 재시작 (환경 변수 변경 후 필수)

---

### 2. 에러 객체 직렬화 문제
**위치**: `lib/api/api.ts:89-98`

**문제점**:
- `error.message`가 `undefined`일 수 있음
- `error.name`이 `TypeError`가 아닐 수 있음
- 에러 객체의 속성이 제대로 전달되지 않음

**확인 방법**:
```javascript
// 브라우저 콘솔에서 확인
console.log('Error type:', typeof error);
console.log('Error keys:', Object.keys(error));
console.log('Error string:', String(error));
```

**해결 방안**:
```typescript
// 에러 객체를 더 안전하게 처리
catch (error: any) {
  const errorMessage = error?.message || String(error) || 'Unknown error';
  const errorName = error?.name || 'Error';
  
  if (errorName === 'TypeError' || errorMessage.includes('fetch')) {
    // 네트워크 오류 처리
  }
}
```

---

### 3. 타임아웃 설정 문제
**위치**: `lib/api/api.ts:61-62`

**문제점**:
- 10초 타임아웃이 너무 길 수 있음
- 타임아웃 에러와 네트워크 에러 구분이 명확하지 않음

**해결 방안**:
```typescript
// 더 짧은 타임아웃 설정 (5초)
const timeoutId = setTimeout(() => controller.abort(), 5000);
```

---

### 4. 에러 로깅 부족
**위치**: `lib/api/api.ts:97`, `hooks/use-auth.ts:53-54`

**문제점**:
- 에러 객체가 `{}`로 표시됨
- 실제 에러 정보가 로그에 나타나지 않음

**해결 방안**:
```typescript
// 더 상세한 에러 로깅
console.error('[API] Network error:', {
  error: error,
  message: error?.message,
  name: error?.name,
  stack: error?.stack,
  toString: String(error),
  url: url,
});
```

---

### 5. CORS preflight 요청 실패
**위치**: `lib/api/api.ts:51-58`

**문제점**:
- `credentials: 'include'` 사용 시 CORS preflight 요청 필요
- OPTIONS 요청이 실패할 수 있음

**해결 방안**:
```typescript
// OPTIONS 요청 실패 시 재시도 로직 추가
// 또는 credentials를 조건부로 사용
const defaultOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
    ...options.headers,
  },
  // credentials는 필요할 때만 사용
  ...(options.credentials !== false && { credentials: 'include' }),
  ...options,
};
```

---

## 🟠 서버 설정 측에서 발생할 수 있는 오류

### 1. 백엔드 서버 미실행
**위치**: 백엔드 서버 (`madcamp-2026-winter-MV-BACK`)

**문제점**:
- 백엔드 서버가 실행되지 않음
- 포트 8080에서 서버가 리스닝하지 않음

**확인 방법**:
```bash
# 백엔드 서버 실행 확인
curl http://localhost:8080/api/auth/me

# 또는 브라우저에서 직접 접속
# http://localhost:8080/api/auth/me
```

**해결 방안**:
1. 백엔드 프로젝트 디렉토리로 이동
2. 서버 실행:
   ```bash
   cd madcamp-2026-winter-MV-BACK
   ./gradlew bootRun
   # 또는
   ./gradlew.bat bootRun  # Windows
   ```
3. 서버가 정상적으로 시작되었는지 확인:
   ```
   Started Madcamp2026WinterMVApplication in X.XXX seconds
   ```

---

### 2. CORS 설정 문제
**위치**: `SecurityConfig.java:57-62`

**현재 설정**:
```java
configuration.setAllowedOriginPatterns(Arrays.asList(
    "https://madcamp-view.com",
    "http://madcamp-view.com",
    "http://localhost:3000",
    "http://localhost:3000"  // 중복
));
```

**문제점**:
1. `http://localhost:3000`이 중복되어 있음
2. 다른 포트(예: 3001)에서 실행 시 차단됨
3. `localhost:8080`이 허용되지 않음 (필요한 경우)

**해결 방안**:
```java
configuration.setAllowedOriginPatterns(Arrays.asList(
    "https://madcamp-view.com",
    "http://madcamp-view.com",
    "http://localhost:*",  // 모든 localhost 포트 허용
    "http://127.0.0.1:*"   // 127.0.0.1도 허용
));
```

---

### 3. SecurityConfig 인증 설정 문제
**위치**: `SecurityConfig.java:30-43`

**현재 설정**:
```java
.requestMatchers(
    "/",
    "/api/posts/**",
    "/login/**",
    "/oauth2/**",
    "/api/auth/me",  // ✅ 허용됨
    ...
).permitAll()
```

**문제점**:
- `/api/auth/me`는 허용되어 있음
- 하지만 실제 요청이 다른 경로로 가거나 인증이 필요한 경우 실패할 수 있음

**확인 방법**:
- 백엔드 로그에서 401/403 에러 확인
- SecurityConfig의 permitAll 설정 확인

**해결 방안**:
```java
// 필요시 추가 경로 허용
.requestMatchers(
    "/api/auth/**",  // 모든 auth 엔드포인트 허용
    ...
).permitAll()
```

---

### 4. 서버 포트 충돌
**위치**: `application.properties`

**문제점**:
- 포트 8080이 이미 사용 중일 수 있음
- 다른 서버가 같은 포트를 사용하고 있을 수 있음

**확인 방법**:
```bash
# Windows
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :8080
```

**해결 방안**:
1. 다른 프로세스 종료
2. 또는 `application.properties`에서 포트 변경:
   ```properties
   server.port=8081
   ```

---

### 5. 방화벽/보안 정책
**문제점**:
- Windows 방화벽이 포트 8080을 차단
- 회사/학교 네트워크 정책으로 인한 차단
- VPN 사용 시 네트워크 문제

**해결 방안**:
1. Windows 방화벽 설정 확인
2. 방화벽 예외 추가
3. 로컬 네트워크 설정 확인

---

## 🔍 진단 체크리스트

### 코드 측 확인
- [ ] `.env.local` 파일 존재 및 `NEXT_PUBLIC_API_URL` 설정 확인
- [ ] 브라우저 콘솔에서 `[API] API_BASE_URL:` 로그 확인
- [ ] Network 탭에서 실제 요청 URL 확인
- [ ] 에러 객체의 실제 내용 확인 (console.log로 상세 출력)

### 서버 측 확인
- [ ] 백엔드 서버 실행 상태 확인
- [ ] `http://localhost:8080/api/auth/me` 직접 접속 테스트
- [ ] 백엔드 로그에서 요청 수신 여부 확인
- [ ] CORS 설정 확인 (SecurityConfig.java)
- [ ] 포트 충돌 확인

---

## 📋 우선순위별 해결 순서

### 1단계: 기본 확인
1. 백엔드 서버 실행 확인
2. API_BASE_URL 확인 (브라우저 콘솔)
3. Network 탭에서 실제 요청 URL 확인

### 2단계: 환경 변수 설정
1. `.env.local` 파일 생성
2. `NEXT_PUBLIC_API_URL=http://localhost:8080` 설정
3. 개발 서버 재시작

### 3단계: 에러 로깅 개선
1. 에러 객체 상세 로깅 추가
2. 실제 에러 내용 확인

### 4단계: 서버 설정 확인
1. CORS 설정 확인 및 수정
2. SecurityConfig 인증 설정 확인
3. 포트 충돌 확인

---

## 🛠️ 디버깅 명령어

### 프론트엔드
```bash
# 환경 변수 확인
echo $NEXT_PUBLIC_API_URL  # Linux/Mac
echo %NEXT_PUBLIC_API_URL%  # Windows

# 개발 서버 재시작
npm run dev
# 또는
pnpm dev
```

### 백엔드
```bash
# 서버 실행
cd madcamp-2026-winter-MV-BACK
./gradlew bootRun

# 포트 확인
netstat -ano | findstr :8080  # Windows
lsof -i :8080  # Linux/Mac
```

### 브라우저 콘솔
```javascript
// API URL 확인
console.log('API_BASE_URL:', process.env.NEXT_PUBLIC_API_URL);

// 직접 요청 테스트
fetch('http://localhost:8080/api/auth/me', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## 📝 참고사항

1. **에러 객체가 `{}`로 표시되는 이유**:
   - JavaScript의 Error 객체는 직렬화 시 빈 객체로 표시될 수 있음
   - `error.message`, `error.stack` 등을 개별적으로 확인해야 함

2. **CORS와 credentials**:
   - `credentials: 'include'` 사용 시 CORS 설정이 더 엄격함
   - `Access-Control-Allow-Credentials: true` 필요
   - `Access-Control-Allow-Origin`에 와일드카드(`*`) 사용 불가

3. **환경 변수**:
   - Next.js에서 `NEXT_PUBLIC_` 접두사가 있어야 클라이언트에서 접근 가능
   - 환경 변수 변경 후 개발 서버 재시작 필수
