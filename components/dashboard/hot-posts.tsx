"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Flame, ChevronRight } from "lucide-react"
import Link from "next/link"
import { postApi } from "@/lib/api/api"
import type { PostResponseDto } from "@/lib/api/types"

export function HotPosts() {
  const [posts, setPosts] = useState<PostResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    postApi
      .getHot3Posts()
      .then((list) => {
        if (mounted) setPosts(list || [])
      })
      .catch((e: { message?: string; error?: string }) => {
        if (mounted) setError(e?.message || e?.error || "HOT 게시글을 불러오지 못했습니다.")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            실시간 HOT 3
          </CardTitle>
          <Link href="/community" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
            더보기 <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {loading && (
          <div className="space-y-2 py-4 text-center text-sm text-muted-foreground">로딩 중...</div>
        )}
        {error && (
          <div className="space-y-2 py-4 text-center text-sm text-destructive">{error}</div>
        )}
        {!loading && !error && (
          <div className="space-y-2">
            {posts.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">아직 HOT 게시글이 없습니다.</p>
            )}
            {posts.map((post, index) => (
              <Link
                key={post.postId}
                href={`/community/${post.postId}`}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{post.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {post.categoryName || "—"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{post.authorNickname}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Heart className="h-4 w-4 fill-current text-red-400" />
                  <span className="text-xs font-medium">{post.likeCount ?? 0}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
