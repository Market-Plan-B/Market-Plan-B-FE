import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import ReportsView from "@/views/ReportView.vue";
import AnalysisView from "@/views/AnalysisView.vue";
import LoginView from "@/views/LoginView.vue";
import CrawlingSourceView from "@/views/CrawlingSourceView.vue";
import { isAdmin } from "@/utils/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", component: LoginView },
    { path: "/", redirect: "/dashboard" },
    { path: "/dashboard", component: DashboardView },
    {
      path: "/reports",
      component: ReportsView,
      meta: { requiresData: "reports" },
    },
    {
      path: "/analysis",
      component: AnalysisView,
      meta: { requiresData: "analysis" },
    },
    {
      path: "/crawling-sources",
      component: CrawlingSourceView,
      meta: { requiresAdmin: true },
    },
    { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
  ],
});

// 라우터 가드: 관리자 전용 페이지 접근 제어
router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAdmin) {
    if (!isAdmin()) {
      // 관리자가 아니면 대시보드로 리다이렉트
      next("/dashboard");
      return;
    }
  }
  next();
});

export default router;
