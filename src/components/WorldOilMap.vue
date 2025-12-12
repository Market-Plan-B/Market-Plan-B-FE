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

                <div v-if="usStocksLoading" class="data-loading">
                    <div class="data-loading-spinner"></div>
                    <span>데이터 불러오는 중...</span>
                </div>
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

                <div v-if="oecdLoading" class="data-loading">
                    <div class="data-loading-spinner"></div>
                    <span>데이터 불러오는 중...</span>
                </div>
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

                <div v-if="supplyLoading" class="data-loading">
                    <div class="data-loading-spinner"></div>
                    <span>데이터 불러오는 중...</span>
                </div>
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
        <div v-else class="impact-summary-box" @click="openImpactSummaryModal" @mouseenter="showMoreIndicator = true"
            @mouseleave="showMoreIndicator = false">
            <h3 class="impact-summary-title">국가별 영향도 요약</h3>
            <div v-if="showMoreIndicator && hasMoreCountries" class="more-indicator">더보기</div>

            <div v-if="urgentList.length" class="impact-category">
                <div class="impact-category-label impact-label-urgent">🟥 긴급</div>
                <div class="impact-category-list">
                    <template v-if="urgentList.length <= 3">
                        {{ urgentList.join(', ') }}
                    </template>
                    <template v-else>
                        {{ displayedUrgentList.join(', ') }}...
                    </template>
                </div>
            </div>
            <div v-if="highList.length" class="impact-category">
                <div class="impact-category-label impact-label-high">🟧 높음</div>
                <div class="impact-category-list">
                    <template v-if="highList.length <= 3">
                        {{ highList.join(', ') }}
                    </template>
                    <template v-else>
                        {{ displayedHighList.join(', ') }}...
                    </template>
                </div>
            </div>
            <div v-if="midList.length" class="impact-category">
                <div class="impact-category-label impact-label-mid">🟨 중간</div>
                <div class="impact-category-list">
                    <template v-if="midList.length <= 3">
                        {{ midList.join(', ') }}
                    </template>
                    <template v-else>
                        {{ displayedMidList.join(', ') }}...
                    </template>
                </div>
            </div>
            <div v-if="lowList.length" class="impact-category">
                <div class="impact-category-label impact-label-low">🟩 낮음</div>
                <div class="impact-category-list">
                    <template v-if="lowList.length <= 3">
                        {{ lowList.join(', ') }}
                    </template>
                    <template v-else>
                        {{ displayedLowList.join(', ') }}...
                    </template>
                </div>
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

        <!-- 나라 뉴스 모달 -->
        <transition name="modal-fade">
            <div v-if="selectedCountry" class="modal-backdrop" @click.self="closeModal">
                <div class="modal-panel">
                    <header class="modal-header">
                        <h2 class="modal-title">{{ selectedCountry.name }} 주요 뉴스</h2>
                        <button @click="closeModal" class="close-btn">X</button>
                    </header>
                    <div class="modal-body">
                        <div v-if="!selectedCountry.articles.length" class="modal-empty">
                            <div class="modal-empty-icon">📰</div>
                            <div class="modal-empty-text">현재 표시할 뉴스가 없어요</div>
                        </div>
                        <template v-else>
                            <section v-for="(news, idx) in currentPageNews" :key="idx" class="info-card news-card">
                                <div class="card-header news-header">
                                    <h3>{{ news.title }}</h3>
                                    <span class="news-level" :class="getScoreClass(news.level)">{{ news.level }}</span>
                                </div>
                                <p class="news-desc">{{ news.desc }}</p>
                                <div class="news-footer">
                                    <a :href="news.url" target="_blank" rel="noopener noreferrer" class="news-link">원본
                                        Link</a>
                                    <span class="news-date">{{ news.date }}</span>
                                </div>
                            </section>
                        </template>
                    </div>
                </div>
            </div>
        </transition>

        <!-- 영향도 요약 모달 -->
        <transition name="modal-fade">
            <div v-if="showImpactSummaryModal" class="modal-backdrop" @click.self="closeImpactSummaryModal">
                <div class="modal-panel">
                    <header class="modal-header">
                        <h2 class="modal-title">국가별 영향도 전체 목록</h2>
                        <button @click="closeImpactSummaryModal" class="close-btn">X</button>
                    </header>
                    <div class="modal-body">
                        <section v-if="urgentListData.length" class="info-card impact-section-card">
                            <div class="card-header impact-header">
                                <span class="impact-dot urgent"></span>
                                <h3>긴급</h3>
                                <span class="impact-count">{{ urgentListData.length }}개국</span>
                            </div>
                            <div class="impact-country-grid">
                                <div v-for="(country, idx) in urgentListData" :key="idx"
                                    class="impact-country-chip urgent clickable"
                                    @click="onCountryChipClick(country.code)">
                                    {{ country.name }}
                                </div>
                            </div>
                        </section>
                        <section v-if="highListData.length" class="info-card impact-section-card">
                            <div class="card-header impact-header">
                                <span class="impact-dot high"></span>
                                <h3>높음</h3>
                                <span class="impact-count">{{ highListData.length }}개국</span>
                            </div>
                            <div class="impact-country-grid">
                                <div v-for="(country, idx) in highListData" :key="idx"
                                    class="impact-country-chip high clickable"
                                    @click="onCountryChipClick(country.code)">
                                    {{ country.name }}
                                </div>
                            </div>
                        </section>
                        <section v-if="midListData.length" class="info-card impact-section-card">
                            <div class="card-header impact-header">
                                <span class="impact-dot mid"></span>
                                <h3>중간</h3>
                                <span class="impact-count">{{ midListData.length }}개국</span>
                            </div>
                            <div class="impact-country-grid">
                                <div v-for="(country, idx) in midListData" :key="idx"
                                    class="impact-country-chip mid clickable" @click="onCountryChipClick(country.code)">
                                    {{ country.name }}
                                </div>
                            </div>
                        </section>
                        <section v-if="lowListData.length" class="info-card impact-section-card">
                            <div class="card-header impact-header">
                                <span class="impact-dot low"></span>
                                <h3>낮음</h3>
                                <span class="impact-count">{{ lowListData.length }}개국</span>
                            </div>
                            <div class="impact-country-grid">
                                <div v-for="(country, idx) in lowListData" :key="idx"
                                    class="impact-country-chip low clickable" @click="onCountryChipClick(country.code)">
                                    {{ country.name }}
                                </div>
                            </div>
                        </section>
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

