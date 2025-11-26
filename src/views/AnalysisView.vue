<template>
    <div class="space-y-8">
        <!-- 헤더 섹션 -->
        <section class="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 class="font-bold text-2xl mb-2 text-gray-900">영향도 분석</h2>
                    <p class="text-sm text-gray-600">실시간 금융지표 기반 원유 시장 분석입니다.</p>
                </div>
                <input type="date" v-model="selectedDate"
                    class="px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 bg-white hover:border-blue-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
            </div>

            <!-- 핵심 지표 카드 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-l-4 border-orange-600 shadow-md">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-gray-700 text-sm font-semibold">브렌트유 종가</span>
                        <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div class="text-4xl font-bold text-orange-600 mb-2">${{ fmt(financial.brent?.price) }}</div>
                    <div class="text-xs text-gray-600 font-medium">USD per barrel</div>
                </div>

                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-l-4 shadow-md"
                    :class="(financial.brent?.change ?? 0) >= 0 ? 'border-green-600' : 'border-red-600'">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-gray-700 text-sm font-semibold">전일 대비 변화</span>
                        <svg class="w-6 h-6"
                            :class="(financial.brent?.change ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div class="text-4xl font-bold mb-2"
                        :class="(financial.brent?.change ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'">
                        {{ (financial.brent?.change ?? 0) >= 0 ? '+' : '' }}{{ fmt(financial.brent?.change) }}
                    </div>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                        :class="(financial.brent?.change ?? 0) >= 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'">
                        {{ (financial.brent?.changePercent ?? 0) >= 0 ? '+' : '' }}{{
                            fmt(financial.brent?.changePercent) }}%
                    </span>
                </div>

                <div
                    class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-l-4 border-blue-600 shadow-md">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-gray-700 text-sm font-semibold">WTI-Brent 스프레드</span>
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                    </div>
                    <div class="text-4xl font-bold text-blue-600 mb-2">${{ fmt(spread) }}</div>
                    <div class="text-xs text-gray-500 font-medium">Brent - WTI</div>
                </div>
            </div>
        </section>

        <!-- 금융지표 카테고리 탭 -->
        <section class="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div class="flex items-center gap-2 mb-6">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <h3 class="font-bold text-xl text-gray-900">금융지표 현황</h3>
            </div>

            <!-- 카테고리 탭 -->
            <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button v-for="cat in categories" :key="cat.id" @click="activeCategory = cat.id"
                    class="px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all border-2"
                    :class="[
                        activeCategory === cat.id
                            ? 'bg-indigo-600 text-black border-indigo-600 shadow-lg shadow-indigo-300 scale-[1.03]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    ]">
                    {{ cat.name }}
                </button>

            </div>

            <!-- 지표 그리드 - 가로 배치 -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div v-for="item in currentIndicators" :key="item.key"
                    class="rounded-xl p-4 border transition-all hover:shadow-md" :class="item.gradient">
                    <div class="text-xs text-gray-600 font-medium mb-1">{{ item.label }}</div>
                    <div class="text-xl font-bold" :class="item.textColor">
                        {{ item.prefix }}{{ formatValue(item) }}{{ item.suffix }}
                    </div>
                    <div v-if="item.changeKey" class="text-xs mt-1 font-medium"
                        :class="getChangeValue(item) >= 0 ? 'text-green-600' : 'text-red-600'">
                        {{ getChangeValue(item) >= 0 ? '▲' : '▼' }} {{ Math.abs(getChangeValue(item)).toFixed(2) }}%
                    </div>
                </div>
            </div>

            <div class="mt-4 text-xs text-gray-500 text-right">마지막 업데이트: {{ lastUpdated }}</div>
        </section>

        <!-- 피처 중요도 분석 -->
        <section class="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div class="flex items-center gap-2 mb-6">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <h3 class="font-bold text-xl text-gray-900">피처 중요도 분석</h3>
                <span class="text-xs text-gray-500 ml-2">(AI 모델이 영향도 평가 시 활용한 주요 지표)</span>
            </div>
            <ChartBar :apiData="apiData" :loading="loading" />
        </section>

        <ChatBotFloating />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import ChatBotFloating from "@/components/ui/ChatBotFloating.vue";
import ChartBar from "@/components/ChartBar.vue";
import { getImpactAnalysis } from '@/api/analysisApi';
import { loadAllFinancialData, type FinancialData } from '@/api/financial';

const selectedDate = ref(new Date().toISOString().split('T')[0]);
const apiData = ref<any>(null);
const loading = ref(false);
const lastUpdated = ref('-');
const activeCategory = ref('oil');

