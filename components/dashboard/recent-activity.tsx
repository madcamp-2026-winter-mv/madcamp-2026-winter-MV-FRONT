import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, MessageSquare, Vote, CheckCircle, Users } from "lucide-react"

interface ActivityItem {
  id: string
  type: "post" | "vote" | "attendance" | "party"
  content: string
  time: string
  user: string
}

const mockActivities: ActivityItem[] = [
  { id: "1", type: "post", content: "새 게시글: 'React 19 새로운 기능 정리'", time: "5분 전", user: "몰입하는 12" },
  { id: "2", type: "vote", content: "투표 종료: '금주의 발표 주제'", time: "15분 전", user: "시스템" },
  { id: "3", type: "attendance", content: "출석 체크 완료 (23/25명)", time: "1시간 전", user: "시스템" },
  { id: "4", type: "party", content: "팟 모집: '저녁 치킨 팟' 마감", time: "2시간 전", user: "몰입하는 7" },
  { id: "5", type: "post", content: "새 댓글: '프로젝트 후기' 게시글", time: "3시간 전", user: "몰입하는 33" },
]

const typeIcons = {
  post: MessageSquare,
  vote: Vote,
  attendance: CheckCircle,
  party: Users,
}

const typeBadges = {
  post: { label: "게시글", variant: "default" as const },
  vote: { label: "투표", variant: "secondary" as const },
  attendance: { label: "출석", variant: "outline" as const },
  party: { label: "팟", variant: "secondary" as const },
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          최근 활동
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockActivities.map((activity) => {
            const Icon = typeIcons[activity.type]
            const badge = typeBadges[activity.type]
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={badge.variant} className="text-xs">
                      {badge.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                  <p className="text-sm truncate">{activity.content}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.user}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
