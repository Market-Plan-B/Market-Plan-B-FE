<template>
    <div class="map-wrapper">
        <div ref="mapContainer" class="map-container"></div>

        <!-- 지도 로딩 인디케이터 -->
        <div v-if="mapLoading" class="map-loading-overlay">
            <div class="map-loading-spinner"></div>
            <div class="map-loading-text">지도를 불러오는 중...</div>
        </div>

        <!-- 모드 토글 버튼 -->
        <div class="control-panel">
            <button @click="toggleSupplyMode" class="mode-toggle-btn"
                :class="{ 'mode-toggle-btn--active': isSupplyMode }">
                {{ isSupplyMode ? 'Impact View' : 'Supply View' }}
            </button>

            <select v-if="isSupplyMode" v-model="supplyTab" @change="changeSupplyTab" class="supply-select">
                <option value="usStocks">US 원유 재고</option>
                <option value="oecdStocks">OECD 재고</option>
                <option value="supplyMonitor">주요 산유국</option>
            </select>
        </div>

        <!-- 좌측 박스: 재고/공급 모드 -->
        <div v-if="isSupplyMode" class="impact-summary-box">
            <!-- 탭 1: 미국 원유 재고 -->
            <template v-if="supplyTab === 'usStocks'">
                <h3 class="impact-summary-title">US 원유 재고 요약</h3>

                <div v-if="usStocksLoading" class="us-stocks-loading">데이터 불러오는 중...</div>
                <div v-else-if="!crudeStocksDisplay" class="us-stocks-empty">데이터 없음</div>

                <div v-else class="seasonal-list">
                    <div class="seasonal-item">
                        <span class="seasonal-label">재고 수준</span>
                        <span class="seasonal-value">{{ crudeStocksDisplay }} Mbbl</span>
                    </div>
                    <div class="seasonal-item">
                        <span class="seasonal-label">주간 변동</span>
                        <span class="seasonal-value" :class="getValueColorClass(crudeStocksChangeMbbl)">
                            {{ crudeStocksChangeDisplay }}
                        </span>
                    </div>
                    <div class="seasonal-item">
                        <span class="seasonal-label">발표 주차</span>
                        <span class="seasonal-value">{{ latestPeriodDisplay }}</span>
                    </div>
                    <div class="seasonal-item">
                        <span class="seasonal-label">시장 시그널</span>
                        <span class="seasonal-value" :class="maxCategoryClass">{{ maxCategory }}</span>
                    </div>
                </div>

                <div class="us-stocks-update-time">출처: EIA Weekly Petroleum Status Report</div>
            </template>

            <!-- 탭 2: OECD 재고 -->
            <template v-else-if="supplyTab === 'oecdStocks'">
                <h3 class="impact-summary-title">OECD 상업 재고</h3>

                <div v-if="oecdLoading" class="us-stocks-loading">데이터 불러오는 중...</div>
                <div v-else-if="!oecdRegions.length" class="us-stocks-empty">데이터 없음</div>

                <div v-else class="seasonal-list">
                    <div v-for="region in oecdRegions" :key="region.code" class="seasonal-item">
                        <span class="seasonal-label">{{ region.name }}</span>
                        <span class="seasonal-value">
                            {{ region.stocksMbbl.toLocaleString() }} Mbbl
                            <span :class="getValueColorClass(region.stocksDiffPct)">
                                ({{ region.stocksDiffPct >= 0 ? '+' : '' }}{{ region.stocksDiffPct.toFixed(1) }}%)
                            </span>
                        </span>
                    </div>
                    <div class="seasonal-item">
                        <span class="seasonal-label">재고일수</span>
                        <span class="seasonal-value">
                            {{ oecdRegions[0]?.daysOfSupply.toFixed(1) }}일
                            <span :class="getValueColorClass(oecdRegions[0]?.daysDiff)">
                                ({{ oecdRegions[0]?.daysDiff >= 0 ? '+' : '' }}{{ oecdRegions[0]?.daysDiff.toFixed(1)
                                }}일)
                            </span>
                        </span>
                    </div>
                    <div class="seasonal-item">
                        <span class="seasonal-label">시장 시그널</span>
                        <span class="seasonal-value" :class="globalInventorySignalClass">
                            {{ globalInventorySignal }}
                        </span>
                    </div>
                </div>

                <div class="us-stocks-update-time">출처: EIA International Energy Statistics (OECD Stocks)</div>
            </template>

            <!-- 탭 3: 주요 산유국 -->
            <template v-else-if="supplyTab === 'supplyMonitor'">
                <h3 class="impact-summary-title">주요 산유국 생산 현황</h3>

                <div v-if="supplyLoading" class="us-stocks-loading">데이터 불러오는 중...</div>
                <div v-else-if="!supplyProducers.length" class="us-stocks-empty">데이터 없음</div>

                <div v-else class="supply-producer-list">
                    <div v-for="producer in topSupplyProducers" :key="producer.code" class="supply-producer-item"
                        @click="focusProducer(producer)">
                        <div class="supply-producer-header">
                            <span class="supply-producer-name">{{ producer.country }}</span>
                            <span class="supply-producer-category" :class="getSupplySignalClass(producer.yoyChangePct)">
                                {{ getSupplySignal(producer.yoyChangePct) }}
                            </span>
                        </div>
                        <div class="supply-producer-details">
                            <span>{{ producer.prodMbd.toFixed(1) }} Mb/d</span>
                            <span :class="getValueColorClass(producer.yoyChangePct)">
                                YoY {{ producer.yoyChangePct > 0 ? '+' : '' }}{{ producer.yoyChangePct.toFixed(1) }}%
                            </span>
                        </div>
                    </div>
                </div>

                <div class="us-stocks-update-time">출처: EIA International Energy Statistics (Crude Oil Production)
                </div>
            </template>
        </div>

        <!-- 좌측 박스: Risk 모드 -->
        <div v-else class="impact-summary-box">
            <h3 class="impact-summary-title">국가별 영향도 요약</h3>

            <div v-if="urgentList.length" class="impact-category">
                <div class="impact-category-label impact-label-urgent">🟥 긴급</div>
                <div class="impact-category-list">{{ urgentList.join(', ') }}</div>
            </div>
            <div v-if="highList.length" class="impact-category">
                <div class="impact-category-label impact-label-high">🟧 높음</div>
                <div class="impact-category-list">{{ highList.join(', ') }}</div>
            </div>
            <div v-if="midList.length" class="impact-category">
                <div class="impact-category-label impact-label-mid">🟨 중간</div>
                <div class="impact-category-list">{{ midList.join(', ') }}</div>
            </div>
            <div v-if="lowList.length" class="impact-category">
                <div class="impact-category-label impact-label-low">🟩 낮음</div>
                <div class="impact-category-list">{{ lowList.join(', ') }}</div>
            </div>
        </div>

        <!-- 우측 박스 -->
        <div class="market-info-box">
            <div v-if="isSupplyMode" class="market-indicators">
                <!-- 탭 1: US 재고 히스토리 -->
                <template v-if="supplyTab === 'usStocks'">
                    <h3 class="market-indicators-title">US 재고 분석</h3>
                    <div class="market-indicators-list">
                        <div class="market-indicator-item">
                            <div class="indicator-label-group">
                                <p class="indicator-name">5년 평균 대비</p>
                                <p class="indicator-symbol">현재 vs 5년 평균</p>
                            </div>
                            <div class="indicator-value-group">
                                <p class="indicator-price" :class="getValueColorClass(fiveYearDiffPct)">
                                    {{ fiveYearDiffDisplay }}
                                </p>
                            </div>
                        </div>
                        <div class="market-indicator-item">
                            <div class="indicator-label-group">
                                <p class="indicator-name">역사적 위치</p>
                                <p class="indicator-symbol">5년 백분위</p>
                            </div>
                            <div class="indicator-value-group">
                                <p class="indicator-price">{{ percentileDisplay }}</p>
                            </div>
                        </div>
                        <div class="market-indicator-item sparkline-row">
                            <div class="indicator-label-group">
                                <p class="indicator-name">최근 {{ sparklineCount }}주</p>
                                <p class="indicator-symbol">추세</p>
                            </div>
                            <div class="indicator-value-group">
                                <svg v-if="sparklinePoints" class="sparkline" viewBox="0 0 100 30"
                                    preserveAspectRatio="none">
                                    <polyline :points="sparklinePoints" fill="none" stroke="#f97316" stroke-width="2" />
                                </svg>
                                <p v-else class="sparkline-empty">데이터 부족</p>
                            </div>
                        </div>
                    </div>
                    <div class="market-update-time">
                        <p class="update-time-text">5년 EIA 주간 재고 기준</p>
                    </div>
                </template>

                <!-- 탭 2: OECD 요약 -->
                <template v-else-if="supplyTab === 'oecdStocks'">
                    <h3 class="market-indicators-title">글로벌 재고 인사이트</h3>
                    <div class="market-indicators-list">
                        <div class="market-indicator-item">
                            <div class="indicator-label-group">
                                <p class="indicator-name">재고 수준</p>
                                <p class="indicator-symbol">5년 평균 대비</p>
                            </div>
                            <div class="indicator-value-group">
                                <p class="indicator-price" :class="getValueColorClass(globalStockDiffPct)">
                                    {{ globalStockDiffDisplay }}
                                </p>
                            </div>
                        </div>
                        <div class="market-indicator-item">
                            <div class="indicator-label-group">
                                <p class="indicator-name">재고일수</p>
                                <p class="indicator-symbol">5년 평균 대비</p>
                            </div>
                            <div class="indicator-value-group">
                                <p class="indicator-price" :class="getValueColorClass(globalDaysDiff)">
                                    {{ globalDaysDiffDisplay }}
                                </p>
                            </div>
                        </div>
                        <div class="market-indicator-item">
                            <div class="indicator-label-group">
                                <p class="indicator-name">Market Signal</p>
                                <p class="indicator-symbol">Supply</p>
                            </div>
                            <div class="indicator-value-group">
                                <p class="indicator-price" :class="globalInventorySignalClass">
                                    {{ globalInventorySignal }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="market-update-time">
                        <p class="update-time-text">OECD Total 기준</p>
                    </div>
                </template>

                <!-- 탭 3: 공급 여유도 -->
                <template v-else-if="supplyTab === 'supplyMonitor'">
                    <h3 class="market-indicators-title">글로벌 공급 여유도</h3>
                    <div class="market-indicators-list">
                        <div class="market-indicator-item">
                            <div class="indicator-label-group">
                                <p class="indicator-name">OPEC+ 생산</p>
                                <p class="indicator-symbol">YoY</p>
                            </div>
                            <div class="indicator-value-group">
                                <p class="indicator-price" :class="getValueColorClass(opecYoyChange)">
                                    {{ opecYoyDisplay }}
                                </p>
                            </div>
                        </div>
                        <div class="market-indicator-item">
                            <div class="indicator-label-group">
                                <p class="indicator-name">Non-OPEC 생산</p>
                                <p class="indicator-symbol">YoY</p>
                            </div>
                            <div class="indicator-value-group">
                                <p class="indicator-price" :class="getValueColorClass(nonOpecYoyChange)">
                                    {{ nonOpecYoyDisplay }}
                                </p>
                            </div>
                        </div>
                        <div class="market-indicator-item">
                            <div class="indicator-label-group">
                                <p class="indicator-name">Net Supply</p>
                                <p class="indicator-symbol">OPEC+ + Non-OPEC</p>
                            </div>
                            <div class="indicator-value-group">
                                <p class="indicator-price" :class="getValueColorClass(netSupplyChange)">
                                    {{ netSupplyDisplay }}
                                </p>
                            </div>
                        </div>
                        <div class="market-indicator-item">
                            <div class="indicator-label-group">
                                <p class="indicator-name">Supply Risk</p>
                                <p class="indicator-symbol">Shock Level</p>
                            </div>
                            <div class="indicator-value-group">
                                <p class="indicator-price" :class="supplyShockRiskClass">
                                    {{ supplyShockRisk }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="market-update-time">
                        <p class="update-time-text">EIA International Production</p>
                    </div>
                </template>
            </div>

            <!-- Risk 모드: 시장 지표 -->
            <div v-else class="market-indicators">
                <h3 class="market-indicators-title">실시간 시장 지표</h3>
                <div class="market-indicators-list">
                    <div v-for="indicator in marketIndicators" :key="indicator.name" class="market-indicator-item">
                        <div class="indicator-label-group">
                            <p class="indicator-name">{{ indicator.name }}</p>
                            <p class="indicator-symbol">{{ indicator.symbol }}</p>
                        </div>
                        <div class="indicator-value-group">
                            <p class="indicator-price"
                                :class="indicator.change >= 0 ? 'indicator-price--up' : 'indicator-price--down'">
                                ${{ indicator.price }}
                            </p>
                            <p class="indicator-change"
                                :class="indicator.change >= 0 ? 'indicator-change--up' : 'indicator-change--down'">
                                {{ indicator.change >= 0 ? '+' : '' }}{{ indicator.change.toFixed(2) }}%
                            </p>
                        </div>
                    </div>
                </div>
                <div class="market-update-time">
                    <p class="update-time-text">업데이트: {{ lastUpdateTime }}</p>
                </div>
            </div>
        </div>

        <!-- 모달 -->
        <transition name="fade-zoom">
            <div v-if="selectedCountry" class="modal-overlay">
                <div class="modal-container">
                    <button @click="closeModal" class="modal-close-btn">X</button>
                    <h2 class="modal-title">{{ selectedCountry.name }} 주요 뉴스</h2>
                    <div class="modal-content">
                        <div v-if="!selectedCountry.articles.length" class="modal-empty">
                            <div class="modal-empty-icon">📰</div>
                            <div class="modal-empty-text">현재 표시할 뉴스가 없어요</div>
                        </div>
                        <div v-else class="modal-news-container">
                            <div class="modal-news-list">
                                <div v-for="(news, idx) in currentPageNews" :key="idx" class="modal-news-card">
                                    <div class="news-card-header">
                                        <h3 class="news-card-title">{{ news.title }}</h3>
                                        <span class="news-card-level">{{ news.level }}</span>
                                    </div>
                                    <p class="news-card-desc">{{ news.desc }}</p>
                                    <div class="news-card-footer">
                                        <a :href="news.url" target="_blank" rel="noopener noreferrer"
                                            class="news-card-link">원본
                                            Link</a>
                                        <p class="news-card-date">{{ news.date }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>
<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css';
import { ref, computed, onMounted, nextTick, onBeforeUnmount, watch } from 'vue';
import maplibregl from 'maplibre-gl';
import { dashboardAPI, MapImpact } from '@/api/dashboard';
import { getBrentOil, getWTI, getDXY, getCrackSpread } from '@/api/financial';

const MAPTILER_KEY = (import.meta as any).env.VITE_MAPTILER_KEY;

// 버블 레이어는 제거됨 - 미국 지도에 색상으로 표시
const SHIPPING_SOURCE_ID = 'shipping-routes';
const SHIPPING_LINE_LAYER_ID = 'shipping-lines';
const SHIPPING_POINT_LAYER_ID = 'shipping-points';
const SEASONAL_SOURCE_ID = 'seasonal-bands';
const SEASONAL_LAYER_ID = 'seasonal-overlay';

const mapImpactData = ref<MapImpact[]>([]);
const mapContainer = ref<HTMLElement | null>(null);
const mapInstance = ref<maplibregl.Map | null>(null);
const mapLoading = ref(true);

const isSupplyMode = ref(false);
const supplyTab = ref<'usStocks' | 'oecdStocks' | 'supplyMonitor'>('usStocks');

// 1) Supply Monitor
interface SupplyProducer {
    country: string;
    code: string;
    lat: number;
    lon: number;
    prodMbd: number;
    yoyChangePct: number;
    group: 'OPEC+' | 'Non-OPEC';
    rank: number;
}

const supplyProducers = ref<SupplyProducer[]>([]);
const opecYoyChange = ref<number | null>(null);
const nonOpecYoyChange = ref<number | null>(null);
const supplyLoading = ref(false);

const topSupplyProducers = computed(() =>
    [...supplyProducers.value].sort((a, b) => a.rank - b.rank)
);

function getSupplySignal(yoy: number): '공급 증가' | '공급 보합' | '공급 감소' {
    if (yoy > 3) return '공급 증가';
    if (yoy < -3) return '공급 감소';
    return '공급 보합';
}

function getSupplySignalColor(signal: string): string {
    if (signal === '공급 증가') return '#16a34a';
    if (signal === '공급 감소') return '#dc2626';
    return '#6b7280';
}

const opecYoyDisplay = computed(() => {
    if (opecYoyChange.value == null) return 'N/A';
    const v = opecYoyChange.value;
    return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
});

const nonOpecYoyDisplay = computed(() => {
    if (nonOpecYoyChange.value == null) return 'N/A';
    const v = nonOpecYoyChange.value;
    return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
});

const netSupplyChange = computed(() => {
    if (opecYoyChange.value == null || nonOpecYoyChange.value == null) return null;
    return opecYoyChange.value + nonOpecYoyChange.value;
});

const netSupplyDisplay = computed(() => {
    if (netSupplyChange.value == null) return 'N/A';
    const v = netSupplyChange.value;
    return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
});

const supplyShockRisk = computed(() => {
    if (opecYoyChange.value == null || nonOpecYoyChange.value == null) return 'N/A';
    const opec = opecYoyChange.value;
    const nonOpec = nonOpecYoyChange.value;
    if (opec <= -3 && nonOpec <= 1) return 'HIGH';
    if (Math.abs(opec + nonOpec) < 1.5) return 'MED';
    if (opec >= 0 && nonOpec >= 2) return 'LOW';
    return 'MED';
});

const supplyShockRiskColor = computed(() => {
    const risk = supplyShockRisk.value;
    if (risk === 'HIGH') return '#dc2626';
    if (risk === 'MED') return '#facc15';
    if (risk === 'LOW') return '#16a34a';
    return '#6b7280';
});

// 2) OECD Inventory
interface OecdRegionSnapshot {
    code: string;
    name: string;
    stocksMbbl: number;
    stocksDiffPct: number;
    daysOfSupply: number;
    daysDiff: number;
}

const oecdRegions = ref<OecdRegionSnapshot[]>([]);
const globalStockDiffPct = ref<number | null>(null);
const globalDaysDiff = ref<number | null>(null);
const oecdLoading = ref(false);

function getOecdSignal(region: OecdRegionSnapshot): 'Tight' | 'Neutral' | 'Loose' {
    const s = region.stocksDiffPct;
    const d = region.daysDiff;
    if (s <= -3 && d <= -1) return 'Tight';
    if (s >= 3 && d >= 1) return 'Loose';
    return 'Neutral';
}

function getOecdSignalColor(signal: string): string {
    if (signal === 'Tight') return '#dc2626';
    if (signal === 'Loose') return '#16a34a';
    return '#facc15';
}

const globalStockDiffDisplay = computed(() => {
    if (globalStockDiffPct.value == null) return 'N/A';
    const v = globalStockDiffPct.value;
    return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
});

const globalDaysDiffDisplay = computed(() => {
    if (globalDaysDiff.value == null) return 'N/A';
    const v = globalDaysDiff.value;
    return `${v >= 0 ? '+' : ''}${v.toFixed(1)}일`;
});

const tightestRegionName = computed(() => {
    if (!oecdRegions.value.length) return 'N/A';
    return oecdRegions.value.reduce((t, r) =>
        (r.stocksDiffPct + r.daysDiff) < (t.stocksDiffPct + t.daysDiff) ? r : t
    ).name;
});

const globalInventorySignal = computed(() => {
    if (globalStockDiffPct.value == null || globalDaysDiff.value == null) return '공급: N/A';
    const s = globalStockDiffPct.value;
    const d = globalDaysDiff.value;
    if (s <= -3 && d <= -1) return '공급 부족';
    if (s >= 3 && d >= 1) return '공급 여유';
    return '공급 보합';
});

const globalInventorySignalColor = computed(() => {
    const sig = globalInventorySignal.value;
    if (sig.includes('Tight')) return '#dc2626';
    if (sig.includes('Loose')) return '#16a34a';
    if (sig.includes('Balanced')) return '#facc15';
    return '#6b7280';
});

// 3) US Stocks
const usStocksLoading = ref(false);
const usStocksUpdateTime = ref('');
const eiaCrudeLevel = ref<number | null>(null);
const eiaCrudePrev = ref<number | null>(null);

interface EiaHistoryPoint {
    period: string;
    value: number;
}

const eiaHistory = ref<EiaHistoryPoint[]>([]);

const crudeStocksDisplay = computed(() =>
    eiaCrudeLevel.value != null ? eiaCrudeLevel.value.toFixed(1) : ''
);

const crudeStocksChangeMbbl = computed(() => {
    if (eiaCrudeLevel.value == null || eiaCrudePrev.value == null) return null;
    return eiaCrudeLevel.value - eiaCrudePrev.value;
});

const crudeStocksChangeDisplay = computed(() => {
    const v = crudeStocksChangeMbbl.value;
    if (v == null) return '';
    return `${v >= 0 ? '+' : ''}${v.toFixed(1)} Mbbl`;
});

const latestPeriodDisplay = computed(() => usStocksUpdateTime.value || 'N/A');

const fiveYearAvg = computed(() => {
    if (!eiaHistory.value.length) return null;
    return eiaHistory.value.reduce((acc, d) => acc + d.value, 0) / eiaHistory.value.length;
});

const fiveYearDiffPct = computed(() => {
    if (eiaCrudeLevel.value == null || fiveYearAvg.value == null) return null;
    return ((eiaCrudeLevel.value - fiveYearAvg.value) / fiveYearAvg.value) * 100;
});

const fiveYearDiffDisplay = computed(() => {
    const v = fiveYearDiffPct.value;
    if (v == null) return 'N/A';
    return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
});

const currentPercentile = computed(() => {
    const cur = eiaCrudeLevel.value;
    const data = eiaHistory.value;
    if (cur == null || !data.length) return null;
    return (data.filter((d) => d.value <= cur).length / data.length) * 100;
});

const percentileDisplay = computed(() => {
    const p = currentPercentile.value;
    if (p == null) return 'N/A';
    return p >= 50 ? `상위 ${Math.round(p)}%` : `하위 ${Math.round(100 - p)}%`;
});

const SPARKLINE_WINDOW = 12;
const sparklineData = computed(() => eiaHistory.value.slice(-SPARKLINE_WINDOW));
const sparklineCount = computed(() => sparklineData.value.length);

const sparklinePoints = computed(() => {
    const data = sparklineData.value;
    if (!data.length) return '';
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    return data.map((d, idx) => {
        const x = data.length === 1 ? 50 : (idx / (data.length - 1)) * 100;
        const y = 30 - ((d.value - min) / range) * 30;
        return `${x},${y}`;
    }).join(' ');
});

const maxCategory = computed(() => {
    const v = crudeStocksChangeMbbl.value;
    if (v == null) return 'N/A';
    const abs = Math.abs(v);
    if (abs > 10 && v < 0) return '공급 부족';
    if (abs > 10 && v > 0) return '공급 여유';
    if (abs > 4) return v < 0 ? '약간 공급 부족' : '약간 공급 여유';
    return '공급 보합';
});

const maxCategoryColor = computed(() => {
    const sig = maxCategory.value;
    if (sig.includes('Tight')) return '#dc2626';
    if (sig.includes('Loose')) return '#16a34a';
    return '#6b7280';
});

const maxCategoryClass = computed(() => {
    const sig = maxCategory.value;
    if (sig.includes('Tight')) return 'signal-tight';
    if (sig.includes('Loose')) return 'signal-loose';
    return 'signal-neutral';
});

// 색상 클래스 헬퍼 함수들
function getValueColorClass(value: number | null): string {
    if (value == null) return '';
    return value >= 0 ? 'value-positive' : 'value-negative';
}

function getSupplySignalClass(yoy: number): string {
    if (yoy > 3) return 'supply-signal-up';
    if (yoy < -3) return 'supply-signal-down';
    return 'supply-signal-flat';
}

const globalInventorySignalClass = computed(() => {
    const sig = globalInventorySignal.value;
    if (sig.includes('Tight')) return 'signal-tight';
    if (sig.includes('Loose')) return 'signal-loose';
    if (sig.includes('Balanced')) return 'signal-balanced';
    return 'signal-neutral';
});

const supplyShockRiskClass = computed(() => {
    const risk = supplyShockRisk.value;
    if (risk === 'HIGH') return 'risk-high';
    if (risk === 'MED') return 'risk-med';
    if (risk === 'LOW') return 'risk-low';
    return 'risk-neutral';
});

// 4) GeoJSON Builders
// 버블 레이어는 제거됨 - 대신 미국 지도에 색상 적용

function getSeasonalGeoJSON(): any {
    if (!oecdRegions.value.length) return { type: 'FeatureCollection', features: [] };
    const region = oecdRegions.value[0];
    return {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            properties: {
                code: region.code,
                name: region.name,
                signal: getOecdSignal(region),
                stocksMbbl: region.stocksMbbl,
                stocksDiffPct: region.stocksDiffPct,
                daysOfSupply: region.daysOfSupply,
                daysDiff: region.daysDiff,
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[[-170, 10], [180, 10], [180, 70], [-170, 70], [-170, 10]]],
            },
        }],
    };
}

