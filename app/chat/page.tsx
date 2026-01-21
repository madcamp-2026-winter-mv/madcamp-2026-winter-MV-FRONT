"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { ContentArea } from "@/components/layout/sidebar-context"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Send, Users, ArrowLeft, MessageCircle, MoreVertical, LogOut, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { chatApi, getChatWsUrl, memberApi, partyApi } from "@/lib/api/api"
import type { ChatRoomResponseDto, ChatMessageDto, ChatMemberResponseDto } from "@/lib/api/types"
import { Suspense } from "react"

function formatTime(s: string) {
  try {
    // 서버 LocalDateTime(타임존 없음)은 UTC로 저장된 경우가 있어, 없으면 'Z' 부여
    const str = /Z|[-+]\d{2}:?\d{2}$/.test(s) ? s : s + "Z"
    const d = new Date(str)
    return isNaN(d.getTime()) ? s : d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
  } catch {
    return s
  }
}

function formatRoomTime(s: string) {
  try {
    const str = /Z|[-+]\d{2}:?\d{2}$/.test(s) ? s : s + "Z"
    const d = new Date(str)
    if (isNaN(d.getTime())) return s
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 24 * 60 * 60 * 1000 && d.getDate() === now.getDate()) {
      return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    }
    if (diff < 48 * 60 * 60 * 1000 && d.getDate() === now.getDate() - 1) return "어제"
    return d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })
  } catch {
    return s
  }
}

