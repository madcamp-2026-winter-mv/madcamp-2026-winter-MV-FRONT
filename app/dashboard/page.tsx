"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { AttendanceWidget } from "@/components/dashboard/attendance-widget"
import { TodaySchedule } from "@/components/dashboard/today-schedule"
import { TodayPresenter } from "@/components/dashboard/today-presenter"
import { HotPosts } from "@/components/dashboard/hot-posts"
import { useAuth } from "@/hooks/use-auth"
import { memberApi } from "@/lib/api/api"
import type { MemberResponseDto } from "@/lib/api/types"

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [myInfo, setMyInfo] = useState<MemberResponseDto | null>(null)

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && isAuthenticated === false) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  // 로그인 후 내 정보 조회 (roomId 등)
  useEffect(() => {
    if (!isAuthenticated || isLoading) return
    memberApi.getMyInfo().then(setMyInfo).catch(() => setMyInfo(null))
  }, [isAuthenticated, isLoading])

  // 로딩 중이거나 인증되지 않은 경우 로딩 화면 표시
  if (isLoading || !isAuthenticated) {
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
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="ml-64">
        <DesktopHeader title="대시보드" />

        <main className="p-6">
          {/* 상단 영역: 출석 + 일정 (출석 1/3, 일정 2/3) */}
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-1">
              <AttendanceWidget roomId={myInfo?.roomId} profileImage={myInfo?.profileImage} />
            </div>
            <div className="xl:col-span-2">
              <TodaySchedule roomId={myInfo?.roomId} />
            </div>
          </div>

          {/* 중간 영역: 진행행자 + HOT 게시글 */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TodayPresenter roomId={myInfo?.roomId} />
            <HotPosts />
          </div>

        </main>
      </div>
    </div>
  )
}
