"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Users, ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { postApi, categoryApi } from "@/lib/api/api"
import type { PostResponseDto, CategoryDto } from "@/lib/api/types"
import { PostType } from "@/lib/api/types"

const categoryColors: Record<string, string> = {
  자유: "bg-blue-100 text-blue-700",
  질문: "bg-purple-100 text-purple-700",
  팟모집: "bg-green-100 text-green-700",
  정보공유: "bg-orange-100 text-orange-700",
  채용공고: "bg-red-100 text-red-700",
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

interface CommunityListProps {
  selectedCategory?: string
  refreshKey?: number
  categoriesRefreshKey?: number
}

export function CommunityList({ selectedCategory = "전체", refreshKey = 0, categoriesRefreshKey = 0 }: CommunityListProps) {
  const [posts, setPosts] = useState<PostResponseDto[]>([])
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isPartyTab = selectedCategory === "팟모집"

  useEffect(() => {
    categoryApi.getAllCategories().then((list) => setCategories(Array.isArray(list) ? list : [])).catch(() => setCategories([]))
  }, [categoriesRefreshKey])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    const run = async () => {
      try {
        let list: PostResponseDto[] = []
        if (selectedCategory === "전체") {
          list = await postApi.getAllPosts()
        } else {
          const cat = categories.find((c) => c.name === selectedCategory)
          if (cat) {
            list = await postApi.getPostsByCategory(cat.categoryId)
          } else {
            list = await postApi.getAllPosts()
            list = list.filter((p) => (p.categoryName || "") === selectedCategory)
          }
        }
        if (mounted) setPosts(Array.isArray(list) ? list : [])
      } catch (e: unknown) {
        const err = e as { message?: string; error?: string }
        if (mounted) setError(err?.message || err?.error || "목록을 불러오지 못했습니다.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    run()
    return () => { mounted = false }
  }, [selectedCategory, categories, refreshKey])

  const recruitingParties = posts.filter((p) => p.type === PostType.PARTY && p.partyInfo?.recruiting)
  // 전체: 모든 글 표시(팟모집 포함). 카테고리별: 해당 카테고리 글만. 팟모집 탭은 PARTY만 표시(백엔드 보완).
  const filtered = isPartyTab
    ? posts.filter((p) => p.type === PostType.PARTY)
    : posts
  // 최신 글 상단
  const filteredPosts = [...filtered].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  )

  const authorNick = (p: PostResponseDto) => p.author?.nickname || p.authorNickname || "—"
  const isAnon = (p: PostResponseDto) => !!(p.author?.anonymous ?? (p.author as { isAnonymous?: boolean })?.isAnonymous)
  const catName = (p: PostResponseDto) => p.categoryName || "—"
  const timeStr = (p: PostResponseDto) => p.timeAgo || formatTime(p.createdAt)

  return (
    <div className="space-y-6">
      {loading && (
        <div className="py-12 text-center text-muted-foreground">로딩 중...</div>
      )}
      {error && (
        <div className="py-12 text-center text-destructive">{error}</div>
      )}

      {!loading && !error && (
        <>
          {isPartyTab && recruitingParties.length > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-foreground">모집 중인 팟</span>
                    <Badge className="bg-primary text-primary-foreground">{recruitingParties.length}</Badge>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {recruitingParties.map((party) => (
                    <Link key={party.postId} href={`/community/${party.postId}`}>
                      <div className="flex items-center gap-3 px-4 py-3 bg-background border rounded-lg hover:border-primary transition-colors min-w-[280px] cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{party.title}</p>
                          <p className="text-sm text-muted-foreground">{authorNick(party)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-primary border-primary">
                            {party.partyInfo?.currentCount ?? party.currentParticipants ?? 0}/{party.partyInfo?.maxCount ?? party.maxParticipants ?? 0}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredPosts.map((post) => (
              <Link key={post.postId} href={`/community/${post.postId}`}>
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 shrink-0">
                        {isAnon(post) ? (
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">익명</AvatarFallback>
                        ) : (
                          <>
                            <AvatarImage src={post.author?.imageUrl || "/placeholder.svg"} />
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
                                  : "border-muted-foreground text-muted-foreground",
                              )}
                            >
                              {post.partyInfo?.recruiting ? "모집중" : "모집완료"}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{authorNick(post)}</span>
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

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>해당 카테고리에 게시글이 없습니다.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
