"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ImagePlus, X, Users, Plus, Trash2, BarChart3 } from "lucide-react"

export function WriteForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const writeType = searchParams.get("type") || "general"
  const isPartyPost = writeType === "team"

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])

  const [isAnonymous, setIsAnonymous] = useState(false)

  // 팟 모집 전용
  const [maxParticipants, setMaxParticipants] = useState(4)

  const [hasVote, setHasVote] = useState(false)
  const [voteTitle, setVoteTitle] = useState("")
  const [voteOptions, setVoteOptions] = useState(["", ""])
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false)

  const getTypeLabel = () => {
    switch (writeType) {
      case "general":
        return "자유 게시글"
      case "question":
        return "질문하기"
      case "team":
        return "팟 모집"
      case "job":
        return "채용공고"
      default:
        return "새 글"
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/community")
  }

  const handleAddImage = () => {
    setImages([...images, `/placeholder.svg?height=200&width=300&query=uploaded image ${images.length + 1}`])
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
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
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="ml-64">
        <DesktopHeader title={`${getTypeLabel()} 작성`} />

        <main className="p-6">
          <div className="mb-6">
            <Link href="/community">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                돌아가기
              </Button>
            </Link>
          </div>

          <Card className="mx-auto max-w-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isPartyPost && <Users className="h-5 w-5 text-primary" />}
                {getTypeLabel()} 작성
              </CardTitle>
              <CardDescription>
                {isPartyPost
                  ? "함께할 팟 멤버를 모집해보세요. 댓글 작성자 중 참가자를 선택할 수 있습니다."
                  : "자유롭게 글을 작성해보세요."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {isPartyPost && (
                  <div className="space-y-2 p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
                    <Label htmlFor="maxParticipants" className="flex items-center gap-2 font-semibold">
                      <Users className="h-4 w-4 text-primary" />
                      모집 인원 설정
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="maxParticipants"
                        type="number"
                        min={2}
                        max={20}
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(Number(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">명 (본인 포함)</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      댓글 작성자 중 참가자를 선택할 수 있습니다. 최대 인원까지만 선택 가능합니다.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isPartyPost ? "예: 오늘 저녁 치킨 팟 구해요" : "제목을 입력하세요"}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">내용</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      isPartyPost ? "팟 모집 내용을 작성해주세요. (모임 장소, 시간, 목적 등)" : "내용을 입력하세요"
                    }
                    className="min-h-[200px]"
                    required
                  />
                </div>

                {!isPartyPost && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <Checkbox
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                    />
                    <Label htmlFor="anonymous" className="cursor-pointer">
                      익명으로 작성하기
                    </Label>
                    <span className="text-xs text-muted-foreground">(작성자가 &apos;익명&apos;으로 표시됩니다)</span>
                  </div>
                )}
                {isPartyPost && (
                  <div className="p-4 rounded-lg bg-muted/30 border border-muted">
                    <p className="text-sm text-muted-foreground">팟 모집 글은 익명으로 작성할 수 없습니다.</p>
                  </div>
                )}

                <div className="space-y-4 p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="hasVote"
                        checked={hasVote}
                        onCheckedChange={(checked) => setHasVote(checked as boolean)}
                      />
                      <Label htmlFor="hasVote" className="cursor-pointer flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        투표 추가하기
                      </Label>
                    </div>
                  </div>

                  {hasVote && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="voteTitle">투표 제목</Label>
                        <Input
                          id="voteTitle"
                          value={voteTitle}
                          onChange={(e) => setVoteTitle(e.target.value)}
                          placeholder="투표 제목을 입력하세요"
                        />
                      </div>

                      <div className="space-y-3">
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

                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="multipleVotes"
                          checked={allowMultipleVotes}
                          onCheckedChange={(checked) => setAllowMultipleVotes(checked as boolean)}
                        />
                        <Label htmlFor="multipleVotes" className="cursor-pointer text-sm">
                          복수 선택 허용
                        </Label>
                      </div>
                    </div>
                  )}
                </div>

                {/* 이미지 첨부 */}
                <div className="space-y-2">
                  <Label>이미지 첨부</Label>
                  <div className="flex flex-wrap gap-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`첨부 이미지 ${index + 1}`}
                          className="h-24 w-32 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="flex h-24 w-32 items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
                    >
                      <ImagePlus className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    취소
                  </Button>
                  <Button type="submit">{isPartyPost ? "팟 모집 시작" : "게시하기"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
