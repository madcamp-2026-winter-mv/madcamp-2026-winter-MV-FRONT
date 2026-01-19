"use client"

import { useEffect, useState } from "react"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { ProfileCard } from "@/components/mypage/profile-card"
import { ActivitySection } from "@/components/mypage/activity-section"
import { SettingsSection } from "@/components/mypage/settings-section"
import { memberApi, roomApi } from "@/lib/api/api"
import type { MemberResponseDto } from "@/lib/api/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"


export default function MyPage() {
  const [member, setMember] = useState<MemberResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState("")
  const [joinLoading, setJoinLoading] = useState(false)

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

  const handleJoinRoom = async () => {
    const code = inviteCode.trim()
    if (!code) return
    setJoinLoading(true)
    setError(null)
    try {
      await roomApi.joinRoom(code)
      setInviteCode("")
      await refetch()
    } catch (e: any) {
      setError(e?.message ?? e?.error ?? "분반 가입에 실패했습니다. 초대 코드를 확인해주세요.")
    } finally {
      setJoinLoading(false)
    }
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

          {member && !member.roomId && (
            <Card className="mb-6 border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  분반 가입
                </CardTitle>
                <CardDescription>
                  관리자에게 받은 초대 코드를 입력하면 분반에 가입할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Input
                  placeholder="초대 코드 8자리"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                  className="max-w-[240px] font-mono tracking-widest"
                  maxLength={8}
                />
                <Button onClick={handleJoinRoom} disabled={joinLoading || !inviteCode.trim()}>
                  {joinLoading ? "가입 중..." : "가입하기"}
                </Button>
              </CardContent>
            </Card>
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
