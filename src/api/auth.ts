import axios from 'axios'

const API_BASE = '/api/auth'

export interface SignInRequest {
  email: string
  password: string
}

export interface SignInResponse {
  grantType: string
  accessToken: string
  refreshToken: string
  refreshTokenExpire: string
}

export interface LogoutRequest {
  refreshToken: string
}

export interface LogoutResponse {
  message: string
}

export const authService = {
  async signIn(email: string, password: string): Promise<SignInResponse> {
    const response = await axios.post<SignInResponse>(`${API_BASE}/sign-in`, {
      email,
      password
    })
    
    return response.data
  },

  async logout(refreshToken: string): Promise<LogoutResponse> {
    const response = await axios.post<LogoutResponse>(`${API_BASE}/logout`, {
      refreshToken
    })
    
    return response.data
  }
}