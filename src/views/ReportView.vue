<template>
    <div class="space-y-8">
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

        <section class="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-900">{{ mode === 'daily' ? 'Daily News' : 'Weekly News' }}</h2>
                <span class="text-sm text-gray-500 font-medium">총 {{ displayCards.length }}개</span>
            </div>

            <Transition name="cards" mode="out-in">
                <ReportCards :key="mode + selectedDate" :cards="displayCards" />
            </Transition>
        </section>

        <section class="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div class="mb-8">
                <h2 class="text-xl font-bold text-gray-900">{{ mode === 'daily' ? 'Daily 상세 리포트' : 'Weekly 상세 리포트' }}
                </h2>
                <p class="text-sm text-slate-600">
                    {{ selectedDate }}
                </p>
            </div>

            <div class="space-y-8">
                <div class="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-blue-600">
                    <div class="flex items-center gap-2 mb-4">
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="font-bold text-xl text-slate-900">Executive Summary</h3>
                    </div>
                    <p class="text-slate-700 leading-relaxed text-base">
                        {{ summaryData.executive_summary }}
                    </p>
                </div>

                <div class="bg-white rounded-2xl p-8 shadow-lg">
                    <div class="flex items-center gap-2 mb-6">
                        <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 class="font-bold text-xl text-slate-900">Key Market Metrics</h3>
                    </div>

                    <div class="overflow-hidden rounded-xl border border-slate-200">
                        <table class="w-full">
                            <thead class="bg-gradient-to-r from-slate-100 to-slate-50">
                                <tr>
                                    <th class="py-4 px-6 text-left font-bold text-slate-700 text-sm">지표</th>
                                    <th class="py-4 px-6 text-left font-bold text-slate-700 text-sm">가격</th>
                                    <th class="py-4 px-6 text-center font-bold text-slate-700 text-sm">D/D</th>
                                    <th class="py-4 px-6 text-center font-bold text-slate-700 text-sm">W/W</th>
                                    <th class="py-4 px-6 text-left font-bold text-slate-700 text-sm">코멘트</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-200">
                                <tr v-for="m in summaryData.metrics" :key="m.label"
                                    class="hover:bg-slate-50 transition-colors">
                                    <td class="py-4 px-6 font-bold text-slate-900">{{ m.label }}</td>
                                    <td class="py-4 px-6 font-bold text-lg text-slate-900">{{ m.price }}</td>
                                    <td class="py-4 px-6 text-center">
                                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
                                            :class="m.dd >= 0
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-blue-100 text-blue-700'">
                                            {{ m.dd >= 0 ? '▲' : '▼' }} {{ Math.abs(m.dd) }}%
                                        </span>
                                    </td>
                                    <td class="py-4 px-6 text-center">
                                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
                                            :class="m.ww >= 0
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-blue-100 text-blue-700'">
                                            {{ m.ww >= 0 ? '▲' : '▼' }} {{ Math.abs(m.ww) }}%
                                        </span>
                                    </td>
                                    <td class="py-4 px-6 text-slate-600 text-sm">{{ m.comment }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-8 shadow-lg">
                    <div class="flex items-center gap-2 mb-6">
                        <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 class="font-bold text-xl text-slate-900">Macro Drivers</h3>
                    </div>

                    <div class="grid md:grid-cols-3 gap-6">
                        <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-l-4 border-red-600">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </div>
                                <h4 class="font-bold text-lg text-red-900">Supply</h4>
                            </div>
                            <p class="text-slate-700 text-sm leading-relaxed">
                                {{ summaryData.macro.supply }}
                            </p>
                        </div>

                        <div
                            class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-l-4 border-yellow-600">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                </div>
                                <h4 class="font-bold text-lg text-yellow-900">Demand</h4>
                            </div>
                            <p class="text-slate-700 text-sm leading-relaxed">
                                {{ summaryData.macro.demand }}
                            </p>
                        </div>

                        <div
                            class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-l-4 border-orange-600">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                    </svg>
                                </div>
                                <h4 class="font-bold text-lg text-orange-900">Policy & Geo</h4>
                            </div>
                            <p class="text-slate-700 text-sm leading-relaxed">
                                {{ summaryData.macro.policy }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-8 shadow-lg">
                    <div class="flex items-center gap-2 mb-6">
                        <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <h3 class="font-bold text-xl text-slate-900">Scenario Outlook</h3>
                    </div>

                    <div class="space-y-4">
                        <div v-for="s in summaryData.scenarios" :key="s.type"
                            class="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-3">
                                    <span class="px-4 py-2 rounded-lg font-bold text-white text-sm" :class="{
                                        'bg-green-600': s.type === 'Base',
                                        'bg-red-600': s.type === 'Bull',
                                        'bg-blue-600': s.type === 'Bear'
                                    }">
                                        {{ s.type }}
                                    </span>
                                    <span class="text-2xl font-bold text-slate-900">${{ s.range }}/bbl</span>
                                </div>
                                <div class="text-right">
                                    <div class="text-3xl font-bold text-slate-900">{{ Math.round(s.prob * 100) }}%</div>
                                    <div class="text-xs text-slate-600 font-medium">확률</div>
                                </div>
                            </div>
                            <p class="text-slate-700 text-sm leading-relaxed">{{ s.desc }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-8 shadow-lg">
                    <div class="flex items-center gap-2 mb-6">
                        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 class="font-bold text-xl text-slate-900">Risk Matrix</h3>
                    </div>

                    <div class="grid md:grid-cols-3 gap-6">
                        <div v-for="risk in summaryData.risk_matrix" :key="risk.risk"
                            class="bg-slate-50 rounded-xl p-6 border-2 transition-all hover:shadow-lg" :class="{
                                'border-red-300 hover:border-red-500': risk.impact === 'high',
                                'border-yellow-300 hover:border-yellow-500': risk.impact === 'medium',
                                'border-green-300 hover:border-green-500': risk.impact === 'low'
                            }">
                            <div class="flex items-start justify-between mb-3">
                                <p class="font-bold text-slate-900 text-lg">{{ risk.risk }}</p>
                                <span class="px-3 py-1 rounded-full text-xs font-bold uppercase" :class="{
                                    'bg-red-100 text-red-700': risk.impact === 'high',
                                    'bg-yellow-100 text-yellow-700': risk.impact === 'medium',
                                    'bg-green-100 text-green-700': risk.impact === 'low'
                                }">
                                    {{ risk.impact }}
                                </span>
                            </div>
                            <p class="text-slate-700 text-sm leading-relaxed">{{ risk.comment }}</p>
                        </div>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-white rounded-2xl p-8 shadow-lg">
                        <div class="flex items-center gap-2 mb-4">
                            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <h3 class="font-bold text-lg text-slate-900">Investment Implications</h3>
                        </div>
                        <ul class="space-y-3">
                            <li v-for="imp in summaryData.implications" :key="imp"
                                class="flex items-start gap-3 text-slate-700 text-sm">
                                <svg class="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                                <span>{{ imp }}</span>
                            </li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-2xl p-8 shadow-lg">
                        <div class="flex items-center gap-2 mb-4">
                            <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <h3 class="font-bold text-lg text-slate-900">Monitoring List</h3>
                        </div>
                        <ul class="space-y-3">
                            <li v-for="m in summaryData.monitoring" :key="m"
                                class="flex items-start gap-3 text-slate-700 text-sm">
                                <svg class="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{{ m }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

        </section>
        <ChatBotFloating />
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import api from "@/api";  // axios 인스턴스
import ReportCards from "@/components/ReportCards.vue";
import ChatBotFloating from "@/components/ui/ChatBotFloating.vue";

