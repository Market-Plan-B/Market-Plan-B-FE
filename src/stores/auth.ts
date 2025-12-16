import { ref, computed, Ref } from "vue";
import { defineStore } from "pinia";
import { authService } from "@/api/auth";
import { useMapDataStore } from "@/stores/mapData";
import { useReportDataStore } from "@/stores/reportData";

/* ============================
   타입 정의
============================ */

export interface UserAuthority {
  authority: string;
}

export interface User {
  id: number;
  username: string;
  role?: string;
  authorities?: UserAuthority[];
}

export interface TokenPayload {
  accessToken: string;
  grantType?: string;
  userName?: string;
  userId?: number;
  user?: User | null;
}

/* ============================
   Pinia Auth Store
============================ */

export const useAuthStore = defineStore("auth", () => {
  const accessToken: Ref<string | null> = ref(
    localStorage.getItem("access_token")
  );


  const user: Ref<User | null> = ref(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  /* ============================
     Computed
  ============================ */

  const isAuthenticated = computed<boolean>(() => !!accessToken.value);

  const isAdmin = computed<boolean>(() => {
    if (!user.value) return false;

    return (
      user.value.role === "admin" ||
      user.value.authorities?.some(
        (auth) => auth.authority === "ROLE_ADMIN"
      ) === true
    );
  });

  /* ============================
     Mutations
  ============================ */

  const setTokens = (tokens: TokenPayload): void => {
    accessToken.value = tokens.accessToken;
    user.value = tokens.user || null;

    localStorage.setItem("access_token", tokens.accessToken);

    if (tokens.grantType) {
      localStorage.setItem("grant_type", tokens.grantType);
    }

    if (tokens.userName) {
      localStorage.setItem("userName", tokens.userName);
    }

    if (tokens.user) {
      localStorage.setItem("user", JSON.stringify(tokens.user));
    }

    if (tokens.userId) {
      localStorage.setItem("userId", tokens.userId.toString());
      localStorage.setItem("user_id", tokens.userId.toString());
    }
  };

  const clearTokens = (): void => {
    accessToken.value = null;
    user.value = null;

    // 인증 관련 localStorage 정리
    localStorage.removeItem("access_token");
    localStorage.removeItem("grant_type");
    localStorage.removeItem("userName");
    localStorage.removeItem("user");

    // 채팅 관련 localStorage 정리
    localStorage.removeItem("user_id");
    localStorage.removeItem("userId");
  };

  /* ============================
     Actions
  ============================ */

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      // 로그아웃 오류 무시
    } finally {
      clearTokens();

      // 다른 스토어들 초기화
      try {
        const mapDataStore = useMapDataStore();
        const reportDataStore = useReportDataStore();
        mapDataStore.reset();
        reportDataStore.clearCache();
      } catch (e) {
        // 스토어 초기화 오류 무시
      }
    }
  };

  return {
    accessToken,
    user,
    isAuthenticated,
    isAdmin,
    setTokens,
    clearTokens,
    logout,
  };
});
