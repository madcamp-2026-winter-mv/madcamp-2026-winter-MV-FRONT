"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageSquare } from "lucide-react"
import { postApi } from "@/lib/api/api"
import type { PostResponseDto } from "@/lib/api/types"

function formatDate(s?: string) {
  if (!s) return "—"
  try {
    const d = new Date(s)
    return isNaN(d.getTime()) ? s : d.toLocaleString("ko-KR")
  } catch { return s }
}

export default function MyCommentsPage() {
  const [posts, setPosts] = useState<PostResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    postApi
      .getPostsICommented()
      .then((list) => { if (mounted) setPosts(Array.isArray(list) ? list : []) })
      .catch((e: { message?: string }) => { if (mounted) setError(e?.message || "목록을 불러오지 못했습니다.") })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <div className="ml-64">
        <DesktopHeader title="댓글 단 글" />
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
                댓글 단 글 <Badge variant="outline">{posts.length}개</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading && <div className="p-6 text-center text-muted-foreground">로딩 중...</div>}
              {error && <div className="p-6 text-center text-destructive">{error}</div>}
              {!loading && !error && (
                <div className="divide-y">
                  {posts.length === 0 && <div className="p-6 text-center text-muted-foreground">댓글 단 글이 없습니다.</div>}
                  {posts.map((post) => (
                    <Link key={post.postId} href={`/community/${post.postId}`}>
                      <div className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                            <MessageSquare className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold truncate">{post.title}</span>
                              <span className="text-xs text-muted-foreground shrink-0">by {post.authorNickname}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{formatDate(post.createdAt)}</p>
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
      </div>
    </div>
  )
}
