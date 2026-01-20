"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, PlayCircle } from "lucide-react"
import { roomApi } from "@/lib/api/api"
import { toast } from "@/hooks/use-toast"

interface AttendanceWidgetProps {
  roomId?: number
  role?: string
  email?: string
}

export function AttendanceWidget({ roomId, role, email }: AttendanceWidgetProps) {
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [startLoading, setStartLoading] = useState(false)
  const [canStart, setCanStart] = useState(false)

  // 운영진(OWNER/ADMIN) 또는 현재 발표자만 출석 시작 가능 → getCurrentPresenter로 발표자 여부 확인
  useEffect(() => {
    if (!roomId || !email) {
      setCanStart(false)
      return
    }
    const isAdminOrOwner = role === "OWNER" || role === "ADMIN"
    if (isAdminOrOwner) {
      setCanStart(true)
      return
    }
    roomApi
      .getCurrentPresenter(roomId)
      .then((r) => setCanStart(r.presenterEmail === email))
      .catch(() => setCanStart(false))
  }, [roomId, role, email])

  const handleCheckIn = async () => {
    if (!roomId) return
    setSubmitLoading(true)
    try {
      await roomApi.submitAttendance()
      setHasCheckedIn(true)
      toast({ title: "출석 체크 완료!" })
    } catch (e: unknown) {
      const err = e as { message?: string; error?: string }
      toast({
        title: "출석 실패",
        description: err?.message || err?.error || "출석 가능 시간이 아닐 수 있습니다.",
        variant: "destructive",
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleStartAttendance = async () => {
    if (!roomId) return
    setStartLoading(true)
    try {
      await roomApi.startAttendance(roomId, 5)
      toast({ title: "출석이 5분 동안 시작되었습니다." })
    } catch (e: unknown) {
      const err = e as { message?: string; error?: string }
      toast({
        title: "출석 시작 실패",
        description: err?.message || err?.error || "권한이 없거나 요청을 처리할 수 없습니다.",
        variant: "destructive",
      })
    } finally {
      setStartLoading(false)
    }
  }

  if (!roomId) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">실시간 출석 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">분반에 가입해 주세요.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">실시간 출석 현황</CardTitle>
          {hasCheckedIn && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              출석 완료
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasCheckedIn && (
          <div className="rounded-lg bg-muted/50 p-3 border border-border">
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              onClick={handleCheckIn}
              disabled={submitLoading}
            >
              {submitLoading ? "처리 중..." : "지금 바로 출석하기"}
            </Button>
          </div>
        )}

        {canStart && (
          <div className="rounded-lg bg-muted/50 p-3 border border-border">
            <p className="text-sm text-muted-foreground mb-2">운영진/발표자: 출석을 시작할 수 있습니다.</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleStartAttendance}
              disabled={startLoading}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              {startLoading ? "처리 중..." : "출석 시작 (5분)"}
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">우리 분반 출석</span>
            <span className="font-semibold">—/— 명</span>
          </div>
          <Progress value={0} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">출석률 정보는 운영진 화면에서 확인할 수 있습니다.</p>
        </div>
      </CardContent>
    </Card>
  )
}
