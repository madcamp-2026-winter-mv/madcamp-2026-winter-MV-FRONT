import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { ProfileCard } from "@/components/mypage/profile-card"
import { ActivitySection } from "@/components/mypage/activity-section"
import { SettingsSection } from "@/components/mypage/settings-section"

export default function MyPage() {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="ml-64">
        <DesktopHeader title="마이페이지" />

        <main className="p-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* 프로필 섹션 */}
            <div>
              <ProfileCard />
            </div>

            {/* 활동 내역 */}
            <div className="xl:col-span-2">
              <ActivitySection />
            </div>
          </div>

          {/* 설정 섹션 */}
          <div className="mt-6">
            <SettingsSection />
          </div>
        </main>
      </div>
    </div>
  )
}
