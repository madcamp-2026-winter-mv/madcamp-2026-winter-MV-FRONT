"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Upload, X, Check } from "lucide-react"
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
import { memberApi } from "@/lib/api/api"
import type { MemberResponseDto } from "@/lib/api/types"

interface ProfileCardProps {
  member: MemberResponseDto | null
  onUpdate?: () => void
}

export function ProfileCard({ member, onUpdate }: ProfileCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [nickname, setNickname] = useState(member?.nickname ?? "")
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false)
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isNicknameChanged = !!member && nickname.trim() !== "" && nickname !== member.nickname

  const handleOpenEdit = () => {
    setNickname(member?.nickname ?? "")
    setPreviewImage(null)
    setIsDuplicateChecked(false)
    setIsNicknameAvailable(null)
    setError(null)
    setIsEditOpen(true)
  }

  const handleNicknameChange = (value: string) => {
    setNickname(value)
    setIsDuplicateChecked(false)
    setIsNicknameAvailable(null)
  }

  const handleDuplicateCheck = async () => {
    if (!nickname.trim()) return;

    try {
      setError(null);
      // 서버 응답: 중복이 존재하면 true, 없으면 false
      const isDuplicated = await memberApi.checkNickname(nickname);
      
      // 사용 가능 여부(Available)는 중복의 반대여야 함 (!)
      setIsNicknameAvailable(!isDuplicated); 
      setIsDuplicateChecked(true);
    } catch (e: any) {
      setError("중복 확인 중 오류가 발생했습니다.");
      console.error(e);
    }
  }

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

  const handleSave = async () => {
    const v = nickname.trim()
    if (!v || !member) return
    if (isNicknameChanged && (!isDuplicateChecked || !isNicknameAvailable)) return
    setSaving(true)
    setError(null)
    try {
      if (isNicknameChanged) {
        await memberApi.updateNickname(v)
      }
      // TODO: 프로필 사진 업로드 API 연동 (previewImage가 있을 때)
      setIsEditOpen(false)
      setPreviewImage(null)
      onUpdate?.()
    } catch (e: any) {
      setError(e?.message || e?.error || "닉네임 변경에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  if (!member) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-24 w-24 rounded-full bg-muted animate-pulse" />
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                  {String(member.nickname).slice(-2)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full border shadow-sm"
                onClick={handleOpenEdit}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">프로필 수정</span>
              </Button>
            </div>

            <h2 className="mt-4 text-xl font-bold">{member.nickname}</h2>
            <p className="text-sm text-muted-foreground">{member.realName}</p>
            <p className="text-xs text-muted-foreground mt-1">{member.email}</p>

            {member.roomName && (
              <Badge variant="outline" className="mt-3 border-primary/50 text-primary">
                {member.roomName}
              </Badge>
            )}

            <div className="grid grid-cols-2 gap-6 mt-6 w-full max-w-[200px]">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{member.presentationCount}</p>
                <p className="text-xs text-muted-foreground">발표 횟수</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{Math.round(member.attendanceRate)}%</p>
                <p className="text-xs text-muted-foreground">출석률</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로필 수정</DialogTitle>
            <DialogDescription>프로필 사진과 닉네임을 수정할 수 있습니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* 프로필 사진 */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary">
                  <AvatarImage src={previewImage || "/placeholder.svg"} alt={nickname} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                    {nickname.slice(-2) || "?"}
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
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="text-xs text-muted-foreground">JPG, PNG, GIF (최대 5MB)</p>
              </div>
            </div>

            {/* 닉네임 수정 */}
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <div className="flex gap-2">
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => handleNicknameChange(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDuplicateCheck}
                  disabled={!nickname || !isNicknameChanged}
                  className="bg-transparent shrink-0"
                >
                  중복확인
                </Button>
              </div>
              {isDuplicateChecked && (
                <div
                  className={`flex items-center gap-1 text-sm ${isNicknameAvailable ? "text-green-600" : "text-destructive"}`}
                >
                  {isNicknameAvailable ? (
                    <>
                      <Check className="h-4 w-4" />
                      사용 가능한 닉네임입니다.
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      이미 사용 중인 닉네임입니다.
                    </>
                  )}
                </div>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                (!isNicknameChanged && !previewImage) ||
                (isNicknameChanged && (!isDuplicateChecked || !isNicknameAvailable))
              }
            >
              {saving ? "저장 중..." : "저장하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
