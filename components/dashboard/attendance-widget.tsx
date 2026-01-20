"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { roomApi } from "@/lib/api/api"
import { toast } from "@/hooks/use-toast"

interface AttendanceWidgetProps {
  roomId?: number
}

export function AttendanceWidget({ roomId }: AttendanceWidgetProps) {
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

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
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
