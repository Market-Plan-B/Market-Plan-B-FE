import axios from 'axios';

// axios 기본 설정 - 쿠키 자동 포함
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://oil-api.skala25a.project.skala-ai.com";
axios.defaults.headers.common['Content-Type'] = 'application/json';

const API_BASE = "/api/auth";

export interface SignInResponse {
  accessToken: string;
  userName: string;
  userId: number;
}

export interface RefreshResponse {
  accessToken: string;
}



// 요청 인터셉터 - Authorization 헤더 자동 추가
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 자동 토큰 갱신
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        const response = await axios.post(`${API_BASE}/refresh`);
        localStorage.setItem('accessToken', response.data.accessToken);
        
        // 원래 요청 재시도
        error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axios.request(error.config);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async signIn(email: string, password: string): Promise<SignInResponse> {
    const response = await axios.post(`${API_BASE}/sign-in`, { email, password });
    return response.data;
  },

  async refresh(): Promise<RefreshResponse> {
    const response = await axios.post(`${API_BASE}/refresh`);
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  },

  async logout(): Promise<string> {
    // 현재 채팅 세션 종료
    const currentSessionId = localStorage.getItem('session_id');
    if (currentSessionId) {
      try {
        await axios.delete(`/api/chat/session/${currentSessionId}`);
      } catch (error) {
        console.warn('채팅 세션 종료 실패:', error);
      }
    }
    
    // 프론트엔드 데이터 정리
    localStorage.removeItem('accessToken');
    localStorage.removeItem('session_id');
    
    return "로그아웃 성공";
  },
};

// 다른 API에서 사용할 수 있도록 export
export default axios;