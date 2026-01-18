"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCommunity } from "@/lib/api" 

interface CreateCommunityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void 
}

export function CreateCommunityModal({ open, onOpenChange, onSuccess }: CreateCommunityModalProps) {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return

    setIsLoading(true)
    try {
      await createCommunity(name)
      
      alert("커뮤니티가 생성되었습니다!")
      setName("") // 입력창 초기화
      onOpenChange(false) // 모달 닫기
      
      // 목록 새로고침
      if (onSuccess) {
        onSuccess()
      } else {
        window.location.reload() // 콜백 없으면 페이지 새로고침
      }
    } catch (error) {
      console.error(error)
      alert("커뮤니티 생성에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">새 커뮤니티 만들기</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              커뮤니티 이름
            </Label>
            <Input
              id="name"
              placeholder="예: 운동, 맛집탐방, 코딩질문"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit()
              }}
            />
            <p className="text-xs text-muted-foreground">
              생성된 커뮤니티는 상단 탭에 즉시 추가됩니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? "생성 중..." : "생성하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}