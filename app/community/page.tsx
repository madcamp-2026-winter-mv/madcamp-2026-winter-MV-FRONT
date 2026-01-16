"use client"

import { useState } from "react"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { CommunityList } from "@/components/community/community-list"
import { CategoryTabs } from "@/components/community/category-tabs"
import { CreateCommunityModal } from "@/components/community/create-community-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function CommunityPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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
                <CategoryTabs />
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  커뮤니티 생성
                </Button>
              </div>
              <div className="mt-4">
                <CommunityList />
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
