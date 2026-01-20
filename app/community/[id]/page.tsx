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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Heart, MessageSquare, MessageCircle, MoreHorizontal, Send, Users, User } from "lucide-react"
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
    // ISO에 Z/타임존 없으면 UTC로 간주 후 KST로 표시 (LocalDateTime 서버 저장 대응)
    const str = /Z|[-+]\d{2}:?\d{2}$/.test(s) ? s : s + "Z"
    const d = new Date(str)
    return isNaN(d.getTime()) ? s : d.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
  } catch { return s }
}

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params?.id === "string" ? parseInt(params.id, 10) : NaN
  const postId = Number.isFinite(id) ? id : 0

  const [post, setPost] = useState<PostResponseDto | null>(null)
  const [myNickname, setMyNickname] = useState<string | null>(null)
  const [myProfileImage, setMyProfileImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newComment, setNewComment] = useState("")
  const [commentAnonymous, setCommentAnonymous] = useState(false)
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [selectedVoteOptions, setSelectedVoteOptions] = useState<number[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[]>([])
  const [togglingParticipantId, setTogglingParticipantId] = useState<number | null>(null)
  const [confirmingParty, setConfirmingParty] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState("")
  const [commentEditSubmitting, setCommentEditSubmitting] = useState(false)

  const authorName = post?.author?.nickname || post?.authorNickname || "—"
  const isAnonymous = !!(post?.author?.anonymous ?? (post?.author as { isAnonymous?: boolean })?.isAnonymous)
  // 백엔드가 이메일로 작성자 여부를 판별해 isAuthor 반환. 익명 글도 작성자에게 수정/삭제 노출.
  const isAuthor = post?.isAuthor === true
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
    postApi.getPostDetail(postId).then((p) => {
      setPost(p)
      // 댓글 삭제 시 참가자 목록에서도 제거된 뒤 반영된 tempParticipantIds로 동기화
      setSelectedParticipantIds(Array.isArray(p.tempParticipantIds) ? p.tempParticipantIds : [])
    }).catch(() => setPost(null))
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
          setMyProfileImage(m.profileImage ?? null)
          setEditTitle(p.title)
          setEditContent(p.content)
          setSelectedParticipantIds(Array.isArray(p.tempParticipantIds) ? p.tempParticipantIds : [])
        }
      })
      .catch((e: { message?: string; error?: string }) => {
        if (mounted) setError(e?.message || e?.error || "글을 불러오지 못했습니다.")
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
      await commentApi.createComment(postId, content, isParty ? undefined : commentAnonymous)
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

  const handleDelete = async () => {
    if (!postId || !window.confirm("이 글을 삭제할까요?")) return
    try {
      await postApi.deletePost(postId)
      toast({ title: "글이 삭제되었습니다." })
      router.push("/community")
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast({ title: "삭제 실패", description: err?.message, variant: "destructive" })
    }
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

  const handleToggleParticipant = async (memberId: number) => {
    if (!postId) return
    setTogglingParticipantId(memberId)
    try {
      const list = await partyApi.toggleTempParticipant(postId, memberId)
      setSelectedParticipantIds(list)
    } catch (e: unknown) {
      const err = e as { message?: string; error?: string }
      toast({ title: "참가자 선택 실패", description: err?.message || err?.error, variant: "destructive" })
    } finally {
      setTogglingParticipantId(null)
    }
  }

  const handleConfirmParty = async (): Promise<number | undefined> => {
    if (!postId || confirmingParty) return undefined
    const ids = [...new Set(selectedParticipantIds)]
    console.log("[채팅방개설] handleConfirmParty 시작", { postId, ids, idsTypes: ids.map((x) => typeof x) })
    if (ids.length === 0) {
      console.warn("[채팅방개설] 참가자 0명 → 중단")
      toast({ title: "참가자를 한 명 이상 선택해 주세요.", variant: "destructive" })
      return undefined
    }
    setConfirmingParty(true)
    try {
      console.log("[채팅방개설] partyApi.confirmParty 호출 직전", { postId, ids })
      const chatRoomId = await partyApi.confirmParty(postId, ids)
      console.log("[채팅방개설] handleConfirmParty 성공", { chatRoomId })
      toast({ title: "모집이 완료되었습니다. 채팅방에서 대화를 나눠보세요." })
      setSelectedParticipantIds([])
      refetch()
      return chatRoomId
    } catch (e: unknown) {
      const err = e as { message?: string; error?: string; statusCode?: number }
      console.error("[채팅방개설] handleConfirmParty 실패", {
        postId,
        ids,
        error: err,
        message: err?.message,
        errorField: err?.error,
        statusCode: err?.statusCode,
        full: JSON.stringify(e, Object.getOwnPropertyNames(Object(e))),
      })
      toast({ title: "채팅방 만들기 실패", description: err?.message || err?.error, variant: "destructive" })
      return undefined
    } finally {
      setConfirmingParty(false)
    }
  }

  const handleCommentEditStart = (c: CommentResponseDto) => {
    setEditingCommentId(c.commentId)
    setEditingCommentContent(c.content)
  }
  const handleCommentEditCancel = () => {
    setEditingCommentId(null)
    setEditingCommentContent("")
  }
  const handleCommentEditSave = async () => {
    if (editingCommentId == null || !editingCommentContent.trim() || commentEditSubmitting) return
    setCommentEditSubmitting(true)
    try {
      await commentApi.updateComment(editingCommentId, editingCommentContent.trim())
      handleCommentEditCancel()
      refetch()
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast({ title: "댓글 수정 실패", description: err?.message, variant: "destructive" })
    } finally {
      setCommentEditSubmitting(false)
    }
  }
  const handleCommentDelete = async (commentId: number) => {
    if (!window.confirm("이 댓글을 삭제할까요?")) return
    try {
      await commentApi.deleteComment(commentId)
      toast({ title: "댓글이 삭제되었습니다." })
      refetch()
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast({ title: "댓글 삭제 실패", description: err?.message, variant: "destructive" })
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
                            <>
                              {post?.author?.imageUrl && <AvatarImage src={post.author.imageUrl} alt="" />}
                              <AvatarFallback className="bg-primary text-primary-foreground">{String(authorName).slice(-2)}</AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {isAnonymous ? "익명" : authorName}
                            {!isAnonymous && post?.author?.roomId != null && (
                              <span className="font-normal text-muted-foreground ml-1">· {post.author.roomId} 분반</span>
                            )}
                          </p>
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
                              {voteOptions.map((opt) => {
                                const pct = totalVotes > 0 ? ((opt.count ?? 0) / totalVotes) * 100 : 0
                                return (
                                  <div key={opt.optionId} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>{opt.content}</span>
                                      <span className="font-medium">{Math.round(opt.percentage ?? pct)}%</span>
                                    </div>
                                    <Progress value={opt.percentage ?? pct} className="h-2" />
                                    <p className="text-xs text-muted-foreground">{opt.count ?? 0}표</p>
                                  </div>
                                )
                              })}
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
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="space-y-1">
                    <h3 className="font-semibold">댓글 {comments.length}개</h3>
                    {isParty && isAuthor && isRecruiting && (
                      <p className="text-xs text-muted-foreground">
                        댓글 작성자 옆의 체크박스를 클릭하여 참가자로 선택할 수 있습니다.
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={handleSubmitComment} className="space-y-3">
                      {!isParty && (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="comment-anonymous"
                            checked={commentAnonymous}
                            onCheckedChange={(v) => setCommentAnonymous(!!v)}
                          />
                          <Label htmlFor="comment-anonymous" className="text-sm cursor-pointer">익명으로 작성</Label>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <Avatar>
                          {myProfileImage && <AvatarImage src={myProfileImage} alt="" />}
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
                      {comments.map((c) => {
                        const isCommentAuthor = c.authorNickname === authorName
                        const canBeSelected = !c.isAnonymous && !isCommentAuthor && (c.memberId != null)
                        const isSelected = c.memberId != null && selectedParticipantIds.includes(c.memberId)
                        const canAddMore = maxCount <= 0 || 1 + selectedParticipantIds.length < maxCount
                        const showCheckbox = isParty && isAuthor && isRecruiting && canBeSelected
                        return (
                          <div
                            key={c.commentId}
                            className={`flex gap-3 p-3 rounded-lg transition-colors ${
                              isSelected ? "bg-primary/10 border border-primary/30" : ""
                            }`}
                          >
                            {showCheckbox ? (
                              <div className="flex items-center shrink-0">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => c.memberId != null && handleToggleParticipant(c.memberId)}
                                  disabled={(!isSelected && !canAddMore) || togglingParticipantId === c.memberId}
                                  className="border-primary data-[state=checked]:bg-primary"
                                />
                              </div>
                            ) : isParty && isAuthor && isRecruiting ? (
                              <div className="w-9 shrink-0" />
                            ) : null}
                            <Avatar className="shrink-0">
                              {!c.isAnonymous && c.imageUrl && <AvatarImage src={c.imageUrl} alt="" />}
                              <AvatarFallback className={isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}>
                                {c.isAnonymous ? "?" : String(c.authorNickname || "").slice(-2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold">{c.isAnonymous ? "익명" : c.authorNickname}</span>
                                {isSelected && <Badge className="bg-primary text-primary-foreground text-xs">참가자</Badge>}
                                {!c.isAnonymous && c.roomId != null && (
                                  <span className="text-xs text-muted-foreground">· {c.roomId} 분반</span>
                                )}
                                <span className="text-sm text-muted-foreground">{formatDate(c.createdAt)}</span>
                                {(c.isMine === true || c.mine === true) && editingCommentId !== c.commentId && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleCommentEditStart(c)}>수정</DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive" onClick={() => handleCommentDelete(c.commentId)}>삭제</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                              {editingCommentId === c.commentId ? (
                                <div className="mt-2 space-y-2">
                                  <Textarea value={editingCommentContent} onChange={(e) => setEditingCommentContent(e.target.value)} className="min-h-[60px]" />
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={handleCommentEditSave} disabled={commentEditSubmitting || !editingCommentContent.trim()}>{commentEditSubmitting ? "저장 중..." : "저장"}</Button>
                                    <Button size="sm" variant="outline" onClick={handleCommentEditCancel} disabled={commentEditSubmitting}>취소</Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="mt-1 text-foreground">{c.content}</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
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
                        <Badge className="bg-primary text-primary-foreground">
                          {isRecruiting ? 1 + selectedParticipantIds.length : currentCount}/{maxCount}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* 참가자 목록: 작성자 + (모집중일 때) 선택된 댓글 작성자 — 작성자/방문자 모두 노출 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          <Avatar className="h-8 w-8 shrink-0">
                            {!isAnonymous && post?.author?.imageUrl && <AvatarImage src={post.author.imageUrl} alt="" />}
                            <AvatarFallback className="bg-primary/20 text-primary text-xs">{String(authorName).slice(-2)}</AvatarFallback>
                          </Avatar>
                          <span className="flex-1 text-sm font-medium">{authorName}</span>
                          <Badge variant="outline" className="text-xs">작성자</Badge>
                        </div>
                        {isRecruiting && selectedParticipantIds.map((mid) => {
                          const c = comments.find((x) => x.memberId === mid)
                          const nick = c?.authorNickname ?? "?"
                          return (
                            <div key={mid} className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 border border-primary/30">
                              <Avatar className="h-8 w-8 shrink-0">
                                {c?.imageUrl && <AvatarImage src={c.imageUrl} alt="" />}
                                <AvatarFallback className="bg-primary/20 text-primary text-xs">{String(nick).slice(-2)}</AvatarFallback>
                              </Avatar>
                              <span className="flex-1 text-sm font-medium">{nick}</span>
                              <Badge className="bg-primary text-primary-foreground text-xs">참가자</Badge>
                            </div>
                          )
                        })}
                        {/* 빈 슬롯 (모집중일 때, 작성자/방문자 동일한 기준) */}
                        {isRecruiting && Array.from({ length: Math.max(0, maxCount - 1 - selectedParticipantIds.length) }).map((_, i) => (
                          <div key={`empty-${i}`} className="flex items-center gap-3 p-2 rounded-lg border border-dashed border-border">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <span className="text-muted-foreground text-xs">?</span>
                            </div>
                            <span className="flex-1 text-sm text-muted-foreground">빈 자리</span>
                          </div>
                        ))}
                      </div>

                      {isAuthor && isRecruiting && 1 + selectedParticipantIds.length >= 2 && (
                        <Button
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => setShowChatModal(true)}
                          disabled={confirmingParty}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          채팅방 만들기
                        </Button>
                      )}

                      {!isRecruiting && (
                        <div className="p-3 rounded-lg bg-muted text-center">
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


                    </CardContent>
                  </Card>

                  {isAuthor && isRecruiting && (
                    <Card className="border-primary/30 bg-primary/5">
                      <CardContent className="p-4 space-y-2">
                        <p className="text-sm font-medium">팟 모집 안내</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>· 댓글 작성자 옆 체크박스로 참가자 선택</li>
                          <li>· 2명 이상 선택 시 채팅방 개설 가능</li>
                          <li>· 채팅방 개설 시 모집이 완료됩니다</li>
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {!isAuthor && isRecruiting && (
                    <Card className="border-primary/30 bg-primary/5">
                      <CardContent className="p-4 space-y-2">
                        <p className="text-sm font-medium">팟 참가 안내</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>· 참가를 원한다면 댓글을 남겨주세요</li>
                          <li>· 댓글을 남기면 작성자가 참가시킬 수 있습니다</li>
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

      {/* 채팅방 개설 확인 모달 */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>채팅방 개설</DialogTitle>
            <DialogDescription>
              현재 참가자 {1 + selectedParticipantIds.length}명으로 채팅방을 개설하시겠습니까?
              <br />
              채팅방 개설 시 모집이 완료됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium mb-2">참가자 목록</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-primary/10">{authorName}</Badge>
              {selectedParticipantIds.map((mid) => {
                const c = comments.find((x) => x.memberId === mid)
                return <Badge key={mid} variant="outline" className="bg-primary/10">{c?.authorNickname ?? "?"}</Badge>
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChatModal(false)}>취소</Button>
            <Button
              onClick={async () => {
                console.log("[채팅방개설] 모달 '채팅방 개설' 클릭", { selectedParticipantIds })
                const chatRoomId = await handleConfirmParty()
                if (chatRoomId != null) {
                  console.log("[채팅방개설] 모달 → 채팅 이동", { chatRoomId })
                  setShowChatModal(false)
                  router.push(`/chat?room=${chatRoomId}`)
                }
              }}
              disabled={confirmingParty}
            >
              {confirmingParty ? "생성 중..." : "채팅방 개설"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
