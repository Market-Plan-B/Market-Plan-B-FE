<template>
    <div class="analysis-container">
        <section class="analysis-section">
            <div class="analysis-header">
                <h2 class="section-title">영향도 분석</h2>
            </div>

            <!-- 핵심 지표 카드 -->
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
                        <div class="key-indicator-value value-orange">${{ fmt(predictedBrentPrice) }}</div>
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
                            {{ predictedChange >= 0 ? '+' : '' }}{{ fmt(predictedChange) }}
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

            <!-- 핵심 변수 지표 (5개 카테고리, 20개 지표) -->
            <div class="core-indicators-section">
                <div class="section-header">
                    <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 class="section-subtitle">핵심 변수 지표</h3>
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
                            <span
                                :class="['indicator-trend', item.trend > 0 ? 'trend-up' : item.trend < 0 ? 'trend-down' : 'trend-neutral']">
                                {{ item.trend > 0 ? '+' : '' }}{{ item.trend.toFixed(2) }}%
                            </span>
                        </div>
                        <div class="indicator-body">
                            <div class="indicator-value" :style="{ color: item.color }">
                                {{ item.prefix || '' }}{{ formatIndicatorValue(item) }}{{ item.suffix || '' }}
                            </div>
                            <svg class="sparkline" viewBox="0 0 60 24">
                                <polyline :points="getSparklinePath(item.history, item.color)" fill="none"
                                    :stroke="item.color" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <div class="indicator-meta">
                            <span class="indicator-description">{{ item.description }}</span>
                        </div>
                    </div>
                </div>

                <div class="last-updated">마지막 업데이트: {{ lastUpdated }}</div>
            </div>

            <!-- 피처 중요도 분석 -->
            <div class="feature-importance-section">
                <div class="section-header">
                    <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <h3 class="section-subtitle">피처 중요도 분석</h3>
                </div>
                <ChartBar :apiData="apiData" :loading="loading" />
            </div>
        </section>

        <ChatBotFloating />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
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
const predictedBrentPrice = ref<number>(0);

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

const coreCategories = [
    { id: 'supply', name: '원유 수급' },
    { id: 'macro', name: '거시경제' },
    { id: 'logistics', name: '물류/수송' },
    { id: 'financial', name: '금융심리' },
    { id: 'technical', name: '기술지표' },
];

const history = ref<HistoryData>({
    brent: [], wti: [], naturalGas: [], dxy: [], sp500: [], vix: [], gold: [], copper: [], us10y: [],
});

const coreIndicators = computed(() => {
    const f = financial.value;
    const h = history.value;
    const calcTrend = (arr: number[]) => {
        if (arr.length < 2) return 0;
        const first = arr[0], last = arr[arr.length - 1];
        return first ? +((last - first) / first * 100).toFixed(1) : 0;
    };

    return {
        supply: [
            { key: 'brent', label: 'Brent Crude', value: f.brent.price, trend: f.brent.changePercent || 0, prefix: '$', color: '#f97316', description: '북해산 원유 현물가', history: h.brent },
            { key: 'wti', label: 'WTI Crude', value: f.wti.price, trend: f.wti.changePercent || 0, prefix: '$', color: '#64748b', description: '서부 텍사스산 원유', history: h.wti },
            { key: 'spread', label: 'WTI-Brent Spread', value: spread.value, trend: 0, prefix: '$', color: '#3b82f6', description: '지역 프리미엄/공급 병목', history: calcSpreadHistory() },
            { key: 'gas', label: 'Natural Gas', value: f.naturalGas.value, trend: f.naturalGas.change || 0, prefix: '$', color: '#10b981', description: '천연가스 선물', history: h.naturalGas },
        ],
        macro: [
            { key: 'dxy', label: 'Dollar Index', value: f.dxy.index, trend: f.dxy.change || 0, color: '#8b5cf6', description: 'USD 강세 = 유가 하락 압력', history: h.dxy },
            { key: 'us10y', label: 'US 10Y Yield', value: f.us10y.rate, trend: calcTrend(h.us10y), suffix: '%', color: '#0ea5e9', description: '미국 10년물 국채 금리', history: h.us10y },
            { key: 'usdkrw', label: 'USD/KRW', value: f.usdkrw.price, trend: 0, prefix: '\u20A9', color: '#22c55e', description: '원달러 환율', history: [] },
            { key: 'gold', label: 'Gold', value: f.gold.value, trend: f.gold.change || 0, prefix: '$', color: '#eab308', description: '금 선물 가격', history: h.gold },
        ],
        logistics: [
            { key: 'copper', label: 'Copper', value: f.copper.value, trend: f.copper.change || 0, prefix: '$', color: '#b45309', description: '구리 (경기 선행지표)', history: h.copper },
            { key: 'crack', label: 'Crack Spread', value: f.crack.value, trend: 0, prefix: '$', color: '#f43f5e', description: '정제 마진', history: [] },
            { key: 'freight', label: 'Tanker Freight', value: 45.2, trend: 0, suffix: 'WS', color: '#f97316', description: '원유 수송 운임', history: [] },
            { key: 'hormuz', label: '호르무즈 리스크', value: 35, trend: 0, suffix: '%', color: '#dc2626', description: '지정학적 위험도', history: [] },
        ],
        financial: [
            { key: 'sp500', label: 'S&P 500', value: f.sp500.value, trend: f.sp500.change || 0, color: '#16a34a', description: '미국 대형주 지수', history: h.sp500 },
            { key: 'vix', label: 'VIX', value: f.vix.value, trend: f.vix.change || 0, color: '#ef4444', description: '공포지수', history: h.vix },
            { key: 'oi', label: 'Open Interest', value: 2.45, trend: 0, suffix: 'M', color: '#a855f7', description: '선물 미결제약정', history: [] },
            { key: 'etf_flow', label: 'Oil ETF Flow', value: 125, trend: 0, prefix: '$', suffix: 'M', color: '#6366f1', description: '주간 자금 유입', history: [] },
        ],
        technical: [
            { key: 'ma5', label: 'Brent MA(5)', value: calcMA(h.brent, 5), trend: 0, prefix: '$', color: '#06b6d4', description: '5일 이동평균', history: h.brent.slice(-5) },
            { key: 'ma20', label: 'Brent MA(20)', value: calcMA(h.brent, 7), trend: 0, prefix: '$', color: '#0891b2', description: '7일 이동평균', history: h.brent },
            { key: 'volatility', label: 'High-Low Range', value: calcVolatility(h.brent), trend: 0, prefix: '$', color: '#c026d3', description: '7일 변동폭', history: [] },
            { key: 'momentum', label: 'Price Momentum', value: calcMomentum(h.brent), trend: 0, suffix: '%', color: '#7c3aed', description: '7일 모멘텀', history: h.brent },
        ],
    };
});

