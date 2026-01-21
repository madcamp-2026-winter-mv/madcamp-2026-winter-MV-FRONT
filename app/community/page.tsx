"use client"

import { useState } from "react"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { ContentArea } from "@/components/layout/sidebar-context"
import { CommunityList } from "@/components/community/community-list"
import { CategoryTabs } from "@/components/community/category-tabs"
import { CreateCommunityModal } from "@/components/community/create-community-modal"
import { WritePostModal } from "@/components/community/write-post-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, PenSquare } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"

export default function CommunityPage() {
  const { user } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [listRefreshKey, setListRefreshKey] = useState(0)
  const [categoriesRefreshKey, setCategoriesRefreshKey] = useState(0)

  const canWrite = selectedCategory !== "전체"
  const isPartyTab = selectedCategory === "팟모집"

  const handleWriteClick = () => {
    if (user?.roomId == null) {
      toast({
        title: "방 참여 필요",
        description: "방에 참여한 후 글을 쓸 수 있습니다. 마이페이지에서 초대 코드로 참여해주세요.",
        variant: "destructive",
      })
      return
    }
    setIsWriteModalOpen(true)
  }

  const handleCreateModalClick = () => {
    if (user?.roomId == null) {
      toast({
        title: "분반 가입 필요",
        description: "분반에 가입 후 이용할 수 있습니다. 마이페이지에서 초대 코드로 분반에 가입해주세요.",
        variant: "destructive",
      })
      return
    }
    setIsCreateModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <ContentArea>
        <DesktopHeader title="커뮤니티" />

        <main className="p-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
            {/* 메인 콘텐츠 */}
            <div className="xl:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <CategoryTabs
                  onCategoryChange={setSelectedCategory}
                  categoriesRefreshKey={categoriesRefreshKey}
                />
                <div className="flex items-center gap-2">
                  {canWrite && (
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleWriteClick}>
                      <PenSquare className="h-4 w-4 mr-2" />
                      {isPartyTab ? "팟 모집하기" : "새 글 작성"}
                    </Button>
                  )}
                  <Button onClick={handleCreateModalClick} variant="outline" className="bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    커뮤니티 관리
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <CommunityList
                  selectedCategory={selectedCategory}
                  refreshKey={listRefreshKey}
                  categoriesRefreshKey={categoriesRefreshKey}
                />
              </div>
            </div>

            <div className="space-y-6">
              <Card className="overflow-hidden border border-border p-0">
                <CardContent className="p-0">
                  <img src="/ad_image1.jpg" alt="광고 1" className="h-48 w-full object-cover" />
                </CardContent>
              </Card>

              <Card className="overflow-hidden border border-border p-0">
                <CardContent className="p-0">
                  <img src="/ad_image2.jpg" alt="광고 2" className="h-48 w-full object-cover" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </ContentArea>

      <CreateCommunityModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => setCategoriesRefreshKey((k) => k + 1)}
      />
      <WritePostModal 
        open={isWriteModalOpen} 
        onOpenChange={setIsWriteModalOpen} 
        category={selectedCategory}
        isPartyOnly={isPartyTab}
        onSuccess={() => setListRefreshKey((k) => k + 1)}
      />
    </div>
  )
}
