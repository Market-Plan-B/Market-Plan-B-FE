import { defineStore } from "pinia";
import { ref } from "vue";
import { dashboardAPI, MapImpact, Strategies } from "@/api/dashboard";
import {
  getBrentOil,
  getWTI,
  getDXY,
  loadAllFinancialData,
  loadAllHistoryData,
  type FinancialData,
  type HistoryData,
} from "@/api/financial";

// TTL 설정 (밀리초)
const TTL = {
  MAP_DATA: 10 * 60 * 1000, // 10분
  MARKET_INDICATORS: 1 * 60 * 1000, // 1분 (실시간 갱신)
  STRATEGIES: 10 * 60 * 1000, // 10분
  DAILY_FACTOR: 10 * 60 * 1000, // 10분
  OVERALL_IMPACT: 10 * 60 * 1000, // 10분
  FINANCIAL_DATA: 1 * 60 * 1000, // 1분 (실시간 갱신)
  HISTORY_DATA: 10 * 60 * 1000, // 10분
};

export const useMapDataStore = defineStore("mapData", () => {
  // 지도 영향도 데이터
  const mapImpactData = ref<MapImpact[]>([]);
  const mapDataLoadedAt = ref<number | null>(null);
  const mapDataLoading = ref(false);

  // 시장 지표 데이터
  const marketIndicators = ref<any[]>([]);
  const marketIndicatorsLoadedAt = ref<number | null>(null);
  const marketIndicatorsLoading = ref(false);
  const lastMarketUpdateTime = ref<string>("");

  // 대응책(전략) 데이터
  const strategiesData = ref<Strategies["strategies"]>([]);
  const strategiesLoadedAt = ref<number | null>(null);
  const strategiesLoading = ref(false);

  // Daily Factor (ChartBar용) 데이터
  const dailyFactorData = ref<any>(null);
  const dailyFactorLoadedAt = ref<number | null>(null);
  const dailyFactorLoading = ref(false);

  // Overall Impact 데이터 (overall_score)
  const overallImpactData = ref<number>(0);
  const overallImpactLoadedAt = ref<number | null>(null);
  const overallImpactLoading = ref(false);

  // 예측 Brent 가격 = 현재 Brent 가격 + overall_score
  const predictedBrentPrice = ref<number>(0);

  // Financial 데이터 (분석 페이지용)
  const financialData = ref<FinancialData | null>(null);
  const financialDataLoadedAt = ref<number | null>(null);
  const financialDataLoading = ref(false);

  // History 데이터 (분석 페이지용)
  const historyData = ref<HistoryData | null>(null);
  const historyDataLoadedAt = ref<number | null>(null);
  const historyDataLoading = ref(false);

  // TTL 체크 유틸리티
  function isStale(loadedAt: number | null, ttlMs: number): boolean {
    if (!loadedAt) return true;
    return Date.now() - loadedAt > ttlMs;
  }

  // 지도 데이터 로드 (TTL + 중복 요청 방지)
  async function loadMapData(forceRefresh = false) {
    if (
      !forceRefresh &&
      mapImpactData.value.length > 0 &&
      !isStale(mapDataLoadedAt.value, TTL.MAP_DATA)
    ) {
      return mapImpactData.value;
    }

    if (mapDataLoading.value) {
      return mapImpactData.value;
    }

    mapDataLoading.value = true;
    try {
      const response = await dashboardAPI.getMapImpact();
      mapImpactData.value = response.data;
      mapDataLoadedAt.value = Date.now();
      return mapImpactData.value;
    } catch (error) {
      console.error("Map data load failed:", error);
      throw error;
    } finally {
      mapDataLoading.value = false;
    }
  }

  // 시장 지표 로드 (TTL 1분 + 중복 요청 방지)
  async function loadMarketIndicators(forceRefresh = false) {
    if (
      !forceRefresh &&
      marketIndicators.value.length > 0 &&
      !isStale(marketIndicatorsLoadedAt.value, TTL.MARKET_INDICATORS)
    ) {
      return {
        indicators: marketIndicators.value,
        updateTime: lastMarketUpdateTime.value,
      };
    }

    if (marketIndicatorsLoading.value) {
      return {
        indicators: marketIndicators.value,
        updateTime: lastMarketUpdateTime.value,
      };
    }

    marketIndicatorsLoading.value = true;
    try {
      const [brent, wti, dxy] = await Promise.all([
        getBrentOil(),
        getWTI(),
        getDXY(),
      ]);

      const spread = brent.price - wti.price;

      marketIndicators.value = [
        {
          name: "Brent Crude",
          symbol: "BZ=F",
          price: brent.price.toFixed(2),
          change: brent.changePercent || 0,
        },
        {
          name: "WTI Crude",
          symbol: "CL=F",
          price: wti.price.toFixed(2),
          change: wti.changePercent || 0,
        },
        {
          name: "Brent-WTI 스프레드",
          symbol: "SPREAD",
          price: `$${spread.toFixed(2)}`,
          change: 0,
        },
        {
          name: "달러인덱스",
          symbol: "DXY",
          price: dxy.index.toFixed(2),
          change: dxy.change || 0,
        },
      ];

      lastMarketUpdateTime.value = new Date().toLocaleTimeString("ko-KR");
      marketIndicatorsLoadedAt.value = Date.now();

      return {
        indicators: marketIndicators.value,
        updateTime: lastMarketUpdateTime.value,
      };
    } catch (error) {
      console.error("Market indicators load failed:", error);
      throw error;
    } finally {
      marketIndicatorsLoading.value = false;
    }
  }

  // 대응책 로드 (TTL + 중복 요청 방지)
  async function loadStrategies(forceRefresh = false) {
    if (
      !forceRefresh &&
      strategiesData.value.length > 0 &&
      !isStale(strategiesLoadedAt.value, TTL.STRATEGIES)
    ) {
      return strategiesData.value;
    }

    if (strategiesLoading.value) {
      return strategiesData.value;
    }

    strategiesLoading.value = true;
    try {
      const response = await dashboardAPI.getStrategies();
      strategiesData.value = response.data.strategies;
      strategiesLoadedAt.value = Date.now();
      return strategiesData.value;
    } catch (error) {
      console.error("AI 대응책 로드 실패:", error);
      throw error;
    } finally {
      strategiesLoading.value = false;
    }
  }

  // Daily Factor 로드 (TTL + 중복 요청 방지)
  async function loadDailyFactor(forceRefresh = false) {
    if (
      !forceRefresh &&
      dailyFactorData.value &&
      !isStale(dailyFactorLoadedAt.value, TTL.DAILY_FACTOR)
    ) {
      return dailyFactorData.value;
    }

    if (dailyFactorLoading.value) {
      return dailyFactorData.value;
    }

    dailyFactorLoading.value = true;
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await dashboardAPI.getImpactAnalysis(today);
      dailyFactorData.value = response.data;
      dailyFactorLoadedAt.value = Date.now();
      return dailyFactorData.value;
    } catch (error) {
      console.error("Daily Factor 로드 실패:", error);
      throw error;
    } finally {
      dailyFactorLoading.value = false;
    }
  }

  // Overall Impact 로드 (TTL + 중복 요청 방지)
  // overall_score = 예측 Brent 가격, overall_change = 예측 대비 변화량
  async function loadOverallImpact(forceRefresh = false) {
    if (
      !forceRefresh &&
      predictedBrentPrice.value &&
      !isStale(overallImpactLoadedAt.value, TTL.OVERALL_IMPACT)
    ) {
      return {
        predictedBrentPrice: predictedBrentPrice.value,
        overallChange: overallImpactData.value,
      };
    }

    if (overallImpactLoading.value) {
      return {
        predictedBrentPrice: predictedBrentPrice.value,
        overallChange: overallImpactData.value,
      };
    }

    overallImpactLoading.value = true;
    try {
      const response = await dashboardAPI.getOverallImpact();
      // overall_score = 예측 Brent 가격
      predictedBrentPrice.value = response.data.overall_score;
      // overall_change = 예측 대비 변화량
      overallImpactData.value = response.data.overall_change;
      overallImpactLoadedAt.value = Date.now();
      return {
        predictedBrentPrice: predictedBrentPrice.value,
        overallChange: overallImpactData.value,
      };
    } catch (error) {
      console.error("Overall Impact 로드 실패:", error);
      throw error;
    } finally {
      overallImpactLoading.value = false;
    }
  }

  // 예측 Brent 가격 로드 (loadOverallImpact 호출)
  async function loadPredictedBrentPrice(forceRefresh = false) {
    try {
      await loadOverallImpact(forceRefresh);
      return predictedBrentPrice.value;
    } catch (error) {
      console.error("예측 Brent 가격 로드 실패:", error);
      throw error;
    }
  }

  // Financial 데이터 로드 (TTL 1분 + 중복 요청 방지)
  async function loadFinancialData(forceRefresh = false) {
    if (
      !forceRefresh &&
      financialData.value &&
      !isStale(financialDataLoadedAt.value, TTL.FINANCIAL_DATA)
    ) {
      return financialData.value;
    }

    if (financialDataLoading.value) {
      return financialData.value;
    }

    financialDataLoading.value = true;
    try {
      const data = await loadAllFinancialData();
      financialData.value = data;
      financialDataLoadedAt.value = Date.now();
      return financialData.value;
    } catch (error) {
      console.error("Financial 데이터 로드 실패:", error);
      throw error;
    } finally {
      financialDataLoading.value = false;
    }
  }

  // History 데이터 로드 (TTL 10분 + 중복 요청 방지)
  async function loadHistoryData(forceRefresh = false) {
    if (
      !forceRefresh &&
      historyData.value &&
      !isStale(historyDataLoadedAt.value, TTL.HISTORY_DATA)
    ) {
      return historyData.value;
    }

    if (historyDataLoading.value) {
      return historyData.value;
    }

    historyDataLoading.value = true;
    try {
      const data = await loadAllHistoryData();
      historyData.value = data;
      historyDataLoadedAt.value = Date.now();
      return historyData.value;
    } catch (error) {
      console.error("History 데이터 로드 실패:", error);
      throw error;
    } finally {
      historyDataLoading.value = false;
    }
  }

  // 스토어 초기화 (로그아웃 시 호출)
  function reset() {
    mapImpactData.value = [];
    marketIndicators.value = [];
    strategiesData.value = [];
    dailyFactorData.value = null;
    overallImpactData.value = 0;

    mapDataLoadedAt.value = null;
    marketIndicatorsLoadedAt.value = null;
    strategiesLoadedAt.value = null;
    dailyFactorLoadedAt.value = null;
    overallImpactLoadedAt.value = null;

    mapDataLoading.value = false;
    marketIndicatorsLoading.value = false;
    strategiesLoading.value = false;
    dailyFactorLoading.value = false;
    overallImpactLoading.value = false;

    lastMarketUpdateTime.value = "";

    financialData.value = null;
    financialDataLoadedAt.value = null;
    financialDataLoading.value = false;
    historyData.value = null;
    historyDataLoadedAt.value = null;
    historyDataLoading.value = false;

    predictedBrentPrice.value = 0;
  }

  const isMapDataLoaded = () => mapDataLoadedAt.value !== null;
  const isDailyFactorLoaded = () => dailyFactorLoadedAt.value !== null;

  return {
    // 데이터
    mapImpactData,
    marketIndicators,
    strategiesData,
    dailyFactorData,
    overallImpactData,
    financialData,
    historyData,
    predictedBrentPrice,

    // 로딩 상태
    mapDataLoading,
    marketIndicatorsLoading,
    strategiesLoading,
    dailyFactorLoading,
    overallImpactLoading,
    financialDataLoading,
    historyDataLoading,

    // 로드 완료 여부
    isMapDataLoaded,
    isDailyFactorLoaded,

    // 마지막 업데이트 시간
    lastMarketUpdateTime,

    // 로드 함수
    loadMapData,
    loadMarketIndicators,
    loadStrategies,
    loadDailyFactor,
    loadOverallImpact,
    loadFinancialData,
    loadHistoryData,
    loadPredictedBrentPrice,

    // 초기화
    reset,
  };
});
