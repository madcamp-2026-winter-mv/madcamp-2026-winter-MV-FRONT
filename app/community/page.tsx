"use client"

import { useState } from "react"
import Link from "next/link"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { CommunityList } from "@/components/community/community-list"
import { CategoryTabs } from "@/components/community/category-tabs"
import { CreateCommunityModal } from "@/components/community/create-community-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, PenSquare } from "lucide-react"

export default function CommunityPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("전체")

  const canWrite = selectedCategory !== "전체"

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="ml-64">
        <DesktopHeader title="커뮤니티" />

        <main className="p-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
            <div className="xl:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <CategoryTabs onCategoryChange={setSelectedCategory} />
                
                <div className="flex items-center gap-2">
                  {canWrite && (
                    <Link href="/community/write">
                      <Button className="gap-2">
                        <PenSquare className="h-4 w-4" />
                        글쓰기
                      </Button>
                    </Link>
                  )}
                  
                  <Button onClick={() => setIsCreateModalOpen(true)} variant="outline" className="bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    커뮤니티 생성
                  </Button>
                </div>
              </div>
              
              <div className="mt-4">
                <CommunityList selectedCategory={selectedCategory} />
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