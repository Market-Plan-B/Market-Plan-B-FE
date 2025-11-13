<template>
    <div id="map-wrapper"
        class="relative w-full h-[520px] rounded-2xl border border-slate-200 bg-gray-100 shadow-sm overflow-visible">
        <!-- 🗺️ 지도 -->
        <div ref="mapContainer" id="map" class="absolute inset-0 w-full h-full z-0"></div>

        <!-- 📰 중앙 고정 뉴스 모달 -->
        <transition name="fade-zoom">
            <div v-if="selectedCountry">
                <!-- 🧱 기존 모달 카드 (스타일 그대로 유지) -->
                <div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
             bg-white rounded-3xl shadow-2xl border border-gray-200
             w-[420px] h-[500px] p-6 flex flex-col justify-between items-center
             backdrop-blur-md z-50">
                    <!-- ✖ 닫기 버튼 -->
                    <button @click="closeModal"
                        class="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-lg font-bold transition">
                        ✕
                    </button>

                    <h2 class="font-extrabold text-2xl mb-3 text-gray-900 text-center">
                        {{ selectedCountry.name }} 주요 뉴스
                    </h2>

                    <div class="p-5 relative flex items-center justify-center overflow-visible h-[360px]">
                        <transition-group name="slide-x" tag="div"
                            class="w-full h-full flex justify-center items-center">
                            <div v-for="(news, i) in [selectedCountry.articles[currentIndex]]" :key="i"
                                class="w-full h-[460px] bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-inner overflow-y-auto">
                                <div class="flex justify-between items-center mb-2">
                                    <h3 class="text-[16px] font-semibold text-gray-900 text-left">{{ news.title }}</h3>
                                    <span
                                        class="text-xs px-2 py-0.5 rounded-full border font-semibold inline-flex items-center justify-center"
                                        :style="{
                                            borderColor: news.level === '긴급'
                                                ? '#ff3b3b'
                                                : news.level === '높음'
                                                    ? '#ff9f1c'
                                                    : news.level === '중간'
                                                        ? '#ffd43b'
                                                        : '#d1d5db',
                                            color: news.level === '긴급'
                                                ? '#ff3b3b'
                                                : news.level === '높음'
                                                    ? '#ff9f1c'
                                                    : news.level === '중간'
                                                        ? '#ffd43b'
                                                        : '#111827',
                                            whiteSpace: 'nowrap',
                                            writingMode: 'horizontal-tb',
                                            textOrientation: 'mixed',
                                        }">
                                        {{ news.level }}
                                    </span>
                                </div>

                                <p class="text-[13px] text-gray-700 mb-3 leading-snug text-left">
                                    {{ news.desc }}
                                </p>
                                <a :href="news.url" target="_blank" rel="noopener noreferrer"
                                    class="text-[14px] font-semibold text-orange-600 hover:underline">
                                    자세히 보기 →
                                </a>
                            </div>
                        </transition-group>

                        <!-- 슬라이드 버튼 -->
                        <button @click="prevSlide" class="absolute left-1 top-1/2 -translate-y-1/2
                 bg-white/30 hover:bg-white/60 backdrop-blur-[2px]
                 border border-white/40 rounded-full w-8 h-8 flex items-center justify-center
                 shadow-sm text-gray-700 hover:text-orange-500 transition-all duration-200">
                            ‹
                        </button>

                        <button @click="nextSlide" class="absolute right-1 top-1/2 -translate-y-1/2
                 bg-white/30 hover:bg-white/60 backdrop-blur-[2px]
                 border border-white/40 rounded-full w-8 h-8 flex items-center justify-center
                 shadow-sm text-gray-700 hover:text-orange-500 transition-all duration-200">
                            ›
                        </button>
                    </div>

                    <div class="flex justify-center gap-2 pt-4">
                        <span v-for="(n, i) in selectedCountry.articles.length" :key="i"
                            class="w-2.5 h-2.5 rounded-full transition-all duration-300"
                            :class="i === currentIndex ? 'bg-orange-500' : 'bg-gray-300'"></span>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>


<script setup lang="ts">
import "maplibre-gl/dist/maplibre-gl.css";
import { ref, onMounted, nextTick, onBeforeUnmount } from "vue";
import maplibregl from "maplibre-gl";
import newsData from "@/data/news/oil_news_sample.json";

