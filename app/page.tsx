"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button" // 버튼 컴포넌트가 있다면

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  // 1. 이미 로그인된 사용자는 진짜 대시보드로 보냄
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  // 2. 깡통 대시보드 UI (로그인 전용 안내 포함)
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 실제 대시보드와 비슷한 레이아웃을 보여주되, 위에 블러(Blur)나 안내창을 띄움 */}
      <div className="opacity-50 pointer-events-none grayscale">
         {/* 여기에 DashboardPage와 비슷한 레이아웃(Sidebar, 위젯 등) 배치 */}
         <div className="p-20 text-center">대시보드 미리보기 영역...</div>
      </div>

      {/* 중앙 안내 섹션 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
        <div className="max-w-md text-center space-y-6 p-8 bg-card border rounded-2xl shadow-xl">
          <img src="/madcamp_logo.png" alt="몰입캠프" className="h-16 w-16 mx-auto object-contain" />
          <h1 className="text-3xl font-bold">몰 봐 (Madcamp View)</h1>
          <p className="text-muted-foreground">
            몰입캠프 생활을 한눈에 확인하세요.<br />
            출석, 일정, 공지사항을 확인하려면 로그인이 필요합니다.
          </p>
          <Button 
            className="w-full h-12 text-lg" 
            onClick={() => router.push("/login")}
          >
            시작하기 (로그인)
          </Button>
        </div>
      </div>
    </div>
  )
}