/**
 * 인증 관련 유틸리티 함수
 */

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  isAdmin?: boolean;
}

/**
 * localStorage에서 사용자 정보를 가져옵니다.
 */
export const getUser = (): User | null => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
};

/**
 * 현재 사용자가 관리자인지 확인합니다.
 */
export const isAdmin = (): boolean => {
  const user = getUser();
  if (!user) return false;
  return user.role === "admin" || user.isAdmin === true;
};

/**
 * 현재 사용자가 로그인되어 있는지 확인합니다.
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  const user = getUser();
  return !!(token && user);
};
