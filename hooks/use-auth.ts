"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authApi, memberApi } from "@/lib/api/api"
import type { MemberResponseDto } from "@/lib/api/types"

interface AuthState {
  user: MemberResponseDto | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  // 사용자 정보 가져오기
  const fetchUser = async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }))
      
      // 먼저 OAuth2 사용자 정보 확인
      const oauthUser = await authApi.getUser()
      
      console.log('[useAuth] OAuth user response:', oauthUser)
      
      if (oauthUser.error) {
        console.log('[useAuth] OAuth error:', oauthUser.error)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
        return
      }

      // 멤버 정보 가져오기
      const memberInfo = await memberApi.getMyInfo()
      
      console.log('[useAuth] Member info:', memberInfo)
      
      setAuthState({
        user: memberInfo,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error: any) {
      // 에러 정보 상세 추출
      const errorMessage = error?.message || error?.error || String(error) || 'Unknown error';
      const errorStatus = error?.statusCode || error?.status || 0;
      const errorUrl = error?.url || 'Unknown URL';
      const errorDetails = error?.details || {};
      
      // 상세 에러 로깅
      console.error('[useAuth] Error fetching user:', {
        rawError: error,
        errorType: typeof error,
        errorKeys: error ? Object.keys(error) : [],
        errorString: String(error),
      });
      
      console.error('[useAuth] Error details:', JSON.stringify({
        message: errorMessage,
        error: error?.error,
        statusCode: errorStatus,
        url: errorUrl,
        details: errorDetails,
        originalError: error?.originalError,
      }, null, 2));
      
      // 네트워크 오류인 경우에도 로딩 상태를 해제하여 로그인 페이지를 표시
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }

  // 로그아웃
  const logout = async () => {
    try {
      await memberApi.logout()
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return {
    ...authState,
    refetch: fetchUser,
    logout,
  }
}
