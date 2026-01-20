"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Users, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { postApi } from "@/lib/api/api"
import type { PostResponseDto } from "@/lib/api/types"
import { PostType } from "@/lib/api/types"

const categoryColors: Record<string, string> = {
  자유: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  질문: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  팟모집: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  정보공유: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  채용공고: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

function formatTime(str?: string): string {
  if (!str) return "—"
  try {
    const d = new Date(str)
    if (isNaN(d.getTime())) return str
    const now = new Date()
    const diff = (now.getTime() - d.getTime()) / 60000
    if (diff < 1) return "방금 전"
    if (diff < 60) return `${Math.floor(diff)}분 전`
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`
    if (diff < 43200) return `${Math.floor(diff / 1440)}일 전`
    return d.toLocaleDateString("ko-KR")
  } catch {
    return str
  }
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get("q") || ""
  const page = Math.max(0, parseInt(searchParams.get("page") || "0", 10) || 0)

  const [searchInput, setSearchInput] = useState(q)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{ content: PostResponseDto[]; totalElements: number; totalPages: number } | null>(null)

  // URL과 로컬 입력 동기화 (예: 브라우저 뒤로가기)
  useEffect(() => {
    setSearchInput(q)
  }, [q])

  useEffect(() => {
    if (!q.trim()) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }
    let mounted = true
    setLoading(true)
    setError(null)
    postApi
      .searchPosts(q.trim(), page, 10)
      .then((res) => {
        if (mounted) setData({ content: res.content, totalElements: res.totalElements, totalPages: res.totalPages })
      })
      .catch((e: { message?: string; error?: string }) => {
        if (mounted) setError(e?.message || e?.error || "검색에 실패했습니다.")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [q, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const v = searchInput.trim()
    if (v) router.push(`/search?q=${encodeURIComponent(v)}&page=0`)
    else router.push("/search")
  }

  const goPage = (next: number) => {
    const p = Math.max(0, Math.min((data?.totalPages ?? 1) - 1, next))
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}&page=${p}`)
  }

  const authorNick = (p: PostResponseDto) => p.author?.nickname || p.authorNickname || "—"
  const isAnon = (p: PostResponseDto) => !!(p.author?.anonymous ?? (p.author as { isAnonymous?: boolean })?.isAnonymous)
  const catName = (p: PostResponseDto) => p.categoryName || "—"
  const timeStr = (p: PostResponseDto) => p.timeAgo || formatTime(p.createdAt)

  const totalPages = data?.totalPages ?? 0
  const content = data?.content ?? []
  const isEmpty = !q.trim()
  const noResults = !loading && !error && q.trim() && content.length === 0

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <div className="ml-64">
        <DesktopHeader title="게시글 검색" />

        <main className="p-6">
          <div className="mx-auto max-w-4xl">
            {/* 검색 폼 */}
            <form onSubmit={handleSearch} className="relative mb-8">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="제목·내용으로 검색..."
                className="h-12 pl-12 pr-4 text-base"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button type="submit" className="absolute right-2 top-1/2 h-8 -translate-y-1/2">
                검색
              </Button>
            </form>

            {isEmpty && (
              <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 py-16 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/60" />
                <p className="text-muted-foreground">검색어를 입력한 뒤 검색 버튼을 누르거나 Enter를 쳐 주세요.</p>
                <Link href="/community" className="mt-4 inline-block text-sm text-primary hover:underline">
                  커뮤니티로 이동
                </Link>
              </div>
            )}

            {!isEmpty && (
              <>
                {loading && (
                  <div className="py-12 text-center text-muted-foreground">검색 중...</div>
                )}
                {error && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 py-6 text-center text-destructive">
                    {error}
                  </div>
                )}

                {!loading && !error && noResults && (
                  <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 py-16 text-center">
                    <p className="text-muted-foreground">「{q}」에 대한 검색 결과가 없습니다.</p>
                    <Link href="/community" className="mt-4 inline-block text-sm text-primary hover:underline">
                      커뮤니티로 이동
                    </Link>
                  </div>
                )}

                {!loading && !error && content.length > 0 && (
                  <>
                    <p className="mb-4 text-sm text-muted-foreground">
                      「{q}」 검색 결과 <span className="font-medium text-foreground">{data?.totalElements ?? 0}</span>건
                    </p>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {content.map((post) => (
                        <Link key={post.postId} href={`/community/${post.postId}`}>
                          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                            <CardContent className="p-5">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-10 w-10 shrink-0">
                                  {isAnon(post) ? (
                                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">익명</AvatarFallback>
                                  ) : (
                                    <>
                                      {post.author?.imageUrl && <AvatarImage src={post.author.imageUrl} alt="" />}
                                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                        {String(authorNick(post)).slice(-2)}
                                      </AvatarFallback>
                                    </>
                                  )}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-2">
                                    <Badge className={cn("text-xs px-2 py-0.5", categoryColors[catName(post)] || "bg-muted")}>
                                      {catName(post)}
                                    </Badge>
                                    {post.type === PostType.PARTY && (
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "text-xs",
                                          post.partyInfo?.recruiting
                                            ? "border-green-500 text-green-600"
                                            : "border-muted-foreground text-muted-foreground"
                                        )}
                                      >
                                        {post.partyInfo?.recruiting ? "모집중" : "모집완료"}
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">{authorNick(post)}</span>
                                    {!isAnon(post) && post.author?.roomId != null && (
                                      <>
                                        <span className="text-xs text-muted-foreground">·</span>
                                        <span className="text-xs text-muted-foreground">{post.author.roomId} 분반</span>
                                      </>
                                    )}
                                    <span className="text-xs text-muted-foreground">·</span>
                                    <span className="text-xs text-muted-foreground">{timeStr(post)}</span>
                                  </div>
                                  <h3 className="font-semibold text-base mb-2 line-clamp-1">{post.title}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                                  <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                      <Heart className="h-4 w-4" />
                                      <span className="text-sm">{post.likeCount ?? 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                      <MessageCircle className="h-4 w-4" />
                                      <span className="text-sm">{post.commentCount ?? post.comments?.length ?? 0}</span>
                                    </div>
                                    {post.type === PostType.PARTY && (post.partyInfo || (post.currentParticipants != null && post.maxParticipants != null)) && (
                                      <div className="flex items-center gap-1.5 text-primary ml-auto">
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                          {post.partyInfo?.currentCount ?? post.currentParticipants ?? 0}/{post.partyInfo?.maxCount ?? post.maxParticipants ?? 0}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={page <= 0}
                          onClick={() => goPage(page - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground px-2">
                          {page + 1} / {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={page >= totalPages - 1}
                          onClick={() => goPage(page + 1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
