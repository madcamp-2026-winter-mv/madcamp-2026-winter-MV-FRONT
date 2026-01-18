"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, MessageSquare, User, Settings, LogOut, Bell, Shield, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { href: "/", icon: Home, label: "대시보드" },
  { href: "/community", icon: MessageSquare, label: "커뮤니티" },
  { href: "/chat", icon: MessageCircle, label: "채팅방" },
  { href: "/mypage", icon: User, label: "마이페이지" },
  { href: "/admin", icon: Shield, label: "관리자" },
]

export function DesktopSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
            몰
          </div>
          <div>
            <h1 className="text-lg font-bold">몰 봐</h1>
            <p className="text-xs text-sidebar-foreground/60">Madcamp View</p>
          </div>
        </div>

        {/* Room Info */}
        <div className="border-b border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent p-3">
            <p className="text-xs text-sidebar-foreground/60">현재 분반</p>
            <p className="font-semibold text-sidebar-primary">MAD012</p>
            <p className="text-xs text-sidebar-foreground/60">2025 겨울학기</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive &&
                      "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                  {item.href === "/community" && (
                    <Badge className="ml-auto bg-destructive text-destructive-foreground">3</Badge>
                  )}
                  {item.href === "/chat" && <Badge className="ml-auto bg-primary text-primary-foreground">2</Badge>}
                </Button>
              </Link>
            )
          })}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* Bottom Actions */}
        <div className="space-y-1 p-4">
          <Link href="/notifications">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Bell className="h-5 w-5" />
              알림
              <Badge className="ml-auto bg-primary text-primary-foreground">2</Badge>
            </Button>
          </Link>
          <Link href="/settings">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Settings className="h-5 w-5" />
              설정
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              로그아웃
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  )
}