function buildShippingGeoJSON(): any {
    if (!supplyProducers.value.length) return { type: 'FeatureCollection', features: [] };
    return {
        type: 'FeatureCollection',
        features: supplyProducers.value.map((p) => ({
            type: 'Feature',
            properties: {
                code: p.code,
                country: p.country,
                prodMbd: p.prodMbd,
                yoyChangePct: p.yoyChangePct,
                group: p.group,
                signal: getSupplySignal(p.yoyChangePct),
                rank: p.rank,
                kind: 'point',
            },
            geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
        })),
    };
}

function updateUSStocksColor() {
    const map = mapInstance.value;
    if (!map || !map.getLayer('country-fill')) return;

    // 주간 변동량에 따라 미국 색상만 적용 (다른 국가는 모두 transparent)
    const change = crudeStocksChangeMbbl.value;
    let usColor = 'transparent';

    if (change != null) {
        usColor = change >= 0 ? '#16a34a' : '#dc2626'; // 증가: 초록, 감소: 빨강
    }

    // 미국만 색상 적용, 나머지는 모두 transparent
    map.setPaintProperty('country-fill', 'fill-color', [
        'match',
        ['get', 'ISO3166-1-Alpha-3'],
        'USA', usColor,
        'transparent'
    ]);
}

function updateSeasonalLayer() {
    const src = mapInstance.value?.getSource(SEASONAL_SOURCE_ID) as maplibregl.GeoJSONSource;
    src?.setData(getSeasonalGeoJSON());
}

