<!-- DashboardView.vue -->
<template>
    <div class="relative space-y-8">
        <!-- ✅ Daily 영향도 (Brent Oil) -->
        <div class="lottie-fixed">
            <div ref="lottieContainer"></div>
            <div class="impact-card" @click="goToAnalysis">
                <div class="text-xs font-medium text-white/90">Brent Oil</div>
                <div class="text-2xl font-extrabold">{{ todayImpact.score }}</div>
            </div>
        </div>

        <!-- 🛢 글로벌 원유 지도 -->
        <section class="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <h2 class="font-bold text-2xl mb-2 text-gray-900">글로벌 원유 대시보드</h2>
            <WorldOilMap />
        </section>

        <!-- 📊 Daily Feature & Counter -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-md p-6 shadow-md border border-gray-200">
                <h3 class="font-semibold mb-3 text-gray-700">Daily Feature 영향도</h3>
                <ChartBar :apiData="apiData" :loading="loading" :limit="5" class="overflow-hidden" />
            </div>
            <div class="bg-white rounded-md p-6 shadow-md border border-gray-200">
                <h3 class="font-semibold mb-3 text-gray-700">Daily 추천 대응책</h3>
                <CounterMeasure />
            </div>
        </section>

        <ChatBotFloating />
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import lottie from "lottie-web";
import { dashboardAPI } from "@/api/dashboard";

import WorldOilMap from "@/components/WorldOilMap.vue";
import ChartBar from "@/components/ChartBar.vue";
import CounterMeasure from "@/components/CounterMeasure.vue";
import ChatBotFloating from "@/components/ui/ChatBotFloating.vue";

const router = useRouter();
const goToAnalysis = () => router.push("/analysis");

const todayImpact = ref({ score: 0 });
const apiData = ref(null);
const lottieContainer = ref(null);
const loading = ref(true);

const loadOverallImpact = async () => {
    try {
        if (window.dashboardData?.overall) {
            todayImpact.value.score = window.dashboardData.overall.overall_score;
        } else {
            const response = await dashboardAPI.getOverallImpact();
            todayImpact.value.score = response.data.overall_score;
        }
    } catch (error) {
        console.error("전체 영향도 로드 실패:", error);
        todayImpact.value.score = 0;
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
            path: "/lottie/robot.json",
        });
    }

    await loadOverallImpact();
    await loadDailyFactor();
});
</script>

<style scoped>
.lottie-fixed {
    position: absolute;
    top: 1px;
    right: 32px;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
}

.lottie-fixed>div:first-child {
    width: 90px;
    height: 90px;
    pointer-events: none;
}

.impact-card {
    pointer-events: auto;
    background: rgb(255, 115, 0);
    color: white;
    padding: 10px 16px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(255, 115, 0, 0.4);
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
    margin-top: -6px;
}

.impact-card:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(255, 115, 0, 0.5);
}

@media (max-width: 1024px) {
    .lottie-fixed {
        position: static !important;
        align-self: center;
        margin-top: 12px;
    }
}
</style>