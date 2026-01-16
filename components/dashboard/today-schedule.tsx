"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin } from "lucide-react"

interface ScheduleItem {
  id: string
  title: string
  time: string
  location: string
  dDay?: string
  isUpcoming?: boolean
}

const mockSchedules: ScheduleItem[] = [
  {
    id: "1",
    title: "금주의 픽",
    time: "14:00",
    location: "대강당",
    dDay: "30분 뒤",
    isUpcoming: true,
  },
  {
    id: "2",
    title: "스크럼 미팅",
    time: "18:00",
    location: "분반별 강의실",
  },
  {
    id: "3",
    title: "자유 개발 시간",
    time: "19:00",
    location: "개발실",
  },
]

export function TodaySchedule() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          오늘의 일정
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${
                schedule.isUpcoming ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-sm">{schedule.title}</h4>
                  {schedule.isUpcoming && (
                    <Badge className="bg-primary text-primary-foreground text-xs">{schedule.dDay}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {schedule.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {schedule.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
