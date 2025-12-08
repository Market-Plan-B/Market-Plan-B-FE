import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

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
  async getDailyCardnews(): Promise<CardNewsImagesResponse> {
    const res = await axios.get<CardNewsImagesResponse>(
      `${API_BASE_URL}/api/reports/daily/cardnews`
    );
    return res.data;
  },

  // Daily Report
  async getDailyReport(queryDate: string): Promise<ReportResponse> {
    const res = await axios.get<ReportResponse>(
      `${API_BASE_URL}/api/reports/daily/report`,
      { params: { query_date: queryDate } }
    );
    return res.data; 
  },



  // Weekly Report
  // 백엔드는 해당 날짜가 start_date와 end_date 범위에 포함되는 위클리 리포트를 반환
  async getWeeklyReport(queryDate: string): Promise<ReportResponse> {
    const res = await axios.get<ReportResponse>(
      `${API_BASE_URL}/api/reports/weekly/report`,
      { params: { query_date: queryDate } }
    );
    return res.data;
  },
};

export default reportsAPI;
