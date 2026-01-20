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

interface CategoryTabsProps {
  onCategoryChange?: (category: string) => void
  categoriesRefreshKey?: number
}

export function CategoryTabs({ onCategoryChange, categoriesRefreshKey = 0 }: CategoryTabsProps) {
  const [activeCategoryLabel, setActiveCategoryLabel] = useState("전체")
  const [categories, setCategories] = useState<CategoryDto[]>([])

  useEffect(() => {
    categoryApi
      .getAllCategories()
      .then((list) => setCategories(Array.isArray(list) ? list : []))
      .catch(() => setCategories([]))
  }, [categoriesRefreshKey])

  const handleClick = (label: string) => {
    setActiveCategoryLabel(label)
    onCategoryChange?.(label)
  }

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
            onClick={() => handleClick("전체")}
            className={cn("cursor-pointer", activeCategoryLabel === "전체" && "bg-primary/10 text-primary font-medium")}
          >
            전체
          </DropdownMenuItem>
          {categories.map((c) => (
            <DropdownMenuItem
              key={c.categoryId}
              onClick={() => handleClick(c.name)}
              className={cn(
                "cursor-pointer",
                activeCategoryLabel === c.name && "bg-primary/10 text-primary font-medium"
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
