import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import ReportsView from "@/views/ReportView.vue";
import AnalysisView from "@/views/AnalysisView.vue";
import LoginView from "@/views/LoginView.vue";
import CrawlingSourceView from "@/views/CrawlingSourceView.vue";
import { useAuthStore } from "@/stores/auth.ts";
import { isAdmin } from "@/utils/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", component: LoginView },
    {
      path: "/",
      redirect: () => {
        const authStore = useAuthStore();
        if (authStore.isAuthenticated) {
          return isAdmin() ? "/crawling-sources" : "/dashboard";
        }
        return "/login";
      },
    },
    {
      path: "/dashboard",
      component: DashboardView,
      meta: { requiresAuth: true, requiresUser: true },
    },
    {
      path: "/reports",
      component: ReportsView,
      meta: { requiresAuth: true, requiresUser: true, requiresData: "reports" },
    },
    {
      path: "/analysis",
      component: AnalysisView,
      meta: {
        requiresAuth: true,
        requiresUser: true,
        requiresData: "analysis",
      },
    },
    {
      path: "/crawling-sources",
      component: CrawlingSourceView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // 인증이 필요한 페이지
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
    return;
  }

  // 관리자 전용 페이지
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next("/dashboard");
    return;
  }

  // 일반 사용자 전용 페이지 - 관리자가 접근하면 크롤링 소스 관리로 리다이렉트
  if (to.meta.requiresUser && authStore.isAdmin) {
    next("/crawling-sources");
    return;
  }

  // 로그인 페이지에 인증된 사용자가 접근
  if (to.path === "/login" && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      next("/crawling-sources");
    } else {
      next("/dashboard");
    }
    return;
  }

  next();
});

export default router;
