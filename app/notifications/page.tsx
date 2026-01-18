"use client"

import { useState } from "react"
import Link from "next/link"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Heart, Users, Calendar, Bell, Check, Trash2 } from "lucide-react"

const mockNotifications = [
  {
    id: 1,
    type: "comment",
    title: "새 댓글",
    message: "이코딩님이 회원님의 글에 댓글을 남겼습니다.",
    link: "/community/1",
    createdAt: "5분 전",
    isRead: false,
  },
  {
    id: 2,
    type: "like",
    title: "좋아요",
    message: "박개발님이 회원님의 글을 좋아합니다.",
    link: "/community/1",
    createdAt: "30분 전",
    isRead: false,
  },
  {
    id: 3,
    type: "team",
    title: "팟 모집",
    message: "신청하신 '2주차 프로젝트 팀원 모집'에 수락되었습니다.",
    link: "/community/2",
    createdAt: "1시간 전",
    isRead: true,
  },
  {
    id: 4,
    type: "schedule",
    title: "일정 알림",
    message: "내일 10:00 AM에 '4주차 발표'가 예정되어 있습니다.",
    link: "/",
    createdAt: "2시간 전",
    isRead: true,
  },
  {
    id: 5,
    type: "comment",
    title: "새 댓글",
    message: "최협업님이 회원님의 글에 댓글을 남겼습니다.",
    link: "/community/3",
    createdAt: "어제",
    isRead: true,
  },
]

const getIcon = (type: string) => {
  switch (type) {
    case "comment":
      return <MessageSquare className="h-5 w-5" />
    case "like":
      return <Heart className="h-5 w-5" />
    case "team":
      return <Users className="h-5 w-5" />
    case "schedule":
      return <Calendar className="h-5 w-5" />
    default:
      return <Bell className="h-5 w-5" />
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

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
                  {unreadCount > 0 && <Badge variant="destructive">{unreadCount}개 읽지 않음</Badge>}
                </div>
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                  <Check className="mr-2 h-4 w-4" />
                  모두 읽음 처리
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">전체</TabsTrigger>
                  <TabsTrigger value="unread">읽지 않음</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <Bell className="mx-auto mb-4 h-12 w-12" />
                      <p>알림이 없습니다</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 rounded-lg border border-border p-4 transition-colors ${
                          !notification.isRead ? "bg-primary/5" : ""
                        }`}
                      >
                        <div
                          className={`rounded-full p-2 ${
                            !notification.isRead
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{notification.title}</span>
                            {!notification.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                          </div>
                          <p className="text-sm text-foreground">{notification.message}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{notification.createdAt}</p>
                        </div>
                        <div className="flex gap-1">
                          <Link href={notification.link}>
                            <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                              보기
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="unread" className="space-y-2">
                  {notifications.filter((n) => !n.isRead).length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <Check className="mx-auto mb-4 h-12 w-12" />
                      <p>모든 알림을 확인했습니다</p>
                    </div>
                  ) : (
                    notifications
                      .filter((n) => !n.isRead)
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-start gap-4 rounded-lg border border-border bg-primary/5 p-4"
                        >
                          <div className="rounded-full bg-primary p-2 text-primary-foreground">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{notification.title}</span>
                              <span className="h-2 w-2 rounded-full bg-primary" />
                            </div>
                            <p className="text-sm text-foreground">{notification.message}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{notification.createdAt}</p>
                          </div>
                          <div className="flex gap-1">
                            <Link href={notification.link}>
                              <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                                보기
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
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
