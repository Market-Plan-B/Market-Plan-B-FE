import axios, { AxiosResponse } from "axios";

// API 응답 타입 정의
export interface Notification {
  notification_id: number;
  content_id: number;
  title: string;
  url: string;
  score: number | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface ReadNotificationResponse {
  success: boolean;
}

export interface ReadAllNotificationsResponse {
  success: boolean;
  count: number;
}

const API_BASE_URL = "https://oil-api.skala25a.project.skala-ai.com";

export const notificationsAPI = {
  // 특정 user_id의 알림 전체 조회
  getNotifications: (userId: number): Promise<AxiosResponse<Notification[]>> =>
    axios.get(`${API_BASE_URL}/api/notifications/`, {
      params: { user_id: userId },
    }),

  // 선택한 알림 1개를 읽음 처리
  markAsRead: (
    notificationId: number
  ): Promise<AxiosResponse<ReadNotificationResponse>> =>
    axios.patch(`${API_BASE_URL}/api/notifications/${notificationId}/read`),

  // 특정 user_id의 모든 안 읽은 알림을 읽음 처리
  markAllAsRead: (
    userId: number
  ): Promise<AxiosResponse<ReadAllNotificationsResponse>> =>
    axios.patch(`${API_BASE_URL}/api/notifications/read-all`, {
      params: { user_id: userId },
    }),
};
