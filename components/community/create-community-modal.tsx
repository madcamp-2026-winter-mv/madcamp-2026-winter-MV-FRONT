"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateCommunityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCommunityModal({ open, onOpenChange }: CreateCommunityModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
  })

  const handleSubmit = () => {
    console.log("커뮤니티 생성:", formData)
    // 여기에 생성 로직 추가
    onOpenChange(false)
    setFormData({ title: "", category: "", description: "" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">새 커뮤니티 생성</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              커뮤니티 이름
            </Label>
            <Input
              id="title"
              placeholder="커뮤니티 이름을 입력하세요"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-foreground">
              카테고리
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">자유</SelectItem>
                <SelectItem value="question">질문</SelectItem>
                <SelectItem value="party">팟모집</SelectItem>
                <SelectItem value="info">정보공유</SelectItem>
                <SelectItem value="job">채용공고</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              설명
            </Label>
            <Textarea
              id="description"
              placeholder="커뮤니티에 대한 설명을 입력하세요"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-background border-border min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!formData.title || !formData.category}
          >
            생성하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
