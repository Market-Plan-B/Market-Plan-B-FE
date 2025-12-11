<template>
    <div class="analysis-container">
        <section class="analysis-section">
            <div class="analysis-header">
                <h2 class="section-title">영향도 분석</h2>
            </div>

            <div class="key-indicators-section">
                <div class="key-indicators-grid">
                    <div class="key-indicator-card">
                        <div class="key-indicator-header">
                            <span class="key-indicator-label">Brent Oil(예상)</span>
                            <svg class="key-indicator-icon icon-orange" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div class="key-indicator-value value-orange">${{ fmt(predictedChange) }}</div>
                        <div class="key-indicator-unit">USD per barrel</div>
                    </div>

                    <div class="key-indicator-card">
                        <div class="key-indicator-header">
                            <span class="key-indicator-label">예상 대비 변화</span>
                            <svg :class="['key-indicator-icon', predictedChange >= 0 ? 'icon-green' : 'icon-red']"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div :class="['key-indicator-value', predictedChange >= 0 ? 'value-green' : 'value-red']">
                            {{ fmt(predictedBrentPrice) }}
                        </div>
                        <span
                            :class="['key-indicator-badge', predictedChange >= 0 ? 'badge-positive' : 'badge-negative']">
                            {{ predictedChangePercent >= 0 ? '+' : '' }}{{ fmt(predictedChangePercent) }}%
                        </span>
                    </div>

                    <div class="key-indicator-card">
                        <div class="key-indicator-header">
                            <span class="key-indicator-label">WTI-Brent 스프레드</span>
                            <svg class="key-indicator-icon icon-blue" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                        </div>
                        <div class="key-indicator-value">${{ fmt(spread) }}</div>
                        <div class="key-indicator-unit text-muted">Brent - WTI</div>
                    </div>
                </div>
            </div>

            <div class="core-indicators-section">
                <div class="section-header">
                    <h3 class="section-subtitle">핵심 시장 지표</h3>
                </div>

                <div class="category-tabs">
                    <button v-for="cat in coreCategories" :key="cat.id" @click="activeCoreCategory = cat.id"
                        :class="['category-tab', activeCoreCategory === cat.id ? 'tab-active' : 'tab-inactive']">
                        {{ cat.name }}
                    </button>
                </div>

                <div class="indicators-grid">
                    <div v-for="item in currentCoreIndicators" :key="item.key" class="indicator-card">
                        <div class="indicator-header">
                            <span class="indicator-label">{{ item.label }}</span>
                            <span :class="['indicator-trend', getTrendClass(item.trend)]">
                                <span class="trend-period">당일</span>
                                {{ formatTrend(item.trend) }}
                            </span>
                        </div>
                        <div class="indicator-body">
                            <div class="indicator-value" :style="{ color: item.color }">
                                {{ item.prefix || '' }}{{ formatValue(item.value) }}{{ item.suffix || '' }}
                            </div>
                            <div v-if="hasValidHistory(item.history)" class="sparkline-wrap">
                                <svg class="sparkline" viewBox="0 0 60 24">
                                    <polyline :points="getSparklinePath(item.history)" fill="none" :stroke="item.color"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <span class="sparkline-label">7D</span>
                            </div>
                            <div v-else class="no-chart">-</div>
                        </div>
                        <div class="indicator-meta">
                            <span class="indicator-description">{{ item.description }}</span>
                        </div>
                    </div>
                </div>

                <div class="last-updated">마지막 업데이트: {{ lastUpdated }}</div>
            </div>

            <div class="feature-importance-section">
                <div class="section-header">
                    <h3 class="section-subtitle">피처 중요도 분석</h3>
                </div>
                <ChartBar :apiData="apiData" :loading="loading" />
            </div>
        </section>

        <ChatBotFloating />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ChatBotFloating from "@/components/ui/ChatBotFloating.vue";
import ChartBar from "@/components/ChartBar.vue";
import { analysisAPI } from '@/api/analysis';
import { loadAllFinancialData, loadAllHistoryData, type FinancialData, type HistoryData } from '@/api/financial';
import { dashboardAPI } from '@/api/dashboard';

