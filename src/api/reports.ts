import axios, { AxiosResponse } from "axios";

// 📌 공통 베이스 URL
const API_BASE_URL = "http://localhost:8000";

// 📌 Daily Cardnews Item 타입
export interface CardNewsItem {
  country: string;
  title: string;
  level: string;
  desc: string;
  url: string;
  published_date: string;
}

// 📌 Daily Report 타입
export interface DailyReport {
  start_date: string;
  end_date: string;
  html_resource: string;
  executive_summary: string;
  metrics: any[];
  macro: any;
  scenarios: any[];
  risk_matrix: any[];
  implications: string[];
  monitoring: string[];
}

// 📌 Weekly Report 타입 (지금은 동일 구조로 가정)
export interface WeeklyReport extends DailyReport {}

// ==========================
// 📌 reportsAPI 구현부
// ==========================

export const reportsAPI = {
  // 🔵 Daily Cardnews - GET
  getDailyCardnews: (
    queryDate: string
  ): Promise<AxiosResponse<CardNewsItem[]>> =>
    axios.get(`${API_BASE_URL}/api/reports/daily/cardnews`, {
      params: { query_date: queryDate },
    }),

  // 🔵 Daily Report - GET
  getDailyReport: (queryDate: string): Promise<AxiosResponse<DailyReport>> =>
    axios.get(`${API_BASE_URL}/api/reports/daily/report`, {
      params: { query_date: queryDate },
    }),

  // 🟢 Weekly Cardnews - POST
  getWeeklyCardnews: (
    startDate: string,
    endDate: string
  ): Promise<AxiosResponse<CardNewsItem[]>> =>
    axios.post(`${API_BASE_URL}/api/reports/weekly/cardnews`, {
      start_date: startDate,
      end_date: endDate,
    }),

  // 🟢 Weekly Report - POST
  getWeeklyReport: (
    startDate: string,
    endDate: string
  ): Promise<AxiosResponse<WeeklyReport>> =>
    axios.post(`${API_BASE_URL}/api/reports/weekly/report`, {
      start_date: startDate,
      end_date: endDate,
    }),
};

export default reportsAPI;
