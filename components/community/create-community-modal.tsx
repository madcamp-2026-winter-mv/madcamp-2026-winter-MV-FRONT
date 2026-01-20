"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X, Pencil, Trash2 } from "lucide-react"
import { categoryApi } from "@/lib/api/api"
import type { CategoryDto } from "@/lib/api/types"
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
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  const fetchCategories = () => {
    categoryApi.getAllCategories().then((list) => setCategories(Array.isArray(list) ? list : [])).catch(() => setCategories([]))
  }

  useEffect(() => {
    if (open) {
      fetchCategories()
      setName("")
      setIsDuplicateChecked(false)
      setIsAvailable(null)
      setEditingCategoryId(null)
      setEditingName("")
    }
  }, [open])

  const handleUpdateCategory = async () => {
    const trimmed = editingName.trim()
    if (editingCategoryId == null || !trimmed || editSubmitting) return
    setEditSubmitting(true)
    try {
      await categoryApi.updateCategory(editingCategoryId, trimmed)
      toast({ title: "카테고리가 수정되었습니다." })
      setEditingCategoryId(null)
      setEditingName("")
      fetchCategories()
      onSuccess?.()
    } catch (e: unknown) {
      const err = e as { message?: string; error?: string }
      toast({ title: "수정 실패", description: err?.message || err?.error || "기본 카테고리(1~5)는 수정할 수 없습니다.", variant: "destructive" })
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleDeleteCategory = async (c: CategoryDto) => {
    if (!window.confirm(`"${c.name}" 카테고리를 삭제할까요? 해당 카테고리 글은 자유게시판으로 이동됩니다.`)) return
    setDeleteSubmitting(true)
    try {
      await categoryApi.deleteCategory(c.categoryId)
      toast({ title: "카테고리가 삭제되었습니다." })
      setEditingCategoryId(null)
      fetchCategories()
      onSuccess?.()
    } catch (e: unknown) {
      const err = e as { message?: string; error?: string }
      toast({ title: "삭제 실패", description: err?.message || err?.error || "기본 카테고리(1~5)는 삭제할 수 없습니다.", variant: "destructive" })
    } finally {
      setDeleteSubmitting(false)
    }
  }

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
          <DialogTitle className="text-foreground">카테고리 관리</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label className="text-foreground">기존 카테고리</Label>
              <div className="max-h-32 overflow-y-auto rounded-lg border border-border p-2 space-y-1.5">
                {categories.map((c) =>
                  editingCategoryId === c.categoryId ? (
                    <div key={c.categoryId} className="flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="이름"
                        className="h-8 flex-1"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleUpdateCategory} disabled={editSubmitting || !editingName.trim()}>
                        {editSubmitting ? "저장 중" : "저장"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingCategoryId(null); setEditingName("") }} disabled={editSubmitting}>
                        취소
                      </Button>
                    </div>
                  ) : (
                    <div key={c.categoryId} className="flex items-center justify-between gap-2 py-1 px-2 rounded hover:bg-muted/50">
                      <span className="text-sm truncate">{c.name}</span>
                      <div className="flex shrink-0 gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingCategoryId(c.categoryId); setEditingName(c.name) }} title="수정">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteCategory(c)} disabled={deleteSubmitting} title="삭제">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              새 카테고리 이름
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
