"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Trash2, BarChart3 } from "lucide-react"
import { postApi, memberApi, categoryApi } from "@/lib/api/api"
import { PostType } from "@/lib/api/types"
import type { CategoryDto } from "@/lib/api/types"

interface WritePostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: string
  isPartyOnly?: boolean
  onSuccess?: () => void
}

export function WritePostModal({ open, onOpenChange, category: initialCategory, isPartyOnly = false, onSuccess }: WritePostModalProps) {
  const isPartyPost = isPartyOnly

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [authorType, setAuthorType] = useState<"nickname" | "anonymous">("nickname")
  const [maxParticipants, setMaxParticipants] = useState(4)
  const [hasVote, setHasVote] = useState(false)
  const [voteTitle, setVoteTitle] = useState("")
  const [voteOptions, setVoteOptions] = useState(["", ""])
  const [roomId, setRoomId] = useState<number | null>(null)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setSubmitError(null)
    memberApi.getMyInfo().then((m) => setRoomId(m.roomId ?? null)).catch(() => setRoomId(null))
    categoryApi.getAllCategories().then((list) => setCategories(Array.isArray(list) ? list : [])).catch(() => setCategories([]))
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)

    const rId = roomId
    const catName = isPartyPost ? "팟모집" : initialCategory
    const cat = categories.find((c) => c.name === catName)

    if (!rId) {
      setSubmitError("방에 참여한 후에 글을 작성할 수 있습니다.")
      setSubmitting(false)
      return
    }
    if (!cat) {
      setSubmitError("선택한 카테고리를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.")
      setSubmitting(false)
      return
    }

    const type = isPartyPost ? PostType.PARTY : (hasVote ? PostType.VOTE : PostType.NORMAL)
    const payload = {
      roomId: rId,
      categoryId: cat.categoryId,
      title: title.trim(),
      content: content.trim(),
      type,
      maxParticipants: isPartyPost ? maxParticipants : undefined,
      voteContents: hasVote ? voteOptions.filter(Boolean) : undefined,
      isAnonymous: !isPartyPost && authorType === "anonymous",
    }

    try {
      await postApi.createPost(payload)
      onOpenChange(false)
      resetForm()
      onSuccess?.()
    } catch (err: unknown) {
      const e = err as { message?: string; error?: string }
      setSubmitError(e?.message || e?.error || "글 작성에 실패했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setAuthorType("nickname")
    setMaxParticipants(4)
    setHasVote(false)
    setVoteTitle("")
    setVoteOptions(["", ""])
  }

  const handleAddVoteOption = () => {
    if (voteOptions.length < 6) {
      setVoteOptions([...voteOptions, ""])
    }
  }

  const handleRemoveVoteOption = (index: number) => {
    if (voteOptions.length > 2) {
      setVoteOptions(voteOptions.filter((_, i) => i !== index))
    }
  }

  const handleVoteOptionChange = (index: number, value: string) => {
    const newOptions = [...voteOptions]
    newOptions[index] = value
    setVoteOptions(newOptions)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isPartyPost ? "팟 모집하기" : "새 글 작성"}</DialogTitle>
          <DialogDescription>
            {isPartyPost 
              ? "함께할 팟 멤버를 모집해보세요." 
              : `${initialCategory} 게시판에 새로운 글을 작성합니다.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {submitError && (
            <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">{submitError}</div>
          )}
          {/* 현재 카테고리 표시 */}
          <div className="flex items-center gap-2">
            <Label className="text-sm font-semibold">게시판</Label>
            <Badge variant="secondary" className="text-sm">
              {isPartyPost ? "팟모집" : initialCategory}
            </Badge>
          </div>

          {/* 작성자 유형 선택 */}
          <div className="space-y-3 p-3 rounded-lg bg-muted/50">
            <Label className="text-sm font-semibold">작성자 표시</Label>
            {isPartyPost ? (
              <p className="text-sm text-muted-foreground">팟 모집 글은 익명으로 작성할 수 없습니다.</p>
            ) : (
              <RadioGroup
                value={authorType}
                onValueChange={(value) => setAuthorType(value as "nickname" | "anonymous")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nickname" id="modal-nickname" />
                  <Label htmlFor="modal-nickname" className="cursor-pointer">닉네임으로 작성</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="anonymous" id="modal-anonymous" />
                  <Label htmlFor="modal-anonymous" className="cursor-pointer">익명으로 작성</Label>
                </div>
              </RadioGroup>
            )}
          </div>

          {/* 팟 모집: 모집 인원 설정 */}
          {isPartyPost && (
            <div className="space-y-2 p-3 rounded-lg border-2 border-primary/30 bg-primary/5">
              <Label htmlFor="modal-maxParticipants" className="flex items-center gap-2 font-semibold text-sm">
                <Users className="h-4 w-4 text-primary" />
                모집 인원 설정
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="modal-maxParticipants"
                  type="number"
                  min={2}
                  max={20}
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">명 (본인 포함)</span>
              </div>
            </div>
          )}

          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="modal-title">제목</Label>
            <Input
              id="modal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isPartyPost ? "예: 오늘 저녁 치킨 팟 구해요" : "제목을 입력하세요"}
              required
            />
          </div>

          {/* 내용 */}
          <div className="space-y-2">
            <Label htmlFor="modal-content">내용</Label>
            <Textarea
              id="modal-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isPartyPost ? "팟 모집 내용을 작성해주세요. (모임 장소, 시간, 목적 등)" : "내용을 입력하세요"
              }
              className="min-h-[150px]"
              required
            />
          </div>

          {/* 투표 추가 */}
          <div className="space-y-3 p-3 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Checkbox
                id="modal-hasVote"
                checked={hasVote}
                onCheckedChange={(checked) => setHasVote(checked as boolean)}
              />
              <Label htmlFor="modal-hasVote" className="cursor-pointer flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                투표 추가하기
              </Label>
            </div>

            {hasVote && (
              <div className="space-y-3 pt-3 border-t">
                <div className="space-y-2">
                  <Label htmlFor="modal-voteTitle">투표 제목</Label>
                  <Input
                    id="modal-voteTitle"
                    value={voteTitle}
                    onChange={(e) => setVoteTitle(e.target.value)}
                    placeholder="투표 제목을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label>투표 항목</Label>
                  {voteOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => handleVoteOptionChange(index, e.target.value)}
                        placeholder={`항목 ${index + 1}`}
                      />
                      {voteOptions.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveVoteOption(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {voteOptions.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddVoteOption}
                      className="mt-2 bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      항목 추가
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" className="bg-transparent" onClick={() => onOpenChange(false)} disabled={submitting}>
              취소
            </Button>
            <Button type="submit" disabled={submitting}>{submitting ? "등록 중..." : (isPartyPost ? "팟 모집 시작" : "게시하기")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
