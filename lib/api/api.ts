import { API_BASE_URL } from './types';
import type {
  PostRequestDto,
  PostResponseDto,
  VoteRequest,
  VoteResponse,
  CommentResponseDto,
  MemberResponseDto,
  CategoryDto,
  NotificationResponseDto,
  ChatMessageDto,
  ChatRoomResponseDto,
  ScheduleRequestDto,
  Schedule,
  CurrentPresenterResponse,
  Advertisement,
  HomeDashboardResponse,
  ApiError,
} from './types';

// ========== 글&댓글 (Posts & Comments) API ==========
// - 글: createPost, updatePost, deletePost + 목록/상세/검색 등
// - 댓글: createComment
// 모두 인증 필요 (credentials: 'include' 사용)

// ========== Helper Functions ==========

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = {
      error: `HTTP error! status: ${response.status}`,
      statusCode: response.status,
    };
    try {
      const errorData = await response.json();
      Object.assign(error, errorData);
    } catch {
      // If response is not JSON, use default error
    }
    throw error;
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return response.text() as unknown as T;
  }

  return response.json();
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session-based auth
    ...options,
  };

  // 타임아웃 설정 (10초)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    console.log('[API] Requesting:', url);
    const response = await fetch(url, {
      ...defaultOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    console.log('[API] Response status:', response.status, response.statusText);
    return handleResponse<T>(response);
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // 에러 정보 상세 추출
    const errorName = error?.name || String(error?.constructor?.name) || 'Unknown';
    const errorMessage = error?.message || String(error) || 'Unknown error';
    const errorStack = error?.stack || '';
    
    // 상세 에러 로깅
    console.error('[API] Raw error:', {
      error: error,
      name: errorName,
      message: errorMessage,
      stack: errorStack,
      type: typeof error,
      keys: error ? Object.keys(error) : [],
      toString: String(error),
    });
    
    // 네트워크 오류 처리
    if (errorName === 'AbortError' || errorMessage.includes('aborted')) {
      const apiError = {
        error: 'Request timeout',
        message: '서버 응답이 지연되고 있습니다. 네트워크 연결을 확인해주세요.',
        statusCode: 408,
        url: url,
        details: {
          errorName,
          errorMessage,
          apiBaseUrl: API_BASE_URL,
        },
      };
      console.error('[API] Request timeout:', JSON.stringify(apiError, null, 2));
      throw apiError;
    }
    
    // Failed to fetch 에러 처리 (네트워크 오류)
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorName === 'TypeError' ||
        errorMessage.includes('fetch')) {
      const apiError = {
        error: 'Network error',
        message: `서버에 연결할 수 없습니다. 다음을 확인해주세요:\n1. 백엔드 서버가 실행 중인지 확인 (${API_BASE_URL})\n2. CORS 설정 확인\n3. 네트워크 연결 확인`,
        statusCode: 0,
        url: url,
        details: {
          errorName,
          errorMessage,
          apiBaseUrl: API_BASE_URL,
          suggestion: '백엔드 서버가 실행 중인지 확인하세요.',
        },
      };
      console.error('[API] Network error:', JSON.stringify(apiError, null, 2));
      throw apiError;
    }
    
    // 기타 알 수 없는 오류
    const apiError = {
      error: 'Unknown error',
      message: errorMessage || '알 수 없는 오류가 발생했습니다.',
      statusCode: 0,
      url: url,
      details: {
        errorName,
        errorMessage,
        errorStack,
        apiBaseUrl: API_BASE_URL,
      },
    };
    console.error('[API] Unknown error:', JSON.stringify(apiError, null, 2));
    throw apiError;
  }
}

// ========== Post APIs (글 쓰기/수정/삭제/조회) ==========

