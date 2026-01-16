import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { AttendanceWidget } from "@/components/dashboard/attendance-widget"
import { TodaySchedule } from "@/components/dashboard/today-schedule"
import { TodayPresenter } from "@/components/dashboard/today-presenter"
import { HotPosts } from "@/components/dashboard/hot-posts"
import { QuickLinks } from "@/components/dashboard/quick-links"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="ml-64">
        <DesktopHeader title="대시보드" />

        <main className="p-6">
          {/* 상단 영역: 출석 + 일정 */}
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <AttendanceWidget />
            </div>
            <div>
              <TodaySchedule />
            </div>
          </div>

          {/* 중간 영역: 발표자 + HOT 게시글 */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TodayPresenter />
            <HotPosts />
          </div>

          {/* 하단 영역: 빠른 링크 + 최근 활동 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <QuickLinks />
            <div className="lg:col-span-2">
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
