"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const categories = [
  { id: "all", label: "전체" },
  { id: "free", label: "자유" },
  { id: "question", label: "질문" },
  { id: "party", label: "팟모집" },
  { id: "info", label: "정보공유" },
  { id: "job", label: "채용공고" },
]

interface CategoryTabsProps {
  onCategoryChange?: (category: string) => void
  visibleCategories?: Record<string, boolean>
}

export function CategoryTabs({ onCategoryChange, visibleCategories }: CategoryTabsProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeCategoryLabel, setActiveCategoryLabel] = useState("전체")

  const handleCategoryClick = (categoryId: string, categoryLabel: string) => {
    setActiveCategory(categoryId)
    setActiveCategoryLabel(categoryLabel)
    onCategoryChange?.(categoryLabel)
  }

  // 전체 탭은 항상 표시, 나머지는 visibleCategories에 따라 표시
  const visibleTabs = categories.filter((category) => {
    if (category.id === "all") return true
    if (!visibleCategories) return true
    return visibleCategories[category.label] !== false
  })

  // 드롭다운에 표시할 카테고리 (전체 제외)
  const dropdownCategories = visibleTabs.filter((category) => category.id !== "all")

  return (
    <div className="flex items-center gap-2">
      {/* 현재 선택된 카테고리 표시 */}
      <div className="rounded-lg border bg-card px-4 py-2">
        <span className="text-sm font-medium">{activeCategoryLabel}</span>
      </div>

      {/* 드롭다운 버튼 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem
            onClick={() => handleCategoryClick("all", "전체")}
            className={cn(
              "cursor-pointer",
              activeCategory === "all" && "bg-primary/10 text-primary font-medium"
            )}
          >
            전체
          </DropdownMenuItem>
          {dropdownCategories.map((category) => (
            <DropdownMenuItem
              key={category.id}
              onClick={() => handleCategoryClick(category.id, category.label)}
              className={cn(
                "cursor-pointer",
                activeCategory === category.id && "bg-primary/10 text-primary font-medium"
              )}
            >
              {category.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
