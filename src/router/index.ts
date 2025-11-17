import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import ReportsView from "@/views/ReportView.vue";
import AnalysisView from "@/views/AnalysisView.vue";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", component: DashboardView },
  { path: "/reports", component: ReportsView },
  { path: "/analysis", component: AnalysisView },
  { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
