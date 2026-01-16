"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil } from "lucide-react"

interface UserProfile {
  nickname: string
  realName: string
  email: string
  imageUrl?: string
  roomCode: string
  presentationCount: number
  attendanceRate: number
}

const mockProfile: UserProfile = {
  nickname: "몰입하는 42",
  realName: "김몰입",
  email: "molip42@gmail.com",
  roomCode: "MAD012",
  presentationCount: 2,
  attendanceRate: 95,
}

export function ProfileCard() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={mockProfile.imageUrl || "/placeholder.svg"} alt={mockProfile.nickname} />
              <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                {mockProfile.nickname.slice(-2)}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full border shadow-sm"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">프로필 수정</span>
            </Button>
          </div>

          <h2 className="mt-4 text-xl font-bold">{mockProfile.nickname}</h2>
          <p className="text-sm text-muted-foreground">{mockProfile.realName}</p>
          <p className="text-xs text-muted-foreground mt-1">{mockProfile.email}</p>

          <Badge variant="outline" className="mt-3 border-primary/50 text-primary">
            {mockProfile.roomCode} 분반
          </Badge>

          <div className="grid grid-cols-2 gap-6 mt-6 w-full max-w-[200px]">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{mockProfile.presentationCount}</p>
              <p className="text-xs text-muted-foreground">발표 횟수</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{mockProfile.attendanceRate}%</p>
              <p className="text-xs text-muted-foreground">출석률</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
