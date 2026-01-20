"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Heart, MessageSquare, Share, MoreHorizontal, Send, Users, MessageCircle, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Mock 데이터
const mockPost = {
  id: "2",
  title: "오늘 저녁 치킨 팟 구해요 (6시 출발)",
  content: `안녕하세요! 오늘 저녁 6시에 BBQ 황금올리브 먹으러 갈 분 구합니다.

N1에서 출발해서 같이 걸어갈 예정이에요.
맛있게 먹고 돌아와요~`,
  author: "몰입하는 7",
  isAnonymous: false,
  category: "팟모집",
  createdAt: "2025-01-15 14:30",
  likes: 8,
  comments: 5,
  isLiked: false,
  isParty: true,
  partyInfo: {
    maxCount: 4,
    isRecruiting: true,
  },
  hasVote: true,
  vote: {
    title: "어떤 치킨 드실래요?",
    options: [
      { id: 1, text: "황금올리브", votes: 3 },
      { id: 2, text: "후라이드", votes: 1 },
      { id: 3, text: "양념", votes: 2 },
    ],
    allowMultiple: false,
    totalVotes: 6,
  },
}

// 현재 로그인한 유저 (테스트용)
const currentUser = "몰입하는 7" // 작성자로 테스트
const isAuthor = currentUser === mockPost.author

// 팟 참가자 목록 (작성자는 자동 포함)
const initialParticipants = [
  { id: "1", nickname: "몰입하는 7" }, // 작성자
]

const mockComments = [
  {
    id: 1,
    author: "몰입하는 3",
    isAnonymous: false,
    content: "저도 참가할게요! 치킨 너무 먹고싶었어요",
    createdAt: "2025-01-15 15:00",
  },
  {
    id: 2,
    author: "몰입하는 15",
    isAnonymous: true, // 익명 댓글
    content: "치킨 좋아요~ 같이 가요",
    createdAt: "2025-01-15 15:30",
  },
  {
    id: 3,
    author: "몰입하는 22",
    isAnonymous: false,
    content: "저도 끼고싶습니다!!",
    createdAt: "2025-01-15 16:00",
  },
  {
    id: 4,
    author: "몰입하는 8",
    isAnonymous: true, // 익명 댓글
    content: "혹시 자리 있으면 저도요~",
    createdAt: "2025-01-15 16:30",
  },
]

