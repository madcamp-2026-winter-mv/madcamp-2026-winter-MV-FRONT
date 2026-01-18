import { client } from "./axios";


export const CATEGORY_MAP: Record<string, number> = {
  "자유": 1,
  "질문": 2,
  "정보공유": 3,
  "채용공고": 4,
  "팟모집": 5
};


// 1. 게시글 목록 조회 (READ)
export const getPosts = async (category: string, page = 0) => {
  const categoryParam = category === "전체" ? null : category;
  
  const response = await client.get(`/api/posts`, {
    params: {
      categoryName: categoryParam,
      page: page,
      size: 10, 
    },
  });
  return response.data;
};

// 2. 게시글 상세 조회 (READ Detail)

export const getPostDetail = async (postId: number) => {
  const response = await client.get(`/api/posts/${postId}`);
  return response.data;
};

// 3. 게시글 작성 (WRITE)
export const createPost = async (data: { 
  title: string; 
  content: string; 
  categoryId: number; 
  roomId: number;
  type?: string;           
  maxParticipants?: number; 
  isAnonymous?: boolean;
  voteOptions?: string[];  
}) => {
  const response = await client.post("/api/posts", {
    title: data.title,
    content: data.content,
    categoryId: data.categoryId,
    roomId: data.roomId,        
    type: data.type || "GENERAL",
    maxParticipants: data.maxParticipants || 0,
    isAnonymous: data.isAnonymous || false,
    voteContents: data.voteOptions || null 
  });
  return response.data;
};


// 4. 커뮤니티(카테고리) 생성

export const createCommunity = async (name: string) => {
  const response = await client.post("/api/categories", { name });
  return response.data;
};

// 5. 모든 커뮤니티(카테고리) 목록 조회
export const getCommunities = async () => {
  try {
    const response = await client.get("/api/categories");
    return response.data; 
  } catch (error) {
    console.error("카테고리 목록 로딩 실패", error);
    return [];
  }
};

// 6. 좋아요 토글
export const toggleLike = async (postId: number) => {
  const response = await client.post(`/api/posts/${postId}/like`);
  return response.data;
};

// 7. 팟 참여하기 (파티 조인)
export const joinParty = async (postId: number) => {
  const response = await client.post(`/api/posts/${postId}/join`);
  return response.data;
};

export { client };