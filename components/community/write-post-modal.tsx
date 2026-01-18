"use client"

import type React from "react"
import { useState } from "react"
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

interface WritePostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: string  // 현재 선택된 카테고리 (자유, 질문, 정보공유, 채용공고, 팟모집)
  isPartyOnly?: boolean  // 팟모집 탭에서 열렸는지
}

export function WritePostModal({ open, onOpenChange, category: initialCategory, isPartyOnly = false }: WritePostModalProps) {
  // 팟모집 탭이면 팟 모집만, 아니면 일반 글만
  const isPartyPost = isPartyOnly

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  // 작성자 유형 (익명/닉네임)
  const [authorType, setAuthorType] = useState<"nickname" | "anonymous">("nickname")

  // 팟 모집 전용
  const [maxParticipants, setMaxParticipants] = useState(4)

  const [hasVote, setHasVote] = useState(false)
  const [voteTitle, setVoteTitle] = useState("")
  const [voteOptions, setVoteOptions] = useState(["", ""])
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 글 작성 완료 후 모달 닫기
    onOpenChange(false)
    // 폼 초기화
    resetForm()
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setAuthorType("nickname")
    setMaxParticipants(4)
    setHasVote(false)
    setVoteTitle("")
    setVoteOptions(["", ""])
    setAllowMultipleVotes(false)
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

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="modal-multipleVotes"
                    checked={allowMultipleVotes}
                    onCheckedChange={(checked) => setAllowMultipleVotes(checked as boolean)}
                  />
                  <Label htmlFor="modal-multipleVotes" className="cursor-pointer text-sm">
                    복수 선택 허용
                  </Label>
                </div>
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" className="bg-transparent" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">{isPartyPost ? "팟 모집 시작" : "게시하기"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