export default function PostDetailPage() {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(mockPost.isLiked)
  const [likeCount, setLikeCount] = useState(mockPost.likes)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState(mockComments)

  const [isCommentAnonymous, setIsCommentAnonymous] = useState(false)

  // 팟 모집 관련 state
  const [participants, setParticipants] = useState(initialParticipants)
  const [isRecruiting, setIsRecruiting] = useState(mockPost.partyInfo.isRecruiting)
  const [showChatModal, setShowChatModal] = useState(false)

  const [selectedVoteOptions, setSelectedVoteOptions] = useState<number[]>([])
  const [hasVoted, setHasVoted] = useState(false)

  const isFull = participants.length >= mockPost.partyInfo.maxCount
  const canAddMore = participants.length < mockPost.partyInfo.maxCount

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setComments([
      ...comments,
      {
        id: comments.length + 1,
        author: currentUser,
        isAnonymous: isCommentAnonymous,
        content: newComment,
        createdAt: new Date().toLocaleString("ko-KR"),
      },
    ])
    setNewComment("")
    setIsCommentAnonymous(false)
  }

  const isParticipant = (nickname: string) => {
    return participants.some((p) => p.nickname === nickname)
  }

  const handleToggleParticipant = (nickname: string) => {
    if (isParticipant(nickname)) {
      setParticipants(participants.filter((p) => p.nickname !== nickname))
    } else if (canAddMore) {
      setParticipants([...participants, { id: String(Date.now()), nickname }])
    }
  }

  const handleCreateChatRoom = () => {
    setIsRecruiting(false)
    setShowChatModal(false)
    router.push("/chat?room=new")
  }

  const handleVote = () => {
    if (selectedVoteOptions.length > 0) {
      setHasVoted(true)
    }
  }

  const handleVoteOptionToggle = (optionId: number) => {
    if (mockPost.vote?.allowMultiple) {
      setSelectedVoteOptions((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
      )
    } else {
      setSelectedVoteOptions([optionId])
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="ml-64">
        <DesktopHeader title="게시글" />

        <main className="p-6">
          <div className="mb-6">
            <Link href="/community">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                목록으로
              </Button>
            </Link>
          </div>

          <div className="mx-auto max-w-4xl space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* 게시글 */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {mockPost.isAnonymous ? (
                            <AvatarFallback className="bg-muted">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </AvatarFallback>
                          ) : (
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {mockPost.author.slice(-2)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-semibold">{mockPost.isAnonymous ? "익명" : mockPost.author}</p>
                          <p className="text-sm text-muted-foreground">{mockPost.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                          {mockPost.category}
                        </Badge>
                        {mockPost.isParty && (
                          <Badge
                            variant="outline"
                            className={
                              !isRecruiting || isFull
                                ? "border-muted-foreground text-muted-foreground"
                                : "border-primary text-primary"
                            }
                          >
                            {!isRecruiting || isFull ? "모집완료" : "모집중"}
                          </Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>수정하기</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">삭제하기</DropdownMenuItem>
                            <DropdownMenuItem>신고하기</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <h1 className="text-2xl font-bold">{mockPost.title}</h1>
                    <p className="whitespace-pre-wrap leading-relaxed text-foreground">{mockPost.content}</p>

                    {mockPost.hasVote && mockPost.vote && (
                      <Card className="border-2 border-primary/20 bg-primary/5">
                        <CardContent className="p-4 space-y-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <span className="text-lg">📊</span>
                            {mockPost.vote.title}
                          </h3>

                          {!hasVoted ? (
                            <>
                              <div className="space-y-2">
                                {mockPost.vote.options.map((option) => (
                                  <div
                                    key={option.id}
                                    onClick={() => handleVoteOptionToggle(option.id)}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                      selectedVoteOptions.includes(option.id)
                                        ? "border-primary bg-primary/10"
                                        : "border-border hover:border-primary/50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Checkbox
                                        checked={selectedVoteOptions.includes(option.id)}
                                        className="pointer-events-none"
                                      />
                                      <span>{option.text}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <Button
                                onClick={handleVote}
                                disabled={selectedVoteOptions.length === 0}
                                className="w-full"
                              >
                                투표하기
                              </Button>
                              {mockPost.vote.allowMultiple && (
                                <p className="text-xs text-muted-foreground text-center">복수 선택 가능</p>
                              )}
                            </>
                          ) : (
                            <div className="space-y-3">
                              {mockPost.vote.options.map((option) => {
                                const percentage = Math.round((option.votes / mockPost.vote!.totalVotes) * 100)
                                return (
                                  <div key={option.id} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>{option.text}</span>
                                      <span className="font-medium">{percentage}%</span>
                                    </div>
                                    <Progress value={percentage} className="h-2" />
                                    <p className="text-xs text-muted-foreground">{option.votes}표</p>
                                  </div>
                                )
                              })}
                              <p className="text-sm text-center text-muted-foreground pt-2">
                                총 {mockPost.vote.totalVotes}명 참여
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <Separator />

                    <div className="flex items-center gap-4">
                      <Button variant="ghost" className={`gap-2 ${isLiked ? "text-red-500" : ""}`} onClick={handleLike}>
                        <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                        {likeCount}
                      </Button>
                      <Button variant="ghost" className="gap-2">
                        <MessageSquare className="h-5 w-5" />
                        {comments.length}
                      </Button>
                      <Button variant="ghost" className="gap-2">
                        <Share className="h-5 w-5" />
                        공유
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 댓글 섹션 */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">댓글 {comments.length}개</h3>
                    {mockPost.isParty && isAuthor && isRecruiting && (
                      <p className="text-xs text-muted-foreground">
                        댓글 작성자 옆의 체크박스를 클릭하여 참가자로 선택할 수 있습니다.
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 댓글 작성 */}
                    <form onSubmit={handleSubmitComment} className="space-y-3">
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {currentUser.slice(-2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-1 gap-2">
                          <Textarea
                            placeholder="댓글을 입력하세요..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[60px] flex-1 resize-none"
                          />
                          <Button type="submit" size="icon">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                    </form>

                    <Separator />

                    <div className="space-y-4">
                      {comments.map((comment) => {
                        const isCommentAuthorParticipant = isParticipant(comment.author)
                        const isCommentAuthor = comment.author === mockPost.author
                        const canBeSelected = !comment.isAnonymous && !isCommentAuthor

                        return (
                          <div
                            key={comment.id}
                            className={`flex gap-3 p-3 rounded-lg transition-colors ${
                              isCommentAuthorParticipant && !isCommentAuthor
                                ? "bg-primary/10 border border-primary/30"
                                : ""
                            }`}
                          >
                            {mockPost.isParty && isAuthor && isRecruiting && (
                              <div className="flex items-center">
                                {canBeSelected ? (
                                  <Checkbox
                                    checked={isCommentAuthorParticipant}
                                    onCheckedChange={() => handleToggleParticipant(comment.author)}
                                    disabled={!isCommentAuthorParticipant && !canAddMore}
                                    className="border-primary data-[state=checked]:bg-primary"
                                  />
                                ) : (
                                  <div className="w-4" /> // 빈 공간 유지
                                )}
                              </div>
                            )}
                            <Avatar>
                              {comment.isAnonymous ? (
                                <AvatarFallback className="bg-muted">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                </AvatarFallback>
                              ) : (
                                <AvatarFallback
                                  className={
                                    isCommentAuthorParticipant && !isCommentAuthor
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }
                                >
                                  {comment.author.slice(-2)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{comment.isAnonymous ? "익명" : comment.author}</span>
                                {isCommentAuthorParticipant && !isCommentAuthor && (
                                  <Badge className="bg-primary text-primary-foreground text-xs">참가자</Badge>
                                )}
                                {comment.isAnonymous && mockPost.isParty && (
                                  <Badge variant="outline" className="text-xs text-muted-foreground">
                                    선택 불가
                                  </Badge>
                                )}
                                <span className="text-sm text-muted-foreground">{comment.createdAt}</span>
                              </div>
                              <p className="mt-1 text-foreground">{comment.content}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 팟 모집 정보 사이드바 */}
              {mockPost.isParty && (
                <div className="space-y-4">
                  {/* 참가자 목록 */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          참가자
                        </h3>
                        <Badge className="bg-primary text-primary-foreground">
                          {participants.length}/{mockPost.partyInfo.maxCount}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {participants.map((participant, index) => (
                        <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/20 text-primary text-xs">
                              {participant.nickname.slice(-2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 text-sm font-medium">{participant.nickname}</span>
                          {index === 0 && (
                            <Badge variant="outline" className="text-xs">
                              작성자
                            </Badge>
                          )}
                        </div>
                      ))}

                      {/* 빈 슬롯 표시 */}
                      {Array.from({ length: mockPost.partyInfo.maxCount - participants.length }).map((_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="flex items-center gap-3 p-2 rounded-lg border border-dashed border-border"
                        >
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">?</span>
                          </div>
                          <span className="flex-1 text-sm text-muted-foreground">빈 자리</span>
                        </div>
                      ))}

                      {isAuthor && isRecruiting && participants.length >= 2 && (
                        <Button
                          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => setShowChatModal(true)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          현재 멤버로 채팅방 개설
                        </Button>
                      )}

                      {/* 모집 완료 안내 */}
                      {!isRecruiting && (
                        <div className="p-3 rounded-lg bg-muted text-center mt-4">
                          <p className="text-sm font-medium text-muted-foreground">모집이 완료되었습니다</p>
                          <p className="text-xs text-muted-foreground mt-1">채팅방에서 대화를 나눠보세요</p>
                          <Link href="/chat">
                            <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              채팅방으로 이동
                            </Button>
                          </Link>
                        </div>
                      )}

                      {/* 작성자가 아닌 경우 안내 */}
                      {!isAuthor && isRecruiting && (
                        <div className="p-3 rounded-lg bg-primary/5 text-center mt-4">
                          <p className="text-sm text-muted-foreground">
                            댓글을 남기면 작성자가 참가자로 선택할 수 있습니다
                          </p>
                          <p className="text-xs text-destructive mt-1">익명 댓글은 참가자로 선택될 수 없습니다</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 작성자 안내 */}
                  {isAuthor && isRecruiting && (
                    <Card className="border-primary/30 bg-primary/5">
                      <CardContent className="p-4 space-y-2">
                        <p className="text-sm font-medium">팟 모집 안내</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• 댓글 작성자 옆 체크박스로 참가자 선택</li>
                          <li>• 익명 댓글 작성자는 선택 불가</li>
                          <li>• 최대 {mockPost.partyInfo.maxCount}명까지 선택 가능</li>
                          <li>• 2명 이상 선택 시 채팅방 개설 가능</li>
                          <li>• 채팅방 개설 시 모집이 완료됩니다</li>
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* 채팅방 개설 확인 모달 */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>채팅방 개설</DialogTitle>
            <DialogDescription>
              현재 참가자 {participants.length}명으로 채팅방을 개설하시겠습니까?
              <br />
              채팅방 개설 시 모집이 완료됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium mb-2">참가자 목록</p>
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <Badge key={p.id} variant="outline" className="bg-primary/10">
                  {p.nickname}
                </Badge>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChatModal(false)}>
              취소
            </Button>
            <Button onClick={handleCreateChatRoom}>채팅방 개설</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
