import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import ReportsView from "@/views/ReportView.vue";
import AnalysisView from "@/views/AnalysisView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
    { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
  ],
});

export default router;
