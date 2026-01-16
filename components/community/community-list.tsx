"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Users } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Post {
  id: string
  title: string
  content: string
  category: string
  author: {
    nickname: string
    imageUrl?: string
  }
  likeCount: number
  commentCount: number
  createdAt: string
  isParty?: boolean
  partyInfo?: {
    currentCount: number
    maxCount: number
  }
}

const mockPosts: Post[] = [
  {
    id: "1",
    title: "2주차 프로젝트 후기 공유합니다",
    content: "이번 주차에 React Native로 앱 만들면서 정말 많이 배웠어요. 특히 네비게이션 부분이...",
    category: "자유",
    author: { nickname: "몰입하는 12" },
    likeCount: 15,
    commentCount: 8,
    createdAt: "30분 전",
  },
  {
    id: "2",
    title: "오늘 저녁 치킨 팟 구해요 (6시 출발)",
    content: "BBQ 황금올리브 먹으러 갈 분~ 같이 가요!",
    category: "팟모집",
    author: { nickname: "몰입하는 7" },
    likeCount: 8,
    commentCount: 5,
    createdAt: "1시간 전",
    isParty: true,
    partyInfo: { currentCount: 3, maxCount: 4 },
  },
  {
    id: "3",
    title: "Flutter vs React Native 어떤거 쓰시나요?",
    content: "다음 프로젝트에 뭘 쓸지 고민 중인데, 각각 장단점이 뭔가요?",
    category: "질문",
    author: { nickname: "몰입하는 33" },
    likeCount: 12,
    commentCount: 15,
    createdAt: "2시간 전",
  },
  {
    id: "4",
    title: "유용한 VS Code 익스텐션 공유",
    content: "개발할 때 쓰면 좋은 익스텐션들 정리해봤습니다. 1. Prettier, 2. ESLint...",
    category: "정보공유",
    author: { nickname: "몰입하는 21" },
    likeCount: 25,
    commentCount: 7,
    createdAt: "3시간 전",
  },
]

const categoryColors: Record<string, string> = {
  자유: "bg-blue-100 text-blue-700",
  질문: "bg-purple-100 text-purple-700",
  팟모집: "bg-green-100 text-green-700",
  정보공유: "bg-orange-100 text-orange-700",
}

export function CommunityList() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {mockPosts.map((post) => (
        <Link key={post.id} href={`/community/${post.id}`}>
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={post.author.imageUrl || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {post.author.nickname.slice(-2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge className={cn("text-xs px-2 py-0.5", categoryColors[post.category] || "bg-muted")}>
                      {post.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{post.author.nickname}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                  </div>
                  <h3 className="font-semibold text-base mb-2 line-clamp-1">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{post.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.commentCount}</span>
                    </div>
                    {post.isParty && post.partyInfo && (
                      <div className="flex items-center gap-1.5 text-primary ml-auto">
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {post.partyInfo.currentCount}/{post.partyInfo.maxCount}
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
  )
}
