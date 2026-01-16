"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

export function AttendanceWidget() {
  const [isAttendanceActive, setIsAttendanceActive] = useState(true)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)

  // 예시 데이터
  const attendedCount = 18
  const totalCount = 25
  const attendancePercentage = (attendedCount / totalCount) * 100

  const handleCheckIn = () => {
    setHasCheckedIn(true)
  }

  return (
    <Card className={isAttendanceActive && !hasCheckedIn ? "border-destructive border-2" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            {isAttendanceActive && !hasCheckedIn && (
              <span className="h-3 w-3 rounded-full bg-destructive animate-pulse-red" />
            )}
            실시간 출석 현황
          </CardTitle>
          {hasCheckedIn && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              출석 완료
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAttendanceActive && !hasCheckedIn && (
          <div className="rounded-lg bg-destructive/10 p-3 border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive font-medium mb-2">
              <AlertCircle className="h-4 w-4" />
              출석이 진행 중입니다!
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              onClick={handleCheckIn}
            >
              지금 바로 출석하기
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">우리 분반 출석률</span>
            <span className="font-semibold">
              {attendedCount}/{totalCount}명
            </span>
          </div>
          <Progress value={attendancePercentage} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">{attendancePercentage.toFixed(0)}% 출석 완료</p>
        </div>

        {!isAttendanceActive && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
            <Clock className="h-4 w-4" />
            다음 출석까지 대기 중
          </div>
        )}
      </CardContent>
    </Card>
  )
}