function updateShippingLayer() {
    const src = mapInstance.value?.getSource(SHIPPING_SOURCE_ID) as maplibregl.GeoJSONSource;
    src?.setData(buildShippingGeoJSON());
}

// 5) Data Loaders
async function fetchEiaCrudeStocks() {
    usStocksLoading.value = true;
    try {
        const res = await dashboardAPI.getUsStocks();
        const data = res.data;
        eiaCrudeLevel.value = data.latest;
        eiaCrudePrev.value = data.prev;
        usStocksUpdateTime.value = data.period || '';
        eiaHistory.value = data.history || [];
        // Supply View 모드이고 US Stocks 탭일 때만 지도 색상 업데이트
        if (isSupplyMode.value && supplyTab.value === 'usStocks') {
            updateUSStocksColor();
        }
    } catch (e) {
        console.error('US stocks fetch failed:', e);
    } finally {
        usStocksLoading.value = false;
    }
}

async function loadOecdInventory() {
    oecdLoading.value = true;
    try {
        const res = await dashboardAPI.getOecdInventory();
        const data = res.data;
        oecdRegions.value = data.regions || [];
        globalStockDiffPct.value = data.globalStockDiffPct ?? null;
        globalDaysDiff.value = data.globalDaysDiff ?? null;
        updateSeasonalLayer();
    } catch (e) {
        console.error('OECD inventory fetch failed:', e);
    } finally {
        oecdLoading.value = false;
    }
}

