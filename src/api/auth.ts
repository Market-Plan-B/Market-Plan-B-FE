import axios from 'axios';


const API_BASE = "/api/auth";

// 백엔드 AuthResponse에 맞는 인터페이스
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
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 - 자동 토큰 갱신
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // refreshToken은 쿠키로 자동 전송됨
        const response = await axios.post(`${API_BASE}/refresh`);
        const newAccessToken = response.data.accessToken;
        
        // 새 토큰 저장
        localStorage.setItem('access_token', newAccessToken);
        
        // 원래 요청에 새 토큰 적용
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        return axios(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  async signIn(email: string, password: string): Promise<SignInResponse> {
    console.log('authService.signIn 시작:', { email, password: '***' }); // 디버깅
    console.log('API URL:', `${API_BASE}/sign-in`); // 디버깅
    
    const response = await axios.post(`${API_BASE}/sign-in`, { 
      email, 
      password 
    });
    
    console.log('signIn 응답:', response.data); // 디버깅
    
    // accessToken만 localStorage에 저장 (refreshToken은 쿠키로 자동 처리)
    localStorage.setItem('access_token', response.data.accessToken);
    
    return response.data;
  },

  async refresh(): Promise<RefreshResponse> {
    // refreshToken은 쿠키로 자동 전송됨
    const response = await axios.post(`${API_BASE}/refresh`);
    
    // 새 accessToken 저장
    localStorage.setItem('access_token', response.data.accessToken);
    
    return response.data;
  },

  async logout(): Promise<string> {
    try {
      // 1. 채팅 세션 종료
      const currentSessionId = localStorage.getItem('session_id');
      const currentUserId = localStorage.getItem('userId') || localStorage.getItem('user_id');
      
      if (currentSessionId && currentUserId) {
        try {
          await axios.post('/api/chat/session/end', {
            session_id: parseInt(currentSessionId),
            user_id: parseInt(currentUserId)
          });
        } catch (error) {
          console.warn('채팅 세션 종료 실패:', error);
        }
      }
      
      // 2. 백엔드 로그아웃 API 호출 (쿠키 삭제 + DB에서 refreshToken 제거)
      await axios.post(`${API_BASE}/logout`);
      
    } catch (error) {
      console.warn('로그아웃 API 실패:', error);
    } finally {
      // 3. 프론트엔드 데이터 정리
      localStorage.removeItem('access_token');
      localStorage.removeItem('session_id');
    }
    
    return "로그아웃 성공";
  },
};

export default axios;