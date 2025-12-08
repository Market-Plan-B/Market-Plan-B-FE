<template>
    <div class="map-wrapper">
        <div ref="mapContainer" class="map-container"></div>

        <!-- 모드 토글 버튼 -->
        <div class="control-panel">
            <button @click="toggleWeatherMode" class="mode-toggle-btn"
                :class="{ 'mode-toggle-btn--active': isWeatherMode }">
                {{ isWeatherMode ? 'Risk View' : 'Weather View' }}
            </button>

            <!-- 날씨 레이어 선택 (날씨 모드일 때만) -->
            <select v-if="isWeatherMode" v-model="activeWeatherLayer" @change="changeWeatherLayer"
                class="weather-select">
                <option value="wind">Wind</option>
                <option value="precipitation">Precipitation</option>
                <option value="clouds">Clouds</option>
                <option value="pressure">Pressure</option>
                <option value="temp">Temperature</option>
            </select>
        </div>

        <!-- 좌측 하단: Weather 모드일 때 날씨 범례, Risk 모드일 때 영향도 박스 -->
        <div v-if="isWeatherMode" class="weather-legend">
            <h4 class="weather-legend-title">{{ weatherLegendTitle }}</h4>
            <div class="weather-legend-colors">
                <div v-for="(color, idx) in weatherLegendColors" :key="idx" :style="{ backgroundColor: color }"
                    class="weather-legend-color-item"></div>
            </div>
            <div class="weather-legend-labels">
                <span>{{ weatherLegendMin }}</span>
                <span>{{ weatherLegendMax }}</span>
            </div>
        </div>

        <!-- 좌측 하단: 영향도 박스 (Risk 모드일 때만) -->
        <div v-else class="impact-summary-box">
            <h3 class="impact-summary-title">국가별 영향도 요약</h3>

            <div v-if="urgentList.length" class="impact-category">
                <div class="impact-category-label">🟥 긴급</div>
                <div class="impact-category-list">{{ urgentList.join(', ') }}</div>
            </div>

            <div v-if="highList.length" class="impact-category">
                <div class="impact-category-label">🟧 높음</div>
                <div class="impact-category-list">{{ highList.join(', ') }}</div>
            </div>

            <div v-if="midList.length" class="impact-category">
                <div class="impact-category-label">🟨 중간</div>
                <div class="impact-category-list">{{ midList.join(', ') }}</div>
            </div>

            <div v-if="midList.length" class="impact-category">
                <div class="impact-category-label">🟩 낮음</div>
                <div class="impact-category-list">{{ lowList.join(', ') }}</div>
            </div>
        </div>

        <!-- 우측 하단: 정보 박스 -->
        <div class="market-info-box">
            <!-- 시장 지표 -->
            <div class="market-indicators">
                <h3 class="market-indicators-title">실시간 시장 지표</h3>

                <div class="market-indicators-list">
                    <div v-for="indicator in marketIndicators" :key="indicator.name" class="market-indicator-item">
                        <!-- 명칭/심벌 -->
                        <div class="indicator-label-group">
                            <p class="indicator-name">{{ indicator.name }}</p>
                            <p class="indicator-symbol">{{ indicator.symbol }}</p>
                        </div>

                        <!-- 가격/변동률 -->
                        <div class="indicator-value-group">
                            <p class="indicator-price"
                                :class="indicator.change >= 0 ? 'indicator-price--up' : 'indicator-price--down'">
                                ${{ indicator.price }}
                            </p>
                            <p class="indicator-change"
                                :class="indicator.change >= 0 ? 'indicator-change--up' : 'indicator-change--down'">
                                {{ indicator.change >= 0 ? '▲' : '▼' }}
                                {{ Math.abs(indicator.change).toFixed(2) }}%
                            </p>
                        </div>
                    </div>
                </div>

                <div class="market-update-time">
                    <p class="update-time-text">마지막 업데이트: {{ lastUpdateTime }}</p>
                </div>
            </div>
        </div>

        <!-- 모달 -->
        <transition name="fade-zoom">
            <div v-if="selectedCountry" class="modal-overlay">
                <div class="modal-container">
                    <button @click="closeModal" class="modal-close-btn">✕</button>

                    <h2 class="modal-title">{{ selectedCountry.name }} 주요 뉴스</h2>

                    <div class="modal-content">
                        <div v-if="!selectedCountry.articles.length" class="modal-empty">
                            <div class="modal-empty-icon">📰</div>
                            <div class="modal-empty-text">해당 국가의 뉴스가 없습니다</div>
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
                                            class="news-card-link">
                                            원본 Link →
                                        </a>
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
import "maplibre-gl/dist/maplibre-gl.css";
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";
import maplibregl from "maplibre-gl";
import { dashboardAPI, MapImpact } from "@/api/dashboard";
import { getBrentOil, getWTI, getDXY, getCrackSpread } from "@/api/financial";

const MAPTILER_KEY = (import.meta as any).env.VITE_MAPTILER_KEY;
const OWM_KEY = (import.meta as any).env.VITE_OPENWEATHERMAP_KEY;

