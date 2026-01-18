"use client"

import Link from "next/link"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, MessageSquare } from "lucide-react"

const mockPosts = [
  {
    id: 1,
    title: "1주차 프로젝트 후기",
    category: "자유",
    content: "안녕하세요, 몰입캠프 1주차 프로젝트를 마치고 후기를 남깁니다...",
    likes: 12,
    comments: 5,
    createdAt: "2025-01-15",
  },
  {
    id: 2,
    title: "RecyclerView 질문있습니다",
    category: "질문",
    content: "RecyclerView에서 아이템 클릭 이벤트를 어떻게 처리하나요?",
    likes: 3,
    comments: 8,
    createdAt: "2025-01-14",
  },
  {
    id: 3,
    title: "2주차 팀원 모집합니다",
    category: "팟모집",
    content: "웹 개발에 관심있는 팀원을 모집합니다!",
    likes: 7,
    comments: 12,
    createdAt: "2025-01-13",
  },
]

export default function MyPostsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="ml-64">
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
                내가 쓴 글<Badge variant="outline">{mockPosts.length}개</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockPosts.map((post) => (
                  <Link key={post.id} href={`/community/${post.id}`}>
                    <div className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {post.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                          </div>
                          <h4 className="font-semibold truncate">{post.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{post.content}</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
