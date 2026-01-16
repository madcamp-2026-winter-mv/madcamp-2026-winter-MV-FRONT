import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { VoteList } from "@/components/vote/vote-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, BarChart3, Clock } from "lucide-react"

export default function VotePage() {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="ml-64">
        <DesktopHeader title="익명투표" />

        <main className="p-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
            {/* 메인 콘텐츠 */}
            <div className="xl:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="default" size="sm">
                    전체
                  </Button>
                  <Button variant="ghost" size="sm">
                    진행중
                  </Button>
                  <Button variant="ghost" size="sm">
                    종료됨
                  </Button>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />새 투표 만들기
                </Button>
              </div>
              <VoteList />
            </div>

            {/* 사이드 패널 */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    투표 통계
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">총 투표 수</span>
                    <span className="font-semibold">24개</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">진행중인 투표</span>
                    <span className="font-semibold text-primary">3개</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">내가 만든 투표</span>
                    <span className="font-semibold">2개</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    최근 종료된 투표
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["금주의 발표 주제", "다음 회식 메뉴", "팀 빌딩 날짜"].map((title) => (
                      <div
                        key={title}
                        className="rounded-lg bg-muted/50 p-2 text-sm hover:bg-muted cursor-pointer transition-colors"
                      >
                        {title}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