// API Key 설정
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
if (!MAPTILER_KEY) alert("❌ MapTiler API Key 누락 (.env 확인)");

// 상태 관리
const mapContainer = ref<HTMLElement | null>(null);
const mapInstance = ref<maplibregl.Map | null>(null);
const selectedCountry = ref<any | null>(null);
const currentIndex = ref(0);

// 주요 국가 정의 (단일 구조)
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

onMounted(async () => {
    await nextTick();
    initMap();
});

async function initMap() {
    if (!mapContainer.value) return;

    const map = new maplibregl.Map({
        container: mapContainer.value,
        style: `https://api.maptiler.com/maps/pastel/style.json?key=${MAPTILER_KEY}`,
        center: [150, 30],   // ← 아시아 중심
        zoom: 1.2,             // ← 적당한 줌
        attributionControl: false,
    });

    map.on("style.load", async () => {
        console.log("✅ MapLibre 지도 로드 완료");

        // 1️⃣ GeoJSON 로드
        const geoData = await fetch(
            "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
        ).then((r) => r.json());

        // 2️⃣ 뉴스 영향도 계산
        const priority = { 긴급: 3, 높음: 2, 중간: 1 };
        const newsLevelMap = Object.keys(newsData).reduce((acc, country) => {
            const articles = newsData[country] || [];
            if (!articles.length) return acc;
            const top = articles.sort(
                (a, b) => (priority[b.level] || 0) - (priority[a.level] || 0)
            )[0];
            acc[country] = top.level;
            return acc;
        }, {});
        console.table(newsLevelMap);

        // 3️⃣ 색상 함수
        function getColorByLevel(level) {
            if (level === "긴급") return "#ff3b3b";
            if (level === "높음") return "#ff9f1c";
            if (level === "중간") return "#ffd43b";
            return "transparent";
        }

        // 4️⃣ ISO 코드 → 색상 매핑 생성
        const isoColorMatch = countries.flatMap((c) => [
            c.iso,
            getColorByLevel(newsLevelMap[c.key] || null),
        ]);

        // 5️⃣ 데이터 소스 등록
        map.addSource("world-borders", {
            type: "geojson",
            data: geoData,
            generateId: true,
        });

        // 6️⃣ Fill Layer
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
                ],
                "fill-opacity": 0.85,
            },
        });

        // 7️⃣ Outline Layer
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

        // 8️⃣ Hover layer
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

        // 9️⃣ Hover 이벤트
        let hoveredId = null;
        map.on("mousemove", "country-fill", (e) => {
            if (e.features?.length) {
                const f = e.features[0];
                if (hoveredId !== null) {
                    map.setFeatureState({ source: "world-borders", id: hoveredId }, { hover: false });
                }
                hoveredId = f.id;
                map.setFeatureState({ source: "world-borders", id: hoveredId }, { hover: true });
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

        // 🔥 10️⃣ 클릭 시 한국어 국가명 매핑 필요 없음 (countryMap 제거)
        // 단일 구조만으로 바로 targetCountry 찾기
        map.on("click", "country-fill", (e) => {
            if (!e.features?.length) return;

            const isoCode = e.features[0].properties["ISO3166-1-Alpha-3"];
            const targetCountry = countries.find((c) => c.iso === isoCode);

            if (targetCountry) {
                openModal(targetCountry);
            }
        });
    });

    mapInstance.value = map;
}


// 뉴스 모달 로직
function openModal(country) {
    const newsList = newsData[country.key];
    if (!newsList || newsList.length === 0) {
        console.warn(`⚠️ ${country.name} 뉴스 없음`);
        return;
    }

    const priority = { 긴급: 3, 높음: 2, 중간: 1 };
    const sorted = [...newsList].sort(
        (a, b) => (priority[b.level] || 0) - (priority[a.level] || 0)
    );

    selectedCountry.value = { ...country, articles: sorted };
    currentIndex.value = 0;
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

/* 🪟 모달 애니메이션 */
.fade-zoom-enter-active,
.fade-zoom-leave-active {
    transition: opacity 0.25s ease;
    /* opacity만 부드럽게 */
}

.fade-zoom-enter-from,
.fade-zoom-leave-to {
    opacity: 0;
    /* 페이드 효과만 남김 */
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
