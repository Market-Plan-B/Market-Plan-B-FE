import axios, { AxiosResponse } from "axios";

// 영향도 분석 API 타입 정의
export interface ImpactAnalysisResponse {
  date: string;
  impact_score: string;
  change_score: string;
  features: {
    [key: string]: [number, number];
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
};
