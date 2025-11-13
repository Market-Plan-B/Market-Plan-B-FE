import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import ReportsView from "@/views/ReportView.vue"; // 👈 추가
import AnalysisView from "@/views/AnalysisView.vue";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", component: DashboardView },
  { path: "/reports", component: ReportsView }, // ✅ 이 라우트 추가
  { path: "/analysis", component: AnalysisView },
  { path: "/:pathMatch(.*)*", redirect: "/dashboard" }, // ✅ 없는 경로 대비 fallback
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
