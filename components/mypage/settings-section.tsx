"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Bell, DoorOpen, LogOut, ChevronRight, Settings } from "lucide-react"

export function SettingsSection() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          설정
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 divide-y lg:grid-cols-3 lg:divide-y-0 lg:divide-x">
          {/* 알림 설정 */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">알림 받기</p>
                <p className="text-sm text-muted-foreground">출석, 일정, 팟 알림</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          {/* 분반 탈퇴 */}
          <button className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <DoorOpen className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">분반 탈퇴</p>
                <p className="text-sm text-muted-foreground">활동 내역은 유지됩니다</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* 로그아웃 */}
          <button className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-600">로그아웃</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
