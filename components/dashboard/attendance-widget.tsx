"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, UserCheck, Sparkles } from "lucide-react"
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
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" />
            실시간 출석 현황
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center flex-1 py-8">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <UserCheck className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">분반에 가입해 주세요.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" />
            실시간 출석 현황
          </CardTitle>
          {hasCheckedIn && (
            <span className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              출석 완료
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {hasCheckedIn ? (
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 ring-4 ring-emerald-50 dark:ring-emerald-900/20">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
              </div>
            </div>
            <p className="text-base font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
              오늘 출석 완료!
            </p>
            <p className="text-sm text-muted-foreground">
              수고하셨습니다
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* 상단 일러스트 영역 */}
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                  <UserCheck className="h-10 w-10 text-primary/70" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <span className="text-xs">👋</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                아직 출석하지 않았어요
              </p>
            </div>
            
            {/* 하단 버튼 영역 */}
            <div className="rounded-xl bg-muted/50 p-4 border border-border">
              <Button
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm transition-all hover:shadow-md"
                onClick={handleCheckIn}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    처리 중...
                  </span>
                ) : (
                  "지금 바로 출석하기"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