// Daily / Weekly 모드
const mode = ref("daily");
const selectedDate = ref("2025-11-17");

// API 데이터 저장
const cardNews = ref([]);     // 뉴스 카드 리스트
const summaryData = ref({});  // 상세 리포트

function switchMode(m) {
    mode.value = m;
}

function getWeekRange(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() + 4 - day);
    const start = new Date(date);
    start.setDate(start.getDate() - 3); // 월요일
    const end = new Date(date);
    end.setDate(end.getDate() + 3); // 일요일

    return {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10)
    };
}
async function fetchDailyCardnews() {
    try {
        const res = await api.get("/api/reports/daily/cardnews", {
            params: { query_date: selectedDate.value }
        });
        cardNews.value = res.data;
    } catch (e) { console.error("Daily Cardnews Error:", e); }
}

async function fetchDailyReport() {
    try {
        const res = await api.get("/api/reports/daily/report", {
            params: { query_date: selectedDate.value }
        });
        summaryData.value = res.data;
    } catch (e) { console.error("Daily Report Error:", e); }
}

async function fetchWeeklyCardnews() {
    try {
        const { start, end } = getWeekRange(selectedDate.value);
        const res = await api.post("/api/reports/weekly/cardnews", {
            start_date: start,
            end_date: end
        });
        cardNews.value = res.data;
    } catch (e) { console.error("Weekly Cardnews Error:", e); }
}

async function fetchWeeklyReport() {
    try {
        const { start, end } = getWeekRange(selectedDate.value);
        const res = await api.post("/api/reports/weekly/report", {
            start_date: start,
            end_date: end
        });
        summaryData.value = res.data;
    } catch (e) { console.error("Weekly Report Error:", e); }
}

watch([mode, selectedDate], () => {
    if (mode.value === "daily") {
        fetchDailyCardnews();
        fetchDailyReport();
    } else {
        fetchWeeklyCardnews();
        fetchWeeklyReport();
    }
}, { immediate: true });
</script>

<style scoped>
/* 카드 전환 애니메이션 */
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