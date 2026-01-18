"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ImagePlus, X, Users, Plus, Trash2, BarChart3 } from "lucide-react"

export function WriteForm() {
  const router = useRouter()

  // 글 유형 선택 (일반 글 vs 팟 모집)
  const [postType, setPostType] = useState<"general" | "team">("general")
  const isPartyPost = postType === "team"

  // 일반 글 카테고리
  const [category, setCategory] = useState("자유")

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])

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
        <DesktopHeader title="새 글 작성" />

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
              <CardTitle>새 글 작성</CardTitle>
              <CardDescription>커뮤니티에 새로운 글을 작성합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 글 유형 선택 */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">글 유형</Label>
                  <RadioGroup
                    value={postType}
                    onValueChange={(value) => {
                      setPostType(value as "general" | "team")
                      if (value === "team") {
                        setAuthorType("nickname") // 팟 모집은 익명 불가
                      }
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="general" id="general" />
                      <Label htmlFor="general" className="cursor-pointer">일반 글</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="team" id="team" />
                      <Label htmlFor="team" className="cursor-pointer flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        팟 모집
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* 일반 글: 카테고리 선택 */}
                {!isPartyPost && (
                  <div className="space-y-2">
                    <Label>카테고리</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="자유">자유</SelectItem>
                        <SelectItem value="질문">질문</SelectItem>
                        <SelectItem value="정보공유">정보공유</SelectItem>
                        <SelectItem value="채용공고">채용공고</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* 작성자 유형 선택 (익명/닉네임) */}
                <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                  <Label className="text-base font-semibold">작성자 표시</Label>
                  {isPartyPost ? (
                    <p className="text-sm text-muted-foreground">팟 모집 글은 익명으로 작성할 수 없습니다.</p>
                  ) : (
                    <RadioGroup
                      value={authorType}
                      onValueChange={(value) => setAuthorType(value as "nickname" | "anonymous")}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nickname" id="nickname" />
                        <Label htmlFor="nickname" className="cursor-pointer">닉네임으로 작성</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="anonymous" id="anonymous" />
                        <Label htmlFor="anonymous" className="cursor-pointer">익명으로 작성</Label>
                      </div>
                    </RadioGroup>
                  )}
                </div>

                {/* 팟 모집: 모집 인원 설정 */}
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

                {/* 제목 */}
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

                {/* 내용 */}
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

                {/* 투표 추가 */}
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
                  <Button type="button" variant="outline" className="bg-transparent" onClick={() => router.back()}>
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
