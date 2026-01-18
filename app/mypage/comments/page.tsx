"use client"

import Link from "next/link"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageSquare } from "lucide-react"

const mockCommentedPosts = [
  {
    id: 1,
    postTitle: "안드로이드 초보 질문입니다",
    postAuthor: "이코딩",
    myComment: "저도 처음에 그랬는데, 공식 문서 보시면 도움이 됩니다!",
    createdAt: "2025-01-15 15:30",
  },
  {
    id: 2,
    postTitle: "1주차 회고",
    postAuthor: "박개발",
    myComment: "수고하셨습니다! 다음 주도 화이팅이에요~",
    createdAt: "2025-01-14 20:00",
  },
  {
    id: 3,
    postTitle: "팀원 모집합니다 (2주차)",
    postAuthor: "최협업",
    myComment: "관심있습니다! DM 드려도 될까요?",
    createdAt: "2025-01-14 10:30",
  },
  {
    id: 4,
    postTitle: "Kotlin vs Java 어떤 게 나을까요?",
    postAuthor: "정프로",
    myComment: "Kotlin 추천드립니다. 문법이 더 간결해요.",
    createdAt: "2025-01-13 16:45",
  },
]

export default function MyCommentsPage() {
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
                댓글 단 글<Badge variant="outline">{mockCommentedPosts.length}개</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockCommentedPosts.map((item) => (
                  <Link key={item.id} href={`/community/${item.id}`}>
                    <div className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold truncate">{item.postTitle}</span>
                            <span className="text-xs text-muted-foreground shrink-0">by {item.postAuthor}</span>
                          </div>
                          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-2 mt-2">
                            "{item.myComment}"
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">{item.createdAt}</p>
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
