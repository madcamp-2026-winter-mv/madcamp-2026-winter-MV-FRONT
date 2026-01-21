"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { ContentArea } from "@/components/layout/sidebar-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, MessageSquare } from "lucide-react"
import { postApi } from "@/lib/api/api"
import type { PostResponseDto } from "@/lib/api/types"

function formatDate(s?: string) {
  if (!s) return "—"
  try {
    const d = new Date(s)
    return isNaN(d.getTime()) ? s : d.toLocaleDateString("ko-KR")
  } catch { return s }
}

export default function MyPostsPage() {
  const [posts, setPosts] = useState<PostResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    postApi
      .getMyPosts()
      .then((list) => { if (mounted) setPosts(Array.isArray(list) ? list : []) })
      .catch((e: { message?: string }) => { if (mounted) setError(e?.message || "목록을 불러오지 못했습니다.") })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <ContentArea>
        <DesktopHeader title="내가 쓴 글" />
        <main className="p-6">
          <div className="mb-6">
            <Link href="/mypage">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                마이페이지로
              </Button>
            </Link>
          </div>
          <Card className="mx-auto max-w-3xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                내가 쓴 글 <Badge variant="outline">{posts.length}개</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading && <div className="p-6 text-center text-muted-foreground">로딩 중...</div>}
              {error && <div className="p-6 text-center text-destructive">{error}</div>}
              {!loading && !error && (
                <div className="divide-y">
                  {posts.length === 0 && <div className="p-6 text-center text-muted-foreground">작성한 글이 없습니다.</div>}
                  {posts.map((post) => (
                    <Link key={post.postId} href={`/community/${post.postId}`}>
                      <div className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">{post.categoryName || "—"}</Badge>
                              <span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span>
                            </div>
                            <h4 className="font-semibold truncate">{post.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{post.content}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
                            <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{post.likeCount ?? 0}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" />{post.commentCount ?? post.comments?.length ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </ContentArea>
    </div>
  )
}
