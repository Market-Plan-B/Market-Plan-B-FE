<template>
    <div class="relative space-y-8">
        <!-- ✅ Daily 영향도 -->
        <div class="lottie-fixed">
            <div ref="lottieContainer"></div>

            <div class="impact-card" @click="goToAnalysis">
                <div class="text-xs font-medium text-white/90">Daily 영향도</div>
                <div class="text-2xl font-extrabold">{{ todayImpact.score }}</div>
            </div>
        </div>
        <!-- 🛢️ 글로벌 원유 대시보드 -->
        <section class="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <h2 class="font-bold text-2xl mb-2 text-gray-900">글로벌 원유 대시보드</h2>
            <WorldOilMap />
        </section>

        <!-- 📊 하단 Daily Feature & Counter -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-2xl p-6 shadow-sm">
                <h3 class="font-semibold mb-3 text-gray-700">Daily feature</h3>
                <ChartBar />
            </div>
            <div class="bg-white rounded-2xl p-6 shadow-sm">
                <h3 class="font-semibold mb-3 text-gray-700">Daily 추천 대응책</h3>
                <CounterMeasure />
            </div>
        </section>

        <!-- 💬 공통 챗봇 플로팅 버튼 -->
        <ChatBotFloating />
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import lottie from "lottie-web";
import { dashboardAPI } from "@/router/api";

import WorldOilMap from "@/components/WorldOilMap.vue";
import ChartBar from "@/components/ChartBar.vue";
import CounterMeasure from "@/components/CounterMeasure.vue";
import ChatBotFloating from "@/components/ui/ChatBotFloating.vue";

const router = useRouter();
const goToAnalysis = () => router.push("/analysis");

const todayImpact = ref({ score: 0 });
const lottieContainer = ref(null);

const loadOverallImpact = async () => {
    try {
        // Router에서 미리 로드된 데이터 사용
        if (window.dashboardData?.overall) {
            todayImpact.value.score = window.dashboardData.overall.overall_score;
        } else {
            const response = await dashboardAPI.getOverallImpact();
            todayImpact.value.score = response.data.overall_score;
        }
    } catch (error) {
        console.error('전체 영향도 로드 실패:', error);
        todayImpact.value.score = 0;
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
    background: rgba(255, 115, 0, 0.8);
    color: white;
    padding: 10px 16px;
    border-radius: 12px;
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
