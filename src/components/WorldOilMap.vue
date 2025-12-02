<template>
    <div id="map-wrapper"
        class="relative w-full h-[520px] rounded-md border border-slate-200 bg-gray-100 shadow-sm overflow-visible">
        <div ref="mapContainer" id="map" class="absolute inset-0 w-full h-full z-0"></div>

        <!-- 좌측 하단: 영향도 박스 -->
        <div class="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md border border-gray-200 
           rounded-md shadow-md p-4 w-[220px] z-20">
            <h3 class="text-sm font-bold text-gray-700 mb-2">국가별 영향도 요약</h3>

            <div v-if="urgentList.length" class="mb-2">
                <div class="text-xs font-semibold mb-1">🟥 긴급</div>
                <div class="text-xs text-gray-800">{{ urgentList.join(', ') }}</div>
            </div>

            <div v-if="highList.length" class="mb-2">
                <div class="text-xs font-semibold mb-1">🟧 높음</div>
                <div class="text-xs text-gray-800">{{ highList.join(', ') }}</div>
            </div>

            <div v-if="midList.length" class="mb-2">
                <div class="text-xs font-semibold mb-1">🟨 중간</div>
                <div class="text-xs text-gray-800">{{ midList.join(', ') }}</div>
            </div>

            <div v-if="midList.length">
                <div class="text-xs font-semibold mb-1">🟩 낮음</div>
                <div class="text-xs text-gray-800">{{ lowList.join(', ') }}</div>
            </div>
        </div>

        <!-- 우측 하단: 정보 박스 (내용만 전환) -->
        <div class="absolute bottom-4 right-4 
                   bg-white/80 backdrop-blur-md border border-gray-200 rounded-md shadow-md 
                   p-4 w-[280px] h-[200px] z-20 flex flex-col">

            <transition name="fade" mode="out-in">
                <!-- 평소: 시장 지표 -->
                <div v-if="!hoveredCountry" key="market-info" class="flex flex-col h-full">
                    <h3 class="text-2xs font-bold text-gray-900 mb-2 tracking-tight">
                        실시간 시장 지표
                    </h3>

                    <div class="flex-1 space-y-3 overflow-hidden pt-2">

                        <div v-for="indicator in marketIndicators" :key="indicator.name"
                            class="flex items-center justify-between">

                            <!-- 명칭/심벌 -->
                            <div>
                                <p class="text-sm font-semibold text-gray-900 leading-tight">
                                    {{ indicator.name }}
                                </p>
                                <p class="text-[10px] text-gray-600 leading-tight">
                                    {{ indicator.symbol }}
                                </p>
                            </div>

                            <!-- 가격/변동률 -->
                            <div class="text-right">
                                <p class="text-base font-bold"
                                    :class="indicator.change >= 0 ? 'text-green-600' : 'text-red-600'">
                                    ${{ indicator.price }}
                                </p>
                                <p class="text-[11px] font-semibold"
                                    :class="indicator.change >= 0 ? 'text-green-600' : 'text-red-600'">
                                    {{ indicator.change >= 0 ? '▲' : '▼' }}
                                    {{ Math.abs(indicator.change).toFixed(2) }}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-2">
                        <p class="text-sm text-gray-900 mb-3 text-center">
                            마지막 업데이트: {{ lastUpdateTime }}
                        </p>
                    </div>
                </div>

                <!-- 호버 시: 국가 정보 -->
                <div v-else key="country-info" class="flex flex-col h-full">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-sm font-bold text-gray-900">{{ hoveredCountry.name }}</h3>
                        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :style="{
                            backgroundColor: getScoreBgColor(hoveredCountry.score),
                            color: getScoreTextColor(hoveredCountry.score)
                        }">
                            {{ hoveredCountry.score }}
                        </span>
                    </div>

                    <div class="flex-1 space-y-2 overflow-hidden">
                        <!-- 뉴스 있을 때 -->
                        <div v-if="hoveredCountry.hasNews" class="h-full flex flex-col space-y-1.5">
                            <div v-for="(news, idx) in hoveredCountry.recentNews" :key="idx"
                                class="flex items-start gap-1.5">
                                <span class="text-orange-600 text-[10px] mt-0.5">•</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-[10px] text-gray-700 leading-tight line-clamp-2">{{ news.title }}</p>
                                    <span class="text-[9px] text-gray-400">{{ news.timeAgo }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- 뉴스 없을 때 -->
                        <div v-else class="h-full flex items-center justify-center">
                            <div class="text-center">
                                <p class="text-xl mb-1">📰</p>
                                <p class="text-xs text-gray-500">해당 국가의 뉴스가 없습니다</p>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>

        <!-- 모달 -->
        <transition name="fade-zoom">
            <div v-if="selectedCountry">
                <div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                    bg-white rounded-lg shadow-2xl border border-gray-200
                    w-[900px] h-[650px] p-6 flex flex-col
                    backdrop-blur-md z-50">

                    <button @click="closeModal"
                        class="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold cursor-pointer">
                        ✕
                    </button>

                    <h2 class="font-extrabold text-2xl mb-4 text-gray-900 text-center">
                        {{ selectedCountry.name }} 주요 뉴스
                    </h2>

                    <div class="flex-1 overflow-hidden">
                        <div v-if="!selectedCountry.articles.length"
                            class="w-full h-full flex items-center justify-center">
                            <div class="text-center">
                                <div class="text-4xl mb-4">📰</div>
                                <div class="text-xl mb-4 text-gray-900 text-center">해당 국가의 뉴스가 없습니다</div>
                            </div>
                        </div>

                        <div v-else class="h-full flex flex-col">
                            <div class="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
                                <div v-for="(news, idx) in currentPageNews" :key="idx"
                                    class="bg-gray-50 border border-gray-200 rounded-md p-4 flex flex-col">

                                    <div class="flex justify-between items-start mb-2">
                                        <h3
                                            class="text-sm font-semibold text-gray-900 leading-tight flex-1 line-clamp-2">
                                            {{ news.title }}
                                        </h3>
                                        <span class="px-2 py-0.5 rounded-full text-xs font-semibold ml-2 flex-shrink-0
                                                     bg-orange-100 text-orange-600">
                                            {{ news.level }}
                                        </span>
                                    </div>

                                    <p class="text-xs text-gray-700 mb-3 leading-relaxed flex-1 overflow-y-auto">
                                        {{ news.desc }}
                                    </p>

                                    <div class="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <a :href="news.url" target="_blank" rel="noopener noreferrer"
                                            class="text-xs text-orange-600 hover:underline">
                                            원본 Link →
                                        </a>
                                        <p class="text-xs text-gray-500">{{ news.date }}</p>
                                    </div>
                                </div>
                            </div>

                            <div v-if="totalPages > 1" class="flex justify-center items-center gap-3 mt-4">
                                <button @click="prevPage" :disabled="currentPage === 0" class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed
                                           flex items-center justify-center transition-colors">
                                    ‹
                                </button>

                                <div class="flex gap-2">
                                    <span v-for="page in totalPages" :key="page"
                                        class="w-2.5 h-2.5 rounded-full transition-all"
                                        :class="page - 1 === currentPage ? 'bg-orange-500' : 'bg-gray-300'"></span>
                                </div>

                                <button @click="nextPage" :disabled="currentPage === totalPages - 1" class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed
                                           flex items-center justify-center transition-colors">
                                    ›
                                </button>
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
const mapImpactData = ref<MapImpact[]>([]);

interface SelectedCountry {
    name: string;
    code: string;
    region_score: number;
    articles: {
        title: string;
        desc: string;
        url: string;
        date: string;
        level: number;
    }[];
}

interface HoveredCountry {
    name: string;
    code: string;
    score: number;
    hasNews: boolean;
    recentNews: { title: string; timeAgo: string }[];
}

interface MarketIndicator {
    name: string;
    symbol: string;
    price: string;
    change: number;
}

const selectedCountry = ref<SelectedCountry | null>(null);
const hoveredCountry = ref<HoveredCountry | null>(null);
const currentPage = ref(0);

const mapContainer = ref<HTMLElement | null>(null);
const mapInstance = ref<maplibregl.Map | null>(null);

const marketIndicators = ref<MarketIndicator[]>([
    { name: 'Brent Crude', symbol: 'BZ=F', price: '0.00', change: 0 },
    { name: 'WTI Crude', symbol: 'CL=F', price: '0.00', change: 0 },
    { name: 'Brent-WTI 스프레드', symbol: 'SPREAD', price: '0.00', change: 0 },
    { name: '달러인덱스', symbol: 'DXY', price: '0.00', change: 0 },
]);

const lastUpdateTime = ref('');

const currentPageNews = computed(() => {
    if (!selectedCountry.value) return [];
    const start = currentPage.value * 3;
    return selectedCountry.value.articles.slice(start, start + 3);
});

const totalPages = computed(() => {
    if (!selectedCountry.value) return 0;
    return Math.ceil(selectedCountry.value.articles.length / 3);
});

const urgentList = computed(() =>
    mapImpactData.value.filter(item => item.region_score >= 8).map(item => item.name)
);
const highList = computed(() =>
    mapImpactData.value.filter(item => item.region_score >= 6 && item.region_score < 8).map(item => item.name)
);
const midList = computed(() =>
    mapImpactData.value.filter(item => item.region_score >= 4 && item.region_score < 6).map(item => item.name)
);
const lowList = computed(() =>
    mapImpactData.value.filter(item => item.region_score < 4).map(item => item.name)
);

function getScoreBgColor(score: number) {
    if (score >= 8) return '#fef2f2';
    if (score >= 6) return '#fff7ed';
    return '#fffbeb';
}

function getScoreTextColor(score: number) {
    if (score >= 8) return '#ff3b3b';
    if (score >= 6) return '#ff9f1c';
    return '#f59e0b';
}

const loadMapData = async () => {
    try {
        const response = await dashboardAPI.getMapImpact();
        mapImpactData.value = response.data;
    } catch (error) {
        console.error("❌ 지도 데이터 로드 실패:", error);
    }
};

async function loadMarketIndicators() {
    try {
        const [brent, wti, dxy, spread] = await Promise.all([
            getBrentOil(),
            getWTI(),
            getDXY(),
            getCrackSpread()
        ]);

        marketIndicators.value = [
            {
                name: 'Brent Crude',
                symbol: 'BZ=F',
                price: brent.price.toFixed(2),
                change: brent.changePercent || 0
            },
            {
                name: 'WTI Crude',
                symbol: 'CL=F',
                price: wti.price.toFixed(2),
                change: wti.changePercent || 0
            },
            {
                name: 'Brent-WTI 스프레드',
                symbol: 'SPREAD',
                price: spread.value.toFixed(2),
                change: 0
            },
            {
                name: '달러인덱스',
                symbol: 'DXY',
                price: dxy.index.toFixed(2),
                change: dxy.change || 0
            }
        ];

        lastUpdateTime.value = new Date().toLocaleTimeString('ko-KR');
        console.log('✅ 시장 지표 업데이트 완료:', marketIndicators.value);
    } catch (error) {
        console.error('❌ 시장 지표 로드 실패:', error);
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
        attributionControl: false,
    });

    map.on("style.load", async () => {
        const geoData = await fetch(
            "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
        ).then(r => r.json());

        const getColorByScore = (score: number) => {
            if (score >= 8) return "#ff3b3b";
            if (score >= 6) return "#ff9f1c";
            if (score >= 4) return "#ffd43b";
            if (score >= 2) return "#90ee90";
            return "transparent";
        };

        const colorMatch = mapImpactData.value.flatMap(item => [
            item.code,
            getColorByScore(item.region_score),
        ]);

        map.addSource("world-borders", {
            type: "geojson",
            data: geoData,
            generateId: true,
        });

        map.addLayer({
            id: "country-fill",
            type: "fill",
            source: "world-borders",
            paint: {
                "fill-color": [
                    "match",
                    ["get", "ISO3166-1-Alpha-3"],
                    ...colorMatch,
                    "transparent",
                ],
                "fill-opacity": 0.85,
            },
        });

        map.addLayer({
            id: "country-outline",
            type: "line",
            source: "world-borders",
            paint: {
                "line-color": "#9ca3af",
                "line-width": 1,
                "line-opacity": 0.6,
            },
        });

        map.addLayer({
            id: "country-highlight",
            type: "line",
            source: "world-borders",
            paint: {
                "line-color": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    "#38bdf8",
                    "transparent",
                ],
                "line-width": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    3.5,
                    0,
                ],
                "line-opacity": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    0.9,
                    0,
                ],
            },
        });

        let hoveredId: number | null = null;

        map.on("mousemove", "country-fill", async (e) => {
            if (hoveredId !== null) {
                map.setFeatureState({ source: "world-borders", id: hoveredId }, { hover: false });
            }

            const feature = e.features?.[0];
            if (!feature) return;

            hoveredId = feature.id;
            map.setFeatureState({ source: "world-borders", id: hoveredId }, { hover: true });
            map.getCanvas().style.cursor = "pointer";

            const isoCode = feature.properties["ISO3166-1-Alpha-3"];
            const countryData = mapImpactData.value.find(item => item.code === isoCode);

            if (countryData) {
                try {
                    const response = await dashboardAPI.getRegionImpact(isoCode);
                    const regionData = response.data;

                    const hasNews = regionData.contents && regionData.contents.length > 0;
                    const recentNews = hasNews
                        ? regionData.contents.slice(0, 3).map((article: any) => ({
                            title: article.title,
                            timeAgo: getTimeAgo(article.published_date)
                        }))
                        : [];

                    hoveredCountry.value = {
                        name: countryData.name,
                        code: countryData.code,
                        score: countryData.region_score,
                        hasNews,
                        recentNews
                    };
                } catch (error) {
                    console.error("국가 정보 로드 실패:", error);
                }
            }
        });

        map.on("mouseleave", "country-fill", () => {
            if (hoveredId !== null) {
                map.setFeatureState({ source: "world-borders", id: hoveredId }, { hover: false });
            }
            hoveredId = null;
            hoveredCountry.value = null;
            map.getCanvas().style.cursor = "";
        });

        map.on("click", "country-fill", async (e) => {
            if (!e.features?.length) return;

            const isoCode = e.features[0].properties["ISO3166-1-Alpha-3"];

            try {
                const response = await dashboardAPI.getRegionImpact(isoCode);
                const regionData = response.data;

                openModalFromRegion(regionData.region, { articles: regionData.contents });
            } catch (error) {
                console.error("❌ 국가 데이터 로드 실패:", error);
            }
        });
    });

    mapInstance.value = map;
}

function getTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
}

function openModalFromRegion(
    region: { name: string; code: string; region_score: number },
    newsData: { articles?: any[] } | null
) {
    let articles: SelectedCountry["articles"] = [];

    if (newsData && newsData.articles && Array.isArray(newsData.articles) && newsData.articles.length > 0) {
        articles = [...newsData.articles]
            .sort((a, b) => (b.source_score || 0) - (a.source_score || 0))
            .map(article => ({
                title: article.title,
                desc: article.summary,
                url: article.url,
                date: article.published_date,
                level: article.source_score,
            }));
    }

    selectedCountry.value = {
        name: region.name,
        code: region.code,
        region_score: region.region_score,
        articles,
    };

    currentPage.value = 0;
}

function closeModal() {
    selectedCountry.value = null;
    currentPage.value = 0;
}

function nextPage() {
    if (currentPage.value < totalPages.value - 1) {
        currentPage.value++;
    }
}

function prevPage() {
    if (currentPage.value > 0) {
        currentPage.value--;
    }
}

onBeforeUnmount(() => {
    mapInstance.value?.remove();
});
</script>

<style>
#map-wrapper {
    position: relative;
    width: 100%;
    height: 520px;
    background-color: #e5ebf2;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-zoom-enter-active,
.fade-zoom-leave-active {
    transition: opacity 0.25s ease;
}

.fade-zoom-enter-from,
.fade-zoom-leave-to {
    opacity: 0;
}
</style>