<template>
    <div id="map-wrapper"
        class="relative w-full h-[520px] rounded-2xl border border-slate-200 bg-gray-100 shadow-sm overflow-visible">
        <div ref="mapContainer" id="map" class="absolute inset-0 w-full h-full z-0"></div>

        <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md border border-gray-200 
           rounded-xl shadow-md p-4 w-[220px] z-20">

            <h3 class="text-sm font-bold text-gray-700 mb-2">국가별 위험도 요약</h3>

            <div v-if="urgentList.length" class="mb-2">
                <div class="text-xs font-semibold mb-1">🟥 긴급</div>
                <div class="text-xs text-gray-800">{{ urgentList.join(', ') }}</div>
            </div>

            <div v-if="highList.length" class="mb-2">
                <div class="text-xs font-semibold mb-1">🟧 높음</div>
                <div class="text-xs text-gray-800">{{ highList.join(', ') }}</div>
            </div>

            <div v-if="midList.length">
                <div class="text-xs font-semibold mb-1">🟨 중간</div>
                <div class="text-xs text-gray-800">{{ midList.join(', ') }}</div>
            </div>
        </div>

        <transition name="fade-zoom">
            <div v-if="selectedCountry">
                <div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                    bg-white rounded-3xl shadow-2xl border border-gray-200
                    w-[420px] h-[500px] p-6 flex flex-col justify-between items-center
                    backdrop-blur-md z-50">
                    <button @click="closeModal" class="absolute top-3 right-4
                        text-gray-500 hover:text-gray-800 text-lg font-bold
                        transition cursor-pointer">✕</button>

                    <h2 class="font-extrabold text-2xl mb-3 text-gray-900 text-center">
                        {{ selectedCountry.name }} 주요 뉴스
                    </h2>

                    <div class="p-5 relative flex items-center justify-center overflow-visible h-[360px]">
                        <!-- 뉴스가 없을 때 -->
                        <div v-if="!selectedCountry.articles || selectedCountry.articles.length === 0"
                            class="w-full h-full flex items-center justify-center">
                            <div class="text-center">
                                <div class="text-4xl mb-4">📰</div>
                                <p class="text-gray-500 text-sm">해당 국가의 뉴스가 없습니다</p>
                            </div>
                        </div>

                        <!-- 뉴스가 있을 때 -->
                        <transition-group v-else name="slide-x" tag="div"
                            class="w-full h-full flex justify-center items-center">
                            <div v-for="(news, i) in [selectedCountry.articles[currentIndex]]" :key="i"
                                class="w-full h-[460px] bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-inner overflow-y-auto">
                                <div class="flex justify-between items-start mb-2">
                                    <h3 class="text-[16px] font-semibold text-gray-900 text-left leading-snug">
                                        {{ news.title }}
                                    </h3>

                                    <span
                                        class="text-xs px-2 py-0.5 rounded-full border font-semibold inline-flex items-center justify-center"
                                        :style="{
                                            borderColor: news.level >= 7
                                                ? '#ff3b3b'
                                                : news.level >= 4
                                                    ? '#ff9f1c'
                                                    : '#ffd43b',
                                            color: news.level >= 7
                                                ? '#ff3b3b'
                                                : news.level >= 4
                                                    ? '#ff9f1c'
                                                    : '#f59e0b',
                                            backgroundColor: news.level >= 7
                                                ? '#fef2f2'
                                                : news.level >= 4
                                                    ? '#fff7ed'
                                                    : '#fffbeb'
                                        }">
                                        {{ news.level }}
                                    </span>
                                </div>

                                <p class="text-[13px] text-gray-700 mb-3 leading-snug text-left">
                                    {{ news.desc }}
                                </p>

                                <div class="flex justify-between items-center mt-4">
                                    <a :href="news.url" target="_blank" rel="noopener noreferrer"
                                        class="text-[7px] text-orange-600 hover:underline text-left">
                                        원본 Link →
                                    </a>
                                    <p class="text-xs text-gray-500 text-right">
                                        📅 {{ news.date }}
                                    </p>
                                </div>
                            </div>

                        </transition-group>

                        <!-- 뉴스가 있을 때만 네비게이션 버튼 표시 -->
                        <template v-if="selectedCountry.articles && selectedCountry.articles.length > 1">
                            <button @click="prevSlide" class="absolute left-1 top-1/2 -translate-y-1/2
                                bg-white/30 hover:bg-white/60 backdrop-blur-[2px]
                                border border-white/40 rounded-full w-8 h-8 flex items-center justify-center
                                shadow-sm text-gray-700 hover:text-orange-500 transition-all">
                                ‹
                            </button>

                            <button @click="nextSlide" class="absolute right-1 top-1/2 -translate-y-1/2
                                bg-white/30 hover:bg-white/60 backdrop-blur-[2px]
                                border border-white/40 rounded-full w-8 h-8 flex items-center justify-center
                                shadow-sm text-gray-700 hover:text-orange-500 transition-all">
                                ›
                            </button>
                        </template>
                    </div>

                    <!-- 뉴스가 있을 때만 인디케이터 표시 -->
                    <div v-if="selectedCountry.articles && selectedCountry.articles.length > 0"
                        class="flex justify-center gap-2 pt-4">
                        <span v-for="(n, i) in selectedCountry.articles.length" :key="i"
                            class="w-2.5 h-2.5 rounded-full transition-all"
                            :class="i === currentIndex ? 'bg-orange-500' : 'bg-gray-300'"></span>
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

