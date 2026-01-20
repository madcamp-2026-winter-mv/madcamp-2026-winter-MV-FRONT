"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic2 } from "lucide-react"
import { roomApi } from "@/lib/api/api"
import type { CurrentPresenterResponse } from "@/lib/api/types"

interface TodayPresenterProps {
  roomId?: number
}

export function TodayPresenter({ roomId }: TodayPresenterProps) {
  const [data, setData] = useState<CurrentPresenterResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) {
      setLoading(false)
      setData(null)
      return
    }
    roomApi
      .getCurrentPresenter(roomId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [roomId])

  const hasPresenter = data && "presenterNickname" in data && data.presenterNickname
  const message = data && "message" in data ? data.message : null

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 bg-linear-to-r from-primary/20 to-primary/5">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Mic2 className="h-4 w-4 text-primary" />
          오늘의 제물
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-sm">
            로딩 중...
          </div>
        ) : !roomId ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-sm">
            분반에 가입해 주세요.
          </div>
        ) : hasPresenter ? (
          <div className="flex flex-col items-center text-center">
            <p className="text-sm text-muted-foreground">오늘의 스크럼 진행자는</p>
            <p className="text-lg font-bold text-foreground mt-1">
              {data?.presenterNickname ?? ""}
              <span className="text-primary">님</span>입니다!
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-sm">
            {message || "현재 선정된 발표자가 없습니다."}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
