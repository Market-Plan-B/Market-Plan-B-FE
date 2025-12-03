import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import ReportsView from "@/views/ReportView.vue";
import AnalysisView from "@/views/AnalysisView.vue";
import LoginView from "@/views/LoginView.vue";
import CrawlingSourceView from "@/views/CrawlingSourceView.vue";
import { useAuthStore } from "@/stores/auth.js";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", component: LoginView },
    { path: "/", redirect: "/login" },
    { 
      path: "/dashboard", 
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: "/reports",
      component: ReportsView,
      meta: { requiresAuth: true, requiresData: "reports" },
    },
    {
      path: "/analysis",
      component: AnalysisView,
      meta: { requiresAuth: true, requiresData: "analysis" },
    },
    {
      path: "/crawling-sources",
      component: CrawlingSourceView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    { path: "/:pathMatch(.*)*", redirect: "/login" },
  ],
});

// 라우터 가드: 인증 및 관리자 접근 제어
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 인증이 필요한 페이지
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // 관리자 전용 페이지
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/dashboard')
    return
  }
  
  // 로그인 페이지에 인증된 사용자가 접근
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  next()
});

export default router;
