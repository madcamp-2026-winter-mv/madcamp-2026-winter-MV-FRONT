"use client"

import { useEffect, useState } from "react"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { ProfileCard } from "@/components/mypage/profile-card"
import { ActivitySection } from "@/components/mypage/activity-section"
import { SettingsSection } from "@/components/mypage/settings-section"
import { memberApi } from "@/lib/api/api"
import type { MemberResponseDto } from "@/lib/api/types"

export default function MyPage() {
  const [member, setMember] = useState<MemberResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = async () => {
    try {
      const m = await memberApi.getMyInfo()
      setMember(m)
      setError(null)
    } catch (e: any) {
      setError(e?.message || "내용을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    setLoading(true)
    memberApi
      .getMyInfo()
      .then((m) => { if (mounted) setMember(m) })
      .catch((e: any) => { if (mounted) setError(e?.message || "내용을 불러오지 못했습니다.") })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const handleAlarmChange = async (v: boolean) => {
    await memberApi.toggleAlarm(v)
    await refetch()
  }

  if (loading && !member) {
    return (
      <div className="min-h-screen bg-background">
        <DesktopSidebar />
        <div className="ml-64">
          <DesktopHeader title="마이페이지" />
          <main className="p-6 flex items-center justify-center min-h-[40vh]">
            <p className="text-muted-foreground">로딩 중...</p>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="ml-64">
        <DesktopHeader title="마이페이지" />

        <main className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
          )}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div>
              <ProfileCard member={member} onUpdate={refetch} />
            </div>
            <div className="xl:col-span-2">
              <ActivitySection member={member} />
            </div>
          </div>

          <div className="mt-6">
            <SettingsSection
              allowAlarm={member?.allowAlarm ?? true}
              onAlarmChange={handleAlarmChange}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
