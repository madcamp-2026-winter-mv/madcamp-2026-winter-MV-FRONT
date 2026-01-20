"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { notificationApi } from "@/lib/api/api"
import { usePathname } from "next/navigation"

interface DesktopHeaderProps {
  title: string
}

export function DesktopHeader({ title }: DesktopHeaderProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [headerUnread, setHeaderUnread] = useState(0)

  useEffect(() => {
    notificationApi.getSidebarUnreadCount().then(setHeaderUnread).catch(() => setHeaderUnread(0))
  }, [pathname])

  const handleLogout = async () => {
    await logout()
  }

  const userInitial = user?.nickname?.[0] || user?.realName?.[0] || "?"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-xl font-bold text-foreground">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="검색..." className="w-64 pl-9" />
        </div>

        {/* Notifications */}
        <Link href="/notifications" className="relative">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          {headerUnread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-destructive-foreground">
              {headerUnread > 99 ? "99+" : headerUnread}
            </span>
          )}
        </Link>

        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImage} alt={user?.nickname} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium lg:inline">
                {user?.nickname || user?.realName || "사용자"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/mypage">프로필</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">설정</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