const financial = ref<FinancialData>({
    brent: { price: 0, value: 0, prevClose: 0, change: 0, changePercent: 0 },
    wti: { price: 0, value: 0, prevClose: 0, change: 0, changePercent: 0 },
    crack: { value: 0 },
    naturalGas: { value: 0, change: 0 },
    usdkrw: { price: 0 },
    cnyusd: { price: 0 },
    dxy: { index: 0, change: 0 },
    us10y: { rate: 0 },
    us2y: { rate: 0 },
    sp500: { value: 0, change: 0 },
    vix: { value: 0, change: 0 },
    gold: { value: 0, change: 0 },
    copper: { value: 0, change: 0 },
});

const categories = [
    { id: 'oil', name: '원유/에너지' },
    { id: 'fx', name: '환율/금리' },
    { id: 'index', name: '주요 지수' },
];

const indicators = {
    oil: [
        { key: 'brent', label: 'Brent Oil', path: 'brent.price', prefix: '$', gradient: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200', textColor: 'text-amber-700', changeKey: 'brent.changePercent' },
        { key: 'wti', label: 'WTI Crude', path: 'wti.price', prefix: '$', gradient: 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200', textColor: 'text-slate-700', changeKey: 'wti.changePercent' },
        { key: 'crack', label: 'Crack Spread', path: 'crack.value', prefix: '$', gradient: 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200', textColor: 'text-rose-700' },
        { key: 'gas', label: 'Natural Gas', path: 'naturalGas.value', prefix: '$', gradient: 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200', textColor: 'text-orange-700', changeKey: 'naturalGas.change' },
    ],
    fx: [
        { key: 'usdkrw', label: 'USD/KRW', path: 'usdkrw.price', prefix: '₩', gradient: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200', textColor: 'text-green-700', decimals: 0 },
        { key: 'cnyusd', label: 'CNY/USD', path: 'cnyusd.price', prefix: '', gradient: 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200', textColor: 'text-red-700', decimals: 4 },
        { key: 'dxy', label: 'Dollar Index', path: 'dxy.index', prefix: '', gradient: 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200', textColor: 'text-purple-700', changeKey: 'dxy.change' },
        { key: 'us10y', label: 'US 10Y Yield', path: 'us10y.rate', suffix: '%', gradient: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200', textColor: 'text-blue-700', decimals: 3 },
        { key: 'us2y', label: 'US 2Y Yield', path: 'us2y.rate', suffix: '%', gradient: 'bg-gradient-to-r from-cyan-50 to-sky-50 border-cyan-200', textColor: 'text-cyan-700', decimals: 3 },
    ],
    index: [
        { key: 'sp500', label: 'S&P 500', path: 'sp500.value', prefix: '', gradient: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200', textColor: 'text-emerald-700', changeKey: 'sp500.change', decimals: 0 },
        { key: 'vix', label: 'VIX', path: 'vix.value', prefix: '', gradient: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200', textColor: 'text-yellow-700', changeKey: 'vix.change' },
        { key: 'gold', label: 'Gold', path: 'gold.value', prefix: '$', gradient: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300', textColor: 'text-yellow-600', changeKey: 'gold.change' },
        { key: 'copper', label: 'Copper', path: 'copper.value', prefix: '$', gradient: 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200', textColor: 'text-orange-600', changeKey: 'copper.change' },
    ],
};

const currentIndicators = computed(() => indicators[activeCategory.value as keyof typeof indicators] || []);
const spread = computed(() => (financial.value.brent?.price ?? 0) - (financial.value.wti?.price ?? 0));

const fmt = (v?: number, decimals = 2) => v?.toFixed(decimals) ?? '-';

const getPath = (path: string) => path.split('.').reduce((o: any, k) => o?.[k], financial.value);
const formatValue = (item: any) => {
    const v = getPath(item.path);
    return v != null ? v.toFixed(item.decimals ?? 2) : '-';
};
const getChangeValue = (item: any) => item.changeKey ? getPath(item.changeKey) ?? 0 : 0;

async function loadFinancialData() {
    financial.value = await loadAllFinancialData();
    lastUpdated.value = new Date().toLocaleString('ko-KR');
}


const fetchData = async () => {
    loading.value = true;
    try { apiData.value = await getImpactAnalysis(selectedDate.value); }
    catch (e) { console.error(e); }
    finally { loading.value = false; }
};

onMounted(() => {
    fetchData();
    loadFinancialData();
});

watch(selectedDate, fetchData);
</script>

<style scoped>
:deep(.bar-negative),
:deep(.bar-positive) {
    cursor: pointer;
    transition: opacity 0.2s ease;
}

:deep(.bar-negative):hover,
:deep(.bar-positive):hover {
    opacity: 0.8;
}
</style>