async function loadSupplyMonitor() {
    supplyLoading.value = true;
    try {
        const res = await dashboardAPI.getSupplyMonitor();
        const data = res.data;
        supplyProducers.value = data.producers || [];
        opecYoyChange.value = data.opec_yoy_change ?? null;
        nonOpecYoyChange.value = data.non_opec_yoy_change ?? null;
        updateShippingLayer();
    } catch (e) {
        console.error('Supply monitor fetch failed:', e);
    } finally {
        supplyLoading.value = false;
    }
}

// 6) Risk Mode Data
interface SelectedCountry {
    name: string;
    code: string;
    region_score: number;
    articles: { title: string; desc: string; url: string; date: string; level: number }[];
}

interface MarketIndicator {
    name: string;
    symbol: string;
    price: string;
    change: number;
}

const selectedCountry = ref<SelectedCountry | null>(null);
const lastUpdateTime = ref('');
const marketIndicators = ref<MarketIndicator[]>([
    { name: 'Brent Crude', symbol: 'BZ=F', price: '0.00', change: 0 },
    { name: 'WTI Crude', symbol: 'CL=F', price: '0.00', change: 0 },
    { name: 'Brent-WTI 스프레드', symbol: 'SPREAD', price: '0.00', change: 0 },
    { name: '달러인덱스', symbol: 'DXY', price: '0.00', change: 0 },
]);

