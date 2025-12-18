import axios from "axios";

const API_BASE_URL = "https://oil-api.skala25a.project.skala-ai.com";

// ==============================
// 📌 백엔드 스키마 기반 타입
// ==============================
export interface CardNewsImagesResponse {
  images: string[];
}

export interface ReportResponse {
  start_date: string;
  end_date: string;
  html_resource: string; // HTML 그대로 들어옴
}

export const reportsAPI = {
  // Daily Cardnews
  async getDailyCardnews(queryDate: string): Promise<CardNewsImagesResponse> {
    const res = await axios.get<CardNewsImagesResponse>(
      `${API_BASE_URL}/api/reports/daily/cardnews`,
      {
        params: { query_date: queryDate },
        withCredentials: false,
      }
    );
    return res.data;
  },

  // Daily Report
  async getDailyReport(queryDate: string): Promise<ReportResponse> {
    const res = await axios.get<ReportResponse>(
      `${API_BASE_URL}/api/reports/daily/report`,
      {
        params: { query_date: queryDate },
        withCredentials: false,
      }
    );
    return res.data;
  },
};

export default reportsAPI;