const newsLevelMap = ref<Record<string, string | null>>({});
const MAPTILER_KEY = (import.meta as any).env.VITE_MAPTILER_KEY;
const mapImpactData = ref<MapImpact[]>([]);

const mapContainer = ref<HTMLElement | null>(null);
const mapInstance = ref<maplibregl.Map | null>(null);
const selectedCountry = ref<any | null>(null);
const currentIndex = ref(0);

const countries = [
    { name: "미국", key: "미국", iso: "USA" },
    { name: "중국", key: "중국", iso: "CHN" },
    { name: "인도", key: "인도", iso: "IND" },
    { name: "이란", key: "이란", iso: "IRN" },
    { name: "독일", key: "독일", iso: "DEU" },
    { name: "러시아", key: "러시아", iso: "RUS" },
    { name: "사우디아라비아", key: "사우디아라비아", iso: "SAU" },
    { name: "영국", key: "영국", iso: "GBR" },
    { name: "한국", key: "한국", iso: "KOR" }
];

const urgentList = computed(() =>
    countries.filter(c => {
        const apiData = mapImpactData.value.find(item => item.code === c.iso);
        return apiData && apiData.region_score >= 8;
    }).map(c => c.name)
);

const highList = computed(() =>
    countries.filter(c => {
        const apiData = mapImpactData.value.find(item => item.code === c.iso);
        return apiData && apiData.region_score >= 6 && apiData.region_score < 8;
    }).map(c => c.name)
);

const midList = computed(() =>
    countries.filter(c => {
        const apiData = mapImpactData.value.find(item => item.code === c.iso);
        return apiData && apiData.region_score >= 4 && apiData.region_score < 6;
    }).map(c => c.name)
);

const loadMapData = async () => {
    try {
        console.log('🗺️ 지도 API 호출...');
        const response = await dashboardAPI.getMapImpact();
        mapImpactData.value = response.data;
        console.log('✅ 지도 데이터 로드 완료:', mapImpactData.value);
    } catch (error) {
        console.error('❌ 지도 데이터 로드 실패:', error);
    }
};

