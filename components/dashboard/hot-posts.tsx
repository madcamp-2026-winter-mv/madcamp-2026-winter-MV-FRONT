"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Flame, ChevronRight } from "lucide-react"
import Link from "next/link"

interface HotPost {
  id: string
  title: string
  category: string
  likeCount: number
  author: string
}

const mockHotPosts: HotPost[] = [
  {
    id: "1",
    title: "2주차 프로젝트 후기 공유합니다",
    category: "자유게시판",
    likeCount: 15,
    author: "몰입하는 12",
  },
  {
    id: "2",
    title: "오늘 저녁 치킨 팟 구해요",
    category: "팟모집",
    likeCount: 8,
    author: "몰입하는 7",
  },
  {
    id: "3",
    title: "Flutter vs React Native 어떤거 쓰시나요?",
    category: "질문",
    likeCount: 12,
    author: "몰입하는 33",
  },
]

export function HotPosts() {
  return (
    <Card>
      <CardHeader className="pb-2">
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
      <CardContent>
        <div className="space-y-2">
          {mockHotPosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{post.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {post.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{post.author}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Heart className="h-4 w-4 fill-current text-red-400" />
                <span className="text-xs font-medium">{post.likeCount}</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