export const postApi = {
  /** 전체 글 목록 */
  getAllPosts: (): Promise<PostResponseDto[]> => {
    return apiRequest<PostResponseDto[]>('/api/posts');
  },

  /** 글 상세 (댓글 포함). 인증 필요. */
  getPostDetail: (postId: number): Promise<PostResponseDto> => {
    return apiRequest<PostResponseDto>(`/api/posts/${postId}`);
  },

  /**
   * 글 작성. 인증 필요.
   * 요청 시 roomId, categoryId 필수. type=VOTE면 voteContents, type=PARTY면 maxParticipants 권장.
   */
  createPost: (data: PostRequestDto): Promise<PostResponseDto> => {
    return apiRequest<PostResponseDto>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** 글 수정. 본인만 가능. title, content만 반영됨. */
  updatePost: (postId: number, data: PostRequestDto): Promise<PostResponseDto> => {
    return apiRequest<PostResponseDto>(`/api/posts/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /** 글 삭제. 본인만 가능. */
  deletePost: (postId: number): Promise<string> => {
    return apiRequest<string>(`/api/posts/${postId}`, {
      method: 'DELETE',
    });
  },

  // Get posts by room
  getPostsByRoom: (roomId: number): Promise<PostResponseDto[]> => {
    return apiRequest<PostResponseDto[]>(`/api/posts/room/${roomId}`);
  },

  // Get posts by category
  getPostsByCategory: (categoryId: number): Promise<PostResponseDto[]> => {
    return apiRequest<PostResponseDto[]>(`/api/posts/category/${categoryId}`);
  },

  // Get my posts
  getMyPosts: (): Promise<PostResponseDto[]> => {
    return apiRequest<PostResponseDto[]>('/api/posts/me');
  },

  // Get posts I commented on
  getPostsICommented: (): Promise<PostResponseDto[]> => {
    return apiRequest<PostResponseDto[]>('/api/posts/me/comments');
  },

  // Get hot 3 posts
  getHot3Posts: (): Promise<PostResponseDto[]> => {
    return apiRequest<PostResponseDto[]>('/api/posts/common/hot3');
  },

  // Toggle like
  toggleLike: (postId: number): Promise<string> => {
    return apiRequest<string>(`/api/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  // Join party
  joinParty: (postId: number): Promise<string> => {
    return apiRequest<string>(`/api/posts/${postId}/join`, {
      method: 'POST',
    });
  },

  // Search posts
  searchPosts: (keyword: string): Promise<PostResponseDto[]> => {
    return apiRequest<PostResponseDto[]>(`/api/posts/search?keyword=${encodeURIComponent(keyword)}`);
  },

  // Get room dashboard
  getRoomDashboard: (roomId: number): Promise<Record<string, any>> => {
    return apiRequest<Record<string, any>>(`/api/posts/room/${roomId}/dashboard`);
  },
};

// ========== Vote APIs ==========

export const voteApi = {
  // Get vote details
  getVoteDetails: (postId: number): Promise<VoteResponse[]> => {
    return apiRequest<VoteResponse[]>(`/api/vote/${postId}`);
  },

  // Cast vote
  castVote: (postId: number, data: VoteRequest): Promise<string> => {
    return apiRequest<string>(`/api/vote/${postId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Close vote
  closeVote: (postId: number): Promise<string> => {
    return apiRequest<string>(`/api/vote/${postId}/close`, {
      method: 'PATCH',
    });
  },
};

// ========== Comment APIs (댓글 쓰기/올리기) ==========

export const commentApi = {
  /**
   * 댓글 작성. 인증 필요.
   * POST /api/posts/{postId}/comments, body: { content: string }
   */
  createComment: (postId: number, content: string): Promise<CommentResponseDto> => {
    return apiRequest<CommentResponseDto>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
};

// ========== Member APIs ==========

export const memberApi = {
  // Get my info
  getMyInfo: (): Promise<MemberResponseDto> => {
    return apiRequest<MemberResponseDto>('/api/members/me');
  },

  // Update nickname
  updateNickname: (nickname: string): Promise<string> => {
    return apiRequest<string>('/api/members/me/nickname', {
      method: 'PATCH',
      body: JSON.stringify({ nickname }),
    });
  },

  checkNickname: (nickname: string): Promise<boolean> => {
    return apiRequest<boolean>(`/api/members/check/nickname?nickname=${encodeURIComponent(nickname)}`, {
      method: 'GET',
    });
  },

  // Toggle alarm
  toggleAlarm: (allowAlarm: boolean): Promise<boolean> => {
    return apiRequest<boolean>('/api/members/me/alarm', {
      method: 'PATCH',
      body: JSON.stringify({ allowAlarm }),
    });
  },

  // Logout
  logout: (): Promise<string> => {
    return apiRequest<string>('/api/members/logout', {
      method: 'POST',
    });
  },

  // Leave room
  leaveRoom: (): Promise<string> => {
    return apiRequest<string>('/api/members/me/room', {
      method: 'DELETE',
    });
  },

  /** 분반 가입 (초대 코드) — POST /api/members/me/room/join. 백엔드에 없으면 roomApi.joinRoom(/api/rooms/join) 사용 */
  joinRoom: (inviteCode: string): Promise<string> => {
    return apiRequest<string>('/api/members/me/room/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  },
};

// ========== Category APIs ==========

export const categoryApi = {
  // Get all categories
  getAllCategories: (): Promise<CategoryDto[]> => {
    return apiRequest<CategoryDto[]>('/api/categories');
  },

  // Create category
  createCategory: (name: string): Promise<string> => {
    return apiRequest<string>('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  /** GET /api/categories/check?name= — 카테고리명 중복 확인. { available: true } = 사용 가능, { available: false } = 이미 존재 */
  checkDuplicate: (name: string): Promise<{ available: boolean }> => {
    return apiRequest<{ available: boolean }>(`/api/categories/check?name=${encodeURIComponent(name)}`);
  },
};

// ========== Notification APIs ==========

export const notificationApi = {
  // Get my notifications
  getMyNotifications: (): Promise<NotificationResponseDto[]> => {
    return apiRequest<NotificationResponseDto[]>('/api/notifications');
  },

  // Subscribe to notifications (SSE)
  subscribe: (): EventSource => {
    return new EventSource(`${API_BASE_URL}/api/notifications/subscribe`, {
      withCredentials: true,
    });
  },

  // Click notification
  clickNotification: (notificationId: number): Promise<string> => {
    return apiRequest<string>(`/api/notifications/${notificationId}/click`, {
      method: 'POST',
    });
  },

  // Delete notification
  deleteNotification: (notificationId: number): Promise<void> => {
    return apiRequest<void>(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};

// ========== Chat APIs ==========

/** 채팅 WebSocket URL (SockJS/STOMP). https→wss, http→ws */
export const getChatWsUrl = () => API_BASE_URL.replace(/^http/, 'ws') + '/ws-stomp';

export const chatApi = {
  // Get my chat rooms
  getMyRooms: (): Promise<ChatRoomResponseDto[]> => {
    return apiRequest<ChatRoomResponseDto[]>('/api/chat/rooms');
  },

  // Get messages
  getMessages: (chatRoomId: number): Promise<ChatMessageDto[]> => {
    return apiRequest<ChatMessageDto[]>(`/api/chat/rooms/${chatRoomId}/messages`);
  },
};

// ========== Room APIs ==========

export const roomApi = {
  // GET /api/rooms/{roomId}/presenter — 현재 발표자 조회
  getCurrentPresenter: (roomId: number): Promise<CurrentPresenterResponse> => {
    return apiRequest<CurrentPresenterResponse>(`/api/rooms/${roomId}/presenter`);
  },

  // GET /api/rooms/{roomId}/schedules — 분반 일정 조회
  getSchedules: (roomId: number): Promise<Schedule[]> => {
    return apiRequest<Schedule[]>(`/api/rooms/${roomId}/schedules`);
  },

  // Join room
  joinRoom: (inviteCode: string): Promise<string> => {
    return apiRequest<string>('/api/rooms/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  },

  // Pick next presenter
  pickNext: (roomId: number): Promise<{ message: string; nextPresenterNickname: string }> => {
    return apiRequest<{ message: string; nextPresenterNickname: string }>(
      `/api/rooms/${roomId}/presenter/next`,
      {
        method: 'POST',
      }
    );
  },

  // Start attendance
  startAttendance: (roomId: number, minutes: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/api/rooms/${roomId}/attendance/start`, {
      method: 'POST',
      body: JSON.stringify({ minutes }),
    });
  },

  // Submit attendance
  submitAttendance: (): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>('/api/rooms/attendance/submit', {
      method: 'POST',
    });
  },
};

// ========== Party APIs ==========

export const partyApi = {
  // Confirm party
  confirmParty: (postId: number, selectedMemberIds: number[]): Promise<number> => {
    return apiRequest<number>(`/api/party/${postId}/confirm`, {
      method: 'POST',
      body: JSON.stringify(selectedMemberIds),
    });
  },

  // Add member to party
  addMember: (chatRoomId: number, memberId: number): Promise<void> => {
    return apiRequest<void>(`/api/party/rooms/${chatRoomId}/members/${memberId}`, {
      method: 'POST',
    });
  },

  // Leave or kick member
  leaveOrKickMember: (chatRoomId: number, memberId: number): Promise<void> => {
    return apiRequest<void>(`/api/party/rooms/${chatRoomId}/members/${memberId}`, {
      method: 'DELETE',
    });
  },
};

// ========== Admin APIs ==========

export const adminApi = {
  // Get real name attendance
  getRealNameAttendance: (roomId: number): Promise<MemberResponseDto[]> => {
    return apiRequest<MemberResponseDto[]>(`/api/admin/rooms/${roomId}/attendance`);
  },

  // Refresh invite code
  refreshInviteCode: (roomId: number): Promise<string> => {
    return apiRequest<string>(`/api/admin/rooms/${roomId}/invite-code`, {
      method: 'POST',
    });
  },

  // Start attendance (admin)
  startAttendance: (roomId: number, minutes: number): Promise<string> => {
    return apiRequest<string>(`/api/admin/rooms/${roomId}/attendance/start?minutes=${minutes}`, {
      method: 'POST',
    });
  },

  // Pick presenter
  pickPresenter: (roomId: number): Promise<MemberResponseDto> => {
    return apiRequest<MemberResponseDto>(`/api/admin/rooms/${roomId}/presenter/pick`, {
      method: 'POST',
    });
  },

  // Add schedule
  addSchedule: (roomId: number, data: ScheduleRequestDto): Promise<string> => {
    return apiRequest<string>(`/api/admin/rooms/${roomId}/schedules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Kick member
  kickMember: (roomId: number, targetMemberId: number): Promise<string> => {
    return apiRequest<string>(`/api/admin/rooms/${roomId}/members/${targetMemberId}`, {
      method: 'DELETE',
    });
  },
};

// ========== Advertisement APIs ==========

export const adApi = {
  // Get ads
  getAds: (): Promise<Advertisement[]> => {
    return apiRequest<Advertisement[]>('/api/ads');
  },

  // Create ad
  createAd: (data: Advertisement): Promise<Advertisement> => {
    return apiRequest<Advertisement>('/api/ads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Delete ad
  deleteAd: (id: number): Promise<void> => {
    return apiRequest<void>(`/api/ads/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========== Home APIs ==========

export const homeApi = {
  // Get home dashboard
  getHomeDashboard: (roomId: number): Promise<HomeDashboardResponse> => {
    return apiRequest<HomeDashboardResponse>(`/api/home?roomId=${roomId}`);
  },
};

// ========== Auth APIs ==========

export const authApi = {
  // Get current user
  getUser: (): Promise<Record<string, any>> => {
    return apiRequest<Record<string, any>>('/api/auth/me');
  },
};
