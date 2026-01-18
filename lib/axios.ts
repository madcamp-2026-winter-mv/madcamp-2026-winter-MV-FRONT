import axios from "axios";

// 백엔드 도메인 설정
const BASE_URL = "https://madcamp-view.com";

export const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // 중요: 쿠키(JSESSIONID)를 주고받기 위해 필수 설정
  withCredentials: true, 
});