const mapImpactData = ref<MapImpact[]>([]);
const mapContainer = ref<HTMLElement | null>(null);
const mapInstance = ref<maplibregl.Map | null>(null);

const isWeatherMode = ref(false);
const activeWeatherLayer = ref('wind');

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

const weatherLayers: Record<string, { layer: string; title: string; min: string; max: string; colors: string[] }> = {
    wind: {
        layer: 'wind_new',
        title: 'Wind Speed',
        min: '0 m/s',
        max: '50+ m/s',
        colors: ['#FFFFFF', '#AED8F1', '#76C4F7', '#3BA1F7', '#FFD700', '#FF8C00', '#FF4500']
    },
    precipitation: {
        layer: 'precipitation_new',
        title: 'Precipitation',
        min: '0 mm',
        max: '50+ mm',
        colors: ['#FFFFFF', '#C8E6FA', '#87CEEB', '#6495ED', '#4169E1', '#8B008B', '#FF1493']
    },
    clouds: {
        layer: 'clouds_new',
        title: 'Cloud Cover',
        min: '0%',
        max: '100%',
        colors: ['#FFFFFF', '#E8E8E8', '#D0D0D0', '#B8B8B8', '#909090', '#707070', '#505050']
    },
    pressure: {
        layer: 'pressure_new',
        title: 'Pressure',
        min: '950 hPa',
        max: '1050 hPa',
        colors: ['#9400D3', '#4B0082', '#0000FF', '#00FF00', '#FFFF00', '#FF7F00', '#FF0000']
    },
    temp: {
        layer: 'temp_new',
        title: 'Temperature',
        min: '-40C',
        max: '40C+',
        colors: ['#9400D3', '#0000FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF7F00', '#FF0000']
    }
};

const weatherLegendTitle = computed(() => weatherLayers[activeWeatherLayer.value]?.title || '');
const weatherLegendMin = computed(() => weatherLayers[activeWeatherLayer.value]?.min || '');
const weatherLegendMax = computed(() => weatherLayers[activeWeatherLayer.value]?.max || '');
const weatherLegendColors = computed(() => weatherLayers[activeWeatherLayer.value]?.colors || []);

const currentPageNews = computed(() => {
    if (!selectedCountry.value) return [];
    return selectedCountry.value.articles;
});

const urgentList = computed(() => mapImpactData.value.filter((i: MapImpact) => i.region_score >= 8).map((i: MapImpact) => i.name));
const highList = computed(() => mapImpactData.value.filter((i: MapImpact) => i.region_score >= 6 && i.region_score < 8).map((i: MapImpact) => i.name));
const midList = computed(() => mapImpactData.value.filter((i: MapImpact) => i.region_score >= 4 && i.region_score < 6).map((i: MapImpact) => i.name));
const lowList = computed(() => mapImpactData.value.filter((i: MapImpact) => i.region_score < 4).map((i: MapImpact) => i.name));

function toggleWeatherMode() {
    isWeatherMode.value = !isWeatherMode.value;
    const map = mapInstance.value;
    if (!map) return;

    if (isWeatherMode.value) {
        map.setPaintProperty('country-fill', 'fill-opacity', 0);
        addWeatherLayer();
    } else {
        removeWeatherLayer();
        map.setPaintProperty('country-fill', 'fill-opacity', 0.85);
    }
}

function addWeatherLayer() {
    const map = mapInstance.value;
    if (!map) return;

    const layerName = weatherLayers[activeWeatherLayer.value].layer;

    if (map.getSource('weather-tiles')) {
        map.removeLayer('weather-layer');
        map.removeSource('weather-tiles');
    }

    map.addSource('weather-tiles', {
        type: 'raster',
        tiles: [`https://tile.openweathermap.org/map/${layerName}/{z}/{x}/{y}.png?appid=${OWM_KEY}`],
        tileSize: 256,
        attribution: '&copy; OpenWeatherMap'
    });

    map.addLayer({
        id: 'weather-layer',
        type: 'raster',
        source: 'weather-tiles',
        paint: { 'raster-opacity': 0.7 }
    }, 'country-outline');
}

function removeWeatherLayer() {
    const map = mapInstance.value;
    if (!map) return;

    if (map.getLayer('weather-layer')) map.removeLayer('weather-layer');
    if (map.getSource('weather-tiles')) map.removeSource('weather-tiles');
}

function changeWeatherLayer() {
    if (isWeatherMode.value) addWeatherLayer();
}

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
            getBrentOil(), getWTI(), getDXY(), getCrackSpread()
        ]);

        marketIndicators.value = [
            { name: 'Brent Crude', symbol: 'BZ=F', price: brent.price.toFixed(2), change: brent.changePercent || 0 },
            { name: 'WTI Crude', symbol: 'CL=F', price: wti.price.toFixed(2), change: wti.changePercent || 0 },
            { name: 'Brent-WTI 스프레드', symbol: 'SPREAD', price: spread.value.toFixed(2), change: 0 },
            { name: '달러인덱스', symbol: 'DXY', price: dxy.index.toFixed(2), change: dxy.change || 0 }
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
});