const currentPageNews = computed(() => selectedCountry.value?.articles || []);

const urgentList = computed(() => mapImpactData.value.filter((i) => i.region_score >= 0.8).map((i) => i.name));
const highList = computed(() => mapImpactData.value.filter((i) => i.region_score >= 0.6 && i.region_score < 0.8).map((i) => i.name));
const midList = computed(() => mapImpactData.value.filter((i) => i.region_score >= 0.4 && i.region_score < 0.6).map((i) => i.name));
const lowList = computed(() => mapImpactData.value.filter((i) => i.region_score < 0.4).map((i) => i.name));

// 7) Map Interactions
function focusProducer(producer: SupplyProducer) {
    mapInstance.value?.flyTo({ center: [producer.lon, producer.lat], zoom: 4, duration: 1500 });
}

function setLayerVisibility(layerId: string, visible: boolean) {
    const map = mapInstance.value;
    if (map?.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    }
}

function restoreImpactViewColors() {
    const map = mapInstance.value;
    if (!map || !map.getLayer('country-fill')) return;

    // Impact View로 돌아갈 때 원래 색상으로 복원
    const getColorByScore = (score: number) => {
        if (score >= 8) return '#dc2626';
        if (score >= 6) return '#ea580c';
        if (score >= 4) return '#facc15';
        if (score >= 2) return '#22c55e';
        return 'transparent';
    };

    const colorMatch = mapImpactData.value.flatMap((item) => [
        item.code, getColorByScore(item.region_score),
    ]);

    map.setPaintProperty('country-fill', 'fill-color', [
        'match',
        ['get', 'ISO3166-1-Alpha-3'],
        ...colorMatch,
        'transparent'
    ]);
}

function clearAllCountryColors() {
    const map = mapInstance.value;
    if (!map || !map.getLayer('country-fill')) return;

    // 모든 국가를 transparent로 설정
    map.setPaintProperty('country-fill', 'fill-color', 'transparent');
}

function applySupplyLayerVisibility() {
    const inSupply = isSupplyMode.value;
    const tab = supplyTab.value;
    // 버블 레이어는 제거됨 - 미국 지도에 색상으로 표시
    setLayerVisibility(SEASONAL_LAYER_ID, false); // OECD 탭에서는 지도 레이어 표시 안 함
    setLayerVisibility(SHIPPING_POINT_LAYER_ID, inSupply && tab === 'supplyMonitor');
    setLayerVisibility(SHIPPING_LINE_LAYER_ID, false);

    const map = mapInstance.value;
    if (!map || !map.getLayer('country-fill')) return;

    if (inSupply) {
        // Supply View 모드일 때
        if (tab === 'usStocks') {
            // US Stocks 탭: 미국만 색상 적용
            updateUSStocksColor();
        } else {
            // 다른 탭: 모든 국가 색상 제거
            clearAllCountryColors();
        }
    } else {
        // Impact View 모드: 원래 색상으로 복원
        restoreImpactViewColors();
    }
}

watch([isSupplyMode, supplyTab], applySupplyLayerVisibility);

