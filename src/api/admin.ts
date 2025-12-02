import axios, { AxiosResponse } from "axios";

const API_BASE_URL = "http://localhost:8000";

// ======================================================
// 🔹 타입 정의 (Swagger 기반)
// ======================================================

// 📌 1) 크롤링 소스 목록 조회
export interface CrawlingSourceItem {
  source_name: string;
  base_url: string;
  id: number;
  is_active: boolean;
  categories: number[]; // 카테고리 ID 배열
}

export interface CrawlingSourceListResponse {
  total: number;
  active: number;
  inactive: number;
  sources: CrawlingSourceItem[];
}

// 📌 2) 크롤링 소스 상세 조회
export interface CrawlingSourceDetailResponse {
  id: number;
  source_name: string;
  base_url: string;
}

// 📌 3) 크롤링 소스 수정
export interface UpdateSourceRequest {
  source_name: string;
  base_url: string;
}

// 📌 4) 키워드 일괄 적용
export interface BulkKeywordUpdateRequest {
  category_ids: number[];
}

export interface BulkKeywordUpdateResponse {
  updated: number;
  categories_applied: number[];
}

// 📌 5) 소스 활성/비활성 변경
export interface UpdateSourceStatusRequest {
  is_active: boolean;
}

// 📌 6) 전체 키워드 목록 조회
export interface AdminKeywordItem {
  id: number;
  category: string;
  is_active: boolean;
}

// ======================================================
// 🔹 API 함수 모음
// ======================================================
export const adminAPI = {
  /** 📌 전체 크롤링 소스 목록 조회 */
  getSources: (): Promise<AxiosResponse<CrawlingSourceListResponse>> =>
    axios.get(`${API_BASE_URL}/api/admin/sources`),

  /** 📌 특정 크롤링 소스 상세 조회 */
  getSourceDetail: (
    sourceId: number
  ): Promise<AxiosResponse<CrawlingSourceDetailResponse>> =>
    axios.get(`${API_BASE_URL}/api/admin/sources/${sourceId}`),

  /** 📌 특정 소스 정보 수정 */
  updateSource: (
    sourceId: number,
    data: UpdateSourceRequest
  ): Promise<AxiosResponse<CrawlingSourceDetailResponse>> =>
    axios.put(`${API_BASE_URL}/api/admin/sources/${sourceId}`, data),

  /** 📌 키워드 일괄 적용 */
  bulkUpdateKeywords: (
    body: BulkKeywordUpdateRequest
  ): Promise<AxiosResponse<BulkKeywordUpdateResponse>> =>
    axios.put(`${API_BASE_URL}/api/admin/sources/keywords`, body),

  /** 📌 소스 활성/비활성 업데이트 */
  updateSourceStatus: (
    sourceId: number,
    body: UpdateSourceStatusRequest
  ): Promise<AxiosResponse<{ is_active: boolean }>> =>
    axios.patch(`${API_BASE_URL}/api/admin/sources/${sourceId}/status`, body),

  /** 📌 전체 키워드 목록 조회 */
  getKeywords: (): Promise<AxiosResponse<AdminKeywordItem[]>> =>
    axios.get(`${API_BASE_URL}/api/admin/keywords`),
};
