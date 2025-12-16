import axios from "axios";

// axios 기본 설정 - 쿠키 자동 포함
axios.defaults.withCredentials = true;

const API_BASE_URL = "https://oil-api.skala25a.project.skala-ai.com/api/chat";

export interface ChatMessage {
  message: string;
  session_id: number;
  user_id: number;
}

export interface ChatResponse {
  session_id: number;
  message: string;
  suggestions: string[];
}

export interface ChatSession {
  id: number;
  started_at: string;
  ended_at: string | null;
  context: object;
}

export interface ChatHistory {
  id: number;
  sender: "user" | "ai";
  message: string;
  created_at: string;
}

export interface ChatSuggestions {
  suggestions: string[];
}

export const chatAPI = {
  // 메시지 전송
  async sendMessage(message: string, sessionId: number, userId: number): Promise<ChatResponse> {
    const response = await axios.post<ChatResponse>(`${API_BASE_URL}/message`, {
      message,
      session_id: sessionId,
      user_id: userId
    });
    return response.data;
  },

  // 새 세션 생성
  async createSession(userId: number): Promise<ChatSession> {
    const response = await axios.post<ChatSession>(`${API_BASE_URL}/session?user_id=${userId}`);
    return response.data;
  },

  // 세션 종료
  async endSession(sessionId: number): Promise<{ message: string }> {
    const response = await axios.delete(`${API_BASE_URL}/session/${sessionId}`);
    return response.data;
  },

  // 대화 기록 조회
  async getHistory(sessionId: number): Promise<ChatHistory[]> {
    const response = await axios.get<ChatHistory[]>(`${API_BASE_URL}/history/${sessionId}`);
    return response.data;
  },

  // 추천 질문 조회
  async getSuggestions(sessionId: number): Promise<ChatSuggestions> {
    const response = await axios.get<ChatSuggestions>(`${API_BASE_URL}/suggestions`, {
      params: { session_id: sessionId }
    });
    return response.data;
  }
};