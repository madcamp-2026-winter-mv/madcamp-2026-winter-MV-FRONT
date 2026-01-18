"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { CommunityList } from "@/components/community/community-list"
import { CategoryTabs } from "@/components/community/category-tabs"
import { CreateCommunityModal } from "@/components/community/create-community-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, PenSquare, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function CommunityPage() {
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("전체")

  const handleWriteClick = (type: string) => {
    router.push(`/community/write?type=${type}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="ml-64">
        <DesktopHeader title="커뮤니티" />

        <main className="p-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
            {/* 메인 콘텐츠 */}
            <div className="xl:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <CategoryTabs onCategoryChange={setSelectedCategory} />
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <PenSquare className="h-4 w-4 mr-2" />새 글 작성
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleWriteClick("general")}>
                        <PenSquare className="h-4 w-4 mr-2" />
                        자유 게시글
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleWriteClick("question")}>
                        <PenSquare className="h-4 w-4 mr-2" />
                        질문하기
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleWriteClick("team")}>
                        <Users className="h-4 w-4 mr-2" />팟 모집
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleWriteClick("job")}>
                        <PenSquare className="h-4 w-4 mr-2" />
                        채용공고
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button onClick={() => setIsCreateModalOpen(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    커뮤니티 생성
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <CommunityList showPartyBanner={selectedCategory === "팟모집" || selectedCategory === "전체"} />
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border-dashed border-2 border-muted-foreground/30">
                <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
                  <span className="text-sm">광고 영역</span>
                </CardContent>
              </Card>

              <Card className="border-dashed border-2 border-muted-foreground/30">
                <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
                  <span className="text-sm">광고 영역</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <CreateCommunityModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  )
}
