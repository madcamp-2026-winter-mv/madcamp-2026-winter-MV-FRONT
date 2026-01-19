"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { categoryApi } from "@/lib/api/api"
import type { CategoryDto } from "@/lib/api/types"

const FALLBACK_CATEGORIES = [
  { categoryId: 0, name: "자유", icon: "" },
  { categoryId: 0, name: "질문", icon: "" },
  { categoryId: 0, name: "팟모집", icon: "" },
  { categoryId: 0, name: "정보공유", icon: "" },
  { categoryId: 0, name: "채용공고", icon: "" },
]

interface CategoryTabsProps {
  onCategoryChange?: (category: string) => void
  visibleCategories?: Record<string, boolean>
}

export function CategoryTabs({ onCategoryChange, visibleCategories }: CategoryTabsProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeCategoryLabel, setActiveCategoryLabel] = useState("전체")
  const [categories, setCategories] = useState<CategoryDto[]>([])

  useEffect(() => {
    categoryApi
      .getAllCategories()
      .then((list) => setCategories(Array.isArray(list) && list.length > 0 ? list : FALLBACK_CATEGORIES))
      .catch(() => setCategories(FALLBACK_CATEGORIES))
  }, [])

  const handleCategoryClick = (categoryId: string, categoryLabel: string) => {
    setActiveCategory(categoryId)
    setActiveCategoryLabel(categoryLabel)
    onCategoryChange?.(categoryLabel)
  }

  const displayList = categories.length > 0 ? categories : FALLBACK_CATEGORIES
  const visibleTabs = displayList.filter((c) => {
    if (c.name === "전체") return true
    if (!visibleCategories) return true
    return visibleCategories[c.name] !== false
  })

  return (
    <div className="flex items-center gap-2">
      <div className="rounded-lg border bg-card px-4 py-2">
        <span className="text-sm font-medium">{activeCategoryLabel}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem
            onClick={() => handleCategoryClick("all", "전체")}
            className={cn("cursor-pointer", activeCategory === "all" && "bg-primary/10 text-primary font-medium")}
          >
            전체
          </DropdownMenuItem>
          {visibleTabs.map((c) => (
            <DropdownMenuItem
              key={c.categoryId}
              onClick={() => handleCategoryClick(String(c.categoryId), c.name)}
              className={cn(
                "cursor-pointer",
                activeCategory === String(c.categoryId) && "bg-primary/10 text-primary font-medium"
              )}
            >
              {c.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
