"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Users, Bell, Check, Trash2 } from "lucide-react"
import { notificationApi } from "@/lib/api/api"
import type { NotificationResponseDto } from "@/lib/api/types"

const ALLOWED_TYPES = ["COMMENT", "CHAT_INVITE"]

function formatTimeAgo(iso: string) {
  try {
    // 서버 LocalDateTime이 UTC로 저장된 경우: 타임존 없으면 'Z' 부여 (9시간 차이 보정)
    const str = /Z|[-+]\d{2}:?\d{2}$/.test(iso) ? iso : iso + "Z"
    const d = new Date(str)
    if (isNaN(d.getTime())) return iso
    const s = Math.floor((Date.now() - d.getTime()) / 1000)
    if (s < 60) return "방금 전"
    if (s < 3600) return `${Math.floor(s / 60)}분 전`
    if (s < 86400) return `${Math.floor(s / 3600)}시간 전`
    if (s < 604800) return `${Math.floor(s / 86400)}일 전`
    return d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })
  } catch {
    return iso
  }
}

function getIcon(type?: string) {
  switch (type) {
    case "COMMENT":
      return <MessageSquare className="h-6 w-6" />
    case "CHAT_INVITE":
      return <Users className="h-6 w-6" />
    default:
      return <Bell className="h-6 w-6" />
  }
}

function getTitle(type?: string) {
  switch (type) {
    case "COMMENT":
      return "새 댓글"
    case "CHAT_INVITE":
      return "팟 모집"
    default:
      return "알림"
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchList = useCallback(() => {
    setLoading(true)
    notificationApi
      .getMyNotifications()
      .then((list) =>
        setNotifications(
          (Array.isArray(list) ? list : []).filter(
            (n) => !n.type || ALLOWED_TYPES.includes(n.type)
          )
        )
      )
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const isRead = (n: NotificationResponseDto) => (n.isRead ?? n.read) === true

  const unreadCount = notifications.filter((n) => !isRead(n)).length

  const handleMarkAsRead = (id: number) => {
    notificationApi
      .markAsRead(id)
      .then(() =>
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === id ? { ...n, isRead: true, read: true } : n
          )
        )
      )
      .catch(() => {})
  }

  const handleDelete = (id: number) => {
    notificationApi
      .deleteNotification(id)
      .then(() =>
        setNotifications((prev) => prev.filter((n) => n.notificationId !== id))
      )
      .catch(() => {})
  }

  const list = notifications
  const listUnread = list.filter((n) => !isRead(n))

  const renderItem = (n: NotificationResponseDto) => (
    <div
      key={n.notificationId}
      className={`flex items-start gap-4 rounded-lg border border-border p-4 transition-colors ${
        !isRead(n) ? "bg-primary/5" : ""
      }`}
    >
      <div
        className={`rounded-full p-3 ${
          !isRead(n) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {getIcon(n.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{getTitle(n.type)}</span>
          {!isRead(n) && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
        </div>
        <p className="text-sm text-foreground">{n.content}</p>
        <p className="mt-1 text-xs text-muted-foreground">{formatTimeAgo(n.createdAt)}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        {!isRead(n) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMarkAsRead(n.notificationId)}
            title="읽음 처리"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Link href={n.url}>
          <Button variant="ghost" size="sm">
            보기
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => handleDelete(n.notificationId)}
          title="삭제"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="ml-64">
        <DesktopHeader title="알림" />

        <main className="p-6">
          <Card className="mx-auto max-w-3xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>알림</CardTitle>
                  {unreadCount > 0 && (
                    <Badge variant="destructive">{unreadCount}개 읽지 않음</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">전체</TabsTrigger>
                  <TabsTrigger value="unread">읽지 않음</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-2">
                  {loading ? (
                    <div className="py-12 text-center text-muted-foreground">
                      로딩 중...
                    </div>
                  ) : list.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <Bell className="mx-auto mb-4 h-12 w-12" />
                      <p>알림이 없습니다</p>
                    </div>
                  ) : (
                    list.map(renderItem)
                  )}
                </TabsContent>

                <TabsContent value="unread" className="space-y-2">
                  {listUnread.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <Check className="mx-auto mb-4 h-12 w-12" />
                      <p>모든 알림을 확인했습니다</p>
                    </div>
                  ) : (
                    listUnread.map(renderItem)
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
