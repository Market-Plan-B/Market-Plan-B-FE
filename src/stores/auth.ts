import { ref, computed, Ref } from "vue";
import { defineStore } from "pinia";
import { authService } from "@/api/auth";

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
  refreshToken: string;
  grantType?: string;
  refreshTokenExpire?: string | number;
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
  const refreshToken: Ref<string | null> = ref(
    localStorage.getItem("refresh_token")
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
    refreshToken.value = tokens.refreshToken;
    user.value = tokens.user || null;

    localStorage.setItem("access_token", tokens.accessToken);
    localStorage.setItem("refresh_token", tokens.refreshToken);

    if (tokens.grantType) {
      localStorage.setItem("grant_type", tokens.grantType);
    }

    if (tokens.refreshTokenExpire) {
      localStorage.setItem(
        "refresh_token_expire",
        String(tokens.refreshTokenExpire)
      );
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
    refreshToken.value = null;
    user.value = null;

    // 인증 관련 localStorage 정리
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("grant_type");
    localStorage.removeItem("refresh_token_expire");
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
      if (refreshToken.value) {
        await authService.logout(refreshToken.value);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearTokens();
    }
  };

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    isAdmin,
    setTokens,
    clearTokens,
    logout,
  };
});
