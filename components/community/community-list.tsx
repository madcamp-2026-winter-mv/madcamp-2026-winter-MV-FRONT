"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Users, ChevronRight } from "lucide-react"
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
    isAnonymous?: boolean
  }
  likeCount: number
  commentCount: number
  createdAt: string
  isParty?: boolean
  partyInfo?: {
    currentCount: number
    maxCount: number
    isRecruiting: boolean
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
    partyInfo: { currentCount: 3, maxCount: 4, isRecruiting: true },
  },
  {
    id: "3",
    title: "Flutter vs React Native 어떤거 쓰시나요?",
    content: "다음 프로젝트에 뭘 쓸지 고민 중인데, 각각 장단점이 뭔가요?",
    category: "질문",
    author: { nickname: "익명", isAnonymous: true },
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
  {
    id: "5",
    title: "내일 아침 운동 같이 하실 분!",
    content: "N1 헬스장에서 7시에 만나요",
    category: "팟모집",
    author: { nickname: "몰입하는 5" },
    likeCount: 6,
    commentCount: 3,
    createdAt: "4시간 전",
    isParty: true,
    partyInfo: { currentCount: 2, maxCount: 3, isRecruiting: true },
  },
  {
    id: "6",
    title: "주말 등산 팟 (완료)",
    content: "계룡산 등산 다녀왔습니다!",
    category: "팟모집",
    author: { nickname: "몰입하는 19" },
    likeCount: 10,
    commentCount: 12,
    createdAt: "1일 전",
    isParty: true,
    partyInfo: { currentCount: 5, maxCount: 5, isRecruiting: false },
  },
  {
    id: "7",
    title: "[네이버] 2026 신입 개발자 채용",
    content: "네이버에서 신입 개발자를 모집합니다. 관심 있으신 분들은 확인해주세요.",
    category: "채용공고",
    author: { nickname: "몰입하는 3" },
    likeCount: 32,
    commentCount: 5,
    createdAt: "5시간 전",
  },
]

const categoryColors: Record<string, string> = {
  자유: "bg-blue-100 text-blue-700",
  질문: "bg-purple-100 text-purple-700",
  팟모집: "bg-green-100 text-green-700",
  정보공유: "bg-orange-100 text-orange-700",
  채용공고: "bg-red-100 text-red-700",
}

const categoryMap: Record<string, string> = {
  전체: "전체",
  자유: "자유",
  질문: "질문",
  팟모집: "팟모집",
  정보공유: "정보공유",
  채용공고: "채용공고",
}

interface CommunityListProps {
  selectedCategory?: string
}

export function CommunityList({ selectedCategory = "전체" }: CommunityListProps) {
  const isPartyTab = selectedCategory === "팟모집"
  
  // 카테고리에 따라 필터링
  const filteredPosts = selectedCategory === "전체" 
    ? mockPosts.filter(post => !post.isParty) // 전체에서는 팟모집 제외
    : mockPosts.filter(post => post.category === selectedCategory)
  
  // 팟모집 탭에서만 모집 중인 팟 배너 표시
  const recruitingParties = mockPosts.filter((post) => post.isParty && post.partyInfo?.isRecruiting)

  return (
    <div className="space-y-6">
      {/* 팟모집 탭에서만 모집 중인 팟 배너 표시 */}
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
                <Link key={party.id} href={`/community/${party.id}`}>
                  <div className="flex items-center gap-3 px-4 py-3 bg-background border rounded-lg hover:border-primary transition-colors min-w-[280px] cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{party.title}</p>
                      <p className="text-sm text-muted-foreground">{party.author.nickname}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-primary border-primary">
                        {party.partyInfo?.currentCount}/{party.partyInfo?.maxCount}
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

      {/* 게시글 목록 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredPosts.map((post) => (
          <Link key={post.id} href={`/community/${post.id}`}>
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    {post.author.isAnonymous ? (
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">익명</AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src={post.author.imageUrl || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {post.author.nickname.slice(-2)}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge className={cn("text-xs px-2 py-0.5", categoryColors[post.category] || "bg-muted")}>
                        {post.category}
                      </Badge>
                      {post.isParty && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            post.partyInfo?.isRecruiting
                              ? "border-green-500 text-green-600"
                              : "border-muted-foreground text-muted-foreground",
                          )}
                        >
                          {post.partyInfo?.isRecruiting ? "모집중" : "모집완료"}
                        </Badge>
                      )}
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

      {filteredPosts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>해당 카테고리에 게시글이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
