# Google 로그인 후 404 에러 원인 분석

## 현재 상황
- 프론트엔드 도메인: `madcamp-view.com` (Vercel 배포 완료)
- 백엔드 API 도메인: `api.madcamp-view.com`
- 문제: Google 로그인 후 "404 This page could not be found" 에러 발생

---

## 🔴 프론트엔드에서 발견된 문제

### 1. API_BASE_URL 잘못 설정
**위치**: `lib/api/types.ts:10`

**현재 코드**:
```typescript
export const API_BASE_URL = 'https://madcamp-view.com';
```

**문제점**:
- API 요청이 프론트엔드 도메인(`madcamp-view.com`)으로 가고 있음
- 올바른 백엔드 도메인(`api.madcamp-view.com`)으로 요청해야 함
- 이로 인해 API 요청이 실패하거나 잘못된 응답을 받을 수 있음

**해결 방법**:
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.madcamp-view.com';
```

**추가 작업**:
- Vercel 환경 변수에 `NEXT_PUBLIC_API_URL=https://api.madcamp-view.com` 설정 필요

---

### 2. Next.js 라우팅 확인 필요
**확인 사항**:
- `/dashboard` 경로가 제대로 설정되어 있는지 확인
- `app/dashboard/page.tsx` 파일이 존재하는지 확인 ✅ (존재함)

**가능한 문제**:
- Vercel 배포 시 라우팅 설정 문제
- Next.js 빌드 설정 문제

---

## 🟠 백엔드에서 확인/수정 필요한 사항

### 1. OAuth2 리다이렉트 URL 확인
**위치**: `SecurityConfig.java`의 `OAuth2AuthenticationSuccessHandler`

**현재 설정**:
```java
String targetUrl = frontendUrl + "/dashboard";
// frontendUrl = "https://madcamp-view.com"
// 결과: "https://madcamp-view.com/dashboard"
```

**확인 사항**:
1. 백엔드 로그에서 실제 리다이렉트 URL 확인
   - `[OAuth2] Redirecting to frontend: https://madcamp-view.com/dashboard` 로그 확인
2. 리다이렉트가 실제로 실행되는지 확인
3. 리다이렉트 후 브라우저가 어떤 URL로 이동하는지 확인

**가능한 문제**:
- 리다이렉트가 실행되지 않고 있음
- 리다이렉트 URL이 잘못됨
- CORS 문제로 리다이렉트가 차단됨

---

### 2. CORS 설정 확인
**위치**: `SecurityConfig.java`의 `corsConfigurationSource()`

**현재 설정**:
```java
configuration.setAllowedOriginPatterns(Arrays.asList(
    "https://madcamp-view.com",
    "http://madcamp-view.com",
    "http://localhost:3000",
    "http://localhost:8080"
));
```

**확인 사항**:
- `https://madcamp-view.com`이 CORS 허용 목록에 포함되어 있는지 확인 ✅ (포함됨)
- `api.madcamp-view.com`에서 `madcamp-view.com`으로의 리다이렉트가 CORS 정책에 위배되지 않는지 확인

---

### 3. OAuth2 콜백 URL 설정 확인
**확인 사항**:
- Google OAuth2 콜솔에서 승인된 리디렉션 URI 확인
- 백엔드의 OAuth2 콜백 경로가 올바른지 확인
- `application.properties`의 `redirect-uri` 설정 확인

**현재 설정** (`application.properties:42`):
```properties
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:8080/login/oauth2/code/google
```

**문제점**:
- 로컬 개발용 설정만 있음
- 배포 환경용 설정이 없음

**해결 방법**:
- 배포 환경에서는 `https://api.madcamp-view.com/login/oauth2/code/google`로 설정 필요
- 환경 변수나 프로파일로 분리 필요

---

## 🔍 디버깅 체크리스트

### 프론트엔드 확인
- [ ] 브라우저 콘솔에서 `[API] API_BASE_URL:` 로그 확인
- [ ] Network 탭에서 실제 API 요청 URL 확인
- [ ] 404 에러가 발생하는 정확한 URL 확인
- [ ] Vercel 배포 로그 확인

### 백엔드 확인
- [ ] 백엔드 로그에서 `[OAuth2] Login success!` 메시지 확인
- [ ] 백엔드 로그에서 리다이렉트 URL 확인
- [ ] Google OAuth2 콜백이 정상적으로 처리되는지 확인
- [ ] 세션이 정상적으로 생성되는지 확인

---

## 📋 백엔드 개발자에게 전달할 수정 사항

