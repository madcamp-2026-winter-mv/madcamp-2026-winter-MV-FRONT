"use client"

import { useState } from "react"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Bell, Moon, Shield, HelpCircle, FileText } from "lucide-react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    comments: true,
    likes: true,
    teams: true,
    schedule: true,
  })
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState("ko")

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="ml-64">
        <DesktopHeader title="설정" />

        <main className="p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* 알림 설정 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>알림 설정</CardTitle>
                    <CardDescription>알림 수신 여부를 설정합니다</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>댓글 알림</Label>
                    <p className="text-sm text-muted-foreground">내 글에 댓글이 달리면 알림을 받습니다</p>
                  </div>
                  <Switch
                    checked={notifications.comments}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, comments: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>좋아요 알림</Label>
                    <p className="text-sm text-muted-foreground">내 글에 좋아요가 눌리면 알림을 받습니다</p>
                  </div>
                  <Switch
                    checked={notifications.likes}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, likes: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>팟 모집 알림</Label>
                    <p className="text-sm text-muted-foreground">팟 신청 결과를 알림으로 받습니다</p>
                  </div>
                  <Switch
                    checked={notifications.teams}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, teams: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>일정 알림</Label>
                    <p className="text-sm text-muted-foreground">분반 일정 알림을 받습니다</p>
                  </div>
                  <Switch
                    checked={notifications.schedule}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, schedule: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 화면 설정 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>화면 설정</CardTitle>
                    <CardDescription>화면 테마와 언어를 설정합니다</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>다크 모드</Label>
                    <p className="text-sm text-muted-foreground">어두운 테마를 사용합니다</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>언어</Label>
                    <p className="text-sm text-muted-foreground">서비스 언어를 선택합니다</p>
                  </div>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 기타 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>기타</CardTitle>
                    <CardDescription>서비스 관련 정보</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Shield className="h-4 w-4" />
                  개인정보 처리방침
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <FileText className="h-4 w-4" />
                  이용약관
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <HelpCircle className="h-4 w-4" />
                  도움말
                </Button>
                <Separator className="my-2" />
                <div className="px-3 py-2 text-sm text-muted-foreground">버전 1.0.0</div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
