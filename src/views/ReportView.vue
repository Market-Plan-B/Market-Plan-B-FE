<template>
    <div class="space-y-8">

        <!-- 📌 모드 선택 + 날짜 선택 -->
        <section class="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <div class="mb-6">
                <h2 class="font-bold text-2xl mb-2 text-gray-900">글로벌 원유 시장 리포트</h2>
                <p class="text-sm text-gray-600">AI가 뉴스의 시장 영향도를 산출하고, 높은 영향도를 가진 핵심 이슈만 선별해 제공합니다.</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-6 justify-between items-center">
                <div class="inline-flex rounded-2xl bg-gray-100 p-1.5 shadow-inner">
                    <button @click="switchMode('daily')"
                        class="relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
                        :class="mode === 'daily'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:text-gray-900'">
                        <span class="relative z-10 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Daily
                        </span>
                    </button>

                    <button @click="switchMode('weekly')"
                        class="relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
                        :class="mode === 'weekly'
                            ? 'bg-white text-purple-600 shadow-md'
                            : 'text-gray-600 hover:text-gray-900'">
                        <span class="relative z-10 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Weekly
                        </span>
                    </button>
                </div>

                <div class="relative">
                    <input type="date" v-model="selectedDate"
                        class="px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 bg-white hover:border-blue-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium shadow-sm" />
                </div>
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

        <!-- 📌 상세 리포트 -->
        <section class="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div class="mb-8">
                <h2 class="text-xl font-bold text-gray-900">
                    {{ mode === 'daily' ? 'Daily 상세 리포트' : 'Weekly 상세 리포트' }}
                </h2>
                <p class="text-sm text-slate-600">{{ selectedDate }}</p>
            </div>

            <div v-if="report && report.macro" class="space-y-8">

                <!-- Executive Summary -->
                <div class="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-blue-600">
                    <h3 class="font-bold text-xl mb-4">Executive Summary</h3>
                    <p class="text-slate-700 leading-relaxed text-base">
                        {{ report.executive_summary }}
                    </p>
                </div>

                <!-- Metrics -->
                <div class="bg-white rounded-2xl p-8 shadow-lg">
                    <h3 class="font-bold text-xl mb-6">Key Market Metrics</h3>

                    <div class="overflow-hidden rounded-xl border border-slate-200">
                        <table class="w-full">
                            <thead>
                                <tr>
                                    <th class="py-4 px-6">지표</th>
                                    <th class="py-4 px-6">가격</th>
                                    <th class="py-4 px-6 text-center">D/D</th>
                                    <th class="py-4 px-6 text-center">W/W</th>
                                    <th class="py-4 px-6">코멘트</th>
                                </tr>
                            </thead>

                            <tbody class="divide-y divide-slate-200">
                                <tr v-for="m in report.metrics" :key="m.label">
                                    <td class="py-4 px-6 font-bold">{{ m.label }}</td>
                                    <td class="py-4 px-6 font-bold text-lg">{{ m.price }}</td>
                                    <td class="py-4 px-6 text-center">{{ m.dd }}</td>
                                    <td class="py-4 px-6 text-center">{{ m.ww }}</td>
                                    <td class="py-4 px-6 text-sm text-slate-600">{{ m.comment }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Macro -->
                <div class="bg-white rounded-2xl p-8 shadow-lg">
                    <h3 class="font-bold text-xl mb-6">Macro Drivers</h3>
                    <div class="grid md:grid-cols-3 gap-6">
                        <div class="border-l-4 border-red-600 p-6 bg-red-50 rounded-xl">
                            <h4 class="font-bold mb-2">Supply</h4>
                            <p>{{ report.macro.supply }}</p>
                        </div>
                        <div class="border-l-4 border-yellow-600 p-6 bg-yellow-50 rounded-xl">
                            <h4 class="font-bold mb-2">Demand</h4>
                            <p>{{ report.macro.demand }}</p>
                        </div>
                        <div class="border-l-4 border-orange-600 p-6 bg-orange-50 rounded-xl">
                            <h4 class="font-bold mb-2">Policy & Geo</h4>
                            <p>{{ report.macro.policy }}</p>
                        </div>
                    </div>
                </div>

                <!-- Scenarios -->
                <div class="bg-white rounded-2xl p-8 shadow-lg">
                    <h3 class="font-bold text-xl mb-6">Scenario Outlook</h3>

                    <div class="space-y-4">
                        <div v-for="s in report.scenarios" :key="s.type"
                            class="bg-slate-50 border border-slate-200 rounded-xl p-6">
                            <div class="flex justify-between mb-3">
                                <div class="flex items-center gap-3">
                                    <span class="px-4 py-2 text-white rounded-lg font-bold" :class="{
                                        'bg-green-600': s.type === 'Base',
                                        'bg-red-600': s.type === 'Bull',
                                        'bg-blue-600': s.type === 'Bear'
                                    }">
                                        {{ s.type }}
                                    </span>
                                    <span class="text-2xl font-bold">${{ s.range }}/bbl</span>
                                </div>

                                <div class="text-right">
                                    <div class="text-3xl font-bold">{{ Math.round(s.prob * 100) }}%</div>
                                    <div class="text-xs text-slate-600">확률</div>
                                </div>
                            </div>
                            <p class="text-slate-700 text-sm">{{ s.desc }}</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
        <ChatBotFloating />
    </div>
</template>

<script setup>
import { ref, watch } from "vue";
import ReportCards from "@/components/ReportCards.vue";
import ChatBotFloating from "@/components/ui/ChatBotFloating.vue";
import { reportsAPI } from "@/api/reports";

// 상태
const mode = ref("daily");
const selectedDate = ref("2025-11-17");

const cards = ref([]);
const report = ref([]);


// 주간 날짜 범위 계산
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

async function loadDaily() {
    const cardRes = await reportsAPI.getDailyCardnews(selectedDate.value);
    const reportRes = await reportsAPI.getDailyReport(selectedDate.value);
    cards.value = cardRes.data;
    report.value = reportRes.data;
}

async function loadWeekly() {
    const { start, end } = getWeekRange(selectedDate.value);

    const cardRes = await reportsAPI.getWeeklyCardnews(start, end);
    const reportRes = await reportsAPI.getWeeklyReport(start, end);

    cards.value = cardRes.data;
    report.value = reportRes.data;
}

function switchMode(m) {
    mode.value = m;

    // 카드를 초기화 → 즉시 UI 갱신됨
    cards.value = [];
    report.value = null;

    // 이전 watch 를 위해 필요
    if (m === "daily") loadDaily();
    else loadWeekly();
}

// 날짜 / 모드 변경 시 API 자동 호출
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
