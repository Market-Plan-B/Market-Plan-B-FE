import axios, { AxiosResponse } from "axios";

// API 응답 타입 정의
export interface OverallImpact {
  date: string;
  overall_score: number;
  overall_change: number;
}

export interface MapImpact {
  name: string;
  code: string;
  region_score: number;
}

export interface RegionData {
  region: {
    id: number;
    name: string;
    code: string;
    region_score: number;
  };
  contents: Array<{
    id: number;
    title: string;
    summary: string;
    source_score: number;
    url: string;
    published_date: string;
  }>;
}

export interface Strategies {
  strategies: Array<{
    id: number;
    title: string;
    description: string;
  }>;
}

// 🔥 영향도 분석 API 타입 추가
export interface ImpactAnalysisResponse {
  date: string;
  impact_score: string;
  change_score: string;
  features: {
    [key: string]: [number, number];
  };
}

const API_BASE_URL = "https://oil-api.skala25a.project.skala-ai.com";

export const dashboardAPI = {
  getOverallImpact: (): Promise<AxiosResponse<OverallImpact>> =>
    axios.get(`${API_BASE_URL}/api/dashboard/impact-overall`),

  getMapImpact: (): Promise<AxiosResponse<MapImpact[]>> =>
    axios.get(`${API_BASE_URL}/api/dashboard/map-impact`),

  getRegionImpact: (regionCode: string): Promise<AxiosResponse<RegionData>> =>
    axios.get(
      `${API_BASE_URL}/api/dashboard/region-impact?region_code=${regionCode}`
    ),

  getStrategies: (): Promise<AxiosResponse<Strategies>> =>
    axios.get(`${API_BASE_URL}/api/dashboard/strategies`),
  getUsStocks: () => axios.get(`${API_BASE_URL}/api/dashboard/us-stocks`),
  getOecdInventory: () =>
    axios.get(`${API_BASE_URL}/api/dashboard/oecd-inventory`),
  getSupplyMonitor: () =>
    axios.get(`${API_BASE_URL}/api/dashboard/supply-monitor`),

  //  영향도 분석 API 추가
  getImpactAnalysis: (
    queryDate: string
  ): Promise<AxiosResponse<ImpactAnalysisResponse>> =>
    axios.get(`${API_BASE_URL}/api/analytics/impact`, {
      params: { query_date: queryDate },
    }),
};
