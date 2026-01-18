"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Upload, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    // 실제로는 API 호출
    setIsEditOpen(false)
  }

  return (
    <>
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
                onClick={() => setIsEditOpen(true)}
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

      {/* 프로필 사진 편집 모달 */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로필 사진 변경</DialogTitle>
            <DialogDescription>새로운 프로필 사진을 업로드하세요</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary">
                  <AvatarImage src={previewImage || mockProfile.imageUrl || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                    {mockProfile.nickname.slice(-2)}
                  </AvatarFallback>
                </Avatar>
                {previewImage && (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -right-2 -top-2 h-8 w-8 rounded-full"
                    onClick={() => setPreviewImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex flex-col items-center gap-2">
                <Label
                  htmlFor="image-upload"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 hover:bg-muted"
                >
                  <Upload className="h-4 w-4" />
                  이미지 선택
                </Label>
                <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <p className="text-xs text-muted-foreground">JPG, PNG, GIF (최대 5MB)</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>저장하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
