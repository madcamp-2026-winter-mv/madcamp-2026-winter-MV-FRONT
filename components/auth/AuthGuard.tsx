"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function AuthGuard() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          "https://madcamp-view.com/api/auth/me",
          {
            withCredentials: true, 
          }
        )

        const user = res.data

        // 분반이 없는 경우
        if (!user.roomId || user.roomId === 0) {
          router.replace("/select-room")
        } else {
          router.replace("/main")
        }
      } catch (error) {
        // 로그인 안 된 상태
        router.replace("/login")
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      로그인 확인 중...
    </div>
  )
}
