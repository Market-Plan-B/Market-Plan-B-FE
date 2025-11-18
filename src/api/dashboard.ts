import axios, { AxiosResponse } from 'axios';

// API 응답 타입 정의
export interface OverallImpact {
  overall_score: number;
}

export interface MapImpact {
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

export interface FactorImpact {
  variable_scores: Record<string, number>;
}

export interface Strategies {
  strategies: Array<{
    id: number;
    title: string;
    description: string;
  }>;
}

const API_BASE_URL = 'http://localhost:8000';

export const dashboardAPI = {
  getOverallImpact: (): Promise<AxiosResponse<OverallImpact>> => 
    axios.get(`${API_BASE_URL}/api/dashboard/impact-overall`),
  
  getMapImpact: (): Promise<AxiosResponse<MapImpact[]>> => 
    axios.get(`${API_BASE_URL}/api/dashboard/map-impact`),
  
  getRegionImpact: (regionCode: string): Promise<AxiosResponse<RegionData>> => 
    axios.get(`${API_BASE_URL}/api/dashboard/region-impact?region_code=${regionCode}`),
  
  getFactorImpact: (): Promise<AxiosResponse<FactorImpact>> => 
    axios.get(`${API_BASE_URL}/api/dashboard/factor-impact`),
  
  getStrategies: (): Promise<AxiosResponse<Strategies>> => 
    axios.get(`${API_BASE_URL}/api/dashboard/strategies`)
};