const calcSpreadHistory = () => {
    const b = history.value.brent, w = history.value.wti;
    if (!b.length || !w.length) return [];
    const len = Math.min(b.length, w.length);
    return Array.from({ length: len }, (_, i) => b[i] - w[i]);
};

const calcMA = (arr: number[], period: number) => {
    if (!arr.length) return 0;
    const slice = arr.slice(-period);
    return +(slice.reduce((a, b) => a + b, 0) / slice.length).toFixed(2);
};

const calcVolatility = (arr: number[]) => {
    if (arr.length < 2) return 0;
    return +(Math.max(...arr) - Math.min(...arr)).toFixed(2);
};

const calcMomentum = (arr: number[]) => {
    if (arr.length < 2) return 0;
    const first = arr[0], last = arr[arr.length - 1];
    return first ? +((last - first) / first * 100).toFixed(1) : 0;
};

const currentCoreIndicators = computed(() => coreIndicators.value[activeCoreCategory.value] || []);
const spread = computed(() => (financial.value.brent?.price ?? 0) - (financial.value.wti?.price ?? 0));

const fmt = (v?: number, decimals = 2) => v?.toFixed(decimals) ?? '-';

const formatIndicatorValue = (item: CoreIndicator) => {
    if (item.value == null) return '-';
    return Number.isInteger(item.value) ? item.value : item.value.toFixed(2);
};

const getSparklinePath = (history: number[], color: string) => {
    if (!history || history.length < 2) return '';
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const width = 60;
    const height = 24;
    const padding = 2;

    const points = history.map((v, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = padding + (1 - (v - min) / range) * (height - padding * 2);
        return `${x},${y}`;
    });

    return points.join(' ');
};

const predictedChange = computed(() => {
    if (!predictedBrentPrice.value || !financial.value.brent?.price) return 0;
    return financial.value.brent.price - predictedBrentPrice.value;
});

const predictedChangePercent = computed(() => {
    if (!predictedBrentPrice.value || predictedBrentPrice.value === 0) return 0;
    return (predictedChange.value / predictedBrentPrice.value) * 100;
});

async function loadFinancialData() {
    const [fin, hist] = await Promise.all([loadAllFinancialData(), loadAllHistoryData(7)]);
    financial.value = fin;
    history.value = hist;
    lastUpdated.value = new Date().toLocaleString('ko-KR');
}

async function loadPredictedBrentPrice() {
    try {
        const windowData = (window as any).dashboardData?.overall;
        if (windowData) {
            predictedBrentPrice.value = windowData.overall_score;
        } else {
            const response = await dashboardAPI.getOverallImpact();
            predictedBrentPrice.value = response.data.overall_score;
        }
    } catch {
        predictedBrentPrice.value = 0;
    }
}

async function fetchData() {
    loading.value = true;
    try {
        const response = await analysisAPI.getImpactAnalysis(selectedDate.value);
        apiData.value = response.data;
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

/* Key Indicators */
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
    font-size: 14px;
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
    font-size: 32px;
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
    font-size: 12px;
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

/* Category Tabs */
.category-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.category-tab {
    padding: 10px 20px;
    border-radius: 6px;
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

/* Core Indicators Grid */
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
    border-radius: 12px;
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
    font-size: 11px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
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

.indicator-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.indicator-value {
    font-size: 22px;
    font-weight: 700;
}

.sparkline {
    width: 60px;
    height: 24px;
    flex-shrink: 0;
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