async function initMap() {
    if (!mapContainer.value) return;

    const map = new maplibregl.Map({
        container: mapContainer.value,
        style: `https://api.maptiler.com/maps/pastel/style.json?key=${MAPTILER_KEY}`,
        center: [140, 45],
        zoom: 1.2,
        attributionControl: false
    });

    map.on('style.load', async () => {
        const geoData = await fetch(
            'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'
        ).then(r => r.json());

        const getColorByScore = (score: number) => {
            if (score >= 8) return '#dc2626';
            if (score >= 6) return '#ea580c';
            if (score >= 4) return '#facc15';
            if (score >= 2) return '#22c55e';
            return 'transparent';
        };

        const colorMatch = mapImpactData.value.flatMap(item => [
            item.code, getColorByScore(item.region_score)
        ]);

        map.addSource('world-borders', { type: 'geojson', data: geoData, generateId: true });

        map.addLayer({
            id: 'country-fill',
            type: 'fill',
            source: 'world-borders',
            paint: {
                'fill-color': ['match', ['get', 'ISO3166-1-Alpha-3'], ...colorMatch, 'transparent'],
                'fill-opacity': 0.85
            }
        });

        map.addLayer({
            id: 'country-outline',
            type: 'line',
            source: 'world-borders',
            paint: { 'line-color': '#9ca3af', 'line-width': 1, 'line-opacity': 0.6 }
        });

        map.addLayer({
            id: 'country-highlight',
            type: 'line',
            source: 'world-borders',
            paint: {
                'line-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#0ea5e9', 'transparent'],
                'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 3, 0],
                'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.9, 0]
            }
        });

        let hoveredId: number | null = null;

        map.on('mousemove', 'country-fill', (e) => {
            if (isWeatherMode.value) return;

            if (hoveredId !== null) {
                map.setFeatureState({ source: 'world-borders', id: hoveredId }, { hover: false });
            }

            const feature = e.features?.[0];
            if (!feature) return;

            hoveredId = feature.id as number;
            map.setFeatureState({ source: 'world-borders', id: hoveredId }, { hover: true });
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'country-fill', () => {
            if (hoveredId !== null) {
                map.setFeatureState({ source: 'world-borders', id: hoveredId }, { hover: false });
            }
            hoveredId = null;
            map.getCanvas().style.cursor = '';
        });

        map.on('click', 'country-fill', async (e) => {
            if (isWeatherMode.value || !e.features?.length) return;

            const isoCode = e.features[0].properties['ISO3166-1-Alpha-3'];
            try {
                const response = await dashboardAPI.getRegionImpact(isoCode);
                openModal(response.data.region, response.data.contents);
            } catch (error) {
                console.error('Country data load failed:', error);
            }
        });
    });

    mapInstance.value = map;
}

function openModal(region: any, contents: any[]) {
    selectedCountry.value = {
        name: region.name,
        code: region.code,
        region_score: region.region_score,
        articles: contents
            .sort((a, b) => (b.source_score || 0) - (a.source_score || 0))
            .map(a => ({
                title: a.title,
                desc: a.summary,
                url: a.url,
                date: a.published_date,
                level: a.source_score
            }))
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
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: none;
    cursor: pointer;
    background: #ffffff;
    color: #000000;
}

.mode-toggle-btn:hover {
    background: #ea580c;
    color: white;
}

.mode-toggle-btn--active {
    background: #ffffff;
    color: #000000;
}

.weather-select {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}

/* Weather Legend */
.weather-legend {
    position: absolute;
    bottom: 16px;
    left: 16px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 16px;
    width: 220px;
    z-index: 20;
}

.weather-legend-title {
    font-size: 14px;
    font-weight: 500;
    color: #000000;
    margin-bottom: 8px;
}

.weather-legend-colors {
    display: flex;
    align-items: center;
    gap: 4px;
}

.weather-legend-color-item {
    width: 24px;
    height: 12px;
}

.weather-legend-color-item:first-child {
    border-radius: 3px 0 0 3px;
}

.weather-legend-color-item:last-child {
    border-radius: 0 3px 3px 0;
}

.weather-legend-labels {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #6b7280;
    margin-top: 4px;
}

/* Impact Summary Box */
.impact-summary-box {
    position: absolute;
    bottom: 16px;
    left: 16px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 16px;
    width: 220px;
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

.impact-category-list {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
    line-height: 1.5;
}

/* Market Info Box */
.market-info-box {
    position: absolute;
    bottom: 16px;
    right: 16px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 16px;
    width: 220px;
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
    font-weight: 600;
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
    font-weight: 600;
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

.modal-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
}

.pagination-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e5e7eb;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    cursor: pointer;
    font-size: 18px;
}

.pagination-btn:hover:not(:disabled) {
    background: #d1d5db;
}

.pagination-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.pagination-dots {
    display: flex;
    gap: 8px;
}

.pagination-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #d1d5db;
    transition: all 0.2s;
}

.pagination-dot--active {
    background: #f97316;
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
</style>