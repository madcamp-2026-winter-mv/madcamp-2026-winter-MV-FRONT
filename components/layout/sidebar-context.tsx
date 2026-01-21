"use client"

import React, { createContext, useContext, useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "sidebar_collapsed"

type SidebarContextValue = {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) {
    return {
      collapsed: false,
      setCollapsed: () => {},
      toggle: () => {},
    }
  }
  return ctx
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setCollapsedState(raw === "true")
    } catch {}
    setMounted(true)
  }, [])

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v)
    try {
      localStorage.setItem(STORAGE_KEY, String(v))
    } catch {}
  }, [])

  const toggle = useCallback(() => {
    setCollapsedState((c) => {
      const next = !c
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {}
      return next
    })
  }, [])

  const value: SidebarContextValue = { collapsed: mounted ? collapsed : false, setCollapsed, toggle }

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

/** 사이드바 오른쪽 메인 컨텐츠 영역. collapsed 여부에 따라 ml-16 / ml-64 적용 */
export function ContentArea({ children, className }: { children: React.ReactNode; className?: string }) {
  const { collapsed } = useSidebar()
  return (
    <div
      className={cn(
        collapsed ? "ml-16" : "ml-64",
        "transition-[margin] duration-200 ease-in-out",
        className
      )}
    >
      {children}
    </div>
  )
}
