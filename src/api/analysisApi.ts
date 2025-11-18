import axios from 'axios';

export interface ImpactAnalysisResponse {
  date: string;
  impact_score: string;
  change_score: string;
  features: {
    [key: string]: [number, number];
  };
}

export const getImpactAnalysis = async (queryDate: string): Promise<ImpactAnalysisResponse> => {
  const response = await axios.get(`http://127.0.0.1:8000/api/analytics/impact`, {
    params: { query_date: queryDate }
  });
  return response.data;
};