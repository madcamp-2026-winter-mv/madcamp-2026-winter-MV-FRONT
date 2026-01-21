// Type declaration for process.env in client-side Next.js
declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string;
  };
};

// API Base URL (백엔드 주소). 앱은 localhost:3000에서 접속. 기본값: 배포 서버. 로컬 백엔드 사용 시 .env.local 에 NEXT_PUBLIC_API_URL=http://localhost:8080
// export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://madcamp-view.com';
export const API_BASE_URL = 'https://api.madcamp-view.com';

// API URL 확인용 (디버깅)
if (typeof window !== 'undefined') {
  console.log('[API] API_BASE_URL:', API_BASE_URL);
}

// PostType Enum
export enum PostType {
  NORMAL = 'NORMAL',
  VOTE = 'VOTE',
  PARTY = 'PARTY',
  ATTENDANCE = 'ATTENDANCE',
  PRESENTER = 'PRESENTER',
  SCHEDULE = 'SCHEDULE',
}

// ========== Request DTOs ==========

/**
 * 글(게시글) 작성/수정 요청.
 * - create: roomId, categoryId 필수. type=VOTE 시 voteContents, type=PARTY 시 maxParticipants 권장.
 * - update: title, content만 사용됨(백엔드). 기타 필드는 무시.
 */
export interface PostRequestDto {
  roomId?: number;
  categoryId?: number;
  title: string;
  content: string;
  type: PostType;
  maxParticipants?: number;
  voteContents?: string[];
  isAnonymous?: boolean;
}

/** 글 작성 시 roomId, categoryId가 필수인 요청 (createPost 전용) */
export interface CreatePostRequestDto extends PostRequestDto {
  roomId: number;
  categoryId: number;
}

export interface VoteRequest {
  memberId?: number;
  optionId: number;
}

export interface ScheduleRequestDto {
  title: string;
  content: string;
  startTime: string; // ISO 8601 format
  isImportant: boolean;
}

// ========== Response DTOs ==========

export interface AuthorDto {
  nickname: string;
  anonymous?: boolean;
  isAnonymous?: boolean;
  imageUrl?: string;
  /** 글쓴이 분반 ID. 익명이면 없음. 표시: "{roomId} 분반" */
  roomId?: number;
}

export interface PartyInfoDto {
  currentCount: number;
  maxCount: number;
  recruiting: boolean;
}

/** 댓글 응답 (createComment 응답 및 PostResponseDto.comments 항목) */
export interface CommentResponseDto {
  commentId: number;
  memberId?: number;
  content: string;
  authorNickname: string;
  createdAt: string; // ISO 8601 format
  isAnonymous?: boolean;
  /** 댓글 작성자 분반 ID. 익명이면 없음. 표시: "{roomId} 분반" */
  roomId?: number;
  /** 댓글 작성자 프로필 이미지 (익명이면 없음) */
  imageUrl?: string;
  /** 현재 로그인 사용자 본인 댓글 여부 (이메일 기준, 익명 댓글도 수정/삭제 가능). 서버가 mine으로 보낼 수 있어 둘 다 허용. */
  isMine?: boolean;
  mine?: boolean;
}

export interface VoteResponse {
  optionId: number;
  content: string;
  count: number;
  percentage: number;
}

export interface PostResponseDto {
  postId: number;
  title: string;
  content: string;
  type: PostType;
  authorNickname: string;
  createdAt: string; // ISO 8601 format
  voteOptions?: VoteResponse[];
  currentParticipants?: number;
  maxParticipants?: number;
  comments?: CommentResponseDto[];
  commentCount?: number;
  likeCount: number;
  liked: boolean;
  categoryName?: string;
  timeAgo?: string;
  author?: AuthorDto;
  partyInfo?: PartyInfoDto;
  voted?: boolean;
  isVoted?: boolean;
  isAuthor?: boolean;
  /** 팟 작성자일 때만. 임시 참가자(선택된 댓글 작성자) memberId 목록. */
  tempParticipantIds?: number[];
  /** 팟 모집 완료 시 해당 게시글의 채팅방 ID. 참가자에게만 노출되는 '채팅방으로 이동'용. */
  chatRoomId?: number | null;
  /** 팟 모집 완료 시, 현재 사용자가 그 채팅방 참가자인지. 참가자에게만 '채팅방에서 대화를 나눠보세요' 블록 노출. */
  isChatParticipant?: boolean;
  /** 팟 모집 완료 시, 채팅방 참가자 중 글쓴이 제외. 모두에게 노출. */
  chatParticipants?: { nickname: string; imageUrl?: string | null; roomId?: number }[];
}

export interface MemberResponseDto {
  memberId?: number;
  nickname: string;
  realName: string;
  email: string;
  profileImage?: string;
  roomName?: string;
  roomId?: number;
  role: string; // 'OWNER' | 'ADMIN' | 'MEMBER'
  presentationCount: number;
  attendanceCount: number;
  attendanceRate: number;
  writtenPostsCount: number;
  commentedPostsCount: number;
  ongoingPartyCount: number;
  allowAlarm: boolean;
}

export interface CategoryDto {
  categoryId: number;
  name: string;
  icon: string;
}

export interface NotificationResponseDto {
  notificationId: number;
  content: string;
  url: string;
  /** "COMMENT" | "CHAT_INVITE" */
  type?: string;
  /** @deprecated use isRead */
  read?: boolean;
  isRead?: boolean;
  createdAt: string; // ISO 8601 format
}

export interface ChatMessageDto {
  chatRoomId: number;
  senderNickname: string;
  senderProfileImageUrl?: string | null;
  content: string;
  timestamp: string;
}

export interface ChatRoomResponseDto {
  chatRoomId: number;
  roomName: string;
  postId: number;
  postTitle?: string;
  /** 채팅방 개설자(방장) 프로필 이미지 URL. 대표 이미지용 */
  creatorProfileImageUrl?: string | null;
  createdAt: string;
  participantCount?: number;
  /** 알람3: 해당 채팅방의 내 미읽음 메시지 개수 */
  unreadCount?: number;
}

/** 채팅방 멤버 목록 (GET /api/party/rooms/{chatRoomId}/members) */
export interface ChatMemberResponseDto {
  memberId: number;
  nickname: string;
  profileImage?: string | null;
  isOwner: boolean;
}

export interface Advertisement {
  id: number;
  imageUrl: string;
  adName: string;
  displayOrder: number;
}

// ========== Home Dashboard Response ==========

export interface HomeDashboardResponse {
  hotPosts: PostResponseDto[];
  [key: string]: any; // Additional dashboard data
}

// ========== API Error Response ==========

// GET /api/rooms/{roomId}/schedules 응답 (백엔드: isImportant → JSON에 important 또는 isImportant)
export interface Schedule {
  scheduleId: number;
  title: string;
  content?: string;
  startTime: string; // ISO 8601
  important?: boolean;
  isImportant?: boolean;
}

// GET /api/rooms/{roomId}/presenter 응답
export interface CurrentPresenterResponse {
  presenterNickname?: string;
  presenterEmail?: string;
  /** 스크럼 진행자 프로필 이미지 URL */
  presenterProfileImageUrl?: string | null;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

/** Spring Page<T> (GET /api/posts/search 등) */
export interface PageDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;  // 0-based page index
  first: boolean;
  last: boolean;
}