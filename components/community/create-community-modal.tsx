"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X } from "lucide-react"
import { categoryApi } from "@/lib/api/api"
import { toast } from "@/hooks/use-toast"

interface CreateCommunityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateCommunityModal({ open, onOpenChange, onSuccess }: CreateCommunityModalProps) {
  const [name, setName] = useState("")
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleDuplicateCheck = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setChecking(true)
    setIsDuplicateChecked(false)
    setIsAvailable(null)
    try {
      const res = await categoryApi.checkDuplicate(trimmed)
      setIsAvailable(res.available)
      setIsDuplicateChecked(true)
    } catch {
      toast({ title: "중복 확인 실패", description: "다시 시도해 주세요.", variant: "destructive" })
    } finally {
      setChecking(false)
    }
  }

  const handleNameChange = (value: string) => {
    setName(value)
    setIsDuplicateChecked(false)
    setIsAvailable(null)
  }

  const handleSubmit = async () => {
    const trimmed = name.trim()
    if (!trimmed || !isDuplicateChecked || !isAvailable) return
    setSubmitting(true)
    try {
      await categoryApi.createCategory(trimmed)
      toast({ title: "카테고리가 생성되었습니다." })
      onOpenChange(false)
      setName("")
      setIsDuplicateChecked(false)
      setIsAvailable(null)
      onSuccess?.()
    } catch (e: unknown) {
      const err = e as { message?: string; error?: string }
      toast({ title: "생성 실패", description: err?.message || err?.error || "다시 시도해 주세요.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">새 커뮤니티 카테고리 생성</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              카테고리 이름
            </Label>
            <div className="flex gap-2">
              <Input
                id="title"
                placeholder="예: 정보공유, 질문"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="bg-background border-border flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleDuplicateCheck}
                disabled={!name.trim() || checking}
                className="bg-transparent shrink-0"
              >
                {checking ? "확인 중" : "중복확인"}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!name.trim() || !isDuplicateChecked || !isAvailable || submitting}
          >
            {submitting ? "생성 중..." : "생성하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