onMounted(async () => {
    await nextTick();
    await loadMapData();
    initMap();
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
        ).then((r) => r.json());

        // 백엔드 API 데이터만 사용

        const getColorByScore = (score: number) => {
            if (score >= 8) return "#ff3b3b"; // 긴급
            if (score >= 6) return "#ff9f1c"; // 높음
            if (score >= 4) return "#ffd43b"; // 중간
            if (score >= 2) return "#90ee90"; // 낮음
            return "transparent";
        };

        // 백엔드 API 데이터만 사용
        const isoColorMatch = countries.flatMap((c) => {
            const apiData = mapImpactData.value.find(item => item.code === c.iso);
            if (apiData) {
                return [c.iso, getColorByScore(apiData.region_score)];
            }
            return [c.iso, "transparent"];
        });

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
                    ...isoColorMatch,
                    "transparent",
                ] as any,
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

        let hoveredId: string | number | null = null;
        map.on("mousemove", "country-fill", (e) => {
            if (e.features?.length) {
                const f = e.features[0];
                if (hoveredId !== null) {
                    map.setFeatureState({ source: "world-borders", id: hoveredId }, { hover: false });
                }
                hoveredId = f.id ?? null;
                if (hoveredId !== null) {
                    map.setFeatureState({ source: "world-borders", id: hoveredId }, { hover: true });
                }
                map.getCanvas().style.cursor = "pointer";
            }
        });

        map.on("mouseleave", "country-fill", () => {
            if (hoveredId !== null) {
                map.setFeatureState({ source: "world-borders", id: hoveredId }, { hover: false });
            }
            hoveredId = null;
            map.getCanvas().style.cursor = "";
        });

        map.on("click", "country-fill", async (e) => {
            if (!e.features?.length) return;

            const isoCode = e.features[0].properties["ISO3166-1-Alpha-3"];
            const targetCountry = countries.find((c) => c.iso === isoCode);

            if (targetCountry) {
                // 국가별 영향도 및 뉴스 데이터 호출
                try {
                    const response = await dashboardAPI.getRegionImpact(isoCode);
                    const regionData = response.data;
                    console.log('✅ 국가 데이터 로드 완료:', regionData);

                    // region-impact API에서 contents 배열을 뉴스로 사용
                    const newsContents = regionData.contents || [];
                    openModal(targetCountry, { articles: newsContents });
                } catch (error) {
                    console.error('❌ 국가 데이터 로드 실패:', error);
                    openModal(targetCountry, null);
                }
            }
        });
    });

    mapInstance.value = map;
}

function openModal(country: any, newsData: any) {
    console.log('국가 클릭:', country.name);

    if (newsData && newsData.articles && newsData.articles.length > 0) {
        // source_score 기준으로 정렬 (높은 점수 순)
        const sorted = [...newsData.articles].sort(
            (a, b) => (b.source_score || 0) - (a.source_score || 0)
        );

        // API 응답 구조에 맞게 데이터 변환
        const formattedArticles = sorted.map(article => ({
            title: article.title,
            desc: article.summary,
            url: article.url,
            date: article.published_date,
            level: article.source_score // 백엔드 숫자 그대로 사용
        }));

        selectedCountry.value = { ...country, articles: formattedArticles };
        currentIndex.value = 0;
        console.log('✅ 모달 열기:', country.name, '뉴스 개수:', formattedArticles.length);
    } else {
        console.log('⚠️ 뉴스 데이터 없음:', country.name);
        selectedCountry.value = { ...country, articles: [] };
        currentIndex.value = 0;
    }
}

function closeModal() {
    selectedCountry.value = null;
}

function nextSlide() {
    if (!selectedCountry.value) return;
    const len = selectedCountry.value.articles.length;
    currentIndex.value = (currentIndex.value + 1) % len;
}

function prevSlide() {
    if (!selectedCountry.value) return;
    const len = selectedCountry.value.articles.length;
    currentIndex.value = (currentIndex.value - 1 + len) % len;
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

/* 모달 애니메이션 */
.fade-zoom-enter-active,
.fade-zoom-leave-active {
    transition: opacity 0.25s ease;
}

.fade-zoom-enter-from,
.fade-zoom-leave-to {
    opacity: 0;
}

.slide-x-enter-active,
.slide-x-leave-active {
    transition: transform 0.4s ease, opacity 0.4s ease;
}

.slide-x-enter-from {
    opacity: 0;
    transform: translateX(30%);
}

.slide-x-leave-to {
    opacity: 0;
    transform: translateX(-30%);
}
</style>