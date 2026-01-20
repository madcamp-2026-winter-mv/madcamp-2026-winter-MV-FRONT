"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Users, ArrowLeft, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { chatApi, getChatWsUrl, memberApi } from "@/lib/api/api"
import type { ChatRoomResponseDto, ChatMessageDto } from "@/lib/api/types"
import { Suspense } from "react"

function formatTime(s: string) {
  try {
    const d = new Date(s)
    return isNaN(d.getTime()) ? s : d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
  } catch {
    return s
  }
}

function formatRoomTime(s: string) {
  try {
    const d = new Date(s)
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
  const [newMessage, setNewMessage] = useState("")
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  const [sendDisabled, setSendDisabled] = useState(false)
  const stompRef = useRef<any>(null)
  const subRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedRoom = rooms.find((r) => r.chatRoomId === selectedRoomId)

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
      .then((m) => { if (mounted) setMyNickname(m.nickname) })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  // 채팅방 목록
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

  // 방 선택 시: 메시지 로드 + STOMP 구독
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

      <div className="ml-64">
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
                          <Avatar>
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {room.roomName.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium truncate">{room.roomName}</span>
                              <span className="text-xs text-muted-foreground shrink-0 ml-1">
                                {formatRoomTime(room.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {room.postTitle ?? `게시글 #${room.postId}`}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Users className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="text-xs text-muted-foreground">
                                {room.participantCount ?? "—"}명
                              </span>
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
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {(selectedRoom?.roomName ?? "채팅방").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold truncate">{selectedRoom?.roomName ?? "채팅방"}</h2>
                        {selectedRoom ? (
                          <Link
                            href={`/community/${selectedRoom.postId}`}
                            className="text-xs text-muted-foreground hover:text-primary truncate block"
                          >
                            게시글 보기
                          </Link>
                        ) : (
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
                    </div>
                  </CardHeader>

                  <ScrollArea className="flex-1 p-4">
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
                                  <AvatarFallback className="bg-muted text-xs">
                                    {String(msg.senderNickname).slice(-2)}
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
                  </ScrollArea>

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
      </div>
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