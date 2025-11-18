import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

// ==============================
// 📌 백엔드 스키마 기반 타입
// ==============================
export interface NewsItem {
  date: string;
  title: string;
  summary: string;
  url: string;
}

export interface CardNewsResponse {
  news: NewsItem[];
}

export interface ReportResponse {
  start_date: string;
  end_date: string;
  html_resource: string; // HTML 그대로 들어옴
}

// ==============================
// 📌 reportsAPI (변환 없음)
// ==============================
export const reportsAPI = {
  // 🔵 Daily Cardnews
  async getDailyCardnews(queryDate: string): Promise<CardNewsResponse> {
    const res = await axios.get<CardNewsResponse>(
      `${API_BASE_URL}/api/reports/daily/cardnews`,
      { params: { query_date: queryDate } }
    );
    return res.data; // 그대로 반환
  },

  // 🔵 Daily Report
  async getDailyReport(queryDate: string): Promise<ReportResponse> {
    const res = await axios.get<ReportResponse>(
      `${API_BASE_URL}/api/reports/daily/report`,
      { params: { query_date: queryDate } }
    );
    return res.data; // 그대로 반환
  },

  // 🟢 Weekly Cardnews
  async getWeeklyCardnews(
    startDate: string,
    endDate: string
  ): Promise<CardNewsResponse> {
    const res = await axios.post<CardNewsResponse>(
      `${API_BASE_URL}/api/reports/weekly/cardnews`,
      {
        start_date: startDate,
        end_date: endDate,
      }
    );
    return res.data; // 그대로 반환
  },

  // 🟢 Weekly Report
  async getWeeklyReport(
    startDate: string,
    endDate: string
  ): Promise<ReportResponse> {
    const res = await axios.post<ReportResponse>(
      `${API_BASE_URL}/api/reports/weekly/report`,
      {
        start_date: startDate,
        end_date: endDate,
      }
    );
    return res.data; // 그대로 반환
  },
};

export default reportsAPI;
