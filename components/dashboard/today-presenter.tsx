"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
      <CardHeader className="py-3 pr-4 pl-4 bg-gradient-to-r from-amber-500/20 to-amber-500/5 dark:from-amber-600/25 dark:to-amber-600/5">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Mic2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>스크럼 진행자</span>
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
            <Avatar className="h-12 w-12 mb-3 shrink-0">
              {data?.presenterProfileImageUrl ? (
                <AvatarImage src={data.presenterProfileImageUrl} alt={data?.presenterNickname ?? ""} />
              ) : null}
              <AvatarFallback className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                {(data?.presenterNickname ?? "?").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">오늘의 스크럼 진행자는</p>
            <p className="text-lg font-bold text-foreground mt-1">
              {data?.presenterNickname ?? ""}
              <span className="text-primary">님</span>입니다!
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-sm">
            {message || "현재 선정된 진행자가 없습니다."}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
