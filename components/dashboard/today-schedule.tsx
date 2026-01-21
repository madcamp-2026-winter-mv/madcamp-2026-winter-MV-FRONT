"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Star } from "lucide-react"
import { roomApi } from "@/lib/api/api"
import type { Schedule } from "@/lib/api/types"
import { parseScheduleDate } from "@/lib/utils"

interface TodayScheduleProps {
  roomId?: number
}

function formatTime(iso: string): string {
  try {
    const d = parseScheduleDate(iso)
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
  } catch {
    return iso
  }
}

function formatTimeAgo(iso: string): string | null {
  try {
    const d = parseScheduleDate(iso)
    const now = new Date()
    const diffMs = d.getTime() - now.getTime()
    const diffM = Math.round(diffMs / 60000)
    if (diffM < 0) return null
    if (diffM < 60) return `${diffM}분 뒤`
    const h = Math.floor(diffM / 60)
    const m = diffM % 60
    if (m === 0) return `${h}시간 뒤`
    return `${h}시간 ${m}분 뒤`
  } catch {
    return null
  }
}

export function TodaySchedule({ roomId }: TodayScheduleProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) {
      setLoading(false)
      setSchedules([])
      return
    }
    roomApi
      .getSchedules(roomId)
      .then((list) => {
        const now = Date.now()
        const upcoming = list
          .filter((s) => parseScheduleDate(s.startTime).getTime() > now)
          .slice(0, 3)
        setSchedules(upcoming)
      })
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false))
  }, [roomId])

  if (!roomId) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            일정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">분반에 가입해 주세요.</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            일정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </CardContent>
      </Card>
    )
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            일정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">예정된 일정이 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          일정
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {schedules.map((s) => {
            const dDay = formatTimeAgo(s.startTime)
            const isImportant = !!(s.important ?? s.isImportant)
            // 1시간 이내 = "n분 뒤" 형태만 (diffM < 60)
            const withinOneHour = dDay != null && /^\d+분 뒤$/.test(dDay)
            // 1시간 이내 일반: 연한 노란 하이라이트 + n분 뒤 뱃지. 1시간 이전 일반: mockup처럼 bg-muted/50만. 중요: 지금처럼(amber 좌측+Star+뱃지)
            const bgClass = isImportant
              ? "bg-muted/50"
              : withinOneHour
                ? "bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200/60 dark:border-yellow-800/50"
                : "bg-muted/50"
            const blockClass = `flex items-start gap-3 rounded-lg p-3 transition-colors ${bgClass} ${isImportant ? "border-l-4 border-amber-500" : ""}`
            return (
              <div key={s.scheduleId} className={blockClass}>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isImportant ? "bg-amber-100 dark:bg-amber-900/40" : "bg-muted/50"
                  }`}
                >
                  {isImportant ? (
                    <Star className="h-5 w-5 text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`font-medium text-sm ${isImportant ? "font-semibold text-amber-900 dark:text-amber-100" : ""}`}>
                      {s.title}
                    </h4>
                    {isImportant && (
                      <Badge className="bg-amber-500/90 text-amber-950 text-xs hover:bg-amber-500/90">중요</Badge>
                    )}
                    {withinOneHour && dDay && !isImportant && (
                      <Badge className="bg-yellow-400/80 text-yellow-950 text-xs">{dDay}</Badge>
                    )}
                    {isImportant && dDay && (
                      <Badge className="bg-amber-500/90 text-amber-950 text-xs">{dDay}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(s.startTime)}
                    </span>
                    {s.content && <span className="truncate">{s.content}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