### 1. OAuth2 리다이렉트 URL 로깅 강화
**위치**: `SecurityConfig.java`의 `OAuth2AuthenticationSuccessHandler.onAuthenticationSuccess()`

**추가할 로그**:
```java
System.out.println("[OAuth2] Request URI: " + request.getRequestURI());
System.out.println("[OAuth2] Request URL: " + request.getRequestURL());
System.out.println("[OAuth2] Response status before redirect: " + response.getStatus());
System.out.println("[OAuth2] Response headers: " + response.getHeaderNames());
```

**목적**: 리다이렉트가 실제로 실행되는지, 어떤 URL로 가는지 확인

---

### 2. OAuth2 콜백 URL 환경별 설정
**위치**: `application.properties` 또는 환경 변수

**현재 문제**:
- `redirect-uri`가 로컬 개발용으로만 설정됨
- 배포 환경용 설정 없음

**해결 방법**:
```properties
# 배포 환경용 (환경 변수로 설정)
spring.security.oauth2.client.registration.google.redirect-uri=${OAUTH2_REDIRECT_URI:https://api.madcamp-view.com/login/oauth2/code/google}
```

**또는 환경 변수로 설정**:
```
OAUTH2_REDIRECT_URI=https://api.madcamp-view.com/login/oauth2/code/google
```

---

### 3. Google OAuth2 콘솔 설정 확인
**확인 사항**:
1. Google Cloud Console → API 및 서비스 → 사용자 인증 정보
2. 승인된 리디렉션 URI에 다음이 포함되어 있는지 확인:
   - `https://api.madcamp-view.com/login/oauth2/code/google`
   - (로컬 개발용) `http://localhost:8080/login/oauth2/code/google`

---

### 4. 리다이렉트 방식 확인
**현재 코드**:
```java
response.sendRedirect(targetUrl);
```

**확인 사항**:
- `response.sendRedirect()`가 외부 도메인으로 리다이렉트할 때 제대로 작동하는지
- HTTP 302 리다이렉트가 정상적으로 전송되는지
- 브라우저가 리다이렉트를 따라가는지

**대안**:
- JavaScript를 사용한 리다이렉트 페이지 생성
- 또는 프론트엔드에서 OAuth2 콜백을 처리하도록 변경

---

### 5. 세션 쿠키 도메인 설정 확인
**확인 사항**:
- 세션 쿠키가 `api.madcamp-view.com`에서 설정되는데, `madcamp-view.com`에서 접근 가능한지
- 쿠키의 `Domain` 속성이 올바르게 설정되어 있는지
- `SameSite` 속성 설정 확인

**가능한 문제**:
- 서브도메인이 다른 경우 쿠키 공유 문제
- `api.madcamp-view.com`과 `madcamp-view.com` 간 쿠키 공유 불가

**해결 방법**:
- 쿠키 도메인을 `.madcamp-view.com`으로 설정하여 서브도메인 간 공유
- 또는 세션 관리 방식 변경 (JWT 토큰 등)

---

## 🎯 우선 확인할 사항

### 1단계: 브라우저 개발자 도구 확인
1. Network 탭에서 404 에러가 발생하는 정확한 URL 확인
2. 404 에러가 발생하는 시점 확인 (로그인 직후인지, 특정 페이지 접근 시인지)
3. 콘솔 에러 메시지 확인

### 2단계: 백엔드 로그 확인
1. `[OAuth2] Login success!` 로그가 출력되는지 확인
2. 리다이렉트 URL이 올바른지 확인
3. 에러 로그가 있는지 확인

### 3단계: URL 확인
1. Google 로그인 후 브라우저 주소창의 URL 확인
2. 404가 발생하는 정확한 경로 확인
3. 예상되는 경로와 실제 경로 비교

---

## 💡 예상되는 원인 (우선순위)

1. **가장 가능성 높음**: 백엔드 리다이렉트가 실행되지 않거나 잘못된 URL로 리다이렉트
2. **두 번째 가능성**: Next.js 라우팅 문제 (Vercel 배포 설정)
3. **세 번째 가능성**: CORS 또는 쿠키 도메인 문제로 인한 세션 공유 실패

---

## 📝 추가 확인 필요 정보

백엔드 개발자에게 다음 정보를 요청:
1. Google 로그인 시 백엔드 로그 전체 (특히 `[OAuth2]`로 시작하는 로그)
2. 404 에러가 발생하는 정확한 URL
3. Google OAuth2 콘솔의 승인된 리디렉션 URI 목록
4. 배포 환경의 환경 변수 설정 (FRONTEND_URL, OAUTH2_REDIRECT_URI 등)
