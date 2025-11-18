<template>
    <div class="space-y-8">

        <!-- 📌 모드 선택 + 날짜 선택 -->
        <section class="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <div class="mb-6">
                <h2 class="font-bold text-2xl mb-2 text-gray-900">글로벌 원유 시장 리포트</h2>
                <p class="text-sm text-gray-600">AI가 생성한 데일리/위클리 리포트를 확인하세요.</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-6 justify-between items-center">
                <div class="inline-flex rounded-2xl bg-gray-100 p-1.5 shadow-inner">
                    <button @click="switchMode('daily')"
                        class="relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
                        :class="mode === 'daily'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:text-gray-900'">
                        Daily
                    </button>

                    <button @click="switchMode('weekly')"
                        class="relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
                        :class="mode === 'weekly'
                            ? 'bg-white text-purple-600 shadow-md'
                            : 'text-gray-600 hover:text-gray-900'">
                        Weekly
                    </button>
                </div>

                <input type="date" v-model="selectedDate"
                    class="px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 bg-white hover:border-blue-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium shadow-sm" />
            </div>
        </section>

        <!-- 📌 뉴스 카드 -->
        <section class="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-900">
                    {{ mode === 'daily' ? 'Daily News' : 'Weekly News' }}
                </h2>
            </div>

            <Transition name="cards" mode="out-in">
                <ReportCards :key="mode + selectedDate" :cards="cards" />
            </Transition>
        </section>

        <!-- 📌 상세 리포트 (HTML 그대로 렌더링) -->
        <section class="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div class="mb-8">
                <h2 class="text-xl font-bold text-gray-900">
                    {{ mode === 'daily' ? 'Daily Report' : 'Weekly Report' }}
                </h2>
                <p class="text-sm text-slate-600">{{ selectedDate }}</p>
            </div>

            <!-- HTML 직접 렌더링 -->
            <div v-if="reportHtml" class="prose max-w-none" v-html="reportHtml">
            </div>

            <div v-else class="text-slate-400 text-center py-10">
                리포트가 없습니다.
            </div>
        </section>

    </div>
</template>

<script setup>
import { ref, watch } from "vue";
import ReportCards from "@/components/ReportCards.vue";
import { reportsAPI } from "@/api/reports";

const mode = ref("daily");
const selectedDate = ref("2025-11-17");

const cards = ref([]);
const reportHtml = ref("");   // html_resource만 저장

/* -----------------------------
    Daily API
------------------------------ */
async function loadDaily() {
    const cardRes = await reportsAPI.getDailyCardnews(selectedDate.value);
    const reportRes = await reportsAPI.getDailyReport(selectedDate.value);

    // news는 카드 형태로 변환
    cards.value = cardRes.news.map(n => ({
        date: n.date,
        title: n.title,
        desc: n.summary,
        url: n.url
    }));

    // HTML 리소스 직접 렌더링
    reportHtml.value = reportRes.html_resource ?? "";
}

/* -----------------------------
    Weekly API
------------------------------ */
function getWeekRange(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() + 4 - day);

    const start = new Date(date);
    start.setDate(start.getDate() - 3);

    const end = new Date(date);
    end.setDate(end.getDate() + 3);

    return {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
    };
}

async function loadWeekly() {
    const { start, end } = getWeekRange(selectedDate.value);

    const cardRes = await reportsAPI.getWeeklyCardnews(start, end);
    const reportRes = await reportsAPI.getWeeklyReport(start, end);

    cards.value = cardRes.news.map(n => ({
        date: n.date,
        title: n.title,
        desc: n.summary,
        url: n.url
    }));

    reportHtml.value = reportRes.html_resource ?? "";
}

/* -----------------------------
    Mode Switch & Watcher
------------------------------ */
function switchMode(m) {
    mode.value = m;
}

watch([mode, selectedDate], () => {
    if (mode.value === "daily") loadDaily();
    else loadWeekly();
}, { immediate: true });
</script>

<style scoped>
.cards-enter-active,
.cards-leave-active {
    transition: all 0.4s ease;
}

.cards-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.cards-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>
