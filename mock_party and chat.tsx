"use client"

import { useState } from "react"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Users, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock 채팅방 목록
const mockChatRooms = [
  {
    id: "1",
    title: "치킨 팟",
    participants: ["몰입하는 7", "몰입하는 3", "몰입하는 15"],
    lastMessage: "6시에 N1에서 만나요!",
    lastMessageTime: "16:45",
    unreadCount: 2,
    postTitle: "오늘 저녁 치킨 팟 구해요",
  },
  {
    id: "2",
    title: "스터디 그룹",
    participants: ["몰입하는 12", "몰입하는 5", "몰입하는 22", "몰입하는 8"],
    lastMessage: "내일 오전 10시 어때요?",
    lastMessageTime: "15:30",
    unreadCount: 0,
    postTitle: "React 스터디 모집합니다",
  },
  {
    id: "3",
    title: "헬스 팟",
    participants: ["몰입하는 1", "몰입하는 9"],
    lastMessage: "내일부터 시작합시다",
    lastMessageTime: "어제",
    unreadCount: 5,
    postTitle: "헬스 같이 가실 분",
  },
]

// Mock 메시지
const mockMessages: Record<
  string,
  Array<{
    id: string
    author: string
    content: string
    time: string
    isMe: boolean
  }>
> = {
  "1": [
    { id: "1", author: "몰입하는 7", content: "오늘 6시에 BBQ 가실 분들 여기 모이세요!", time: "15:30", isMe: true },
    { id: "2", author: "몰입하는 3", content: "저 참가합니다!", time: "15:32", isMe: false },
    { id: "3", author: "몰입하는 15", content: "저도요~ 황금올리브 맛있죠", time: "15:35", isMe: false },
    { id: "4", author: "몰입하는 7", content: "좋아요! N1에서 6시에 만나요", time: "16:00", isMe: true },
    { id: "5", author: "몰입하는 3", content: "네 알겠습니다!", time: "16:30", isMe: false },
    { id: "6", author: "몰입하는 15", content: "6시에 N1에서 만나요!", time: "16:45", isMe: false },
  ],
  "2": [
    { id: "1", author: "몰입하는 12", content: "React 스터디 시작해볼까요?", time: "14:00", isMe: false },
    { id: "2", author: "몰입하는 5", content: "좋아요! 시간은 언제가 좋을까요?", time: "14:15", isMe: false },
    { id: "3", author: "몰입하는 22", content: "저는 오전이 좋아요", time: "15:00", isMe: false },
    { id: "4", author: "몰입하는 8", content: "내일 오전 10시 어때요?", time: "15:30", isMe: false },
  ],
  "3": [
    { id: "1", author: "몰입하는 1", content: "헬스 같이 가실 분 구해요", time: "어제", isMe: false },
    { id: "2", author: "몰입하는 9", content: "저 합류합니다!", time: "어제", isMe: true },
    { id: "3", author: "몰입하는 1", content: "내일부터 시작합시다", time: "어제", isMe: false },
  ],
}

const currentUser = "몰입하는 7"

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState(mockMessages)

  const selectedRoomData = mockChatRooms.find((r) => r.id === selectedRoom)
  const roomMessages = selectedRoom ? messages[selectedRoom] || [] : []

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return

    const newMsg = {
      id: String(Date.now()),
      author: currentUser,
      content: newMessage,
      time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    }

    setMessages({
      ...messages,
      [selectedRoom]: [...(messages[selectedRoom] || []), newMsg],
    })
    setNewMessage("")
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
                  {mockChatRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room.id)}
                      className={cn(
                        "w-full p-4 text-left hover:bg-muted/50 transition-colors border-b",
                        selectedRoom === room.id && "bg-primary/10",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {room.title.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">{room.title}</span>
                            <span className="text-xs text-muted-foreground">{room.lastMessageTime}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{room.lastMessage}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{room.participants.length}명</span>
                            {room.unreadCount > 0 && (
                              <Badge className="ml-auto bg-primary text-primary-foreground text-xs px-1.5 py-0">
                                {room.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* 채팅 영역 */}
            <Card className="lg:col-span-2 flex flex-col">
              {selectedRoom && selectedRoomData ? (
                <>
                  {/* 채팅방 헤더 */}
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedRoom(null)}>
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <Avatar>
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {selectedRoomData.title.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="font-semibold">{selectedRoomData.title}</h2>
                        <p className="text-xs text-muted-foreground">{selectedRoomData.participants.join(", ")}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {selectedRoomData.postTitle}
                      </Badge>
                    </div>
                  </CardHeader>

                  {/* 메시지 목록 */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {roomMessages.map((msg) => (
                        <div key={msg.id} className={cn("flex gap-3", msg.isMe && "flex-row-reverse")}>
                          {!msg.isMe && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-muted text-xs">{msg.author.slice(-2)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div className={cn("max-w-[70%]", msg.isMe && "items-end")}>
                            {!msg.isMe && <p className="text-xs text-muted-foreground mb-1">{msg.author}</p>}
                            <div
                              className={cn(
                                "rounded-lg px-3 py-2",
                                msg.isMe ? "bg-primary text-primary-foreground" : "bg-muted",
                              )}
                            >
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            <p className={cn("text-xs text-muted-foreground mt-1", msg.isMe && "text-right")}>
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* 메시지 입력 */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="메시지를 입력하세요..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button onClick={handleSendMessage}>
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
                      팟 모집 게시글에서 채팅방을 개설하면
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
