"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Users, CheckCircle2, Lock } from "lucide-react"

interface VoteOption {
  id: string
  label: string
  voteCount: number
}

interface Vote {
  id: string
  title: string
  description?: string
  author: {
    nickname: string
    imageUrl?: string
  }
  options: VoteOption[]
  totalVotes: number
  endTime: string
  isEnded: boolean
  hasVoted: boolean
  votedOptionId?: string
}

const mockVotes: Vote[] = [
  {
    id: "1",
    title: "이번 주 회식 메뉴 뭐 먹을까요?",
    description: "금요일 저녁 회식 메뉴를 정해봐요!",
    author: { nickname: "운영진" },
    options: [
      { id: "1-1", label: "삼겹살", voteCount: 12 },
      { id: "1-2", label: "치킨", voteCount: 8 },
      { id: "1-3", label: "피자", voteCount: 5 },
    ],
    totalVotes: 25,
    endTime: "오늘 18:00",
    isEnded: false,
    hasVoted: true,
    votedOptionId: "1-1",
  },
  {
    id: "2",
    title: "다음 주차 발표 시간대",
    author: { nickname: "운영진" },
    options: [
      { id: "2-1", label: "오전 10시", voteCount: 3 },
      { id: "2-2", label: "오후 2시", voteCount: 15 },
      { id: "2-3", label: "오후 4시", voteCount: 7 },
    ],
    totalVotes: 25,
    endTime: "내일 12:00",
    isEnded: false,
    hasVoted: false,
  },
  {
    id: "3",
    title: "가장 어려웠던 주차는?",
    author: { nickname: "몰입하는 5" },
    options: [
      { id: "3-1", label: "1주차", voteCount: 5 },
      { id: "3-2", label: "2주차", voteCount: 18 },
      { id: "3-3", label: "3주차", voteCount: 2 },
    ],
    totalVotes: 25,
    endTime: "종료됨",
    isEnded: true,
    hasVoted: true,
    votedOptionId: "3-2",
  },
]

export function VoteList() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {mockVotes.map((vote) => (
        <VoteCard key={vote.id} vote={vote} />
      ))}
    </div>
  )
}

function VoteCard({ vote }: { vote: Vote }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(vote.votedOptionId || null)
  const [hasVoted, setHasVoted] = useState(vote.hasVoted)

  const handleVote = (optionId: string) => {
    if (hasVoted || vote.isEnded) return
    setSelectedOption(optionId)
  }

  const submitVote = () => {
    if (!selectedOption) return
    setHasVoted(true)
  }

  const canSeeResults = hasVoted || vote.isEnded

  return (
    <Card className={vote.isEnded ? "opacity-75" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={vote.author.imageUrl || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {vote.author.nickname.slice(-2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-sm text-muted-foreground">{vote.author.nickname}</span>
            </div>
          </div>
          <Badge variant={vote.isEnded ? "secondary" : "default"} className="text-xs">
            {vote.isEnded ? "종료" : "진행중"}
          </Badge>
        </div>
        <CardTitle className="text-lg font-semibold mt-3">{vote.title}</CardTitle>
        {vote.description && <p className="text-sm text-muted-foreground">{vote.description}</p>}
      </CardHeader>
      <CardContent className="space-y-3">
        {vote.options.map((option) => {
          const percentage = canSeeResults ? Math.round((option.voteCount / vote.totalVotes) * 100) : 0
          const isSelected = selectedOption === option.id
          const isWinning =
            canSeeResults && option.voteCount === Math.max(...vote.options.map((o) => o.voteCount)) && !vote.isEnded

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted || vote.isEnded}
              className={`w-full text-left rounded-lg border p-4 transition-all ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : hasVoted || vote.isEnded
                    ? "border-border bg-muted/30"
                    : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>{option.label}</span>
                {canSeeResults && (
                  <div className="flex items-center gap-2">
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    <span className="text-sm font-semibold">{percentage}%</span>
                  </div>
                )}
              </div>
              {canSeeResults && (
                <Progress value={percentage} className={`h-2 ${isWinning ? "[&>div]:bg-primary" : ""}`} />
              )}
            </button>
          )
        })}

        {!canSeeResults && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            투표 후 결과를 확인할 수 있습니다
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {vote.totalVotes}명 참여
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {vote.endTime}
            </span>
          </div>
          {!hasVoted && !vote.isEnded && selectedOption && (
            <Button size="sm" onClick={submitVote} className="bg-primary text-primary-foreground hover:bg-primary/90">
              투표하기
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
