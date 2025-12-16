import { defineStore } from "pinia";
import { ref } from "vue";
import { reportsAPI } from "@/api/reports";

// 캐시 유효 시간 (10분)
const CACHE_DURATION = 10 * 60 * 1000;

interface CachedReport {
  html: string;
  cardNews: string[];
  createdAt: string | null;
  cachedAt: number;
}

export const useReportDataStore = defineStore("reportData", () => {
  // 일간 리포트 캐시 (날짜별)
  const dailyReportCache = ref<Map<string, CachedReport>>(new Map());

  // 주간 리포트 캐시 (날짜별)
  const weeklyReportCache = ref<Map<string, CachedReport>>(new Map());

  // 캐시 유효성 체크
  function isCacheValid(cachedAt: number): boolean {
    return Date.now() - cachedAt < CACHE_DURATION;
  }

  // 일간 리포트 로드
  async function loadDailyReport(date: string, forceRefresh = false) {
    const cached = dailyReportCache.value.get(date);

    if (!forceRefresh && cached && isCacheValid(cached.cachedAt)) {
      return cached;
    }

    try {
      // 리포트와 카드뉴스 병렬 로드
      const [reportRes, cardNewsRes] = await Promise.all([
        reportsAPI.getDailyReport(date),
        reportsAPI.getDailyCardnews(date).catch(() => ({ images: [] })),
      ]);

      const result: CachedReport = {
        html: reportRes.html_resource || "",
        cardNews: cardNewsRes.images || [],
        createdAt: reportRes.start_date || null,
        cachedAt: Date.now(),
      };

      dailyReportCache.value.set(date, result);
      return result;
    } catch (error) {
      console.error("일간 리포트 로드 실패:", error);
      throw error;
    }
  }

  // 주간 리포트 로드
  async function loadWeeklyReport(date: string, forceRefresh = false) {
    const cached = weeklyReportCache.value.get(date);

    if (!forceRefresh && cached && isCacheValid(cached.cachedAt)) {
      return cached;
    }

    try {
      const reportRes = await reportsAPI.getWeeklyReport(date);
      const result: CachedReport = {
        html: reportRes.html_resource || "",
        cardNews: [],
        createdAt: reportRes.start_date || null,
        cachedAt: Date.now(),
      };

      weeklyReportCache.value.set(date, result);
      return result;
    } catch (error) {
      console.error("주간 리포트 로드 실패:", error);
      throw error;
    }
  }

  // 캐시 초기화
  function clearCache() {
    dailyReportCache.value.clear();
    weeklyReportCache.value.clear();
  }

  // 특정 날짜 캐시 삭제
  function clearDateCache(date: string) {
    dailyReportCache.value.delete(date);
    weeklyReportCache.value.delete(date);
  }

  return {
    dailyReportCache,
    weeklyReportCache,
    loadDailyReport,
    loadWeeklyReport,
    clearCache,
    clearDateCache,
  };
});
