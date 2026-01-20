"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
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
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Heart, MessageSquare, Share, MoreHorizontal, Send, Users, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { postApi, commentApi, memberApi, voteApi, partyApi } from "@/lib/api/api"
import type { PostResponseDto, CommentResponseDto } from "@/lib/api/types"
import { PostType } from "@/lib/api/types"
import { toast } from "@/hooks/use-toast"

function formatDate(s?: string) {
  if (!s) return "—"
  try {
    const d = new Date(s)
    return isNaN(d.getTime()) ? s : d.toLocaleString("ko-KR")
  } catch { return s }
}

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params?.id === "string" ? parseInt(params.id, 10) : NaN
  const postId = Number.isFinite(id) ? id : 0

  const [post, setPost] = useState<PostResponseDto | null>(null)
  const [myNickname, setMyNickname] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newComment, setNewComment] = useState("")
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [selectedVoteOptions, setSelectedVoteOptions] = useState<number[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[]>([])
  const [confirmingParty, setConfirmingParty] = useState(false)

  const authorName = post?.author?.nickname || post?.authorNickname || "—"
  const isAnonymous = !!(post?.author?.anonymous ?? (post?.author as { isAnonymous?: boolean })?.isAnonymous)
  const isAuthor = post?.isAuthor ?? !!(myNickname && myNickname === authorName)
  const comments: CommentResponseDto[] = post?.comments ?? []
  const likeCount = post?.likeCount ?? 0
  const isLiked = post?.liked ?? false
  const isParty = post?.type === PostType.PARTY
  const partyInfo = post?.partyInfo
  const isRecruiting = partyInfo?.recruiting ?? false
  const maxCount = partyInfo?.maxCount ?? post?.maxParticipants ?? 0
  const currentCount = partyInfo?.currentCount ?? post?.currentParticipants ?? 0
  const isFull = maxCount > 0 && currentCount >= maxCount
  const voteOptions = post?.voteOptions ?? []
  const hasVote = voteOptions.length > 0
  const hasVoted = post?.voted ?? post?.isVoted ?? false

  const refetch = () => {
    if (!postId) return
    postApi.getPostDetail(postId).then(setPost).catch(() => setPost(null))
  }

  useEffect(() => {
    if (!postId) {
      setLoading(false)
      setError("올바르지 않은 게시글입니다.")
      return
    }
    let mounted = true
    setLoading(true)
    setError(null)
    Promise.all([postApi.getPostDetail(postId), memberApi.getMyInfo()])
      .then(([p, m]) => {
        if (mounted) {
          setPost(p)
          setMyNickname(m.nickname)
          setEditTitle(p.title)
          setEditContent(p.content)
        }
      })
      .catch((e: { message?: string }) => {
        if (mounted) setError(e?.message || "글을 불러오지 못했습니다.")
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [postId])

  const handleLike = async () => {
    if (!postId) return
    try {
      await postApi.toggleLike(postId)
      refetch()
    } catch { /* ignore */ }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = newComment.trim()
    if (!content || !postId || commentSubmitting) return
    setCommentSubmitting(true)
    try {
      await commentApi.createComment(postId, content)
      setNewComment("")
      refetch()
    } catch { /* ignore */ }
    finally { setCommentSubmitting(false) }
  }

  const handleVote = async () => {
    if (!postId || selectedVoteOptions.length === 0) return
    try {
      await voteApi.castVote(postId, { optionId: selectedVoteOptions[0] })
      refetch()
    } catch { /* ignore */ }
  }

  const handleVoteOptionToggle = (optionId: number) => {
    setSelectedVoteOptions([optionId])
  }

  const handleJoinParty = async () => {
    if (!postId || isFull || !isRecruiting) return
    try {
      await postApi.joinParty(postId)
      refetch()
    } catch { /* ignore */ }
  }

  const handleDelete = async () => {
    if (!postId || !window.confirm("이 글을 삭제할까요?")) return
    try {
      await postApi.deletePost(postId)
      router.push("/community")
    } catch { /* ignore */ }
  }

  const handleEditSave = async () => {
    if (!postId || !post || editSubmitting) return
    setEditSubmitting(true)
    try {
      await postApi.updatePost(postId, { title: editTitle, content: editContent, type: post.type })
      setEditOpen(false)
      refetch()
    } catch { /* ignore */ }
    finally { setEditSubmitting(false) }
  }

  // 익명이 아닌 댓글만 참가 후보 (memberId 있음). 글 작성자 본인 댓글 제외.
  const eligibleComments = comments.filter(
    (c) => c.memberId != null && c.authorNickname !== authorName
  )
  const toggleParticipant = (memberId: number) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    )
  }

  const handleConfirmParty = async () => {
    if (!postId || confirmingParty) return
    const ids = [...new Set(selectedParticipantIds)]
    if (ids.length === 0) {
      toast({ title: "참가자를 한 명 이상 선택해 주세요.", variant: "destructive" })
      return
    }
    setConfirmingParty(true)
    try {
      await partyApi.confirmParty(postId, ids)
      toast({ title: "모집이 완료되었습니다. 채팅방에서 대화를 나눠보세요." })
      setSelectedParticipantIds([])
      refetch()
      // TODO: 생성된 채팅방으로 deep link (/chat?room={chatRoomId})
    } catch (e: unknown) {
      const err = e as { message?: string; error?: string }
      toast({ title: "채팅방 만들기 실패", description: err?.message || err?.error, variant: "destructive" })
    } finally {
      setConfirmingParty(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DesktopSidebar />
        <div className="ml-64">
          <DesktopHeader title="게시글" />
          <main className="p-6 flex items-center justify-center min-h-[40vh]">
            <p className="text-muted-foreground">로딩 중...</p>
          </main>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <DesktopSidebar />
        <div className="ml-64">
          <DesktopHeader title="게시글" />
          <main className="p-6">
            <Link href="/community"><Button variant="ghost" className="gap-2"><ArrowLeft className="h-4 w-4" />목록으로</Button></Link>
            <p className="mt-4 text-destructive">{error || "글을 찾을 수 없습니다."}</p>
          </main>
        </div>
      </div>
    )
  }

  const totalVotes = voteOptions.reduce((s, o) => s + (o.count ?? 0), 0)

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
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {isAnonymous ? (
                            <AvatarFallback className="bg-muted"><User className="h-4 w-4 text-muted-foreground" /></AvatarFallback>
                          ) : (
                            <AvatarFallback className="bg-primary text-primary-foreground">{String(authorName).slice(-2)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-semibold">{isAnonymous ? "익명" : authorName}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(post.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">{post.categoryName || "—"}</Badge>
                        {isParty && (
                          <Badge variant="outline" className={!isRecruiting || isFull ? "border-muted-foreground text-muted-foreground" : "border-primary text-primary"}>
                            {!isRecruiting || isFull ? "모집완료" : "모집중"}
                          </Badge>
                        )}
                        {isAuthor && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditTitle(post.title); setEditContent(post.content); setEditOpen(true); }}>수정하기</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>삭제하기</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <h1 className="text-2xl font-bold">{post.title}</h1>
                    <p className="whitespace-pre-wrap leading-relaxed text-foreground">{post.content}</p>

                    {hasVote && voteOptions.length > 0 && (
                      <Card className="border-2 border-primary/20 bg-primary/5">
                        <CardContent className="p-4 space-y-4">
                          <h3 className="font-semibold flex items-center gap-2"><span className="text-lg">📊</span>투표</h3>
                          {!hasVoted ? (
                            <>
                              <div className="space-y-2">
                                {voteOptions.map((opt) => (
                                  <div
                                    key={opt.optionId}
                                    onClick={() => handleVoteOptionToggle(opt.optionId)}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedVoteOptions.includes(opt.optionId) ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Checkbox checked={selectedVoteOptions.includes(opt.optionId)} className="pointer-events-none" />
                                      <span>{opt.content}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <Button onClick={handleVote} disabled={selectedVoteOptions.length === 0} className="w-full">투표하기</Button>
                            </>
                          ) : (
                            <div className="space-y-3">
                              {voteOptions.map((opt) => (
                                <div key={opt.optionId} className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>{opt.content}</span>
                                    <span className="font-medium">{opt.percentage != null ? Math.round(opt.percentage) : 0}%</span>
                                  </div>
                                  <Progress value={opt.percentage ?? 0} className="h-2" />
                                  <p className="text-xs text-muted-foreground">{opt.count ?? 0}표</p>
                                </div>
                              ))}
                              <p className="text-sm text-center text-muted-foreground pt-2">총 {totalVotes}명 참여</p>
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
                      <Button variant="ghost" className="gap-2"><Share className="h-5 w-5" />공유</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><h3 className="font-semibold">댓글 {comments.length}개</h3></CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={handleSubmitComment} className="space-y-3">
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">{String(myNickname || "").slice(-2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-1 gap-2">
                          <Textarea
                            placeholder="댓글을 입력하세요..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[60px] flex-1 resize-none"
                            disabled={commentSubmitting}
                          />
                          <Button type="submit" size="icon" disabled={commentSubmitting || !newComment.trim()}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </form>
                    <Separator />
                    <div className="space-y-4">
                      {comments.map((c) => (
                        <div key={c.commentId} className="flex gap-3 p-3 rounded-lg">
                          <Avatar>
                            <AvatarFallback className="bg-muted">{String(c.authorNickname || "").slice(-2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{c.authorNickname}</span>
                              <span className="text-sm text-muted-foreground">{formatDate(c.createdAt)}</span>
                            </div>
                            <p className="mt-1 text-foreground">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {isParty && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          참가자
                        </h3>
                        <Badge className="bg-primary text-primary-foreground">{currentCount}/{maxCount}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {!isRecruiting && (
                        <div className="p-3 rounded-lg bg-muted text-center">
                          <p className="text-sm font-medium text-muted-foreground">모집이 완료되었습니다</p>
                          <Link href="/chat">
                            <Button variant="outline" size="sm" className="mt-2 bg-transparent">채팅방으로 이동</Button>
                          </Link>
                        </div>
                      )}
                      {!isAuthor && isRecruiting && !isFull && (
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleJoinParty}>
                          <Users className="h-4 w-4 mr-2" />
                          참가하기
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {isAuthor && isRecruiting && (
                    <Card className="border-primary/30 bg-primary/5">
                      <CardHeader className="pb-2">
                        <h3 className="font-semibold text-sm">참가자 등록</h3>
                        <p className="text-xs text-muted-foreground">댓글을 달린 사용자 중 참가할 멤버를 골라 채팅방을 만드세요.</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {eligibleComments.length === 0 ? (
                          <p className="text-sm text-muted-foreground">참가 후보가 없습니다. 댓글이 달리면 여기에 표시됩니다.</p>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {eligibleComments.map((c) => (
                              <div
                                key={c.commentId}
                                className="flex items-center gap-2 p-2 rounded border bg-background"
                              >
                                <Checkbox
                                  id={`participant-${c.commentId}`}
                                  checked={c.memberId != null && selectedParticipantIds.includes(c.memberId)}
                                  onCheckedChange={() => c.memberId != null && toggleParticipant(c.memberId)}
                                />
                                <Label htmlFor={`participant-${c.commentId}`} className="flex-1 cursor-pointer text-sm">
                                  {c.authorNickname}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          className="w-full"
                          onClick={handleConfirmParty}
                          disabled={selectedParticipantIds.length === 0 || confirmingParty}
                        >
                          {confirmingParty ? "생성 중..." : "채팅방 만들기"}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>글 수정</DialogTitle>
            <DialogDescription>제목과 내용을 수정하세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>제목</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="제목" />
            </div>
            <div className="space-y-2">
              <Label>내용</Label>
              <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="min-h-[120px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>취소</Button>
            <Button onClick={handleEditSave} disabled={editSubmitting}>{editSubmitting ? "저장 중..." : "저장"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
