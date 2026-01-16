"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, MessageCircle, Users, ChevronRight, Activity } from "lucide-react"
import Link from "next/link"

const activityItems = [
  {
    icon: FileText,
    label: "내가 쓴 글",
    count: 12,
    href: "/mypage/posts",
  },
  {
    icon: MessageCircle,
    label: "댓글 단 글",
    count: 28,
    href: "/mypage/comments",
  },
  {
    icon: Users,
    label: "진행 중인 팟",
    count: 2,
    href: "/mypage/parties",
  },
]

export function ActivitySection() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />내 활동
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {activityItems.map((item) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
