<template>
    <div class="space-y-8">

        <!-- 📌 모드 선택 + 날짜 선택 -->
        <section class="bg-white p-8 rounded-lg shadow-lg border border-gray-200 mb-6">
            <div class="mb-6">
                <h2 class="font-bold text-2xl mb-2 text-gray-900">글로벌 원유 시장 리포트</h2>
            </div>

            <div class="flex flex-col sm:flex-row gap-6 justify-between items-center">
                <div class="inline-flex rounded-md bg-gray-100 p-1.5 shadow-inner">
                    <button @click="switchMode('daily')"
                        class="relative px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-300"
                        :class="mode === 'daily' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'">
                        Daily
                    </button>
                    <button @click="switchMode('weekly')"
                        class="relative px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-300"
                        :class="mode === 'weekly' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-600 hover:text-gray-900'">
                        Weekly
                    </button>
                </div>

                <input type="date" v-model="selectedDate"
                    class="px-4 py-3 border-2 border-gray-200 rounded-md text-gray-700 bg-white hover:border-blue-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium shadow-sm" />
            </div>
        </section>

        <!-- 📌 데일리 뉴스 카드 (Daily 모드에서만) -->
        <section v-if="mode === 'daily'" class="bg-white rounded-lg p-8 shadow-lg border border-gray-200 mb-6">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Daily News</h2>
            <div class="relative">
                <!-- 카드 캐러셀 -->
                <div class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                    <div v-for="(img, idx) in dummyImages" :key="idx"
                        class="flex-shrink-0 w-64 snap-center cursor-pointer transition-transform hover:scale-[1.02]"
                        @click="openImage(idx)">
                        <img :src="img" class="w-full h-80 object-cover rounded-md shadow-lg border border-gray-200" />
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
        <section class="bg-white rounded-lg p-8 shadow-lg border border-gray-200">
            <div class="mb-8">
                <h2 class="text-xl font-bold text-gray-900 mb-1">
                    {{ mode === 'daily' ? 'Daily Report' : 'Weekly Report' }}
                </h2>
                <p v-if="mode === 'daily'" class="text-sm text-slate-600">{{ selectedDate }}</p>
                <p v-else class="text-sm text-slate-600">
                    {{ weekRange.start }} ~ {{ weekRange.end }}
                </p>
            </div>

            <div v-if="reportHtml" class="report-content" v-html="reportHtml"></div>
            <div v-else class="text-slate-400 text-center py-10">리포트가 없습니다.</div>
        </section>
    </div>

    <!-- 이미지 모달 -->
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                @click="isModalOpen = false">
                <img :src="dummyImages[currentIndex]" class="rounded-md shadow-2xl"
                    style="max-width: 600px; max-height: 700px; width: auto; height: auto;" @click.stop />
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

// public/images 폴더에서 이미지 가져오기 (lottie와 동일한 방식)
const dummyImages = [
    "/images/CardNews_Sample01.png",
    "/images/CardNews_Sample02.png",
    "/images/CardNews_Sample03.png"
];
const currentIndex = ref(0);
const isModalOpen = ref(false);

const openImage = (idx) => { currentIndex.value = idx; isModalOpen.value = true; };
const nextImage = () => { currentIndex.value = (currentIndex.value + 1) % dummyImages.length; };
const prevImage = () => { currentIndex.value = (currentIndex.value - 1 + dummyImages.length) % dummyImages.length; };

const mode = ref("daily");
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const reportHtml = ref("");

async function loadDaily() {
    const reportRes = await reportsAPI.getDailyReport(selectedDate.value);
    reportHtml.value = reportRes.html_resource ?? "";
}