function ChatContent() {
  const searchParams = useSearchParams()
  const [rooms, setRooms] = useState<ChatRoomResponseDto[]>([])
  const [messages, setMessages] = useState<ChatMessageDto[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [myNickname, setMyNickname] = useState<string | null>(null)
  const [myMemberId, setMyMemberId] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  const [sendDisabled, setSendDisabled] = useState(false)
  const [chatMembers, setChatMembers] = useState<ChatMemberResponseDto[]>([])
  const [membersOpen, setMembersOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false)
  const [kickTarget, setKickTarget] = useState<ChatMemberResponseDto | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const stompRef = useRef<any>(null)
  const subRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedRoom = rooms.find((r) => r.chatRoomId === selectedRoomId)
  const isOwner = chatMembers.find((m) => m.memberId === myMemberId)?.isOwner ?? false

  // URL ?room= 지원: 채팅방 개설 후 이동 등
  useEffect(() => {
    const room = searchParams.get("room")
    if (room) {
      const n = parseInt(room, 10)
      if (Number.isFinite(n)) setSelectedRoomId(n)
    }
  }, [searchParams])

  // 로그인 여부 및 내 정보
  useEffect(() => {
    let mounted = true
    memberApi
      .getMyInfo()
      .then((m) => {
        if (mounted) {
          setMyNickname(m.nickname)
          setMyMemberId(m.memberId ?? null)
        }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  // 채팅방 목록
  const refetchRooms = useCallback(async () => {
    try {
      const list = await chatApi.getMyRooms()
      setRooms(Array.isArray(list) ? list : [])
    } catch { /* keep current */ }
  }, [])

  useEffect(() => {
    let mounted = true
    setRoomsLoading(true)
    chatApi
      .getMyRooms()
      .then((list) => { if (mounted) setRooms(Array.isArray(list) ? list : []) })
      .catch(() => { if (mounted) setRooms([]) })
      .finally(() => { if (mounted) setRoomsLoading(false) })
    return () => { mounted = false }
  }, [])

  // 선택된 방의 멤버 목록 (isOwner 판단용)
  useEffect(() => {
    if (selectedRoomId == null) {
      setChatMembers([])
      return
    }
    let mounted = true
    partyApi
      .getChatRoomMembers(selectedRoomId)
      .then((list) => { if (mounted) setChatMembers(Array.isArray(list) ? list : []) })
      .catch(() => { if (mounted) setChatMembers([]) })
    return () => { mounted = false }
  }, [selectedRoomId])

  // 방 선택 시: 읽음 처리 + 메시지 로드 + STOMP 구독
  const connectAndSubscribe = useCallback(
    async (roomId: number) => {
      // 기존 구독 해제
      if (subRef.current) {
        try { subRef.current.unsubscribe() } catch { /* noop */ }
        subRef.current = null
      }
      if (stompRef.current) {
        try { stompRef.current.deactivate() } catch { /* noop */ }
        stompRef.current = null
      }
      setWsConnected(false)

      // 알람3: 입장 시 읽음 처리(미읽음 0)
      partyApi.markChatRoomAsRead(roomId).then(() => {
        setRooms((prev) =>
          prev.map((r) =>
            r.chatRoomId === roomId ? { ...r, unreadCount: 0 } : r
          )
        )
      }).catch(() => {})

      setMessagesLoading(true)
      try {
        const list = await chatApi.getMessages(roomId)
        setMessages(Array.isArray(list) ? list : [])
      } catch {
        setMessages([])
      } finally {
        setMessagesLoading(false)
      }

      // STOMP 연결 및 구독 (동적 import로 SSR 회피)
      try {
        const { Client } = await import("@stomp/stompjs")
        const SockJS = (await import("sockjs-client")).default
        const wsUrl = getChatWsUrl()
        // SockJS는 HTTP(S)로 /info 핸드셰이크를 하므로, ws/wss → http/https 변환
        const sockJsUrl = wsUrl.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://")
        console.log("[WS] getChatWsUrl:", wsUrl, "→ SockJS:", sockJsUrl)

        const client = new Client({
          webSocketFactory: () => new SockJS(sockJsUrl) as any,
          onConnect: () => {
            setWsConnected(true)
            // WebSocket 연결 성공 시 메시지 구독
            const subDest = `/sub/chat/room/${roomId}`
            console.log('[WS] subscribe:', subDest)
            const sub = client.subscribe(subDest, (msg) => {
              try {
                const d = JSON.parse(msg.body) as ChatMessageDto
                setMessages((prev) => [...prev, d])
              } catch { /* ignore */ }
            })
            subRef.current = sub
          },
          onStompError: () => setWsConnected(false),
          onWebSocketClose: () => setWsConnected(false),
        })
        client.activate()
        stompRef.current = client
      } catch {
        setWsConnected(false)
      }
    },
    []
  )

  useEffect(() => {
    if (selectedRoomId != null) {
      connectAndSubscribe(selectedRoomId)
    } else {
      setMessages([])
      if (subRef.current) { try { subRef.current.unsubscribe() } catch { /* noop */ }; subRef.current = null }
      if (stompRef.current) { try { stompRef.current.deactivate() } catch { /* noop */ }; stompRef.current = null }
      setWsConnected(false)
    }
    return () => {
      if (subRef.current) { try { subRef.current.unsubscribe() } catch { /* noop */ } }
      if (stompRef.current) { try { stompRef.current.deactivate() } catch { /* noop */ } }
    }
  }, [selectedRoomId, connectAndSubscribe])

  // 메시지 목록 최하단으로 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleDeleteRoom = async () => {
    if (selectedRoomId == null) return
    setActionLoading(true)
    try {
      await partyApi.deleteChatRoom(selectedRoomId)
      setDeleteConfirmOpen(false)
      setSelectedRoomId(null)
      await refetchRooms()
    } catch (e: any) {
      console.error("채팅방 삭제 실패:", e)
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeave = async () => {
    if (selectedRoomId == null || myMemberId == null) return
    setActionLoading(true)
    try {
      await partyApi.leaveOrKickMember(selectedRoomId, myMemberId)
      setLeaveConfirmOpen(false)
      setSelectedRoomId(null)
      await refetchRooms()
    } catch (e: any) {
      console.error("나가기 실패:", e)
    } finally {
      setActionLoading(false)
    }
  }

  const handleKick = async (m: ChatMemberResponseDto) => {
    if (selectedRoomId == null) return
    setActionLoading(true)
    try {
      await partyApi.leaveOrKickMember(selectedRoomId, m.memberId)
      setKickTarget(null)
      const list = await partyApi.getChatRoomMembers(selectedRoomId)
      setChatMembers(Array.isArray(list) ? list : [])
    } catch (e: any) {
      console.error("강퇴 실패:", e)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendMessage = async () => {
    const content = newMessage.trim()
    if (!content || selectedRoomId == null || !myNickname) return

    const payload = {
      chatRoomId: selectedRoomId,
      senderNickname: myNickname,
      content,
      timestamp: new Date().toISOString(),
    }

    setSendDisabled(true)
    try {
      const c = stompRef.current
      if (c?.connected) {
        c.publish({ destination: "/pub/chat/message", body: JSON.stringify(payload) })
        setNewMessage("")
      }
    } finally {
      setSendDisabled(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <ContentArea>
        <DesktopHeader title="채팅방" />

        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
            {/* 채팅방 목록 */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <h2 className="font-semibold">내 채팅방</h2>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-240px)]">
                  {roomsLoading ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">로딩 중...</div>
                  ) : rooms.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      <MessageCircle className="mx-auto h-10 w-10 mb-2 opacity-50" />
                      <p>참여 중인 채팅방이 없습니다</p>
                      <p className="text-xs mt-1">팟 모집 글에서 모집 완료 시 채팅방이 생성됩니다</p>
                    </div>
                  ) : (
                    rooms.map((room) => (
                      <button
                        key={room.chatRoomId}
                        onClick={() => setSelectedRoomId(room.chatRoomId)}
                        className={cn(
                          "w-full p-4 text-left hover:bg-muted/50 transition-colors border-b",
                          selectedRoomId === room.chatRoomId && "bg-primary/10"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="shrink-0">
                            {room.creatorProfileImageUrl ? (
                              <AvatarImage src={room.creatorProfileImageUrl} alt="" />
                            ) : null}
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {room.roomName.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium truncate">{room.roomName}</span>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {formatRoomTime(room.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {room.postTitle ?? `게시글 #${room.postId}`}
                            </p>
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="text-xs text-muted-foreground">
                                  {room.participantCount ?? "—"}명
                                </span>
                              </div>
                              {(room.unreadCount ?? 0) > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px]">
                                  {room.unreadCount! > 99 ? "99+" : room.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* 채팅 영역 */}
            <Card className="lg:col-span-2 flex flex-col">
              {selectedRoomId != null ? (
                <>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSelectedRoomId(null)}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <Avatar>
                        {selectedRoom?.creatorProfileImageUrl ? (
                          <AvatarImage src={selectedRoom.creatorProfileImageUrl} alt="" />
                        ) : null}
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {(selectedRoom?.roomName ?? "채팅방").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold truncate">{selectedRoom?.roomName ?? "채팅방"}</h2>
                        {!selectedRoom && (
                          <p className="text-xs text-muted-foreground">로딩 중...</p>
                        )}
                      </div>
                      {selectedRoom && (selectedRoom.postTitle || selectedRoom.postId) && (
                        <Badge variant="outline" className="text-xs shrink-0 max-w-[140px] truncate">
                          {selectedRoom.postTitle ?? `#${selectedRoom.postId}`}
                        </Badge>
                      )}
                      {!wsConnected && (
                        <span className="text-xs text-amber-600 shrink-0">실시간 연결 안 됨</span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setMembersOpen(true)}>
                            <Users className="h-4 w-4 mr-2" />
                            멤버 보기
                          </DropdownMenuItem>
                          {isOwner && (
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleteConfirmOpen(true)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              채팅방 삭제
                            </DropdownMenuItem>
                          )}
                          {!isOwner && (
                            <DropdownMenuItem variant="destructive" onClick={() => setLeaveConfirmOpen(true)}>
                              <LogOut className="h-4 w-4 mr-2" />
                              나가기
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  {/* 멤버 보기 Dialog */}
                  <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle>채팅방 멤버</DialogTitle>
                        <DialogDescription>참가자 목록입니다. 방장만 멤버를 강퇴할 수 있습니다.</DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[280px] pr-2">
                        <div className="space-y-2">
                          {chatMembers.map((m) => (
                            <div key={m.memberId} className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50 last:border-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <Avatar className="h-8 w-8 shrink-0">
                                  {m.profileImage ? <AvatarImage src={m.profileImage} alt="" /> : null}
                                  <AvatarFallback className="text-xs">{String(m.nickname).slice(-2)}</AvatarFallback>
                                </Avatar>
                                <span className="truncate">{m.nickname}</span>
                                {m.isOwner && <Badge variant="secondary" className="shrink-0 text-[10px]">방장</Badge>}
                              </div>
                              <div className="shrink-0">
                                {isOwner && !m.isOwner && (
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive h-8" onClick={() => setKickTarget(m)} disabled={actionLoading}>
                                    강퇴
                                  </Button>
                                )}
                                {!isOwner && m.memberId === myMemberId && (
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive h-8" onClick={() => { setMembersOpen(false); setLeaveConfirmOpen(true); }} disabled={actionLoading}>
                                    나가기
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>

                  {/* 채팅방 삭제 확인 */}
                  <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>채팅방 삭제</DialogTitle>
                        <DialogDescription>채팅방을 삭제하면 복구할 수 없습니다. 계속할까요?</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
                        <Button variant="destructive" onClick={handleDeleteRoom} disabled={actionLoading}>
                          {actionLoading ? "처리 중..." : "삭제"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* 나가기 확인 */}
                  <Dialog open={leaveConfirmOpen} onOpenChange={setLeaveConfirmOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>나가기</DialogTitle>
                        <DialogDescription>채팅방을 나가시겠습니까?</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setLeaveConfirmOpen(false)}>취소</Button>
                        <Button variant="destructive" onClick={handleLeave} disabled={actionLoading}>
                          {actionLoading ? "처리 중..." : "나가기"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* 강퇴 확인 */}
                  <Dialog open={kickTarget != null} onOpenChange={(open) => !open && setKickTarget(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>멤버 강퇴</DialogTitle>
                        <DialogDescription>
                          {kickTarget ? `${kickTarget.nickname}님을 강퇴하시겠습니까?` : ""}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setKickTarget(null)}>취소</Button>
                        <Button variant="destructive" onClick={() => kickTarget && handleKick(kickTarget)} disabled={actionLoading}>
                          {actionLoading ? "처리 중..." : "강퇴"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <div className="flex-1 min-h-0 max-h-[50vh] overflow-y-auto p-4">
                    {messagesLoading ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">메시지 로딩 중...</div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg, i) => {
                          const isMe = msg.senderNickname === myNickname
                          return (
                            <div
                              key={i}
                              className={cn("flex gap-3", isMe && "flex-row-reverse")}
                            >
                              {!isMe && (
                                <Avatar className="h-8 w-8 shrink-0">
                                  {msg.senderNickname === "몰입캠프" ? (
                                    <AvatarImage src="/madcamp_logo.png" alt="몰입캠프" />
                                  ) : msg.senderProfileImageUrl ? (
                                    <AvatarImage src={msg.senderProfileImageUrl} alt="" />
                                  ) : null}
                                  <AvatarFallback className="bg-muted text-xs">
                                    {msg.senderNickname === "몰입캠프" ? "몰입" : String(msg.senderNickname).slice(-2)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className={cn("max-w-[70%]", isMe && "items-end")}>
                                {!isMe && (
                                  <p className="text-xs text-muted-foreground mb-1">
                                    {msg.senderNickname}
                                  </p>
                                )}
                                <div
                                  className={cn(
                                    "rounded-lg px-3 py-2",
                                    isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                                  )}
                                >
                                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                <p
                                  className={cn(
                                    "text-xs text-muted-foreground mt-1",
                                    isMe && "text-right"
                                  )}
                                >
                                  {formatTime(msg.timestamp)}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder={
                          wsConnected
                            ? "메시지를 입력하세요..."
                            : "실시간 연결이 필요합니다 (새로고침 후 재시도)"
                        }
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        disabled={!wsConnected}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!wsConnected || !newMessage.trim() || sendDisabled}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>채팅방을 선택해주세요</p>
                    <p className="text-sm mt-2">
                      팟 모집 게시글에서 채팅방이 개설되면
                      <br />
                      여기에 표시됩니다
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </main>
      </ContentArea>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">채팅 서비스를 준비 중입니다...</p>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}