# 백엔드 수정 요청 사항

## 문제 상황
- 프론트엔드: `madcamp-view.com` (Vercel 배포 완료)
- 백엔드 API: `api.madcamp-view.com`
- Google 로그인 후 "404 This page could not be found" 에러 발생

---

## 🔴 필수 수정 사항

### 1. OAuth2 콜백 URL 환경별 설정
**파일**: `application.properties` 또는 환경 변수

**현재 문제**:
```properties
# 현재는 로컬 개발용만 설정됨
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:8080/login/oauth2/code/google
```

**수정 필요**:
```properties
# 환경 변수 사용 또는 프로파일별 설정
spring.security.oauth2.client.registration.google.redirect-uri=${OAUTH2_REDIRECT_URI:https://api.madcamp-view.com/login/oauth2/code/google}
```

**환경 변수 설정**:
```
OAUTH2_REDIRECT_URI=https://api.madcamp-view.com/login/oauth2/code/google
```

**Google OAuth2 콘솔 확인**:
- 승인된 리디렉션 URI에 `https://api.madcamp-view.com/login/oauth2/code/google` 추가 필요

---

### 2. OAuth2 리다이렉트 로깅 강화
**파일**: `SecurityConfig.java`의 `OAuth2AuthenticationSuccessHandler.onAuthenticationSuccess()`

**추가할 로그**:
```java
System.out.println("[OAuth2] Request URI: " + request.getRequestURI());
System.out.println("[OAuth2] Request URL: " + request.getRequestURL());
System.out.println("[OAuth2] Response status before redirect: " + response.getStatus());
System.out.println("[OAuth2] Redirect target: " + targetUrl);
System.out.println("[OAuth2] Response committed: " + response.isCommitted());
```

**목적**: 리다이렉트가 실제로 실행되는지, 어떤 URL로 가는지 확인

---

### 3. 세션 쿠키 도메인 설정 확인
**문제**: `api.madcamp-view.com`에서 설정된 세션 쿠키가 `madcamp-view.com`에서 접근 가능한지 확인 필요

**확인 사항**:
- 세션 쿠키의 `Domain` 속성이 `.madcamp-view.com`으로 설정되어 있는지
- `SameSite` 속성 설정 확인
- 서브도메인 간 쿠키 공유 가능 여부

**해결 방법 (필요시)**:
```java
// SecurityConfig에 추가
@Bean
public CookieSerializer cookieSerializer() {
    DefaultCookieSerializer serializer = new DefaultCookieSerializer();
    serializer.setDomainNamePattern("^.+?\\.(\\w+\\.[a-z]+)$"); // 서브도메인 공유
    serializer.setCookieName("JSESSIONID");
    serializer.setCookiePath("/");
    serializer.setSameSite("Lax");
    return serializer;
}
```

---

## 🟡 확인 필요 사항

### 1. 리다이렉트 실행 여부 확인
**확인 방법**:
- 백엔드 로그에서 `[OAuth2] Login success!` 메시지 확인
- `[OAuth2] Redirecting to frontend: https://madcamp-view.com/dashboard` 로그 확인
- 실제로 리다이렉트가 실행되는지 확인

**문제 가능성**:
- 리다이렉트가 실행되지 않음
- 리다이렉트 전에 다른 필터가 응답을 가로챔
- 예외 발생으로 리다이렉트가 중단됨

---

### 2. Google OAuth2 콘솔 설정
**확인 사항**:
1. Google Cloud Console → API 및 서비스 → 사용자 인증 정보
2. 승인된 리디렉션 URI 목록:
   - ✅ `https://api.madcamp-view.com/login/oauth2/code/google` (필수)
   - ✅ `http://localhost:8080/login/oauth2/code/google` (로컬 개발용)

---

### 3. CORS 설정 확인
**현재 설정** (`SecurityConfig.java`):
```java
configuration.setAllowedOriginPatterns(Arrays.asList(
    "https://madcamp-view.com",  // ✅ 포함됨
    ...
));
```

**확인 사항**:
- `https://madcamp-view.com`이 CORS 허용 목록에 포함되어 있는지 확인 ✅
- `api.madcamp-view.com`에서 `madcamp-view.com`으로의 리다이렉트가 CORS 정책에 위배되지 않는지 확인

---

## 🔍 디버깅을 위한 정보 요청

다음 정보를 제공해주시면 문제 해결에 도움이 됩니다:

1. **백엔드 로그**:
   - Google 로그인 시 전체 로그 (특히 `[OAuth2]`로 시작하는 로그)
   - 에러 로그가 있다면 전체 스택 트레이스

2. **404 에러 상세 정보**:
   - 브라우저에서 404가 발생하는 정확한 URL
   - Network 탭에서 404 응답의 헤더 정보

3. **환경 설정**:
   - 배포 환경의 환경 변수 목록 (FRONTEND_URL 등)
   - Google OAuth2 클라이언트 ID/Secret 설정 확인

4. **테스트 결과**:
   - `https://api.madcamp-view.com/api/auth/me` 직접 접속 시 응답
   - Google 로그인 후 브라우저 주소창의 URL

---

## 💡 예상 원인 및 해결 방안

### 원인 1: 리다이렉트가 실행되지 않음
**증상**: 백엔드 로그에 `[OAuth2] Login success!`는 있지만 리다이렉트가 실행되지 않음

**해결**: 
- `response.sendRedirect()` 대신 다른 방식 시도
- 예외 처리 확인
- 필터 체인 확인

### 원인 2: 잘못된 리다이렉트 URL
**증상**: 리다이렉트는 실행되지만 잘못된 URL로 이동

**해결**:
- `getFrontendUrl()` 메서드가 올바른 값을 반환하는지 확인
- 환경 변수 `FRONTEND_URL` 설정 확인

### 원인 3: 세션 쿠키 공유 문제
**증상**: 리다이렉트는 성공하지만 세션이 공유되지 않아 인증 실패

**해결**:
- 쿠키 도메인을 `.madcamp-view.com`으로 설정
- 또는 JWT 토큰 방식으로 변경

---

## 📝 우선순위

1. **최우선**: OAuth2 콜백 URL 환경별 설정 (배포 환경용 추가)
2. **두 번째**: 리다이렉트 로깅 강화 (디버깅용)
3. **세 번째**: 세션 쿠키 도메인 설정 확인

---

## 연락처
문제 해결 중 추가 정보가 필요하면 알려주세요.
