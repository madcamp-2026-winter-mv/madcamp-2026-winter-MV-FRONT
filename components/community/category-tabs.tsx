"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

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
}

export function CategoryTabs({ onCategoryChange }: CategoryTabsProps) {
  const [activeCategory, setActiveCategory] = useState("all")

  const handleCategoryClick = (categoryId: string, categoryLabel: string) => {
    setActiveCategory(categoryId)
    onCategoryChange?.(categoryLabel)
  }

  return (
    <div className="rounded-lg border bg-card p-2">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id, category.label)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeCategory === category.id
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-muted-foreground hover:bg-muted",
            )}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  )
}
