import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 타입 정의
interface OverallImpact {
  overall_score: number;
}

interface MapImpact {
  code: string;
  region_score: number;
}

interface RegionData {
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

interface FactorImpact {
  variable_scores: Record<string, number>;
}

interface Strategies {
  strategies: Array<{
    id: number;
    title: string;
    description: string;
  }>;
}

// 대시보드 페이지 API
export const dashboardAPI = {
  getOverallImpact: (): Promise<AxiosResponse<OverallImpact>> => 
    api.get('/api/dashboard/impact-overall'),
  
  getMapImpact: (): Promise<AxiosResponse<MapImpact[]>> => 
    api.get('/api/dashboard/map-impact'),
  
  getRegionImpact: (regionCode: string): Promise<AxiosResponse<RegionData>> => 
    api.get(`/api/dashboard/region-impact?region_code=${regionCode}`),
  
  getFactorImpact: (): Promise<AxiosResponse<FactorImpact>> => 
    api.get('/api/dashboard/factor-impact'),
  
  getStrategies: (): Promise<AxiosResponse<Strategies>> => 
    api.get('/api/dashboard/strategies'),

  async fetchDashboardPageData() {
    try {
      console.log('📊 대시보드 페이지 데이터 로드 시작...');
      
      const [overallResponse, mapResponse, strategiesResponse] = await Promise.all([
        this.getOverallImpact(),
        this.getMapImpact(),
        this.getStrategies()
      ]);

      console.log('✅ 대시보드 페이지 데이터 로드 완료');
      
      return {
        overall: overallResponse.data,
        map: mapResponse.data,
        strategies: strategiesResponse.data
      };
    } catch (error) {
      console.error('❌ 대시보드 페이지 데이터 로드 실패:', error);
      throw error;
    }
  },

  async fetchRegionData(regionCode: string) {
    try {
      console.log(`🌍 지역 데이터 로드: ${regionCode}`);
      const response = await this.getRegionImpact(regionCode);
      console.log('✅ 지역 데이터 로드 완료');
      return response.data;
    } catch (error) {
      console.error('❌ 지역 데이터 로드 실패:', error);
      throw error;
    }
  }
};

// 리포트 페이지 API
export const reportsAPI = {
  async fetchReportsPageData() {
    try {
      console.log('📋 리포트 페이지 데이터 로드 시작...');
      console.log('✅ 리포트 페이지 데이터 로드 완료');
      return {};
    } catch (error) {
      console.error('❌ 리포트 페이지 데이터 로드 실패:', error);
      throw error;
    }
  }
};

// 분석 페이지 API
export const analysisAPI = {
  async fetchAnalysisPageData() {
    try {
      console.log('📈 분석 페이지 데이터 로드 시작...');
      console.log('✅ 분석 페이지 데이터 로드 완료');
      return {};
    } catch (error) {
      console.error('❌ 분석 페이지 데이터 로드 실패:', error);
      throw error;
    }
  }
};

export default api;