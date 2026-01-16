"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic2, Sparkles } from "lucide-react"

interface Presenter {
  id: string
  nickname: string
  imageUrl?: string
  presentationCount: number
}

const mockPresenter: Presenter = {
  id: "1",
  nickname: "몰입하는 42",
  imageUrl: "/diverse-person-avatars.png",
  presentationCount: 2,
}

export function TodayPresenter() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/20 to-primary/5">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Mic2 className="h-4 w-4 text-primary" />
          오늘의 제물
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-primary">
              <AvatarImage src={mockPresenter.imageUrl || "/placeholder.svg"} alt={mockPresenter.nickname} />
              <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
                {mockPresenter.nickname.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-1 -right-1 rounded-full bg-primary p-1">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">오늘의 스크럼 진행자는</p>
            <p className="text-lg font-bold text-foreground mt-1">
              {mockPresenter.nickname}
              <span className="text-primary">님</span>입니다!
            </p>
            <p className="text-xs text-muted-foreground mt-1">누적 발표 횟수: {mockPresenter.presentationCount}회</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