function getWeekRange(dateStr) {
    // 선택한 날짜를 기준으로 해당 주의 월요일~일요일 계산
    // 날짜 문자열을 파싱 (YYYY-MM-DD 형식)
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // 월은 0부터 시작하므로 -1

    const dayOfWeek = date.getDay(); // 0(일요일) ~ 6(토요일)

    // 월요일을 주의 시작으로 설정
    // 일요일(0)인 경우 -6일, 월요일(1)인 경우 0일, 화요일(2)인 경우 -1일, ...
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(date);
    monday.setDate(date.getDate() + daysToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // YYYY-MM-DD 형식으로 변환
    const formatDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    return {
        start: formatDate(monday),
        end: formatDate(sunday)
    };
}

const weekRange = ref({ start: '', end: '' });

async function loadWeekly() {
    try {
        // 선택한 날짜로 직접 조회 (백엔드가 해당 날짜가 포함된 위클리 리포트를 찾아줌)
        const reportRes = await reportsAPI.getWeeklyReport(selectedDate.value);

        if (reportRes && reportRes.html_resource) {
            reportHtml.value = reportRes.html_resource;
            // 실제 반환된 날짜 범위로 업데이트
            if (reportRes.start_date && reportRes.end_date) {
                weekRange.value = {
                    start: reportRes.start_date,
                    end: reportRes.end_date
                };
            }
        } else {
            reportHtml.value = "";
        }
    } catch (error) {
        console.error('위클리 리포트 로드 실패:', error);
        reportHtml.value = "";
    }
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

/* HTML 보고서 스타일링 */
.report-content {
    max-width: none;
    line-height: 1.6;
    color: #374151;
}

/* 제목 스타일 */
.report-content :deep(h1) {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #dbeafe;
}

.report-content :deep(h2) {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
    margin-top: 2rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.report-content :deep(h3) {
    font-size: 1.25rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.75rem;
    margin-top: 1.5rem;
}

/* 문단 스타일 */
.report-content :deep(p) {
    color: #374151;
    line-height: 1.75;
    margin-bottom: 1rem;
    font-size: 1rem;
}

/* 리스트 스타일 */
.report-content :deep(ul) {
    list-style-type: disc;
    list-style-position: inside;
    margin-bottom: 1rem;
    padding-left: 1rem;
}

.report-content :deep(ol) {
    list-style-type: decimal;
    list-style-position: inside;
    margin-bottom: 1rem;
    padding-left: 1rem;
}

.report-content :deep(li) {
    color: #374151;
    line-height: 1.75;
    margin-bottom: 0.5rem;
}

/* 테이블 스타일 */
.report-content :deep(table) {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #d1d5db;
    margin-bottom: 1.5rem;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.report-content :deep(th) {
    background-color: #eff6ff;
    border: 1px solid #d1d5db;
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    color: #1f2937;
}

.report-content :deep(td) {
    border: 1px solid #d1d5db;
    padding: 0.75rem 1rem;
    color: #374151;
}

.report-content :deep(tr:nth-child(even)) {
    background-color: #f9fafb;
}

/* 강조 텍스트 */
.report-content :deep(strong) {
    font-weight: 600;
    color: #111827;
}

.report-content :deep(em) {
    font-style: italic;
    color: #2563eb;
}

/* 인용문 */
.report-content :deep(blockquote) {
    border-left: 4px solid #60a5fa;
    padding-left: 1rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    background-color: #eff6ff;
    border-radius: 0 0.5rem 0.5rem 0;
    margin-bottom: 1rem;
    font-style: italic;
    color: #374151;
}

/* 코드 블록 */
.report-content :deep(pre) {
    background-color: #f3f4f6;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
}

.report-content :deep(code) {
    background-color: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-family: 'Courier New', monospace;
    color: #1f2937;
}

/* 링크 */
.report-content :deep(a) {
    color: #2563eb;
    text-decoration: underline;
    transition: color 0.2s;
}

.report-content :deep(a:hover) {
    color: #1d4ed8;
}

/* 이미지 */
.report-content :deep(img) {
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
    max-width: 100%;
    height: auto;
}
</style>