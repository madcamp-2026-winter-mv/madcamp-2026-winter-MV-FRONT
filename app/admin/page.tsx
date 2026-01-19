"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Users, Copy, Play, Shuffle, Clock, RefreshCw, Trash2, Loader2 } from "lucide-react"
import { memberApi, adminApi } from "@/lib/api/api"
import type { MemberResponseDto } from "@/lib/api/types"

export default function AdminPage() {
  const [myInfo, setMyInfo] = useState<MemberResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [inviteCode, setInviteCode] = useState("")
  const [inviteLoading, setInviteLoading] = useState(false)

  const [members, setMembers] = useState<MemberResponseDto[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  const [attendanceMinutes, setAttendanceMinutes] = useState(5)
  const [attendanceLoading, setAttendanceLoading] = useState(false)

  const [selectedPresenter, setSelectedPresenter] = useState<MemberResponseDto | null>(null)
  const [presenterLoading, setPresenterLoading] = useState(false)

  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({ title: "", content: "", date: "", time: "09:00", important: false })
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [localSchedules, setLocalSchedules] = useState<{ id: string; title: string; time: string; type: string }[]>([])

  const [kickTarget, setKickTarget] = useState<{ memberId: number; realName: string } | null>(null)
  const [kickLoading, setKickLoading] = useState(false)

  const roomId = myInfo?.roomId ?? null

  const loadMyInfo = useCallback(async () => {
    try {
      setError(null)
      const res = await memberApi.getMyInfo()
      setMyInfo(res)
    } catch (e: any) {
      setError(e?.message || e?.error || "내 정보를 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMembers = useCallback(async () => {
    if (!roomId) return
    setMembersLoading(true)
    try {
      const res = await adminApi.getRealNameAttendance(roomId)
      setMembers(res)
    } catch (e: any) {
      setError(e?.message || e?.error || "출석 명단을 불러오지 못했습니다.")
    } finally {
      setMembersLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    loadMyInfo()
  }, [loadMyInfo])

  useEffect(() => {
    if (roomId) loadMembers()
  }, [roomId, loadMembers])

  const handleCopyCode = () => {
    if (inviteCode) navigator.clipboard.writeText(inviteCode)
  }

  const handleRefreshInviteCode = async () => {
    if (!roomId) return
    setInviteLoading(true)
    try {
      setError(null)
      const newCode = await adminApi.refreshInviteCode(roomId)
      setInviteCode(newCode)
    } catch (e: any) {
      setError(e?.message || e?.error || "초대 코드 생성에 실패했습니다.")
    } finally {
      setInviteLoading(false)
    }
  }

  const handleStartAttendance = async () => {
    if (!roomId) return
    setAttendanceLoading(true)
    try {
      setError(null)
      await adminApi.startAttendance(roomId, attendanceMinutes)
    } catch (e: any) {
      setError(e?.message || e?.error || "출석 시작에 실패했습니다.")
    } finally {
      setAttendanceLoading(false)
    }
  }

  const handlePickPresenter = async () => {
    if (!roomId) return
    setPresenterLoading(true)
    try {
      setError(null)
      const res = await adminApi.pickPresenter(roomId)
      setSelectedPresenter(res)
    } catch (e: any) {
      setError(e?.message || e?.error || "발표자 선정에 실패했습니다.")
    } finally {
      setPresenterLoading(false)
    }
  }

  const handleAddSchedule = async () => {
    if (!roomId || !scheduleForm.title.trim() || !scheduleForm.date || !scheduleForm.time) return
    const startTime = `${scheduleForm.date}T${scheduleForm.time}:00`
    setScheduleLoading(true)
    try {
      setError(null)
      await adminApi.addSchedule(roomId, {
        title: scheduleForm.title.trim(),
        content: scheduleForm.content.trim(),
        startTime,
        important: scheduleForm.important,
      })
      setLocalSchedules((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, title: scheduleForm.title, time: `${scheduleForm.date} ${scheduleForm.time}`, type: scheduleForm.important ? "중요" : "일반" },
      ])
      setScheduleForm({ title: "", content: "", date: "", time: "09:00", important: false })
      setIsScheduleOpen(false)
    } catch (e: any) {
      setError(e?.message || e?.error || "일정 등록에 실패했습니다.")
    } finally {
      setScheduleLoading(false)
    }
  }

  const handleKick = async () => {
    if (!roomId || !kickTarget) return
    setKickLoading(true)
    try {
      setError(null)
      await adminApi.kickMember(roomId, kickTarget.memberId)
      setKickTarget(null)
      loadMembers()
    } catch (e: any) {
      setError(e?.message || e?.error || "강제 탈퇴에 실패했습니다.")
    } finally {
      setKickLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!roomId) {
    return (
      <div className="min-h-screen bg-background">
        <DesktopSidebar />
        <div className="ml-64">
          <DesktopHeader title="관리자" />
          <main className="p-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">분반에 가입한 후 관리자 기능을 사용할 수 있습니다.</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  const avgRate = members.length > 0 ? members.reduce((s, m) => s + (m.attendanceRate || 0), 0) / members.length : 0

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="ml-64">
        <DesktopHeader title="관리자" />

        <main className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Tabs defaultValue="class" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="class">분반 관리</TabsTrigger>
              <TabsTrigger value="attendance">출석 관리</TabsTrigger>
              <TabsTrigger value="scrum">스크럼</TabsTrigger>
              <TabsTrigger value="members">인원 관리</TabsTrigger>
              <TabsTrigger value="schedule">일정 등록</TabsTrigger>
            </TabsList>

            {/* 분반 관리 */}
            <TabsContent value="class" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>현재 분반 정보</CardTitle>
                    <CardDescription>분반 정보를 확인합니다</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>분반 ID</Label>
                      <Input value={String(roomId)} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>분반명</Label>
                      <Input value={myInfo?.roomName || ""} readOnly />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>초대 코드</CardTitle>
                    <CardDescription>분반 초대 코드를 생성하고 공유합니다</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        value={inviteCode || "새 코드 생성으로 확인"}
                        readOnly
                        className="font-mono text-xl tracking-widest text-center"
                      />
                      <Button variant="outline" size="icon" onClick={handleCopyCode} disabled={!inviteCode}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={handleRefreshInviteCode} variant="outline" className="w-full bg-transparent" disabled={inviteLoading}>
                      {inviteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      새 코드 생성
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

            {/* 출석 관리 */}
            <TabsContent value="attendance" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>출석 체크</CardTitle>
                    <CardDescription>출석 체크를 시작합니다 (지정 시간 후 자동 종료)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>출석 허용 시간 (분)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        value={attendanceMinutes}
                        onChange={(e) => setAttendanceMinutes(Number(e.target.value) || 5)}
                      />
                    </div>
                    <Button onClick={handleStartAttendance} className="w-full" disabled={attendanceLoading}>
                      {attendanceLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                      출석 시작
                    </Button>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>출석 명단</CardTitle>
                    <CardDescription>분반 멤버와 출석률</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                        <p className="text-3xl font-bold text-foreground">{members.length}</p>
                        <p className="text-sm text-muted-foreground">전체 인원</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                        <p className="text-3xl font-bold text-foreground">{Math.round(avgRate)}%</p>
                        <p className="text-sm text-muted-foreground">평균 출석률</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                        <p className="text-3xl font-bold text-foreground">{members.filter((m) => (m.attendanceRate || 0) >= 90).length}</p>
                        <p className="text-sm text-muted-foreground">출석률 90% 이상</p>
                      </div>
                    </div>
                    {membersLoading ? (
                      <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>이름</TableHead>
                            <TableHead>이메일</TableHead>
                            <TableHead>출석률</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {members.map((m) => (
                            <TableRow key={m.email}>
                              <TableCell className="font-medium">{m.realName}</TableCell>
                              <TableCell className="text-muted-foreground">{m.email}</TableCell>
                              <TableCell><Badge variant={m.attendanceRate >= 90 ? "default" : "secondary"}>{Math.round(m.attendanceRate)}%</Badge></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 스크럼 */}
            <TabsContent value="scrum" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>스크럼 대표자 뽑기</CardTitle>
                  <CardDescription>랜덤으로 스크럼 발표자를 선정합니다 (발표 횟수 최소인 사람 중 선정)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center justify-center gap-6 py-8">
                    {selectedPresenter ? (
                      <div className="text-center">
                        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground">
                          {(selectedPresenter.realName || selectedPresenter.nickname || "?").charAt(0)}
                        </div>
                        <p className="text-2xl font-bold text-foreground">{selectedPresenter.realName || selectedPresenter.nickname}</p>
                        <p className="text-muted-foreground">오늘의 스크럼 발표자입니다!</p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Shuffle className="mx-auto mb-4 h-16 w-16" />
                        <p>버튼을 눌러 발표자를 선정하세요</p>
                      </div>
                    )}
                    <Button size="lg" onClick={handlePickPresenter} disabled={presenterLoading}>
                      {presenterLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Shuffle className="mr-2 h-5 w-5" />}
                      랜덤 선정
                    </Button>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h4 className="mb-4 font-semibold">전체 멤버</h4>
                    {membersLoading ? (
                      <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {members.map((m) => (
                          <Badge
                            key={m.email}
                            variant={selectedPresenter?.email === m.email ? "default" : "outline"}
                            className="px-3 py-1"
                          >
                            {m.realName || m.nickname}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 인원 관리 */}
            <TabsContent value="members" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>분반 인원 관리</CardTitle>
                      <CardDescription>분반 멤버를 관리합니다</CardDescription>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />총 {members.length}명
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {membersLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                  ) : (
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
                        {members.map((m) => (
                          <TableRow key={m.email}>
                            <TableCell className="font-medium">{m.realName}</TableCell>
                            <TableCell>{m.email}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-16 rounded-full bg-muted">
                                  <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, m.attendanceRate)}%` }} />
                                </div>
                                <span className="text-sm">{Math.round(m.attendanceRate)}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {m.memberId != null ? (
                                <Dialog open={!!kickTarget && kickTarget.memberId === m.memberId} onOpenChange={(open) => !open && setKickTarget(null)}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => setKickTarget({ memberId: m.memberId!, realName: m.realName || m.nickname })}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>멤버 강제 탈퇴</DialogTitle>
                                      <DialogDescription>
                                        정말 {kickTarget?.realName}님을 분반에서 탈퇴시키겠습니까? 이 작업은 되돌릴 수 없습니다.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setKickTarget(null)}>취소</Button>
                                      <Button variant="destructive" onClick={handleKick} disabled={kickLoading}>
                                        {kickLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "탈퇴시키기"}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 일정 등록 */}
            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>오늘의 일정 등록</CardTitle>
                      <CardDescription>분반 일정을 등록합니다</CardDescription>
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
                            <Label>일정 제목 *</Label>
                            <Input
                              placeholder="예: 오전 스크럼"
                              value={scheduleForm.title}
                              onChange={(e) => setScheduleForm((f) => ({ ...f, title: e.target.value }))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>날짜 *</Label>
                              <Input
                                type="date"
                                value={scheduleForm.date}
                                onChange={(e) => setScheduleForm((f) => ({ ...f, date: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>시작 시간 *</Label>
                              <Input
                                type="time"
                                value={scheduleForm.time}
                                onChange={(e) => setScheduleForm((f) => ({ ...f, time: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>설명 (선택)</Label>
                            <Textarea
                              placeholder="일정에 대한 추가 설명"
                              value={scheduleForm.content}
                              onChange={(e) => setScheduleForm((f) => ({ ...f, content: e.target.value }))}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="important"
                              checked={scheduleForm.important}
                              onChange={(e) => setScheduleForm((f) => ({ ...f, important: e.target.checked }))}
                            />
                            <Label htmlFor="important">중요 일정</Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>취소</Button>
                          <Button
                            onClick={handleAddSchedule}
                            disabled={scheduleLoading || !scheduleForm.title.trim() || !scheduleForm.date || !scheduleForm.time}
                          >
                            {scheduleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "등록하기"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {localSchedules.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">등록된 일정이 없습니다. 일정 추가 후 이번 세션에서 등록한 항목이 아래에 표시됩니다. (목록 조회 API는 별도로 제공되지 않습니다.)</p>
                    ) : (
                      localSchedules.map((s) => (
                        <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{s.title}</p>
                              <p className="text-sm text-muted-foreground">{s.time}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{s.type}</Badge>
                        </div>
                      ))
                    )}
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