function changeSupplyTab() {
    const map = mapInstance.value;
    if (!map) return;

    if (supplyTab.value === 'usStocks') {
        if (!eiaCrudeLevel.value) fetchEiaCrudeStocks();
        // 미국 육지 중심으로 변경 (경도 약 -95, 위도 약 38)
        map.flyTo({ center: [-95, 38], zoom: 3.5, duration: 1200 });
    } else if (supplyTab.value === 'oecdStocks') {
        if (!oecdRegions.value.length) loadOecdInventory();
        map.flyTo({ center: [140, 45], zoom: 1.2, duration: 1200 });
    } else if (supplyTab.value === 'supplyMonitor') {
        if (!supplyProducers.value.length) loadSupplyMonitor();
        // 5개국 모두 보이도록: 사우디, 러시아, 이라크, UAE, 중국 포함, 유럽이 왼쪽에 오도록
        map.flyTo({ center: [80, 40], zoom: 2.0, duration: 1200 });
    }
    applySupplyLayerVisibility();
}

function toggleSupplyMode() {
    isSupplyMode.value = !isSupplyMode.value;
    const map = mapInstance.value;
    if (!map) return;

    if (map.getLayer('country-fill')) {
        // Supply View에서도 지도는 보이도록 (fill-opacity는 항상 0.85 유지)
        map.setPaintProperty('country-fill', 'fill-opacity', 0.85);
    }

    if (isSupplyMode.value) {
        supplyTab.value = 'usStocks';
        if (!eiaCrudeLevel.value) fetchEiaCrudeStocks();
        // 미국 육지 중심으로 변경 (경도 약 -95, 위도 약 38)
        map.flyTo({ center: [-95, 38], zoom: 3.3, duration: 1200 });
    } else {
        map.flyTo({ center: [140, 45], zoom: 1.2, duration: 1000 });
    }
    applySupplyLayerVisibility();
}

// 8) Init
async function loadMapData() {
    try {
        const response = await dashboardAPI.getMapImpact();
        mapImpactData.value = response.data;
    } catch (error) {
        console.error('Map data load failed:', error);
    }
}

async function loadMarketIndicators() {
    try {
        const [brent, wti, dxy, spread] = await Promise.all([
            getBrentOil(), getWTI(), getDXY(), getCrackSpread(),
        ]);
        marketIndicators.value = [
            { name: 'Brent Crude', symbol: 'BZ=F', price: brent.price.toFixed(2), change: brent.changePercent || 0 },
            { name: 'WTI Crude', symbol: 'CL=F', price: wti.price.toFixed(2), change: wti.changePercent || 0 },
            { name: 'Brent-WTI 스프레드', symbol: 'SPREAD', price: spread.value.toFixed(2), change: 0 },
            { name: '달러인덱스', symbol: 'DXY', price: dxy.index.toFixed(2), change: dxy.change || 0 },
        ];
        lastUpdateTime.value = new Date().toLocaleTimeString('ko-KR');
    } catch (error) {
        console.error('Market indicators load failed:', error);
    }
}

onMounted(async () => {
    await nextTick();
    await loadMapData();
    await loadMarketIndicators();
    initMap();
    setInterval(loadMarketIndicators, 300000);

    // Supply View 데이터 미리 로드 (백그라운드)
    Promise.all([
        fetchEiaCrudeStocks(),
        loadOecdInventory(),
        loadSupplyMonitor(),
    ]).catch((error) => {
        console.error('Supply View 데이터 사전 로드 실패:', error);
    });
});

