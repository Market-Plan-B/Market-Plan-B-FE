<template>
    <div class="relative space-y-8">
        <!-- ✅ Daily 영향도 -->
        <div class="lottie-fixed">
            <!-- Lottie 캐릭터 (클릭 X) -->
            <div ref="lottieContainer"></div>

            <!-- 클릭 가능 버튼 -->
            <div class="impact-card" @click="goToAnalysis">
                <div class="text-1xs font-medium text-white/90">Daily 영향도</div>
                <div class="text-2xl font-extrabold">{{ todayImpact.score }}</div>
            </div>
        </div>

        <!-- 🛢️ 글로벌 원유 대시보드 -->
        <section class="bg-white p-6 rounded-2xl shadow-sm">
            <h2 class="font-bold text-xl mb-1">글로벌 원유 대시보드</h2>
            <p class="text-sm text-gray-500 mb-4">
                공급·수요·시장 리스크 요인을 실시간으로 시각화합니다.
            </p>
            <WorldOilMap />
        </section>

        <!-- 하단 그래프 -->
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
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import lottie from "lottie-web";
import WorldOilMap from "@/components/WorldOilMap.vue";
import ChartBar from "@/components/ChartBar.vue";
import CounterMeasure from "@/components/CounterMeasure.vue";

const router = useRouter();
const goToAnalysis = () => router.push("/analysis");

const todayImpact = { score: 8.3 };

const lottieContainer = ref(null);

onMounted(() => {
    if (lottieContainer.value) {
        lottie.loadAnimation({
            container: lottieContainer.value,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "/lottie/robot.json",
        });
    }
});
</script>

<style scoped>
.lottie-fixed {
    position: absolute;
    top: 8px;
    right: 32px;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
    /* 전체 박스는 클릭 막음 */
}

.lottie-fixed>div:first-child {
    width: 90px;
    height: 90px;
    pointer-events: none;
    /* Lottie 자체는 클릭 불가 */
}

.impact-card {
    pointer-events: auto;
    /* ✅ 버튼만 클릭 허용 */
    background: rgba(255, 115, 0, 0.8);
    /* 🧡 반투명 배경 */
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
