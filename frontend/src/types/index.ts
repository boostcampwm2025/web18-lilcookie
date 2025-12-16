// 링크 타입 - 백엔드 응답 구조
export interface Link {
  linkId: string; // UUID v4
  teamId: string; // 팀 ID (소문자)
  url: string;
  title: string; // 링크 제목
  tags: string[];
  summary: string;
  createdAt: string; // 한국 시간
  createdBy: string; // 사용자 ID (예: "J001")
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}