async function initMap() {
    if (!mapContainer.value) return;

    const map = new maplibregl.Map({
        container: mapContainer.value,
        style: `https://api.maptiler.com/maps/pastel/style.json?key=${MAPTILER_KEY}`,
        center: [140, 45],
        zoom: 1.2,
        attributionControl: false,
    });

    mapInstance.value = map;

    map.on('style.load', async () => {
        const geoData = await fetch(
            'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'
        ).then((r) => r.json());

        const getColorByScore = (score: number) => {
            if (score >= 8) return '#dc2626';
            if (score >= 6) return '#ea580c';
            if (score >= 4) return '#facc15';
            if (score >= 2) return '#22c55e';
            return 'transparent';
        };

        const colorMatch = mapImpactData.value.flatMap((item) => [
            item.code, getColorByScore(item.region_score),
        ]);

        map.addSource('world-borders', { type: 'geojson', data: geoData, generateId: true });

        map.addLayer({
            id: 'country-fill',
            type: 'fill',
            source: 'world-borders',
            paint: {
                'fill-color': ['match', ['get', 'ISO3166-1-Alpha-3'], ...colorMatch, 'transparent'],
                'fill-opacity': 0.85,
            },
        });

        map.addLayer({
            id: 'country-outline',
            type: 'line',
            source: 'world-borders',
            paint: { 'line-color': '#9ca3af', 'line-width': 1, 'line-opacity': 0.6 },
        });

        map.addLayer({
            id: 'country-highlight',
            type: 'line',
            source: 'world-borders',
            paint: {
                'line-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#0ea5e9', 'transparent'],
                'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 3, 0],
                'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.9, 0],
            },
        });

        // US Stocks는 버블 대신 지도 색상으로 표시됨

        // Supply Monitor Points
        map.addSource(SHIPPING_SOURCE_ID, { type: 'geojson', data: buildShippingGeoJSON() });
        map.addLayer({
            id: SHIPPING_LINE_LAYER_ID,
            type: 'line',
            source: SHIPPING_SOURCE_ID,
            layout: { visibility: 'none' },
            filter: ['==', ['get', 'kind'], 'line'],
            paint: {
                'line-color': ['match', ['get', 'signal'], '공급 증가', '#16a34a', '공급 감소', '#dc2626', '#6b7280'],
                'line-width': 2,
            },
        });
        map.addLayer({
            id: SHIPPING_POINT_LAYER_ID,
            type: 'circle',
            source: SHIPPING_SOURCE_ID,
            layout: { visibility: 'none' },
            filter: ['==', ['get', 'kind'], 'point'],
            paint: {
                'circle-radius': ['interpolate', ['linear'], ['get', 'prodMbd'], 3, 25, 10, 45, 15, 60, 25, 80],
                'circle-color': ['match', ['get', 'signal'], '공급 증가', '#16a34a', '공급 감소', '#dc2626', '공급 보합', '#6b7280', '#6b7280'],
                'circle-opacity': 0.5,
                'circle-blur': 0.6,
                'circle-stroke-width': 0,
            },
        });

        // OECD Region Band
        map.addSource(SEASONAL_SOURCE_ID, { type: 'geojson', data: getSeasonalGeoJSON() });
        map.addLayer({
            id: SEASONAL_LAYER_ID,
            type: 'fill',
            source: SEASONAL_SOURCE_ID,
            layout: { visibility: 'none' },
            paint: {
                'fill-color': ['match', ['get', 'signal'], 'Tight', '#dc2626', 'Loose', '#16a34a', 'Neutral', '#facc15', '#6b7280'],
                'fill-opacity': 0.15,
            },
        });

        // Popup for tooltips
        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });

        // US Stocks Hover는 아래 country-fill mousemove 이벤트에서 처리

        // OECD Hover
        map.on('mouseenter', SEASONAL_LAYER_ID, (e) => {
            map.getCanvas().style.cursor = 'pointer';
            const props = e.features?.[0]?.properties;
            if (!props) return;
            const diffSign = props.stocksDiffPct >= 0 ? '+' : '';
            const daysSign = props.daysDiff >= 0 ? '+' : '';
            const signalColor = props.signal === 'Tight' ? '#dc2626' : props.signal === 'Loose' ? '#16a34a' : '#f59e0b';
            const signalText = props.signal === 'Tight' ? '공급 부족' : props.signal === 'Loose' ? '공급 여유' : props.signal === 'Neutral' ? '공급 보합' : props.signal;
            popup.setLngLat(e.lngLat).setHTML(`
        <div style="padding:12px 16px;font-size:13px;background:#fff;color:#111;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);min-width:160px;">
            <div style="font-weight:600;font-size:14px;margin-bottom:8px;">${props.name}</div>
            <div style="color:#555;margin-bottom:4px;">재고: ${Number(props.stocksMbbl).toLocaleString()} Mbbl</div>
            <div style="color:#555;margin-bottom:4px;">5년 대비: ${diffSign}${Number(props.stocksDiffPct).toFixed(1)}%</div>
            <div style="color:#555;margin-bottom:4px;">재고일수: ${Number(props.daysOfSupply).toFixed(1)}일 (${daysSign}${Number(props.daysDiff).toFixed(1)})</div>
            <div style="color:${signalColor};font-weight:500;">${signalText}</div>
        </div>
    `).addTo(map);
        });

        // Supply Monitor Hover
        map.on('mouseenter', SHIPPING_POINT_LAYER_ID, (e) => {
            map.getCanvas().style.cursor = 'pointer';
            const props = e.features?.[0]?.properties;
            if (!props) return;
            const yoySign = props.yoyChangePct >= 0 ? '+' : '';
            const signalColor = props.signal === '공급 증가' ? '#16a34a' : props.signal === '공급 감소' ? '#dc2626' : '#6b7280';
            popup.setLngLat(e.lngLat).setHTML(`
        <div style="padding:12px 16px;font-size:13px;background:#fff;color:#111;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);min-width:140px;">
            <div style="font-weight:600;font-size:14px;margin-bottom:8px;">${props.country}</div>
            <div style="color:#555;margin-bottom:4px;">생산량: ${props.prodMbd} Mb/d</div>
            <div style="color:#555;margin-bottom:4px;">YoY: ${yoySign}${props.yoyChangePct}%</div>
            <div style="color:${signalColor};font-weight:500;">${props.signal}</div>
        </div>
    `).addTo(map);
        });
        // US Stocks mouseleave는 country-fill의 기존 이벤트에서 처리됨

        map.on('mouseleave', SHIPPING_POINT_LAYER_ID, () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

        map.on('mouseleave', SEASONAL_LAYER_ID, () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

        // Country Hover (Risk Mode & US Stocks)
        let hoveredId: number | null = null;
        map.on('mousemove', 'country-fill', (e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            // US Stocks 탭에서 미국 hover 처리
            if (isSupplyMode.value && supplyTab.value === 'usStocks') {
                const isoCode = feature.properties['ISO3166-1-Alpha-3'];
                if (isoCode === 'USA') {
                    map.getCanvas().style.cursor = 'pointer';
                    const change = crudeStocksChangeMbbl.value;
                    if (change != null) {
                        const sign = change >= 0 ? '+' : '';
                        const signal = change > 4 ? '공급 여유' : change < -4 ? '공급 부족' : '공급 보합';
                        const signalColor = change > 0 ? '#16a34a' : change < 0 ? '#dc2626' : '#6b7280';
                        popup.setLngLat(e.lngLat).setHTML(`
        <div style="padding:12px 16px;font-size:13px;background:#fff;color:#111;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);min-width:140px;">
            <div style="font-weight:600;font-size:14px;margin-bottom:8px;">US Crude Stocks</div>
            <div style="color:#555;margin-bottom:4px;">주간 변동: ${sign}${change.toFixed(1)} Mbbl</div>
            <div style="color:${signalColor};font-weight:500;">${signal}</div>
        </div>
    `).addTo(map);
                    }
                }
                return;
            }

            // 다른 Supply 모드 탭에서는 hover 처리 안 함
            if (isSupplyMode.value) return;

            // Risk Mode hover 처리
            if (hoveredId !== null) {
                map.setFeatureState({ source: 'world-borders', id: hoveredId }, { hover: false });
            }
            hoveredId = feature.id as number;
            map.setFeatureState({ source: 'world-borders', id: hoveredId }, { hover: true });
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'country-fill', () => {
            // US Stocks 탭에서는 popup만 제거
            if (isSupplyMode.value && supplyTab.value === 'usStocks') {
                popup.remove();
                map.getCanvas().style.cursor = '';
                return;
            }
            if (hoveredId !== null) {
                map.setFeatureState({ source: 'world-borders', id: hoveredId }, { hover: false });
            }
            hoveredId = null;
            map.getCanvas().style.cursor = '';
        });

        // Country Click (Risk Mode)
        map.on('click', 'country-fill', async (e) => {
            if (isSupplyMode.value || !e.features?.length) return;
            const isoCode = e.features[0].properties['ISO3166-1-Alpha-3'];
            try {
                const response = await dashboardAPI.getRegionImpact(isoCode);
                openModal(response.data.region, response.data.contents);
            } catch (error) {
                console.error('Country data load failed:', error);
            }
        });

        updateSeasonalLayer();
        updateShippingLayer();
        updateUSStocksColor();
        applySupplyLayerVisibility();

        // 지도 로딩 완료
        mapLoading.value = false;
    });
}

function openModal(region: any, contents: any[]) {
    selectedCountry.value = {
        name: region.name,
        code: region.code,
        region_score: region.region_score,
        articles: contents
            .sort((a, b) => (b.source_score || 0) - (a.source_score || 0))
            .map((a) => ({
                title: a.title,
                desc: a.summary,
                url: a.url,
                date: a.published_date,
                level: a.source_score,
            })),
    };
}

function closeModal() {
    selectedCountry.value = null;
}

onBeforeUnmount(() => {
    mapInstance.value?.remove();
});
</script>


<style scoped>
/* Map Container */
.map-wrapper {
    position: relative;
    width: 100%;
    height: 520px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    background-color: #e5ebf2;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: visible;
}

.map-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

/* Control Panel */
.control-panel {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 30;
    display: flex;
    gap: 8px;
}

.mode-toggle-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.7);
    color: #000000;
}

