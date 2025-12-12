<!-- DashboardView.vue -->
<template>
    <div class="dashboard-container">
        <!-- ✅ Daily 영향도 (Brent Oil) -->
        <div class="lottie-fixed">
            <div ref="lottieContainer"></div>
            <div class="impact-card" @click="goToAnalysis">
                <div class="impact-card-label">Brent Oil</div>
                <div class="impact-card-score">${{ fmt(predictedChange) }}</div>
            </div>
        </div>

        <!-- 🛢 글로벌 원유 지도 -->
        <section class="dashboard-section">
            <h2 class="dashboard-section-title">글로벌 원유 대시보드</h2>
            <WorldOilMap />
        </section>

        <!-- 📊 Daily Feature & Counter -->
        <section class="dashboard-grid">
            <div class="dashboard-card">
                <h3 class="dashboard-card-title">Daily Feature 영향도</h3>
                <ChartBar :apiData="apiData" :loading="loading" :limit="5" class="chart-overflow" />
            </div>
            <div class="dashboard-card">
                <h3 class="dashboard-card-title">Daily 추천 대응책</h3>
                <CounterMeasure />
            </div>
        </section>

        <ChatBotFloating />
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import lottie from "lottie-web";
import { dashboardAPI } from "@/api/dashboard";
import { loadAllFinancialData } from '@/api/financial';

import WorldOilMap from "@/components/WorldOilMap.vue";
import ChartBar from "@/components/ChartBar.vue";
import CounterMeasure from "@/components/CounterMeasure.vue";
import ChatBotFloating from "@/components/ui/ChatBotFloating.vue";

const router = useRouter();
const goToAnalysis = () => router.push("/analysis");

const predictedBrentPrice = ref(0);
const apiData = ref(null);
const lottieContainer = ref(null);
const loading = ref(true);

const financial = ref({
    brent: { price: 0, value: 0, prevClose: 0, change: 0, changePercent: 0 },
    wti: { price: 0, value: 0, prevClose: 0, change: 0, changePercent: 0 },
    crack: { value: 0 },
    naturalGas: { value: 0, change: 0 },
    heatingOil: { value: 0, change: 0 },
    usdkrw: { price: 0 },
    cnyusd: { price: 0 },
    eurusd: { price: 0, change: 0 },
    dxy: { index: 0, change: 0 },
    us10y: { rate: 0 },
    us2y: { rate: 0 },
    sp500: { value: 0, change: 0 },
    vix: { value: 0, change: 0 },
    gold: { value: 0, change: 0 },
    copper: { value: 0, change: 0 },
});

const predictedChange = computed(() => {
    if (!predictedBrentPrice.value || !financial.value.brent?.price) return 0;
    return financial.value.brent.price - predictedBrentPrice.value;
});

const fmt = (v, decimals = 2) => {
    if (v == null || isNaN(v)) return '-';
    return v.toFixed(decimals);
};

const loadOverallImpact = async () => {
    try {
        if (window.dashboardData?.overall) {
            predictedBrentPrice.value = window.dashboardData.overall.overall_score;
        } else {
            const response = await dashboardAPI.getOverallImpact();
            predictedBrentPrice.value = response.data.overall_score;
        }
    } catch (error) {
        console.error("전체 영향도 로드 실패:", error);
        predictedBrentPrice.value = 0;
    }
};

const loadFinancialData = async () => {
    try {
        financial.value = await loadAllFinancialData();
    } catch (error) {
        console.error("금융 데이터 로드 실패:", error);
    }
};

const loadDailyFactor = async () => {
    loading.value = true;
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await dashboardAPI.getImpactAnalysis(today); //  동일한 API
        apiData.value = response.data;
    } catch (err) {
        console.error("Daily Feature 로드 실패:", err);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    if (lottieContainer.value) {
        lottie.loadAnimation({
            container: lottieContainer.value,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "/lottie/Drop Oil.json",
        });
    }

    await Promise.all([loadOverallImpact(), loadFinancialData()]);
    await loadDailyFactor();
});
</script>

<style scoped>
.dashboard-container {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.lottie-fixed {
    position: absolute;
    top: 26px;
    right: 48px;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
}

.lottie-fixed>div:first-child {
    width: 60px;
    height: 60px;
    pointer-events: none;
}

.impact-card {
    pointer-events: auto;
    background: rgba(255, 255, 255, 0.7);
    color: #ea770c;
    padding: 10px 16px;
    border-radius: 6px;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
    margin-top: 5px;
}

.impact-card:hover {
    transform: scale(1.05);
}

.impact-card-label {
    font-size: 14px;
    font-weight: 600;
    color: rgb(0, 0, 0);
}

.impact-card-score {
    font-size: 30px;
    font-weight: 700;
}

.dashboard-section {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
}

.dashboard-section-title {
    font-weight: 700;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #111827;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
}

.dashboard-card {
    background: white;
    border-radius: 0.375rem;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
}

.dashboard-card-title {
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: #000000;
}

.chart-overflow {
    overflow: hidden;
}

@media (min-width: 1024px) {
    .dashboard-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 1024px) {
    .lottie-fixed {
        position: static !important;
        align-self: center;
        margin-top: 12px;
    }
}
</style>