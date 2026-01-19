"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, MessageCircle, Users, ChevronRight, Activity } from "lucide-react"
import Link from "next/link"
import type { MemberResponseDto } from "@/lib/api/types"

const activityItems = (m: MemberResponseDto) => [
  { icon: FileText, label: "내가 쓴 글", count: m.writtenPostsCount, href: "/mypage/posts" },
  { icon: MessageCircle, label: "댓글 단 글", count: m.commentedPostsCount, href: "/mypage/comments" },
  { icon: Users, label: "진행 중인 팟", count: m.ongoingPartyCount, href: "/chat" },
]

interface ActivitySectionProps {
  member: MemberResponseDto | null
}

export function ActivitySection({ member }: ActivitySectionProps) {
  const items = member ? activityItems(member) : []

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />내 활동
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {items.length === 0 ? (
            <div className="px-6 py-8 text-center text-muted-foreground text-sm">활동 내역을 불러오는 중...</div>
          ) : (
            items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="text-lg font-semibold text-primary">{item.count}</span>
                  <ChevronRight className="h-5 w-5" />
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
