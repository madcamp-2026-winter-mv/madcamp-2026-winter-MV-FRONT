"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check, X } from "lucide-react"

interface CreateCommunityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCommunityModal({ open, onOpenChange }: CreateCommunityModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  const handleDuplicateCheck = () => {
    // Mock: 중복 확인 로직 (실제로는 서버에 요청)
    const unavailableNames = ["테스트", "몰입캠프", "자유게시판"]
    const available = !unavailableNames.includes(formData.title)
    setIsAvailable(available)
    setIsDuplicateChecked(true)
  }

  const handleTitleChange = (value: string) => {
    setFormData({ ...formData, title: value })
    setIsDuplicateChecked(false)
    setIsAvailable(null)
  }

  const handleSubmit = () => {
    console.log("커뮤니티 생성:", formData)
    onOpenChange(false)
    setFormData({ title: "", description: "" })
    setIsDuplicateChecked(false)
    setIsAvailable(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">새 커뮤니티 생성</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              커뮤니티 이름
            </Label>
            <div className="flex gap-2">
              <Input
                id="title"
                placeholder="커뮤니티 이름을 입력하세요"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="bg-background border-border flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleDuplicateCheck}
                disabled={!formData.title}
                className="bg-transparent shrink-0"
              >
                중복확인
              </Button>
            </div>
            {isDuplicateChecked && (
              <div className={`flex items-center gap-1 text-sm ${isAvailable ? "text-green-600" : "text-destructive"}`}>
                {isAvailable ? (
                  <>
                    <Check className="h-4 w-4" />
                    사용 가능한 이름입니다.
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    이미 사용 중인 이름입니다.
                  </>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              설명
            </Label>
            <Textarea
              id="description"
              placeholder="커뮤니티에 대한 설명을 입력하세요"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-background border-border min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!formData.title || !isDuplicateChecked || !isAvailable}
          >
            생성하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
