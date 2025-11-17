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
                        <transition-group name="slide-x" tag="div"
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
                    </div>

                    <div class="flex justify-center gap-2 pt-4">
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
import newsData from "@/data/news/oil_news_sample.json";

const newsLevelMap = ref<Record<string, string | null>>({});
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

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
    countries.filter(c => newsLevelMap.value[c.key] === "긴급").map(c => c.name)
);

const highList = computed(() =>
    countries.filter(c => newsLevelMap.value[c.key] === "높음").map(c => c.name)
);

const midList = computed(() =>
    countries.filter(c => newsLevelMap.value[c.key] === "중간").map(c => c.name)
);

onMounted(async () => {
    await nextTick();
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

        const priority = { 긴급: 3, 높음: 2, 중간: 1 };

        Object.keys(newsData).forEach(country => {
            const articles = newsData[country] || [];
            if (!articles.length) newsLevelMap.value[country] = null;
            else {
                const top = articles.sort(
                    (a, b) => (priority[b.level] || 0) - (priority[a.level] || 0)
                )[0];
                newsLevelMap.value[country] = top.level;
            }
        });

        const getColorByLevel = (level) => {
            if (level === "긴급") return "#ff3b3b";
            if (level === "높음") return "#ff9f1c";
            if (level === "중간") return "#ffd43b";
            return "transparent";
        };

        const isoColorMatch = countries.flatMap((c) => [
            c.iso,
            getColorByLevel(newsLevelMap.value[c.key] || null)
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
                    ...isoColorMatch,
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

        map.on("click", "country-fill", (e) => {
            if (!e.features?.length) return;

            const isoCode = e.features[0].properties["ISO3166-1-Alpha-3"];
            const targetCountry = countries.find((c) => c.iso === isoCode);

            if (targetCountry) openModal(targetCountry);
        });
    });

    mapInstance.value = map;
}

function openModal(country) {
    const newsList = newsData[country.key];
    if (!newsList || newsList.length === 0) return;

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
