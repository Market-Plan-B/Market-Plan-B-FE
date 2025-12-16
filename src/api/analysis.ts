import axios, { AxiosResponse } from "axios";

// Overall Impact 타입 정의
export interface OverallImpact {
  date: string;
  overall_score: number;
  overall_change: number;
}

// 🔥 영향도 분석 API 타입 정의
export interface ImpactAnalysisResponse {
  date: string;
  impact_score: string;
  change_score: string;
  features: {
    [key: string]: [number, number];
  };
}

// 피처 중요도 분석 응답 타입
export interface FeatureImportanceResponse {
  date: string;
  features: Array<{
    name: string;
    importance: number;
    impact: number;
    change: number;
  }>;
}

// 분석 상세 정보 타입
export interface AnalysisDetailResponse {
  date: string;
  impact_score: number;
  change_score: number;
  feature_importance: Array<{
    feature_name: string;
    importance: number;
    contribution: number;
  }>;
  model_metadata: {
    model_version: string;
    prediction_date: string;
  };
}

const API_BASE_URL = "https://oil-api.skala25a.project.skala-ai.com";

export const analysisAPI = {
  // 영향도 분석 (피처 중요도 포함)
  getImpactAnalysis: (
    queryDate: string
  ): Promise<AxiosResponse<ImpactAnalysisResponse>> =>
    axios.get(`${API_BASE_URL}/api/analytics/impact`, {
      params: { query_date: queryDate },
    }),

  // 피처 중요도 분석 (상세)
  getFeatureImportance: (
    queryDate: string
  ): Promise<AxiosResponse<FeatureImportanceResponse>> =>
    axios.get(`${API_BASE_URL}/api/analytics/feature-importance`, {
      params: { query_date: queryDate },
    }),

  // 분석 상세 정보
  getAnalysisDetail: (
    queryDate: string
  ): Promise<AxiosResponse<AnalysisDetailResponse>> =>
    axios.get(`${API_BASE_URL}/api/analytics/detail`, {
      params: { query_date: queryDate },
    }),

  // 시계열 분석 데이터
  getTimeSeriesAnalysis: (
    startDate: string,
    endDate: string
  ): Promise<AxiosResponse<any>> =>
    axios.get(`${API_BASE_URL}/api/analytics/time-series`, {
      params: { start_date: startDate, end_date: endDate },
    }),
};
