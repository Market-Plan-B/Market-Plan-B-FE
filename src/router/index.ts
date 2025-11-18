import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import ReportsView from "@/views/ReportView.vue";
import AnalysisView from "@/views/AnalysisView.vue";
import { dashboardAPI, reportsAPI, analysisAPI } from "./api";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { 
    path: "/dashboard", 
    component: DashboardView,
    meta: { requiresData: 'dashboard' }
  },
  { 
    path: "/reports", 
    component: ReportsView,
    meta: { requiresData: 'reports' }
  },
  { 
    path: "/analysis", 
    component: AnalysisView,
    meta: { requiresData: 'analysis' }
  },
  { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 페이지별 Navigation Guard로 API 데이터 미리 로드
router.beforeEach(async (to, from, next) => {
  const pageType = to.meta.requiresData;
  
  if (pageType) {
    try {
      let pageData;
      
      switch (pageType) {
        case 'dashboard':
          pageData = await dashboardAPI.fetchDashboardPageData();
          window.dashboardData = pageData;
          break;
        case 'reports':
          pageData = await reportsAPI.fetchReportsPageData();
          window.reportsData = pageData;
          break;
        case 'analysis':
          pageData = await analysisAPI.fetchAnalysisPageData();
          window.analysisData = pageData;
          break;
      }
      
      console.log(`✅ ${pageType} 페이지 데이터 로드 완료`);
      next();
    } catch (error) {
      console.error(`❌ ${pageType} 페이지 데이터 로드 실패:`, error);
      next(); // 에러가 있어도 페이지는 이동
    }
  } else {
    next();
  }
});

export default router;
export { dashboardAPI, reportsAPI, analysisAPI };
