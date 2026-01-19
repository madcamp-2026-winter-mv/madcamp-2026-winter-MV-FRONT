"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Bell, DoorOpen, LogOut, ChevronRight, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { memberApi } from "@/lib/api/api"

interface SettingsSectionProps {
  allowAlarm: boolean
  onAlarmChange: (v: boolean) => Promise<void>
}

export function SettingsSection({ allowAlarm, onAlarmChange }: SettingsSectionProps) {
  const router = useRouter()
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [isLeaveCompleteOpen, setIsLeaveCompleteOpen] = useState(false)
  const [alarmLoading, setAlarmLoading] = useState(false)
  const [leaveLoading, setLeaveLoading] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  const handleLeave = async () => {
    setLeaveLoading(true)
    try {
      await memberApi.leaveRoom()
      setIsLeaveDialogOpen(false)
      setIsLeaveCompleteOpen(true)
    } finally {
      setLeaveLoading(false)
    }
  }

  const handleLeaveComplete = () => {
    setIsLeaveCompleteOpen(false)
    router.push("/")
  }

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await memberApi.logout()
      router.push("/")
    } finally {
      setLogoutLoading(false)
    }
  }

  const handleAlarmToggle = async (v: boolean) => {
    setAlarmLoading(true)
    try {
      await onAlarmChange(v)
    } finally {
      setAlarmLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            설정
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 divide-y lg:grid-cols-3 lg:divide-y-0 lg:divide-x">
            {/* 알림 설정 */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">알림 받기</p>
                  <p className="text-sm text-muted-foreground">출석, 일정, 팟 알림</p>
                </div>
              </div>
              <Switch checked={allowAlarm} onCheckedChange={handleAlarmToggle} disabled={alarmLoading} />
            </div>

            {/* 분반 탈퇴 */}
            <button
              className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors text-left w-full"
              onClick={() => setIsLeaveDialogOpen(true)}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <DoorOpen className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">분반 탈퇴</p>
                  <p className="text-sm text-muted-foreground">활동 내역은 유지됩니다</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* 로그아웃 */}
            <button
              className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors text-left w-full"
              onClick={handleLogout}
              disabled={logoutLoading}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <LogOut className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-600">로그아웃</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>정말 탈퇴하시겠습니까?</DialogTitle>
            <DialogDescription>
              분반에서 탈퇴하면 더 이상 해당 분반의 커뮤니티와 일정을 확인할 수 없습니다. 작성한 글과 댓글은 유지됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>취소</Button>
            <Button variant="destructive" onClick={handleLeave} disabled={leaveLoading}>
              {leaveLoading ? "처리 중..." : "탈퇴하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isLeaveCompleteOpen} onOpenChange={setIsLeaveCompleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>탈퇴 완료되었습니다</AlertDialogTitle>
            <AlertDialogDescription>
              분반 탈퇴가 완료되었습니다. 다른 분반에 입장하시려면 초대코드를 입력해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleLeaveComplete}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
