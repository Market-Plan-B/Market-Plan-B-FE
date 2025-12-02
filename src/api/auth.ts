import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

// ==============================
// 📌 인증 관련 타입
// ==============================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "admin" | "user";
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: "admin" | "user";
  };
}

// ==============================
// 📌 authAPI
// ==============================
export const authAPI = {
  // 로그인
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await axios.post<LoginResponse>(
      `${API_BASE_URL}/api/auth/login`,
      credentials
    );
    return res.data;
  },

  // 회원가입
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const res = await axios.post<RegisterResponse>(
      `${API_BASE_URL}/api/auth/register`,
      data
    );
    return res.data;
  },

  // 로그아웃
  async logout(): Promise<void> {
    const token = localStorage.getItem("token");
    if (token) {
      await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  },

  // 토큰 갱신
  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    const res = await axios.post<{ access_token: string }>(
      `${API_BASE_URL}/api/auth/refresh`,
      { refresh_token: refreshToken }
    );
    return res.data;
  },
};

export default authAPI;
