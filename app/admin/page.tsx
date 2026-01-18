"use client"

import { useState } from "react"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Users, Copy, Edit, Trash2, Play, Square, Shuffle, Clock, RefreshCw } from "lucide-react"

// Mock 데이터
const mockMembers = [
  { id: 1, name: "김몰입", email: "kim@kaist.ac.kr", attendance: 85 },
  { id: 2, name: "이코딩", email: "lee@kaist.ac.kr", attendance: 92 },
  { id: 3, name: "박개발", email: "park@kaist.ac.kr", attendance: 78 },
  { id: 4, name: "최협업", email: "choi@kaist.ac.kr", attendance: 95 },
  { id: 5, name: "정디자인", email: "jung@kaist.ac.kr", attendance: 88 },
]

const generateRandomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function AdminPage() {
  const [isAttendanceActive, setIsAttendanceActive] = useState(false)
  const [inviteCode, setInviteCode] = useState("A1B2C3D4")
  const [selectedPresenter, setSelectedPresenter] = useState<string | null>(null)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode)
  }

  const handleGenerateCode = () => {
    setInviteCode(generateRandomCode())
  }

  const handleRandomPresenter = () => {
    const randomIndex = Math.floor(Math.random() * mockMembers.length)
    setSelectedPresenter(mockMembers[randomIndex].name)
  }

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="ml-64">
        <DesktopHeader title="관리자" />

        <main className="p-6">
          <Tabs defaultValue="class" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="class">분반 관리</TabsTrigger>
              <TabsTrigger value="attendance">출석 관리</TabsTrigger>
              <TabsTrigger value="scrum">스크럼</TabsTrigger>
              <TabsTrigger value="members">인원 관리</TabsTrigger>
              <TabsTrigger value="schedule">일정 등록</TabsTrigger>
            </TabsList>

            {/* 분반 관리 탭 - 새 분반 생성 기능 제거 */}
            <TabsContent value="class" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* 현재 분반 정보 */}
                <Card>
                  <CardHeader>
                    <CardTitle>현재 분반 정보</CardTitle>
                    <CardDescription>분반 정보를 확인하고 편집합니다</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>분반 코드</Label>
                      <Input defaultValue="MAD012" />
                    </div>
                    <div className="space-y-2">
                      <Label>분반명</Label>
                      <Input defaultValue="2025 겨울학기 12분반" />
                    </div>
                    <div className="space-y-2">
                      <Label>설명</Label>
                      <Textarea defaultValue="몰입캠프 2025년 겨울학기 12분반입니다." />
                    </div>
                    <Button className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      저장하기
                    </Button>
                  </CardContent>
                </Card>

                {/* 초대 코드 - 8자리 랜덤 코드로 변경 */}
                <Card>
                  <CardHeader>
                    <CardTitle>초대 코드</CardTitle>
                    <CardDescription>분반 초대 코드를 생성하고 공유합니다</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input value={inviteCode} readOnly className="font-mono text-xl tracking-widest text-center" />
                      <Button variant="outline" size="icon" onClick={handleCopyCode}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={handleGenerateCode} variant="outline" className="w-full bg-transparent">
                      <RefreshCw className="mr-2 h-4 w-4" />새 코드 생성
                    </Button>
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">
                        8자리 초대 코드를 공유하여 새로운 멤버를 분반에 초대할 수 있습니다.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 출석 관리 탭 */}
            <TabsContent value="attendance" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* 출석 시작/종료 */}
                <Card>
                  <CardHeader>
                    <CardTitle>출석 체크</CardTitle>
                    <CardDescription>출석 체크를 시작하거나 종료합니다</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      {isAttendanceActive ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <span className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                          </span>
                          출석 진행중
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          출석 대기중
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsAttendanceActive(true)}
                        disabled={isAttendanceActive}
                        className="flex-1"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        시작
                      </Button>
                      <Button
                        onClick={() => setIsAttendanceActive(false)}
                        disabled={!isAttendanceActive}
                        variant="destructive"
                        className="flex-1"
                      >
                        <Square className="mr-2 h-4 w-4" />
                        종료
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 오늘 출석 현황 */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>오늘 출석 현황</CardTitle>
                    <CardDescription>2025년 1월 15일</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                        <p className="text-3xl font-bold text-foreground">24</p>
                        <p className="text-sm text-muted-foreground">전체 인원</p>
                      </div>
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">22</p>
                        <p className="text-sm text-green-600">출석</p>
                      </div>
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                        <p className="text-3xl font-bold text-red-600">2</p>
                        <p className="text-sm text-red-600">결석</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 출석 기록 */}
              <Card>
                <CardHeader>
                  <CardTitle>전체 출석 기록</CardTitle>
                  <CardDescription>날짜별 출석 현황을 확인합니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>날짜</TableHead>
                        <TableHead>전체 인원</TableHead>
                        <TableHead>출석</TableHead>
                        <TableHead>결석</TableHead>
                        <TableHead>출석률</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { date: "2025-01-15", total: 24, present: 22, absent: 2 },
                        { date: "2025-01-14", total: 24, present: 24, absent: 0 },
                        { date: "2025-01-13", total: 24, present: 21, absent: 3 },
                        { date: "2025-01-12", total: 24, present: 23, absent: 1 },
                      ].map((record) => (
                        <TableRow key={record.date}>
                          <TableCell className="font-medium">{record.date}</TableCell>
                          <TableCell>{record.total}명</TableCell>
                          <TableCell className="text-green-600">{record.present}명</TableCell>
                          <TableCell className="text-red-600">{record.absent}명</TableCell>
                          <TableCell>
                            <Badge variant={record.present / record.total >= 0.9 ? "default" : "secondary"}>
                              {Math.round((record.present / record.total) * 100)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 스크럼 대표자 탭 */}
            <TabsContent value="scrum" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>스크럼 대표자 뽑기</CardTitle>
                  <CardDescription>랜덤으로 스크럼 발표자를 선정합니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center justify-center gap-6 py-8">
                    {selectedPresenter ? (
                      <div className="text-center">
                        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground">
                          {selectedPresenter.charAt(0)}
                        </div>
                        <p className="text-2xl font-bold text-foreground">{selectedPresenter}</p>
                        <p className="text-muted-foreground">오늘의 스크럼 발표자입니다!</p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Shuffle className="mx-auto mb-4 h-16 w-16" />
                        <p>버튼을 눌러 발표자를 선정하세요</p>
                      </div>
                    )}
                    <Button size="lg" onClick={handleRandomPresenter}>
                      <Shuffle className="mr-2 h-5 w-5" />
                      랜덤 선정
                    </Button>
                  </div>

                  {/* 전체 멤버 목록 */}
                  <div className="border-t border-border pt-6">
                    <h4 className="mb-4 font-semibold">전체 멤버</h4>
                    <div className="flex flex-wrap gap-2">
                      {mockMembers.map((member) => (
                        <Badge
                          key={member.id}
                          variant={selectedPresenter === member.name ? "default" : "outline"}
                          className="px-3 py-1"
                        >
                          {member.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 인원 관리 탭 - 상태 컬럼 제거 */}
            <TabsContent value="members" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>분반 인원 관리</CardTitle>
                      <CardDescription>분반 멤버를 관리합니다</CardDescription>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />총 {mockMembers.length}명
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이름</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>출석률</TableHead>
                        <TableHead className="text-right">관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-16 rounded-full bg-muted">
                                <div
                                  className="h-2 rounded-full bg-primary"
                                  style={{ width: `${member.attendance}%` }}
                                />
                              </div>
                              <span className="text-sm">{member.attendance}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>멤버 강제 탈퇴</DialogTitle>
                                  <DialogDescription>
                                    정말 {member.name}님을 분반에서 탈퇴시키겠습니까? 이 작업은 되돌릴 수 없습니다.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline">취소</Button>
                                  <Button variant="destructive">탈퇴시키기</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 일정 등록 탭 */}
            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>오늘의 일정 등록</CardTitle>
                      <CardDescription>분반 일정을 등록하고 관리합니다</CardDescription>
                    </div>
                    <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Clock className="mr-2 h-4 w-4" />
                          일정 추가
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>새 일정 등록</DialogTitle>
                          <DialogDescription>새로운 일정 정보를 입력해주세요</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>일정 제목</Label>
                            <Input placeholder="예: 오전 스크럼" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>시작 시간</Label>
                              <Input type="time" defaultValue="09:00" />
                            </div>
                            <div className="space-y-2">
                              <Label>종료 시간</Label>
                              <Input type="time" defaultValue="10:00" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>일정 유형</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="유형 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="scrum">스크럼</SelectItem>
                                <SelectItem value="lecture">강의</SelectItem>
                                <SelectItem value="work">작업</SelectItem>
                                <SelectItem value="etc">기타</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>설명 (선택)</Label>
                            <Textarea placeholder="일정에 대한 추가 설명" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>
                            취소
                          </Button>
                          <Button onClick={() => setIsScheduleOpen(false)}>등록하기</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { id: 1, title: "오전 스크럼", time: "09:00 - 10:00", type: "스크럼" },
                      { id: 2, title: "앱 개발 강의", time: "10:00 - 12:00", type: "강의" },
                      { id: 3, title: "점심시간", time: "12:00 - 13:00", type: "기타" },
                      { id: 4, title: "팀 프로젝트", time: "13:00 - 18:00", type: "작업" },
                    ].map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{schedule.title}</p>
                            <p className="text-sm text-muted-foreground">{schedule.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{schedule.type}</Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