.mode-toggle-btn:hover {
    background: #ea580c;
    color: white;
}

.mode-toggle-btn--active {
    background: rgba(255, 255, 255, 0.7);
    color: #000000;
}

.supply-select {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}

/* Impact Summary Box */
.impact-summary-box {
    position: absolute;
    bottom: 16px;
    left: 16px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 16px;
    width: 240px;
    height: auto;
    max-height: 300px;
    z-index: 20;
    display: flex;
    flex-direction: column;
}

.impact-summary-title {
    font-size: 16px;
    font-weight: 700;
    color: #000000;
    margin-bottom: 8px;
}

.impact-category {
    margin-bottom: 8px;
}

.impact-category-label {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
    line-height: 1.4;
}

.impact-label-urgent {
    color: #dc2626;
}

.impact-label-high {
    color: #ea770c;
}

.impact-label-mid {
    color: #e2ad01;
}

.impact-label-low {
    color: #0dbd4d;
}

.impact-category-list {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
    line-height: 1.5;
}

/* US Stocks & Supply Producer List */
.us-stocks-loading,
.us-stocks-empty {
    font-size: 14px;
    color: #6b7280;
    text-align: center;
    padding: 16px 0;
}

.supply-producer-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 8px;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
}

.supply-producer-item {
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
}

.supply-producer-item:hover {
    background: rgba(255, 255, 255, 1);
}

.supply-producer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.supply-producer-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
}

.supply-producer-category {
    font-size: 11px;
    font-weight: 600;
    color: #ffffff;
    padding: 2px 6px;
    border-radius: 4px;
}

.supply-producer-details {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #6b7280;
}

.us-stocks-update-time {
    margin-top: 8px;
    font-size: 11px;
    color: #6b7280;
    text-align: center;
}

/* Seasonal List 재사용 */
.seasonal-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.seasonal-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid #e5e7eb;
}

.seasonal-item:last-child {
    border-bottom: none;
}

.seasonal-label {
    font-size: 14px;
    color: #6b7280;
}

.seasonal-value {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
}

/* Market Info Box */
.market-info-box {
    position: absolute;
    bottom: 16px;
    right: 16px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 16px;
    width: 240px;
    height: auto;
    max-height: 300px;
    z-index: 20;
    display: flex;
    flex-direction: column;
}

.market-indicators {
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.market-indicators-title {
    font-size: 16px;
    font-weight: 700;
    color: #000000;
    margin-bottom: 8px;
}

.market-indicators-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 8px;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
}

.market-indicator-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.indicator-label-group {
    flex: 1;
}

.indicator-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    line-height: 1.4;
}

.indicator-symbol {
    font-size: 12px;
    color: #434c58;
    line-height: 1.5;
}

.indicator-value-group {
    text-align: right;
}

.indicator-price {
    font-size: 15px;
    font-weight: 700;
}

.indicator-price--up {
    color: #16a34a;
}

.indicator-price--down {
    color: #dc2626;
}

.indicator-price--warning {
    color: #ea580c;
}

.indicator-change {
    font-size: 12px;
    font-weight: 600;
}

.indicator-change--up {
    color: #16a34a;
}

.indicator-change--down {
    color: #dc2626;
}

.market-update-time {
    margin-top: 8px;
    flex-shrink: 0;
}

.update-time-text {
    font-size: 11px;
    color: #111827;
    text-align: center;
    margin: 0;
}

/* 스파크라인 */
.sparkline-row {
    align-items: center;
}

.sparkline {
    width: 100px;
    height: 30px;
}

.sparkline-empty {
    font-size: 11px;
    color: #6b7280;
}

/* Modal */
.modal-overlay {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 8px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    width: 900px;
    max-width: 90vw;
    height: 650px;
    max-height: 90vh;
    padding: 24px;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(12px);
    z-index: 50;
    border: 1px solid #e5e7eb;
}

.modal-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.modal-close-btn {
    position: absolute;
    top: 12px;
    right: 16px;
    color: #6b7280;
    font-size: 20px;
    font-weight: 700;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    transition: color 0.2s;
}

.modal-close-btn:hover {
    color: #1f2937;
}

.modal-title {
    font-weight: 500;
    font-size: 24px;
    margin-bottom: 16px;
    color: #000000;
    text-align: center;
}

.modal-content {
    flex: 1;
    overflow: hidden;
}

.modal-empty {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.modal-empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.modal-empty-text {
    font-weight: 500;
    font-size: 20px;
    margin-bottom: 16px;
    color: #000000;
    text-align: center;
}

.modal-news-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.modal-news-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
}

.modal-news-card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    width: 100%;
}

.news-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
}

.news-card-title {
    font-size: 18px;
    font-weight: 500;
    color: #111827;
    line-height: 1.5;
    flex: 1;
}

.news-card-level {
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 600;
    margin-left: 8px;
    flex-shrink: 0;
    background: #fed7aa;
    color: #ea580c;
}

.news-card-desc {
    font-size: 16px;
    font-weight: 400;
    color: #374151;
    margin-bottom: 12px;
    line-height: 1.75;
    flex: 1;
    overflow-y: auto;
}

.news-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid #e5e7eb;
}

.news-card-link {
    font-size: 16px;
    color: #ea580c;
    text-decoration: none;
    transition: text-decoration 0.2s;
}

.news-card-link:hover {
    text-decoration: underline;
}

.news-card-date {
    font-size: 14px;
    color: #6b7280;
}

/* Transitions */
.fade-zoom-enter-active,
.fade-zoom-leave-active {
    transition: opacity 0.25s ease;
}

.fade-zoom-enter-from,
.fade-zoom-leave-to {
    opacity: 0;
}

/* MapLibre Popup 기본 스타일 제거 */
:deep(.maplibregl-popup-content) {
    padding: 0;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
}

:deep(.maplibregl-popup-tip) {
    display: none;
}

/* Supply View 색상 클래스 */
.value-positive {
    color: #16a34a;
}

.value-negative {
    color: #dc2626;
}

.signal-tight {
    color: #dc2626;
}

.signal-loose {
    color: #16a34a;
}

.signal-balanced {
    color: #facc15;
}

.signal-neutral {
    color: #6b7280;
}

.supply-signal-up {
    background: #16a34a;
}

.supply-signal-down {
    background: #dc2626;
}

.supply-signal-flat {
    background: #6b7280;
}

.risk-high {
    color: #dc2626;
}

.risk-med {
    color: #facc15;
}

.risk-low {
    color: #16a34a;
}

.risk-neutral {
    color: #6b7280;
}

/* Map Loading Overlay */
.map-loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 100;
    border-radius: 6px;
}

.map-loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top-color: #ea580c;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.map-loading-text {
    margin-top: 16px;
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
