"use client"

import type React from "react"
import { useState, useEffect } from "react"
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

// API 함수 및 카테고리 맵 import
import { createPost, CATEGORY_MAP } from "@/lib/api"

// 1. Props 인터페이스 정의 (onPostCreated 추가)
interface WriteFormProps {
  onPostCreated?: () => void; 
}

// 2. 컴포넌트 인자에 props 구조 분해 할당
export function WriteForm({ onPostCreated }: WriteFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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

  // 투표 관련 상태
  const [hasVote, setHasVote] = useState(false)
  const [voteTitle, setVoteTitle] = useState("")
  const [voteOptions, setVoteOptions] = useState(["", ""])
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false)

  // 사용자 분반(Room ID) 관리 상태
  const [roomId, setRoomId] = useState<number>(1)

  // 컴포넌트 마운트 시 사용자 정보에서 RoomID 가져오기
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser.roomId) {
          setRoomId(Number(parsedUser.roomId))
        }
      } catch (error) {
        console.error("사용자 정보 파싱 오류:", error)
      }
    }
  }, [])

  // API 전송 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.")
      return
    }

    try {
      setLoading(true)

      const targetCategoryName = isPartyPost ? "팟모집" : category
      const categoryId = CATEGORY_MAP[targetCategoryName] || 1

      const validVoteOptions = hasVote 
        ? voteOptions.filter((opt) => opt.trim() !== "") 
        : undefined

      const postData = {
        title,
        content,
        categoryId,
        roomId: roomId,
        type: isPartyPost ? "PARTY" : "GENERAL",
        isAnonymous: authorType === "anonymous",
        maxParticipants: isPartyPost ? maxParticipants : undefined,
        voteOptions: validVoteOptions && validVoteOptions.length > 0 ? {
          title: voteTitle || "투표",
          items: validVoteOptions,
          allowMultiple: allowMultipleVotes
        } : undefined
      }

      console.log("전송 데이터:", postData)

      await createPost({
        ...postData,
        voteOptions: validVoteOptions 
      })

      alert("게시글이 성공적으로 등록되었습니다.")

      // 3. onPostCreated가 있으면 실행(모달 닫기 등), 없으면 페이지 이동
      if (onPostCreated) {
        onPostCreated()
      } else {
        router.push("/community")
        router.refresh()
      }

    } catch (error) {
      console.error("작성 실패:", error)
      alert("게시글 등록에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }
  const handleAddImage = () => {
    setImages([...images, `/placeholder.svg?height=200&width=300`])
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
        <DesktopHeader title={isPartyPost ? "팟 모집하기" : "새 글 작성"} />

        <main className="p-6">
          <div className="mb-6">
            <Link href="/community">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                목록으로 돌아가기
              </Button>
            </Link>
          </div>

          <Card className="mx-auto max-w-3xl">
            <CardHeader>
              <CardTitle>글 작성</CardTitle>
              <CardDescription>
                {isPartyPost 
                  ? "함께할 멤버를 모집하는 글을 작성합니다." 
                  : "커뮤니티에 자유롭게 글을 남겨보세요."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 글 유형 선택 */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">게시글 유형</Label>
                  <RadioGroup
                    value={postType}
                    onValueChange={(value) => {
                      setPostType(value as "general" | "team")
                      if (value === "team") {
                        setAuthorType("nickname")
                        setCategory("팟모집")
                      } else {
                        setCategory("자유")
                      }
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="general" id="general" />
                      <Label htmlFor="general" className="cursor-pointer">📝 일반 게시글</Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="team" id="team" />
                      <Label htmlFor="team" className="cursor-pointer flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        👫 팟 모집
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

                {/* 작성자 유형 (익명/닉네임) */}
                <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                  <Label className="text-base font-semibold">작성자 설정</Label>
                  {isPartyPost ? (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" /> 팟 모집은 신뢰를 위해 닉네임으로만 작성 가능합니다.
                    </p>
                  ) : (
                    <RadioGroup
                      value={authorType}
                      onValueChange={(value) => setAuthorType(value as "nickname" | "anonymous")}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nickname" id="nickname" />
                        <Label htmlFor="nickname" className="cursor-pointer">닉네임 사용</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="anonymous" id="anonymous" />
                        <Label htmlFor="anonymous" className="cursor-pointer">익명 사용</Label>
                      </div>
                    </RadioGroup>
                  )}
                </div>

                {/* 팟 모집: 인원 설정 */}
                {isPartyPost && (
                  <div className="space-y-2 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                    <Label className="flex items-center gap-2 font-semibold text-primary">
                      <Users className="h-5 w-5" /> 모집 인원 (본인 포함)
                    </Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        type="number"
                        min={2}
                        max={20}
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(Number(e.target.value))}
                        className="w-24 font-bold text-lg"
                      />
                      <span className="text-sm text-muted-foreground">명까지 참여 가능</span>
                    </div>
                  </div>
                )}

                {/* 제목 */}
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isPartyPost ? "예: 오늘 저녁 6시 떡볶이 드실 분! (2/4)" : "제목을 입력하세요"}
                    className="text-lg"
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
                    placeholder={isPartyPost ? "모임 장소, 시간, 상세 내용을 적어주세요." : "내용을 입력하세요"}
                    className="min-h-[250px] resize-none"
                    required
                  />
                </div>

                {/* 투표 섹션 */}
                <div className="space-y-4 p-4 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hasVote"
                      checked={hasVote}
                      onCheckedChange={(checked) => setHasVote(checked as boolean)}
                    />
                    <Label htmlFor="hasVote" className="cursor-pointer flex items-center gap-2 font-medium">
                      <BarChart3 className="h-4 w-4" /> 투표 기능 사용하기
                    </Label>
                  </div>

                  {hasVote && (
                    <div className="space-y-4 pt-4 border-t mt-2 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label>투표 제목</Label>
                        <Input
                          value={voteTitle}
                          onChange={(e) => setVoteTitle(e.target.value)}
                          placeholder="무엇을 투표할까요?"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>투표 항목</Label>
                        {voteOptions.map((option, index) => (
                          <div key={index} className="flex gap-2">
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
                            className="w-full mt-2"
                          >
                            <Plus className="h-4 w-4 mr-1" /> 항목 추가
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <Checkbox
                          id="multiVote"
                          checked={allowMultipleVotes}
                          onCheckedChange={(checked) => setAllowMultipleVotes(checked as boolean)}
                        />
                        <Label htmlFor="multiVote" className="text-sm cursor-pointer">복수 선택 허용</Label>
                      </div>
                    </div>
                  )}
                </div>

                {/* 이미지 섹션 */}
                <div className="space-y-2">
                   <Label>이미지 첨부</Label>
                   <div className="flex flex-wrap gap-4">
                     {images.map((img, index) => (
                       <div key={index} className="relative">
                         <img src={img} alt="preview" className="h-24 w-32 rounded-lg object-cover border" />
                         <button
                           type="button"
                           onClick={() => handleRemoveImage(index)}
                           className="absolute -right-2 -top-2 rounded-full bg-destructive text-white p-1"
                         >
                           <X className="h-3 w-3" />
                         </button>
                       </div>
                     ))}
                     <button
                       type="button"
                       onClick={handleAddImage}
                       className="flex h-24 w-32 items-center justify-center rounded-lg border-2 border-dashed hover:bg-accent"
                     >
                       <ImagePlus className="h-6 w-6 text-muted-foreground" />
                     </button>
                   </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    취소
                  </Button>
                  <Button type="submit" disabled={loading} className="w-32">
                    {loading ? "등록 중..." : (isPartyPost ? "팟 모집 시작" : "작성 완료")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}