// 나라별로 최대 절대값 region_score를 가진 데이터만 남기기
const aggregatedMapImpactData = computed(() => {
    const countryMap = new Map<string, MapImpact>();

    mapImpactData.value.forEach((item) => {
        if (!item.code || typeof item.code !== 'string') return;

        const code = item.code.toUpperCase();
        const existing = countryMap.get(code);

        if (!existing) {
            countryMap.set(code, item);
        } else {
            if (Math.abs(item.region_score) > Math.abs(existing.region_score)) {
                countryMap.set(code, item);
            }
        }
    });

    return Array.from(countryMap.values());
});

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

const globalInventorySignal = computed(() => {
    if (globalStockDiffPct.value == null || globalDaysDiff.value == null) return '공급: N/A';
    const s = globalStockDiffPct.value;
    const d = globalDaysDiff.value;
    if (s <= -3 && d <= -1) return '공급 부족';
    if (s >= 3 && d >= 1) return '공급 여유';
    return '공급 보합';
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

// 국가 목록 (name과 code 포함) - 절대값 기준으로 분류 (나라별 최대값 기준)
const urgentListData = computed(() => aggregatedMapImpactData.value.filter((i) => Math.abs(i.region_score) >= 0.7).map((i) => ({ name: i.name, code: i.code })));
const highListData = computed(() => aggregatedMapImpactData.value.filter((i) => Math.abs(i.region_score) >= 0.5 && Math.abs(i.region_score) < 0.7).map((i) => ({ name: i.name, code: i.code })));
const midListData = computed(() => aggregatedMapImpactData.value.filter((i) => Math.abs(i.region_score) >= 0.3 && Math.abs(i.region_score) < 0.5).map((i) => ({ name: i.name, code: i.code })));
const lowListData = computed(() => aggregatedMapImpactData.value.filter((i) => Math.abs(i.region_score) < 0.3).map((i) => ({ name: i.name, code: i.code })));

// 기존 호환성을 위해 이름만 추출한 리스트
const urgentList = computed(() => urgentListData.value.map((i) => i.name));
const highList = computed(() => highListData.value.map((i) => i.name));
const midList = computed(() => midListData.value.map((i) => i.name));
const lowList = computed(() => lowListData.value.map((i) => i.name));

const displayedUrgentList = computed(() => urgentList.value.slice(0, 3));
const displayedHighList = computed(() => highList.value.slice(0, 3));
const displayedMidList = computed(() => midList.value.slice(0, 3));
const displayedLowList = computed(() => lowList.value.slice(0, 3));

const showMoreIndicator = ref(false);
const showImpactSummaryModal = ref(false);

const hasMoreCountries = computed(() => {
    return urgentList.value.length > 3 ||
        highList.value.length > 3 ||
        midList.value.length > 3 ||
        lowList.value.length > 3;
});

function openImpactSummaryModal() {
    showImpactSummaryModal.value = true;
}

function closeImpactSummaryModal() {
    showImpactSummaryModal.value = false;
}

// 영향도 모달에서 국가 클릭 시 뉴스 모달 열기
async function onCountryChipClick(countryCode: string) {
    // 영향도 모달 닫기
    closeImpactSummaryModal();

    // 해당 국가 뉴스 가져오기
    try {
        const response = await dashboardAPI.getRegionImpact(countryCode);
        openModal(response.data.region, response.data.contents || []);
    } catch (error) {
        console.error(`나라 뉴스 로드 실패: ${countryCode}`, error);
    }
}

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

    // Impact View로 돌아갈 때 원래 색상으로 복원 (절대값 기준)
    const getColorByScore = (score: number) => {
        const absScore = Math.abs(score);
        // 점수가 0~1 사이의 값인 경우 (0.0 ~ 1.0)
        if (absScore <= 1) {
            if (absScore >= 0.7) return '#dc2626';  // 긴급 (빨강)
            if (absScore >= 0.5) return '#ea580c';  // 높음 (주황)
            if (absScore >= 0.3) return '#facc15';  // 중간 (노랑)
            if (absScore > 0.1) return '#22c55e';     // 낮음 (초록)
            return 'transparent';
        }
        // 점수가 1보다 큰 경우 (기존 로직)
        if (absScore >= 7) return '#dc2626';
        if (absScore >= 5) return '#ea580c';
        if (absScore >= 3) return '#facc15';
        if (absScore > 1) return '#22c55e';
        return 'transparent';
    };

    if (aggregatedMapImpactData.value.length === 0) return;

    // aggregatedMapImpactData는 이미 나라별 최대값만 포함
    const colorMatch: string[] = [];
    aggregatedMapImpactData.value.forEach((item) => {
        if (item.code && typeof item.code === 'string' && item.code.length === 3) {
            const code = item.code.toUpperCase();
            if (/^[A-Z]{3}$/.test(code)) {
                colorMatch.push(code, getColorByScore(item.region_score));
            }
        }
    });

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
        // Supply View에서도 지도는 보이도록 (fill-opacity는 항상 0.5 유지)
        map.setPaintProperty('country-fill', 'fill-opacity', 0.3);
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

        // 지도가 이미 로드된 경우 색상 적용
        if (mapInstance.value && mapInstance.value.getLayer('country-fill')) {
            restoreImpactViewColors();
        }
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
            const absScore = Math.abs(score);
            // 점수가 0~1 사이의 값인 경우 (0.0 ~ 1.0) - 절대값 기준
            if (absScore <= 1) {
                if (absScore >= 0.7) return '#dc2626';  // 긴급 (빨강)
                if (absScore >= 0.5) return '#ea580c';  // 높음 (주황)
                if (absScore >= 0.3) return '#facc15';  // 중간 (노랑)
                if (absScore > 0.1) return '#22c55e';     // 낮음 (초록)
                return 'transparent';
            }
            // 점수가 1보다 큰 경우 (기존 로직)
            if (absScore >= 7) return '#dc2626';
            if (absScore >= 5) return '#ea580c';
            if (absScore >= 3) return '#facc15';
            if (absScore > 1) return '#22c55e';
            return 'transparent';
        };

        // aggregatedMapImpactData는 이미 나라별 최대값만 포함
        const colorMatch: string[] = [];
        aggregatedMapImpactData.value.forEach((item) => {
            if (item.code && typeof item.code === 'string' && item.code.length === 3) {
                const code = item.code.toUpperCase();
                if (/^[A-Z]{3}$/.test(code)) {
                    colorMatch.push(code, getColorByScore(item.region_score));
                }
            }
        });

        map.addSource('world-borders', { type: 'geojson', data: geoData, generateId: true });

        map.addLayer({
            id: 'country-fill',
            type: 'fill',
            source: 'world-borders',
            paint: {
                'fill-color': ['match', ['get', 'ISO3166-1-Alpha-3'], ...colorMatch, 'transparent'],
                'fill-opacity': 0.5,
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
            const signalClass = props.signal === 'Tight' ? 'popup-signal-tight' : props.signal === 'Loose' ? 'popup-signal-loose' : 'popup-signal-neutral';
            const signalText = props.signal === 'Tight' ? '공급 부족' : props.signal === 'Loose' ? '공급 여유' : props.signal === 'Neutral' ? '공급 보합' : props.signal;
            popup.setLngLat(e.lngLat).setHTML(`
        <div class="map-popup">
            <div class="popup-title">${props.name}</div>
            <div class="popup-row">재고: ${Number(props.stocksMbbl).toLocaleString()} Mbbl</div>
            <div class="popup-row">5년 대비: ${diffSign}${Number(props.stocksDiffPct).toFixed(1)}%</div>
            <div class="popup-row">재고일수: ${Number(props.daysOfSupply).toFixed(1)}일 (${daysSign}${Number(props.daysDiff).toFixed(1)})</div>
            <div class="popup-signal ${signalClass}">${signalText}</div>
        </div>
    `).addTo(map);
        });

        // Supply Monitor Hover
        map.on('mouseenter', SHIPPING_POINT_LAYER_ID, (e) => {
            map.getCanvas().style.cursor = 'pointer';
            const props = e.features?.[0]?.properties;
            if (!props) return;
            const yoySign = props.yoyChangePct >= 0 ? '+' : '';
            const signalClass = props.signal === '공급 증가' ? 'popup-signal-loose' : props.signal === '공급 감소' ? 'popup-signal-tight' : 'popup-signal-neutral';
            popup.setLngLat(e.lngLat).setHTML(`
        <div class="map-popup">
            <div class="popup-title">${props.country}</div>
            <div class="popup-row">생산량: ${props.prodMbd} Mb/d</div>
            <div class="popup-row">YoY: ${yoySign}${props.yoyChangePct}%</div>
            <div class="popup-signal ${signalClass}">${props.signal}</div>
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
                        const signalClass = change > 0 ? 'popup-signal-loose' : change < 0 ? 'popup-signal-tight' : 'popup-signal-neutral';
                        popup.setLngLat(e.lngLat).setHTML(`
        <div class="map-popup">
            <div class="popup-title">US Crude Stocks</div>
            <div class="popup-row">주간 변동: ${sign}${change.toFixed(1)} Mbbl</div>
            <div class="popup-signal ${signalClass}">${signal}</div>
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
                openModal(response.data.region, response.data.contents || []);
            } catch (error) {
                console.error(`나라 뉴스 로드 실패: ${isoCode}`, error);
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
    if (!contents || !Array.isArray(contents)) {
        contents = [];
    }

    const articles = contents
        .sort((a, b) => (b.source_score || 0) - (a.source_score || 0))
        .map((a) => ({
            title: a.title || '제목 없음',
            desc: a.summary || '요약 없음',
            url: a.url || '#',
            date: a.published_date || '',
            level: a.source_score || 0,
        }));

    selectedCountry.value = {
        name: region.name,
        code: region.code,
        region_score: region.region_score,
        articles: articles,
    };
}

function closeModal() {
    selectedCountry.value = null;
}

// 영향도 점수에 따른 색상 클래스 반환
function getScoreClass(level: number): string {
    const absScore = Math.abs(level);
    if (absScore >= 0.7) return 'score-urgent';
    if (absScore >= 0.5) return 'score-high';
    if (absScore >= 0.3) return 'score-mid';
    return 'score-low';
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

.impact-summary-box {
    cursor: pointer;
    transition: all 0.2s;
}

.impact-summary-box:hover {
    background: rgba(255, 255, 255, 0.85);
}

.more-indicator {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 12px;
    font-weight: 600;
    color: #ea580c;
    background: rgba(234, 88, 12, 0.1);
    padding: 4px 8px;
    border-radius: 4px;
    pointer-events: none;
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

/* 공통 모달 스타일 (Countermeasure와 동일) */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
    overflow-y: auto;
}

.modal-panel {
    width: 100%;
    max-width: 800px;
    max-height: calc(100vh - 48px);
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: auto;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 28px;
    background: #ffffff;
    position: relative;
    border-bottom: 2px solid #e2e8f0;
}

.modal-title {
    font-size: 22px;
    font-weight: 700;
    color: #000000;
    margin: 0;
    letter-spacing: -0.3px;
    text-align: center;
    line-height: 1.3;
}

.close-btn {
    position: absolute;
    top: 50%;
    right: 24px;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.05);
    border: none;
    color: #000000;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.close-btn:hover {
    background: rgba(0, 0, 0, 0.1);
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.modal-body::-webkit-scrollbar {
    width: 5px;
}

.modal-body::-webkit-scrollbar-track {
    background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.info-card {
    background: #f8fafc;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e2e8f0;
}

.card-header {
    margin-bottom: 12px;
}

.card-header h3 {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    letter-spacing: -0.2px;
}

.info-card p {
    font-size: 14px;
    color: #475569;
    line-height: 1.7;
    margin: 0;
}

/* 영향도 모달 섹션 카드 */
.impact-section-card {
    background: #f8fafc;
}

.impact-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
}

.impact-header h3 {
    flex: 1;
}

.impact-count {
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    background: #e2e8f0;
    padding: 4px 10px;
    border-radius: 20px;
}

.impact-dot {
    width: 12px;
    height: 12px;
    border-radius: 4px;
    flex-shrink: 0;
}

.impact-dot.urgent {
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
}

.impact-dot.high {
    background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
}

.impact-dot.mid {
    background: linear-gradient(135deg, #eab308 0%, #facc15 100%);
}

.impact-dot.low {
    background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
}

.impact-country-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
}

.impact-country-chip {
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}

.impact-country-chip.clickable {
    cursor: pointer;
}

.impact-country-chip.urgent {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    color: #000000;
}

.impact-country-chip.urgent:hover {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
}

.impact-country-chip.high {
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
    color: #000000;
}

.impact-country-chip.high:hover {
    background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(234, 88, 12, 0.15);
}

.impact-country-chip.mid {
    background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
    color: #000000;
}

.impact-country-chip.mid:hover {
    background: linear-gradient(135deg, #fef9c3 0%, #fde68a 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(234, 179, 8, 0.15);
}

.impact-country-chip.low {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    color: #000000;
}

.impact-country-chip.low:hover {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.15);
}

/* US Stocks & Supply Producer List */
.us-stocks-empty {
    font-size: 14px;
    color: #6b7280;
    text-align: center;
    padding: 16px 0;
}

/* Data Loading (Small boxes) */
.data-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 0;
    gap: 12px;
}

.data-loading-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #e5e7eb;
    border-top-color: #ea580c;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.data-loading span {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
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

/* 모달 빈 상태 */
.modal-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
}

.modal-empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.modal-empty-text {
    font-weight: 500;
    font-size: 16px;
    color: #6b7280;
    text-align: center;
}

/* 뉴스 카드 스타일 */
.news-card {
    background: #f8fafc;
}

.news-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
}

.news-header h3 {
    flex: 1;
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.5;
}

.news-level {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
}

.news-level.score-urgent {
    background: #fef2f2;
    color: #dc2626;
}

.news-level.score-high {
    background: #fff7ed;
    color: #ea580c;
}

.news-level.score-mid {
    background: #fefce8;
    color: #ca8a04;
}

.news-level.score-low {
    background: #f0fdf4;
    color: #16a34a;
}

.news-desc {
    font-size: 14px;
    color: #475569;
    line-height: 1.7;
    margin: 0;
}

.news-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    margin-top: 12px;
    border-top: 1px solid #e2e8f0;
}

.news-link {
    font-size: 14px;
    color: #ea580c;
    text-decoration: none;
    font-weight: 500;
}

.news-link:hover {
    text-decoration: underline;
}

.news-date {
    font-size: 13px;
    color: #6b7280;
}

/* Modal Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.25s ease;
}

.modal-fade-enter-active .modal-panel,
.modal-fade-leave-active .modal-panel {
    transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-from .modal-panel,
.modal-fade-leave-to .modal-panel {
    transform: scale(0.95) translateY(10px);
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

/* Map Popup 스타일 */
:deep(.map-popup) {
    padding: 12px 16px;
    font-size: 13px;
    background: #fff;
    color: #111;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 140px;
}

:deep(.popup-title) {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 8px;
    color: #111;
}

:deep(.popup-row) {
    color: #555;
    margin-bottom: 4px;
}

:deep(.popup-signal) {
    font-weight: 500;
}

:deep(.popup-signal-tight) {
    color: #dc2626;
}

:deep(.popup-signal-loose) {
    color: #16a34a;
}

:deep(.popup-signal-neutral) {
    color: #6b7280;
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
