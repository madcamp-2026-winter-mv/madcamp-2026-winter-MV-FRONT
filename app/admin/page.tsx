"use client"

import { useEffect, useState, useCallback } from "react"
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
import { Users, Copy, Trash2, Play, Shuffle, Clock, RefreshCw } from "lucide-react"
import { memberApi, adminApi, roomApi } from "@/lib/api/api"
import type { MemberResponseDto, Schedule } from "@/lib/api/types"

export default function AdminPage() {
  const [member, setMember] = useState<MemberResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [attendanceMinutes, setAttendanceMinutes] = useState(5)
  const [attendanceEndTime, setAttendanceEndTime] = useState<number | null>(null)
  const [attendanceRemainingSeconds, setAttendanceRemainingSeconds] = useState(0)

  const ATTENDANCE_STORAGE_KEY = (rid: number) => `admin_attendance_end_${rid}`
  const isAttendanceActive = attendanceEndTime != null
  const [inviteCode, setInviteCode] = useState("")
  const [inviteCodeLoading, setInviteCodeLoading] = useState(false)
  const [selectedPresenter, setSelectedPresenter] = useState<MemberResponseDto | null>(null)
  const [presenterLoading, setPresenterLoading] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [scheduleSaving, setScheduleSaving] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    content: "",
    startDate: "",
    startTime: "09:00",
    isImportant: false,
  })

  const [attendanceList, setAttendanceList] = useState<MemberResponseDto[]>([])
  const [attendanceListLoading, setAttendanceListLoading] = useState(false)
  const [kickTarget, setKickTarget] = useState<MemberResponseDto | null>(null)
  const [kickLoading, setKickLoading] = useState(false)

  const [scheduleList, setScheduleList] = useState<Schedule[]>([])
  const [scheduleListLoading, setScheduleListLoading] = useState(false)
  const [deleteScheduleLoading, setDeleteScheduleLoading] = useState(false)

  const roomId = member?.roomId ?? null
  const roomName = member?.roomName ?? ""

  const refetchMember = useCallback(async () => {
    try {
      const m = await memberApi.getMyInfo()
      setMember(m)
      setError(null)
    } catch (e: any) {
      setError(e?.message ?? e?.error ?? "정보를 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }, [])

  const refetchAttendance = useCallback(async () => {
    if (!roomId) return
    setAttendanceListLoading(true)
    try {
      const list = await adminApi.getRealNameAttendance(roomId)
      setAttendanceList(list)
    } catch (e: any) {
      console.error("출석/멤버 목록 조회 실패:", e)
    } finally {
      setAttendanceListLoading(false)
    }
  }, [roomId])

  const refetchSchedules = useCallback(async () => {
    if (!roomId) return
    setScheduleListLoading(true)
    try {
      const list = await roomApi.getSchedules(roomId)
      setScheduleList(list)
    } catch (e: any) {
      console.error("일정 목록 조회 실패:", e)
    } finally {
      setScheduleListLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    memberApi
      .getMyInfo()
      .then((m) => { if (mounted) setMember(m) })
      .catch((e: any) => { if (mounted) setError(e?.message ?? e?.error ?? "정보를 불러오지 못했습니다.") })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (roomId) refetchAttendance()
  }, [roomId, refetchAttendance])

  useEffect(() => {
    if (roomId) refetchSchedules()
  }, [roomId, refetchSchedules])

  // 출석 종료 시각 복원 (새로고침·다른 탭 다녀와도 유지)
  useEffect(() => {
    if (!roomId) return
    try {
      const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY(roomId))
      if (raw) {
        const et = Number(raw)
        if (et > Date.now()) {
          setAttendanceEndTime(et)
          setAttendanceRemainingSeconds(Math.max(0, Math.ceil((et - Date.now()) / 1000)))
        } else {
          localStorage.removeItem(ATTENDANCE_STORAGE_KEY(roomId))
        }
      }
    } catch (_) {}
  }, [roomId])

  // 출석 남은 시간 카운트다운 (1초마다)
  useEffect(() => {
    if (!attendanceEndTime || !roomId) return
    const key = ATTENDANCE_STORAGE_KEY(roomId)
    const id = setInterval(() => {
      const rem = Math.max(0, Math.ceil((attendanceEndTime - Date.now()) / 1000))
      setAttendanceRemainingSeconds(rem)
      if (rem <= 0) {
        setAttendanceEndTime(null)
        setAttendanceRemainingSeconds(0)
        localStorage.removeItem(key)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [attendanceEndTime, roomId])

  const handleCopyCode = () => {
    if (inviteCode) navigator.clipboard.writeText(inviteCode)
  }

  const handleGenerateCode = async () => {
    if (!roomId) return
    setInviteCodeLoading(true)
    try {
      const code = await adminApi.refreshInviteCode(roomId)
      setInviteCode(code)
    } catch (e: any) {
      setError(e?.message ?? e?.error ?? "초대 코드 생성에 실패했습니다.")
    } finally {
      setInviteCodeLoading(false)
    }
  }

  const handleStartAttendance = async () => {
    if (!roomId) return
    try {
      await adminApi.startAttendance(roomId, attendanceMinutes)
      const endTime = Date.now() + attendanceMinutes * 60 * 1000
      localStorage.setItem(ATTENDANCE_STORAGE_KEY(roomId), String(endTime))
      setAttendanceEndTime(endTime)
      setAttendanceRemainingSeconds(attendanceMinutes * 60)
      await refetchAttendance()
    } catch (e: any) {
      setError(e?.message ?? e?.error ?? "출석 시작에 실패했습니다.")
    }
  }

  const handlePickPresenter = async () => {
    if (!roomId) return
    setPresenterLoading(true)
    try {
      const picked = await adminApi.pickPresenter(roomId)
      setSelectedPresenter(picked)
      await refetchAttendance()
    } catch (e: any) {
      setError(e?.message ?? e?.error ?? "진행행자 선정에 실패했습니다.")
    } finally {
      setPresenterLoading(false)
    }
  }

  const handleKick = async (m: MemberResponseDto) => {
    if (!roomId || m.memberId == null) return
    setKickLoading(true)
    try {
      await adminApi.kickMember(roomId, m.memberId)
      setKickTarget(null)
      await refetchMember()
      await refetchAttendance()
    } catch (e: any) {
      setError(e?.message ?? e?.error ?? "강퇴에 실패했습니다.")
    } finally {
      setKickLoading(false)
    }
  }

  const handleDeleteSchedule = async (s: Schedule) => {
    if (!roomId || s.scheduleId == null) return
    setDeleteScheduleLoading(true)
    try {
      await adminApi.deleteSchedule(roomId, s.scheduleId)
      setError(null)
      await refetchSchedules()
    } catch (e: any) {
      setError(e?.message ?? e?.error ?? "일정 삭제에 실패했습니다.")
    } finally {
      setDeleteScheduleLoading(false)
    }
  }

  const handleAddSchedule = async () => {
    if (!roomId || !scheduleForm.title.trim()) return
    const datePart = scheduleForm.startDate || new Date().toLocaleDateString("en-CA")
    const timePart = scheduleForm.startTime || "09:00"
    // 백엔드 ScheduleRequestDto.startTime은 LocalDateTime(타임존 없음). toISOString()은 UTC로 바꿔 13:00 KST→04:00 UTC가 되어 버그 유발. 로컬 날짜·시간 문자열만 전송.
    const startTime = `${datePart}T${timePart}:00`
    setScheduleSaving(true)
    try {
      await adminApi.addSchedule(roomId, {
        title: scheduleForm.title.trim(),
        content: scheduleForm.content.trim(),
        startTime,
        isImportant: scheduleForm.isImportant,
      })
      setIsScheduleOpen(false)
      setScheduleForm({ title: "", content: "", startDate: "", startTime: "09:00", isImportant: false })
      setError(null)
      await refetchSchedules()
    } catch (e: any) {
      setError(e?.message ?? e?.error ?? "일정 등록에 실패했습니다.")
    } finally {
      setScheduleSaving(false)
    }
  }

  const avgRate = attendanceList.length
    ? Math.round(attendanceList.reduce((a, b) => a + (b.attendanceRate ?? 0), 0) / attendanceList.length)
    : 0

  // 인원 관리: role=ADMIN 제외 (쓰레기통으로 kickMember 연동)
  const membersForManagement = attendanceList.filter((m) => m.role !== "ADMIN")

  if (loading && !member) {
    return (
      <div className="min-h-screen bg-background">
        <DesktopSidebar />
        <div className="ml-64">
          <DesktopHeader title="관리자" />
          <main className="p-6 flex items-center justify-center min-h-[40vh]">
            <p className="text-muted-foreground">로딩 중...</p>
          </main>
        </div>
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
                <p className="text-muted-foreground">
                  분반에 가입된 관리자만 이 페이지를 사용할 수 있습니다. 마이페이지에서 초대 코드로 분반에 가입해주세요.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  // role=ADMIN 또는 OWNER만 접근 허용
  if (!member || (member.role !== "ADMIN" && member.role !== "OWNER")) {
    return (
      <div className="min-h-screen bg-background">
        <DesktopSidebar />
        <div className="ml-64">
          <DesktopHeader title="관리자" />
          <main className="p-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  관리자(ADMIN) 권한이 있는 회원만 이 페이지를 이용할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <div className="ml-64">
        <DesktopHeader title="관리자" />

        <main className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
          )}

          <Tabs defaultValue="class" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="class">분반 관리</TabsTrigger>
              <TabsTrigger value="attendance">출석 관리</TabsTrigger>
              <TabsTrigger value="scrum">스크럼</TabsTrigger>
              <TabsTrigger value="members">인원 관리</TabsTrigger>
              <TabsTrigger value="schedule">일정 등록</TabsTrigger>
            </TabsList>

            {/* 분반 관리 탭 */}
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
                      <Input value={roomName} readOnly />
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
                        value={inviteCode || "새 코드 생성을 클릭하세요"}
                        readOnly
                        className="font-mono text-xl tracking-widest text-center"
                      />
                      <Button variant="outline" size="icon" onClick={handleCopyCode} disabled={!inviteCode}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleGenerateCode}
                      variant="outline"
                      className="w-full bg-transparent"
                      disabled={inviteCodeLoading}
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${inviteCodeLoading ? "animate-spin" : ""}`} />
                      {inviteCodeLoading ? "생성 중..." : "새 코드 생성"}
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
                <Card>
                  <CardHeader>
                    <CardTitle>출석 체크</CardTitle>
                    <CardDescription>출석 체크를 시작합니다 (지정 시간 후 자동 종료)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      {isAttendanceActive ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <span className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                          </span>
                          출석 진행중 (남은 시간{" "}
                          {`${Math.floor(attendanceRemainingSeconds / 60)}:${String(attendanceRemainingSeconds % 60).padStart(2, "0")}`})
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          출석 대기중
                        </div>
                      )}
                    </div>
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
                    <Button
                      onClick={handleStartAttendance}
                      disabled={isAttendanceActive}
                      className="w-full"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      시작
                    </Button>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>출석 현황</CardTitle>
                    <CardDescription>분반 멤버별 출석률</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {attendanceListLoading ? (
                      <p className="text-muted-foreground text-sm">로딩 중...</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                          <p className="text-3xl font-bold text-foreground">{attendanceList.length}</p>
                          <p className="text-sm text-muted-foreground">전체 인원</p>
                        </div>
                        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900 p-4 text-center">
                          <p className="text-3xl font-bold text-green-600">{avgRate}%</p>
                          <p className="text-sm text-green-600 dark:text-green-400">평균 출석률</p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                          <p className="text-3xl font-bold text-foreground">
                            {attendanceList.filter((m) => (m.attendanceRate ?? 0) >= 90).length}
                          </p>
                          <p className="text-sm text-muted-foreground">출석률 90% 이상</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>전체 출석 기록</CardTitle>
                  <CardDescription>분반 멤버별 출석률</CardDescription>
                </CardHeader>
                <CardContent>
                  {attendanceListLoading ? (
                    <p className="text-muted-foreground text-sm">로딩 중...</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>이름</TableHead>
                          <TableHead>이메일</TableHead>
                          <TableHead>출석률</TableHead>
                          <TableHead>발표 횟수</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceList.map((m) => (
                          <TableRow key={m.email}>
                            <TableCell className="font-medium">{m.nickname || m.realName}</TableCell>
                            <TableCell>{m.email}</TableCell>
                            <TableCell>
                              <Badge variant={(m.attendanceRate ?? 0) >= 90 ? "default" : "secondary"}>
                                {Math.round(m.attendanceRate ?? 0)}%
                              </Badge>
                            </TableCell>
                            <TableCell>{m.presentationCount ?? 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 스크럼 대표자 탭 */}
            <TabsContent value="scrum" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>스크럼 대표자 뽑기</CardTitle>
                  <CardDescription>발표 횟수가 가장 적은 멤버 중에서 랜덤으로 선정합니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center justify-center gap-6 py-8">
                    {selectedPresenter ? (
                      <div className="text-center">
                        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground">
                          {(selectedPresenter.nickname || selectedPresenter.realName || "?").charAt(0)}
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {selectedPresenter.nickname || selectedPresenter.realName}
                        </p>
                        <p className="text-muted-foreground">오늘의 스크럼 진행행자입니다!</p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Shuffle className="mx-auto mb-4 h-16 w-16" />
                        <p>버튼을 눌러 진행행자를 선정하세요</p>
                      </div>
                    )}
                    <Button size="lg" onClick={handlePickPresenter} disabled={presenterLoading}>
                      <Shuffle className={`mr-2 h-5 w-5 ${presenterLoading ? "animate-spin" : ""}`} />
                      {presenterLoading ? "선정 중..." : "랜덤 선정"}
                    </Button>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h4 className="mb-4 font-semibold">전체 멤버</h4>
                    {attendanceListLoading ? (
                      <p className="text-muted-foreground text-sm">로딩 중...</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {attendanceList.map((m) => (
                          <Badge
                            key={m.email}
                            variant={
                              selectedPresenter?.email === m.email ? "default" : "outline"
                            }
                            className="px-3 py-1"
                          >
                            {m.nickname || m.realName}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 인원 관리 탭 */}
            <TabsContent value="members" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>분반 인원 관리</CardTitle>
                      <CardDescription>분반 멤버를 관리합니다</CardDescription>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />총 {membersForManagement.length}명
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {attendanceListLoading ? (
                    <p className="text-muted-foreground text-sm">로딩 중...</p>
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
                        {membersForManagement.map((m) => (
                          <TableRow key={m.email}>
                            <TableCell className="font-medium">{m.nickname || m.realName}</TableCell>
                            <TableCell>{m.email}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-16 rounded-full bg-muted">
                                  <div
                                    className="h-2 rounded-full bg-primary"
                                    style={{ width: `${Math.min(100, m.attendanceRate ?? 0)}%` }}
                                  />
                                </div>
                                <span className="text-sm">{Math.round(m.attendanceRate ?? 0)}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Dialog open={kickTarget?.email === m.email} onOpenChange={(open) => !open && setKickTarget(null)}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    disabled={m.memberId == null}
                                    onClick={() => setKickTarget(m)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>멤버 강제 탈퇴</DialogTitle>
                                    <DialogDescription>
                                      정말 {m.nickname || m.realName}님을 분반에서 탈퇴시키겠습니까? 이 작업은 되돌릴 수 없습니다.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setKickTarget(null)}>취소</Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleKick(m)}
                                      disabled={kickLoading}
                                    >
                                      {kickLoading ? "처리 중..." : "탈퇴시키기"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 일정 등록 탭 */}
            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>일정 등록</CardTitle>
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
                            <Label>일정 제목</Label>
                            <Input
                              placeholder="예: 오전 스크럼"
                              value={scheduleForm.title}
                              onChange={(e) => setScheduleForm((f) => ({ ...f, title: e.target.value }))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>날짜</Label>
                              <Input
                                type="date"
                                value={scheduleForm.startDate}
                                onChange={(e) => setScheduleForm((f) => ({ ...f, startDate: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>시작 시간</Label>
                              <Input
                                type="time"
                                value={scheduleForm.startTime}
                                onChange={(e) => setScheduleForm((f) => ({ ...f, startTime: e.target.value }))}
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
                              id="schedule-important"
                              checked={scheduleForm.isImportant}
                              onChange={(e) => setScheduleForm((f) => ({ ...f, isImportant: e.target.checked }))}
                              className="rounded"
                            />
                            <Label htmlFor="schedule-important">중요 일정</Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>
                            취소
                          </Button>
                          <Button onClick={handleAddSchedule} disabled={scheduleSaving || !scheduleForm.title.trim()}>
                            {scheduleSaving ? "등록 중..." : "등록하기"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {scheduleListLoading ? (
                    <p className="text-muted-foreground text-sm py-4">로딩 중...</p>
                  ) : scheduleList.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4">등록된 일정이 없습니다. 「일정 추가」로 등록해주세요.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>제목</TableHead>
                          <TableHead>일시</TableHead>
                          <TableHead>설명</TableHead>
                          <TableHead>중요</TableHead>
                          <TableHead className="w-[60px] text-right">삭제</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheduleList.map((s) => (
                          <TableRow key={s.scheduleId}>
                            <TableCell className="font-medium">{s.title}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {s.startTime ? new Date(s.startTime).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" }) : "-"}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground">{s.content || "-"}</TableCell>
                            <TableCell>{(s.important ?? s.isImportant) ? <Badge variant="secondary">중요</Badge> : "-"}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                disabled={deleteScheduleLoading}
                                onClick={() => handleDeleteSchedule(s)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
