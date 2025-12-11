import axios from "axios";

const API_BASE = "/api/auth";

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  grantType: string;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpire: string;
  userId: number;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const authService = {
  async signIn(email: string, password: string): Promise<SignInResponse> {
    const response = await axios.post<SignInResponse>(`${API_BASE}/sign-in`, {
      email,
      password,
    });

    return response.data;
  },

  async getUserInfo(): Promise<UserInfo> {
    const response = await axios.get<UserInfo>(`${API_BASE}/me`);
    return response.data;
  },

  async logout(refreshToken: string): Promise<LogoutResponse> {
    const response = await axios.post<LogoutResponse>(`${API_BASE}/logout`, {
      refreshToken,
    });

    return response.data;
  },
};
