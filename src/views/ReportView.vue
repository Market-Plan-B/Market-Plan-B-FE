<template>
    <div class="space-y-8">

        <!-- 📌 모드 선택 + 날짜 선택 -->
        <section class="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <div class="mb-6">
                <h2 class="font-bold text-2xl mb-2 text-gray-900">글로벌 원유 시장 리포트</h2>
                <p class="text-sm text-gray-600">AI가 생성한 데일리/위클리 리포트를 확인하세요.</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-6 justify-between items-center">
                <div class="inline-flex rounded-2xl bg-gray-100 p-1.5 shadow-inner">
                    <button @click="switchMode('daily')"
                        class="relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
                        :class="mode === 'daily' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'">
                        Daily
                    </button>
                    <button @click="switchMode('weekly')"
                        class="relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
                        :class="mode === 'weekly' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-600 hover:text-gray-900'">
                        Weekly
                    </button>
                </div>

                <input type="date" v-model="selectedDate"
                    class="px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 bg-white hover:border-blue-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium shadow-sm" />
            </div>
        </section>

        <!-- 📌 데일리 뉴스 카드 (Daily 모드에서만) -->
        <section v-if="mode === 'daily'" class="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Daily News</h2>
            <!-- <Transition name="cards" mode="out-in">
                <ReportCards :key="mode + selectedDate" :cards="cards" />
            </Transition> -->
            <div class="relative">
                <!-- 카드 캐러셀 -->
                <div class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                    <div v-for="(img, idx) in dummyImages" :key="idx"
                        class="flex-shrink-0 w-64 snap-center cursor-pointer transition-transform hover:scale-[1.02]"
                        @click="openImage(idx)">
                        <img :src="img" class="w-full h-80 object-cover rounded-2xl shadow-lg border border-gray-200" />
                    </div>
                </div>

                <!-- 인디케이터 -->
                <div class="flex justify-center mt-4 gap-2">
                    <span v-for="(img, idx) in dummyImages" :key="idx" class="w-2 h-2 rounded-full transition-all"
                        :class="currentIndex === idx ? 'bg-blue-500 w-6' : 'bg-gray-300'">
                    </span>
                </div>
            </div>
        </section>

        <!-- 📌 상세 리포트 -->
        <section class="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div class="mb-8">
                <h2 class="text-xl font-bold text-gray-900">
                    {{ mode === 'daily' ? 'Daily Report' : 'Weekly Report' }}
                </h2>
                <p class="text-sm text-slate-600">{{ selectedDate }}</p>
            </div>

            <div v-if="reportHtml" class="prose max-w-none" v-html="reportHtml"></div>
            <div v-else class="text-slate-400 text-center py-10">리포트가 없습니다.</div>
        </section>
    </div>

    <!-- 이미지 모달 -->
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                @click="isModalOpen = false">
                <img :src="dummyImages[currentIndex]" class="rounded-2xl shadow-2xl"
                    style="max-width: 400px; max-height: 500px; width: auto; height: auto;" @click.stop />
                <button @click.stop="prevImage"
                    class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white">◀</button>
                <button @click.stop="nextImage"
                    class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white">▶</button>
            </div>
        </Transition>
    </Teleport>

    <ChatBotFloating />
</template>

<script setup>
import { ref, watch } from "vue";
import { reportsAPI } from "@/api/reports";
import ChatBotFloating from "@/components/ui/ChatBotFloating.vue";
import ReportCards from "@/components/ReportCards.vue";

import CardNews1 from "@/data/images/CardNews_sample1.jpg";
import CardNews2 from "@/data/images/CardNews_sample2.jpg";

const dummyImages = [CardNews1, CardNews2];
const currentIndex = ref(0);
const isModalOpen = ref(false);

const openImage = (idx) => { currentIndex.value = idx; isModalOpen.value = true; };
const nextImage = () => { currentIndex.value = (currentIndex.value + 1) % dummyImages.length; };
const prevImage = () => { currentIndex.value = (currentIndex.value - 1 + dummyImages.length) % dummyImages.length; };

const mode = ref("daily");
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const cards = ref([]);
const reportHtml = ref("");

async function loadDaily() {
    const cardRes = await reportsAPI.getDailyCardnews(selectedDate.value);
    const reportRes = await reportsAPI.getDailyReport(selectedDate.value);
    cards.value = cardRes.news.map(n => ({ date: n.date, title: n.title, desc: n.summary, url: n.url }));
    reportHtml.value = reportRes.html_resource ?? "";
}

function getWeekRange(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() + 4 - day);
    const start = new Date(date); start.setDate(start.getDate() - 3);
    const end = new Date(date); end.setDate(end.getDate() + 3);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

async function loadWeekly() {
    const { start, end } = getWeekRange(selectedDate.value);
    const reportRes = await reportsAPI.getWeeklyReport(start, end);
    reportHtml.value = reportRes.html_resource ?? "";
}

function switchMode(m) { mode.value = m; }

watch([mode, selectedDate], () => {
    mode.value === "daily" ? loadDaily() : loadWeekly();
}, { immediate: true });
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>