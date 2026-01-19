// Type declaration for process.env in client-side Next.js
declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string;
  };
};

// API Base URL (백엔드 주소)
// 배포 환경: Vercel 환경 변수에서 NEXT_PUBLIC_API_URL 설정 필요
//   - 백엔드가 EC2에서 실행 중이라면: EC2의 공인 IP 또는 도메인 (예: http://[EC2-IP]:8080 또는 https://api.madcamp-view.com)
// 로컬 개발: .env.local 파일에 NEXT_PUBLIC_API_URL=http://localhost:8080 설정
// 
// 중요: 백엔드 서버의 실제 접근 가능한 URL을 설정해야 합니다!
// 현재 기본값은 프론트엔드 도메인인데, 이는 잘못된 설정입니다.
// export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.madcamp-view.com';
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
  important: boolean;
}

// ========== Response DTOs ==========

export interface AuthorDto {
  nickname: string;
  anonymous: boolean;
  imageUrl?: string;
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
  likeCount: number;
  liked: boolean;
  categoryName?: string;
  timeAgo?: string;
  author?: AuthorDto;
  partyInfo?: PartyInfoDto;
  voted?: boolean;
}

export interface MemberResponseDto {
  nickname: string;
  realName: string;
  email: string;
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
  read: boolean;
  createdAt: string; // ISO 8601 format
}

export interface ChatMessageDto {
  chatRoomId: number;
  senderNickname: string;
  content: string;
  timestamp: string;
}

export interface ChatRoomResponseDto {
  chatRoomId: number;
  roomName: string;
  postId: number;
  createdAt: string;
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

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}