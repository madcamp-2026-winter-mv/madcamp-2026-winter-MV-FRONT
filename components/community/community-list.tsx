"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Users, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPosts } from "@/lib/api"

// 프론트엔드 컴포넌트가 사용하는 데이터 구조
interface Post {
  id: number
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
  isParty: boolean
  partyInfo?: {
    currentCount: number
    maxCount: number
    isRecruiting: boolean
  }
}

const categoryColors: Record<string, string> = {
  자유: "bg-blue-100 text-blue-700",
  질문: "bg-purple-100 text-purple-700",
  팟모집: "bg-green-100 text-green-700",
  정보공유: "bg-orange-100 text-orange-700",
  채용공고: "bg-red-100 text-red-700",
}

// 날짜 포맷팅 함수
function formatTimeAgo(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "방금 전"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

interface CommunityListProps {
  selectedCategory?: string
}

export function CommunityList({ selectedCategory = "전체" }: CommunityListProps) {
  const isPartyTab = selectedCategory === "팟모집"
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await getPosts(selectedCategory)
        const rawData = response.content || response 

        const mappedData = rawData.map((item: any) => ({
          // 1. 기본 ID
          id: item.postId, 

          // 2. 기본 정보
          title: item.title,
          content: item.content,
          category: item.categoryName || "기타", 
          
          // 3. 작성자 정보 (authorNickname 필드 사용)
          author: {
            nickname: item.authorNickname || "익명",
            imageUrl: item.author?.imageUrl, 
            isAnonymous: false,
          },
          
          // 4. 숫자 정보
          likeCount: item.likeCount || 0,
          commentCount: item.commentCount ?? (item.comments ? item.comments.length : 0),
          createdAt: formatTimeAgo(item.createdAt), 
          
          // 5. 팟 모집 정보 매핑 
          isParty: item.type === "PARTY",

          partyInfo: item.type === "PARTY" ? {
            currentCount: item.currentParticipants || 1,
            maxCount: item.maxParticipants || 4,
            isRecruiting: (item.currentParticipants || 0) < (item.maxParticipants || 0)
          } : undefined
        }))

        setPosts(mappedData)
      } catch (error) {
        console.error("게시글 불러오기 실패:", error)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedCategory])

  // 모집 중인 팟 필터링
  const recruitingParties = posts.filter((post) => post.isParty && post.partyInfo?.isRecruiting)

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">게시글을 불러오는 중...</div>
  }

  return (
    <div className="space-y-6">
      {/* 팟모집 탭일 때 상단 배너 */}
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
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {recruitingParties.map((party) => (
                <Link key={party.id} href={`/community/${party.id}`}>
                  <div className="flex items-center gap-3 px-4 py-3 bg-background border rounded-lg hover:border-primary transition-colors min-w-[280px] cursor-pointer shadow-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{party.title}</p>
                      <p className="text-sm text-muted-foreground">{party.author.nickname}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-primary border-primary bg-primary/5">
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

      {/* 게시글 리스트 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.id} href={`/community/${post.id}`}>
            <Card className="h-full hover:border-primary/50 transition-all hover:shadow-md cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 shrink-0 border">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {post.author.nickname.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge className={cn("text-xs px-2 py-0.5 border-0", categoryColors[post.category] || "bg-gray-100 text-gray-700")}>
                        {post.category}
                      </Badge>
                      {post.isParty && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            post.partyInfo?.isRecruiting
                              ? "border-green-500 text-green-600 bg-green-50"
                              : "border-gray-400 text-gray-500 bg-gray-50",
                          )}
                        >
                          {post.partyInfo?.isRecruiting ? "모집중" : "모집완료"}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground px-1">|</span>
                      <span className="text-xs text-muted-foreground">{post.author.nickname}</span>
                      <span className="text-xs text-muted-foreground px-1">·</span>
                      <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                    </div>
                    <h3 className="font-semibold text-base mb-2 line-clamp-1">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{post.content}</p>

                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        <span className="text-xs">{post.likeCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">{post.commentCount}</span>
                      </div>
                      {post.isParty && post.partyInfo && (
                        <div className="flex items-center gap-1.5 text-primary ml-auto bg-primary/5 px-2 py-1 rounded-full">
                          <Users className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">
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

      {posts.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
            <MessageCircle className="h-10 w-10 mb-3 opacity-20" />
            <p>아직 작성된 게시글이 없습니다.</p>
        </div>
      )}
    </div>
  )
}