interface CoreIndicator {
    key: string;
    label: string;
    value: number;
    trend: number;
    prefix?: string;
    suffix?: string;
    color: string;
    description: string;
    history: number[];
}

const selectedDate = ref(new Date().toISOString().split('T')[0]);
const apiData = ref<any>(null);
const loading = ref(false);
const lastUpdated = ref('-');
const activeCoreCategory = ref('supply');
const predictedBrentPrice = ref(0);

const financial = ref<FinancialData>({
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

const history = ref<HistoryData>({
    brent: [], wti: [], naturalGas: [], heatingOil: [],
    dxy: [], sp500: [], vix: [], gold: [], copper: [],
    us10y: [], us2y: [], eurusd: [],
});

const coreCategories = [
    { id: 'supply', name: '원유 수급' },
    { id: 'macro', name: '거시경제' },
    { id: 'commodity', name: '원자재' },
    { id: 'sentiment', name: '시장심리' },
    { id: 'technical', name: '기술지표' },
];

const spread = computed(() => (financial.value.brent?.price ?? 0) - (financial.value.wti?.price ?? 0));

const calcTrend = (arr: number[]) => {
    if (arr.length < 2) return 0;
    const [first, last] = [arr[0], arr[arr.length - 1]];
    return first ? +((last - first) / first * 100).toFixed(1) : 0;
};

const calcSpreadHistory = () => {
    const { brent: b, wti: w } = history.value;
    if (!b.length || !w.length) return [];
    return Array.from({ length: Math.min(b.length, w.length) }, (_, i) => b[i] - w[i]);
};

const calcMA = (arr: number[], period: number) => {
    if (!arr.length) return 0;
    const slice = arr.slice(-period);
    return +(slice.reduce((a, b) => a + b, 0) / slice.length).toFixed(2);
};

const calcVolatility = (arr: number[]) => arr.length < 2 ? 0 : +(Math.max(...arr) - Math.min(...arr)).toFixed(2);

const coreIndicators = computed(() => {
    const f = financial.value;
    const h = history.value;

    return {
        supply: [
            { key: 'brent', label: 'Brent Crude', value: f.brent.price, trend: f.brent.changePercent || 0, prefix: '$', color: '#f97316', description: '북해산 원유 현물가', history: h.brent },
            { key: 'wti', label: 'WTI Crude', value: f.wti.price, trend: f.wti.changePercent || 0, prefix: '$', color: '#64748b', description: '서부 텍사스산 원유', history: h.wti },
            { key: 'spread', label: 'Brent-WTI Spread', value: spread.value, trend: calcTrend(calcSpreadHistory()), prefix: '$', color: '#3b82f6', description: '지역 프리미엄/공급 병목', history: calcSpreadHistory() },
            { key: 'gas', label: 'Natural Gas', value: f.naturalGas.value, trend: f.naturalGas.change || 0, prefix: '$', color: '#10b981', description: '천연가스 선물', history: h.naturalGas },
        ],
        macro: [
            { key: 'dxy', label: 'Dollar Index', value: f.dxy.index, trend: f.dxy.change || 0, color: '#8b5cf6', description: 'USD 강세 = 유가 하락 압력', history: h.dxy },
            { key: 'us10y', label: 'US 10Y Yield', value: f.us10y.rate, trend: calcTrend(h.us10y), suffix: '%', color: '#0ea5e9', description: '장기 금리 (경기 전망)', history: h.us10y },
            { key: 'us2y', label: 'US 2Y Yield', value: f.us2y.rate, trend: calcTrend(h.us2y), suffix: '%', color: '#06b6d4', description: '단기 금리 (Fed 정책)', history: h.us2y },
            { key: 'eurusd', label: 'EUR/USD', value: f.eurusd.price, trend: f.eurusd.change || 0, prefix: '$', color: '#22c55e', description: '유로/달러 환율', history: h.eurusd },
        ],
        commodity: [
            { key: 'heating', label: 'Heating Oil', value: f.heatingOil.value, trend: f.heatingOil.change || 0, prefix: '$', color: '#f43f5e', description: '난방유 선물', history: h.heatingOil },
            { key: 'crack', label: 'Crack Spread', value: f.crack.value, trend: 0, prefix: '$', color: '#ec4899', description: '정제 마진', history: [] },
            { key: 'copper', label: 'Copper', value: f.copper.value, trend: f.copper.change || 0, prefix: '$', color: '#b45309', description: '구리 (경기 선행지표)', history: h.copper },
            { key: 'gold', label: 'Gold', value: f.gold.value, trend: f.gold.change || 0, prefix: '$', color: '#eab308', description: '금 (인플레 헤지)', history: h.gold },
        ],
        sentiment: [
            { key: 'sp500', label: 'S&P 500', value: f.sp500.value, trend: f.sp500.change || 0, color: '#16a34a', description: '미국 대형주 지수', history: h.sp500 },
            { key: 'vix', label: 'VIX', value: f.vix.value, trend: f.vix.change || 0, color: '#ef4444', description: '변동성 지수 (공포지수)', history: h.vix },
        ],
        technical: [
            { key: 'ma5', label: 'Brent MA(5)', value: calcMA(h.brent, 5), trend: 0, prefix: '$', color: '#06b6d4', description: '5일 이동평균', history: h.brent.slice(-5) },
            { key: 'ma7', label: 'Brent MA(7)', value: calcMA(h.brent, 7), trend: 0, prefix: '$', color: '#0891b2', description: '7일 이동평균', history: h.brent },
            { key: 'volatility', label: 'High-Low Range', value: calcVolatility(h.brent), trend: 0, prefix: '$', color: '#c026d3', description: '7일 변동폭', history: [] },
            { key: 'momentum', label: 'Price Momentum', value: calcTrend(h.brent), trend: 0, suffix: '%', color: '#7c3aed', description: '7일 모멘텀', history: h.brent },
        ],
    };
});

const currentCoreIndicators = computed(() => coreIndicators.value[activeCoreCategory.value as keyof typeof coreIndicators.value] || []);

const predictedChange = computed(() => {
    if (!predictedBrentPrice.value || !financial.value.brent?.price) return 0;
    return financial.value.brent.price - predictedBrentPrice.value;
});

const predictedChangePercent = computed(() => {
    if (!predictedBrentPrice.value) return 0;
    return (predictedChange.value / predictedBrentPrice.value) * 100;
});

const fmt = (v?: number, decimals = 2) => v?.toFixed(decimals) ?? '-';
const formatValue = (v: number) => v == null ? '-' : Number.isInteger(v) ? v : v.toFixed(2);
const formatTrend = (t: number) => `${t > 0 ? '+' : ''}${t.toFixed(2)}%`;
const getTrendClass = (t: number) => t > 0 ? 'trend-up' : t < 0 ? 'trend-down' : 'trend-neutral';
const hasValidHistory = (h: number[]) => h && h.length >= 2;

const getSparklinePath = (history: number[]) => {
    if (!hasValidHistory(history)) return '';
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    return history.map((v, i) => {
        const x = (i / (history.length - 1)) * 60;
        const y = 2 + (1 - (v - min) / range) * 20;
        return `${x},${y}`;
    }).join(' ');
};

async function loadFinancialData() {
    const [fin, hist] = await Promise.all([loadAllFinancialData(), loadAllHistoryData(7)]);
    financial.value = fin;
    history.value = hist;
    lastUpdated.value = new Date().toLocaleString('ko-KR');
}

async function loadPredictedBrentPrice() {
    try {
        const windowData = (window as any).dashboardData?.overall;
        predictedBrentPrice.value = windowData?.overall_score ?? (await dashboardAPI.getOverallImpact()).data.overall_score;
    } catch {
        predictedBrentPrice.value = 0;
    }
}

async function fetchData() {
    loading.value = true;
    try {
        apiData.value = (await analysisAPI.getImpactAnalysis(selectedDate.value)).data;
    } catch {
        apiData.value = null;
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchData();
    loadFinancialData();
    loadPredictedBrentPrice();
});
</script>

<style scoped>
.analysis-container {
    display: flex;
    flex-direction: column;
}

.analysis-section {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    overflow: hidden;
}

.analysis-header {
    padding: 32px;
    border-bottom: 1px solid #cbd5e1;
}

.section-title {
    font-weight: 700;
    font-size: 24px;
    margin: 0;
    color: #111827;
}

.key-indicators-section,
.core-indicators-section,
.feature-importance-section {
    padding: 32px;
    border-bottom: 1px solid #cbd5e1;
}

.feature-importance-section {
    border-bottom: none;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
}

.section-icon {
    width: 24px;
    height: 24px;
    color: #ea580c;
}

.section-subtitle {
    font-weight: 700;
    font-size: 20px;
    color: #111827;
    margin: 0;
}

.key-indicators-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

@media (max-width: 768px) {
    .key-indicators-grid {
        grid-template-columns: 1fr;
    }
}

.key-indicator-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
}

.key-indicator-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.key-indicator-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.key-indicator-label {
    color: #374151;
    font-size: 15px;
    font-weight: 600;
}

.key-indicator-icon {
    width: 24px;
    height: 24px;
}

.icon-orange {
    color: #ea580c;
}

.icon-green {
    color: #16a34a;
}

.icon-red {
    color: #dc2626;
}

.icon-blue {
    color: #3b82f6;
}

.key-indicator-value {
    font-size: 33px;
    font-weight: 700;
    margin-bottom: 6px;
    color: #111827;
}

.value-orange {
    color: #ea580c;
}

.value-green {
    color: #16a34a;
}

.value-red {
    color: #dc2626;
}

.key-indicator-unit {
    font-size: 13px;
    color: #4b5563;
    font-weight: 500;
}

.text-muted {
    color: #6b7280;
}

.key-indicator-badge {
    display: inline-flex;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 700;
}

.badge-positive {
    background: #dcfce7;
    color: #166534;
}

.badge-negative {
    background: #fee2e2;
    color: #991b1b;
}

.category-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.category-tab {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    border: 2px solid;
    cursor: pointer;
    transition: all 0.2s;
}

.tab-active {
    background: #ea580c;
    color: #fff;
    border-color: #ea580c;
}

.tab-inactive {
    background: #fff;
    color: #374151;
    border-color: #e5e7eb;
}

.tab-inactive:hover {
    border-color: #ea580c;
    background: #fff7ed;
}

.indicators-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

@media (max-width: 1024px) {
    .indicators-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 640px) {
    .indicators-grid {
        grid-template-columns: 1fr;
    }
}

.indicator-card {
    background: #fafafa;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    transition: transform 0.2s, box-shadow 0.2s;
}

.indicator-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.indicator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.indicator-label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
}

.indicator-trend {
    font-size: 13px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.trend-period {
    font-size: 9px;
    font-weight: 500;
    opacity: 0.7;
}

.trend-up {
    color: #16a34a;
    background: #dcfce7;
}

.trend-down {
    color: #dc2626;
    background: #fee2e2;
}

.trend-neutral {
    color: #6b7280;
    background: #f3f4f6;
}

.sparkline-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
}

.sparkline-label {
    font-size: 10px;
    color: #9ca3af;
    font-weight: 500;
}

.indicator-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    min-height: 32px;
}

.indicator-value {
    font-size: 26px;
    font-weight: 700;
}

.sparkline {
    width: 60px;
    height: 24px;
    flex-shrink: 0;
}

.no-chart {
    width: 60px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #d1d5db;
    font-size: 14px;
}

.indicator-meta {
    margin-top: 4px;
}

.indicator-description {
    font-size: 11px;
    color: #6b7280;
}

.last-updated {
    margin-top: 20px;
    font-size: 12px;
    color: #6b7280;
    text-align: right;
}
</style>