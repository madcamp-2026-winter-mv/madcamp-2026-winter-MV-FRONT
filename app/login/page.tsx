"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, refetch } = useAuth()

  // 이미 로그인된 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  // app/login/page.tsx 수정안
  useEffect(() => {
    // 1. 이미 로그인 중이거나 로딩 중이면 아무것도 안 함
    if (isLoading || isAuthenticated) return;

    // 2. URL 확인: OAuth 성공 파라미터가 있을 때만 '적극적으로' 확인
    const urlParams = new URLSearchParams(window.location.search);
    const isOAuthSuccess = urlParams.get('oauth_success') === 'true';

    if (isOAuthSuccess) {
      const checkAuth = async () => {
        try {
          await refetch();
        } catch (error) {
          console.error("인증 확인 실패:", error);
        }
      };

      checkAuth(); // 즉시 확인
      const timer = setTimeout(checkAuth, 1000); // 1초 뒤 한 번 더 확인 (세션 생성 지연 대비)
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]); // refetch는 제외 (무한루프 방지)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">로딩 중...</p>
          <p className="text-xs text-muted-foreground/60">인증 정보를 확인하는 중입니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* 왼쪽: 브랜딩 영역 */}
      <div className="hidden lg:flex lg:flex-1 bg-foreground items-center justify-center p-12">
        <div className="max-w-md text-center space-y-6">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground">
            몰
          </div>
          <h1 className="text-4xl font-bold text-background">몰 봐</h1>
          <p className="text-lg text-background/60">Madcamp View</p>
          <p className="text-background/80 leading-relaxed">
            몰입캠프에서 지금 뭘 봐야 할지 알려드립니다.
            <br />
            출석, 일정, 커뮤니티, 투표를 한 곳에서.
          </p>
        </div>
      </div>

      {/* 오른쪽: 로그인 폼 */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* 모바일용 로고 */}
          <div className="text-center lg:hidden space-y-2">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
              몰
            </div>
            <h1 className="text-3xl font-bold text-foreground">몰 봐</h1>
            <p className="text-sm text-muted-foreground">Madcamp View</p>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-2xl font-bold text-foreground">로그인</h2>
            <p className="text-muted-foreground mt-1">Google 계정으로 로그인하세요</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
