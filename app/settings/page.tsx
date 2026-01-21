"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { ContentArea } from "@/components/layout/sidebar-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, LogOut, UserMinus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { memberApi } from "@/lib/api/api"

export default function SettingsPage() {
  const router = useRouter()
  const [allowAlarm, setAllowAlarm] = useState(true)
  const [alarmLoading, setAlarmLoading] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [showLeaveCompleteDialog, setShowLeaveCompleteDialog] = useState(false)
  const [leaveLoading, setLeaveLoading] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    memberApi
      .getMyInfo()
      .then((m) => setAllowAlarm(m.allowAlarm))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await memberApi.logout()
      router.push("/")
    } finally {
      setLogoutLoading(false)
    }
  }

  const handleLeaveClass = async () => {
    setLeaveLoading(true)
    try {
      await memberApi.leaveRoom()
      setShowLeaveDialog(false)
      setShowLeaveCompleteDialog(true)
    } finally {
      setLeaveLoading(false)
    }
  }

  const handleLeaveComplete = () => {
    setShowLeaveCompleteDialog(false)
    router.push("/")
  }

  const handleAlarmToggle = async (v: boolean) => {
    setAlarmLoading(true)
    try {
      await memberApi.toggleAlarm(v)
      setAllowAlarm(v)
    } finally {
      setAlarmLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <ContentArea>
        <DesktopHeader title="설정" />

        <main className="p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* 알림 설정 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>알림 설정</CardTitle>
                    <CardDescription>알림 수신 여부를 설정합니다</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>전체 알림</Label>
                    <p className="text-sm text-muted-foreground">모든 알림을 허용하거나 거부합니다</p>
                  </div>
                  <Switch
                    checked={allowAlarm}
                    onCheckedChange={handleAlarmToggle}
                    disabled={loading || alarmLoading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 계정 관리 */}
            <Card>
              <CardHeader>
                <CardTitle>계정 관리</CardTitle>
                <CardDescription>로그아웃 또는 분반을 나갈 수 있습니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 bg-transparent"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                >
                  <LogOut className="h-4 w-4" />
                  {logoutLoading ? "처리 중..." : "로그아웃"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
                  onClick={() => setShowLeaveDialog(true)}
                >
                  <UserMinus className="h-4 w-4" />
                  분반 나가기
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </ContentArea>

      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 탈퇴하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              분반에서 나가면 모든 활동 기록이 삭제되며, 다시 초대코드를 입력해야 입장할 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveClass}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={leaveLoading}
            >
              {leaveLoading ? "처리 중..." : "탈퇴하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLeaveCompleteDialog} onOpenChange={setShowLeaveCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>탈퇴 완료되었습니다</AlertDialogTitle>
            <AlertDialogDescription>
              분반에서 성공적으로 나갔습니다. 로그인 페이지로 이동합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleLeaveComplete}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
