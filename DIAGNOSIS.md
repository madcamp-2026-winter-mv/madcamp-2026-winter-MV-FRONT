# 로딩 문제 진단 가이드

## 발견된 문제점

### 1. API_BASE_URL 잘못 설정
- **문제**: `lib/api/types.ts`에서 기본값이 `http://localhost:3000`으로 설정되어 있었음
- **해결**: `http://localhost:3000`으로 수정 완료
- **확인 방법**: 브라우저 콘솔에서 `[API] API_BASE_URL:` 로그 확인

### 2. API 요청 타임아웃 없음
- **문제**: API 요청이 응답하지 않을 때 무한 대기
- **해결**: 10초 타임아웃 추가 완료
- **확인 방법**: 네트워크 탭에서 요청 상태 확인

### 3. 에러 로깅 부족
- **문제**: 에러 발생 시 원인 파악 어려움
- **해결**: 콘솔 로그 추가 완료
- **확인 방법**: 브라우저 개발자 도구 콘솔 확인

## 진단 체크리스트

### 1. 브라우저 콘솔 확인
브라우저 개발자 도구(F12) → Console 탭에서 다음 로그 확인:
- `[API] API_BASE_URL:` - API 서버 URL 확인
- `[useAuth] OAuth user response:` - OAuth 응답 확인
- `[useAuth] Error fetching user:` - 에러 발생 시 상세 정보

### 2. 네트워크 탭 확인
브라우저 개발자 도구 → Network 탭에서:
- `/api/auth/me` 요청 상태 확인
  - Status: 200 (성공) / 401 (인증 실패) / 500 (서버 오류) / Failed (네트워크 오류)
  - Time: 응답 시간 확인
  - Response: 응답 내용 확인

### 3. 가능한 원인별 대응

#### A. 네트워크 오류 (Failed)
- **증상**: Network 탭에서 요청이 "Failed"로 표시
- **원인**: 
  - 백엔드 서버가 실행되지 않음
  - CORS 설정 문제
  - 방화벽/보안 정책
- **해결**:
  1. 백엔드 서버 실행 확인 (`http://localhost:3000`)
  2. CORS 설정 확인 (SecurityConfig.java)
  3. `.env.local` 파일에 올바른 API URL 설정

#### B. 401 Unauthorized
- **증상**: Network 탭에서 Status 401
- **원인**: 로그인되지 않은 상태
- **해결**: 정상 동작 (로그인 페이지 표시되어야 함)

#### C. 500 Internal Server Error
- **증상**: Network 탭에서 Status 500
- **원인**: 백엔드 서버 오류
- **해결**: 백엔드 로그 확인

#### D. 타임아웃 (10초 후)
- **증상**: 10초 후 에러 발생
- **원인**: 
  - 백엔드 서버 응답 없음
  - 네트워크 연결 문제
- **해결**: 백엔드 서버 상태 확인

#### E. CORS 오류
- **증상**: 콘솔에 CORS 관련 에러
- **원인**: 백엔드 CORS 설정 문제
- **해결**: SecurityConfig.java의 CORS 설정 확인

## 테스트 방법

1. **브라우저 콘솔 열기** (F12)
2. **페이지 새로고침**
3. **콘솔 로그 확인**:
   ```
   [API] API_BASE_URL: http://localhost:3000
   [useAuth] OAuth user response: {...}
   ```
4. **Network 탭 확인**:
   - `/api/auth/me` 요청 확인
   - 응답 상태 및 시간 확인

## 환경 변수 확인

`.env.local` 파일이 있는지 확인하고, 다음 내용이 있는지 확인:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

또는 배포 환경:
```
NEXT_PUBLIC_API_URL=https://madcamp-view.com
```

## 다음 단계

1. 브라우저 콘솔과 Network 탭에서 위의 체크리스트 확인
2. 발견된 문제를 보고
3. 필요시 추가 디버깅 진행
