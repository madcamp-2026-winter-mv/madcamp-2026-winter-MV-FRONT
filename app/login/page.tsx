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

  // 페이지 로드 시 사용자 정보 확인 (OAuth2 콜백 후 자동 로그인 확인)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // 주기적으로 사용자 정보 확인 (OAuth2 로그인 후 세션 생성 대기)
      const checkAuth = async () => {
        try {
          await refetch()
        } catch (error) {
          // 로그인되지 않은 상태
        }
      }
      
      // 초기 확인
      checkAuth()
      
      // 1초 후 다시 확인 (OAuth2 콜백 대기)
      const timer = setTimeout(() => {
        checkAuth()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isLoading, isAuthenticated, refetch])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">로딩 중...</p>
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
          <div className="flex justify-center gap-8 pt-4 text-background/60 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div>캠퍼</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">20+</div>
              <div>분반</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10K+</div>
              <div>게시글</div>
            </div>
          </div>
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
