"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Home, MessageSquare, User, Settings, LogOut, Bell, Shield, MessageCircle, PanelLeftClose, PanelLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { useAuth } from "@/hooks/use-auth"
import { useSidebar } from "@/components/layout/sidebar-context"
import { notificationApi } from "@/lib/api/api"

const navItems = [
  { href: "/dashboard", icon: Home, label: "대시보드" },
  { href: "/community", icon: MessageSquare, label: "커뮤니티" },
  { href: "/chat", icon: MessageCircle, label: "채팅방" },
  { href: "/mypage", icon: User, label: "마이페이지" },
  { href: "/admin", icon: Shield, label: "관리자" },
]

export function DesktopSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { collapsed, toggle } = useSidebar()
  const [sidebarUnread, setSidebarUnread] = useState(0)

  useEffect(() => {
    notificationApi.getSidebarUnreadCount().then(setSidebarUnread).catch(() => setSidebarUnread(0))
  }, [pathname])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo + Toggle */}
        <div className={cn("flex min-h-16 items-center border-b border-sidebar-border", collapsed ? "flex-col justify-center gap-1 py-2 px-0" : "gap-3 px-6")}>
          <Link href="/dashboard" className={cn("flex items-center shrink-0", collapsed ? "justify-center" : "gap-3")}>
            <img src="/madcamp_logo.png" alt="몰입캠프" className={cn("object-contain shrink-0", collapsed ? "h-8 w-8" : "h-10 w-10")} />
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold">몰 봐</h1>
                <p className="text-xs text-sidebar-foreground/60">Madcamp View</p>
              </div>
            )}
          </Link>
          {!collapsed && <div className="flex-1" />}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("shrink-0 text-sidebar-foreground hover:bg-sidebar-accent", collapsed && "h-8 w-8")} onClick={toggle}>
                {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{collapsed ? "사이드바 펼치기" : "사이드바 접기"}</TooltipContent>
          </Tooltip>
        </div>

        {/* Room Info */}
        <div className={cn("border-b border-sidebar-border", collapsed ? "p-2 flex justify-center" : "p-4")}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent">
                  <Users className="h-5 w-5 text-sidebar-primary" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">{user?.roomId ?? "—"} 분반</TooltipContent>
            </Tooltip>
          ) : (
            <div className="rounded-lg bg-sidebar-accent p-3">
              <p className="text-xs text-sidebar-foreground/60">현재 분반</p>
              <p className="font-semibold text-sidebar-primary">{user?.roomId ?? "—"} 분반</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 space-y-1", collapsed ? "p-2" : "p-4")}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const btn = (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed ? "justify-center px-0" : "justify-start gap-3",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && item.label}
                </Button>
              </Link>
            )
            return collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              btn
            )
          })}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* Bottom Actions */}
        <div className={cn("space-y-1", collapsed ? "p-2" : "p-4")}>
          {(() => {
            const notifBtn = (
              <Link href="/notifications">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full text-sidebar-foreground hover:bg-sidebar-accent",
                    collapsed ? "justify-center px-0 relative" : "justify-start gap-3",
                  )}
                >
                  <Bell className="h-5 w-5 shrink-0" />
                  {!collapsed && "알림"}
                  {sidebarUnread > 0 && (
                    <span
                      className={cn(
                        "flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-destructive-foreground",
                        collapsed ? "absolute -right-0.5 -top-0.5" : "ml-auto"
                      )}
                    >
                      {sidebarUnread > 99 ? "99+" : sidebarUnread}
                    </span>
                  )}
                </Button>
              </Link>
            )
            const notif = collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>{notifBtn}</TooltipTrigger>
                <TooltipContent side="right">알림</TooltipContent>
              </Tooltip>
            ) : (
              notifBtn
            )
            const settingsBtn = (
              <Link href="/settings">
                <Button variant="ghost" className={cn("w-full text-sidebar-foreground hover:bg-sidebar-accent", collapsed ? "justify-center px-0" : "justify-start gap-3")}>
                  <Settings className="h-5 w-5 shrink-0" />
                  {!collapsed && "설정"}
                </Button>
              </Link>
            )
            const settings = collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>{settingsBtn}</TooltipTrigger>
                <TooltipContent side="right">설정</TooltipContent>
              </Tooltip>
            ) : (
              settingsBtn
            )
            const logoutBtn = (
              <Button
                variant="ghost"
                className={cn("w-full text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive", collapsed ? "justify-center px-0" : "justify-start gap-3")}
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!collapsed && "로그아웃"}
              </Button>
            )
            const logout = collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>{logoutBtn}</TooltipTrigger>
                <TooltipContent side="right">로그아웃</TooltipContent>
              </Tooltip>
            ) : (
              logoutBtn
            )
            return (
              <>
                {notif}
                {settings}
                {logout}
              </>
            )
          })()}
        </div>
      </div>
    </aside>
  )
}
