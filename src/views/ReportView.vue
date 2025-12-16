<template>
    <div class="space-y-8">

        <!-- 📌 통합 리포트 섹션 -->
        <section class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <!-- 헤더 영역 -->
            <div class="report-header">
                <div class="header-content">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="report-title">시장 인텔리전스 리포트</h2>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 탭바 -->
            <div class="content-tab-header">
                <div class="flex justify-between items-center">
                    <div class="tab-container">
                        <div class="tab-wrapper">
                            <button @click="switchMode('daily')" class="tab-button"
                                :class="{ 'active': mode === 'daily' }">
                                Daily
                            </button>
                            <button @click="switchMode('weekly')" class="tab-button"
                                :class="{ 'active': mode === 'weekly' }">
                                Weekly
                            </button>
                            <div class="tab-underline" :class="{ 'weekly-active': mode === 'weekly' }"></div>
                            <div class="tab-underline" :class="{ 'weekly-active': mode === 'weekly' }"></div>
                        </div>
                    </div>
                    <div class="flex-shrink-0">
                        <input type="date" v-model="selectedDate" class="date-input" />
                    </div>
                </div>
            </div>

            <!-- 로딩 바 제거됨 -->

            <!-- 데일리 뉴스 (Daily 모드에서만) -->
            <Transition name="fade-slide">
                <div v-if="mode === 'daily' && !isLoading" class="daily-news-section">
                    <div class="news-header">
                        <div class="flex items-center gap-3">
                            <h2 class="text-xl font-bold text-gray-900">Daily News</h2>
                            <span v-if="cardNewsImages.length > 0" class="news-count-badge">
                                {{ cardNewsImages.length }} 개의 카드뉴스
                            </span>
                        </div>
                    </div>
                    <div v-if="cardNewsImages.length > 0" class="card-news-container">
                        <div v-for="(img, idx) in cardNewsImages" :key="idx" class="card-news-item"
                            :style="{ animationDelay: `${idx * 0.1}s` }" @click="openImage(idx)">
                            <div class="card-news-wrapper">
                                <img :src="img" class="card-news-image" />
                                <div class="card-overlay">
                                    <div class="overlay-content">
                                        <span class="view-text">자세히 보기</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="empty-state">
                        <p class="empty-title">카드 뉴스가 없습니다</p>
                        <p class="empty-subtitle">선택한 날짜의 카드 뉴스를 찾을 수 없습니다</p>
                    </div>
                </div>
            </Transition>



            <!-- 리포트 내용 -->
            <div class="report-body">
                <Transition name="fade" mode="out-in">
                    <div v-if="isLoading" class="loading-state">
                        <div class="loading-spinner"></div>
                        <p class="loading-title">리포트를 불러오는 중...</p>
                    </div>
                    <div v-else-if="reportHtml" class="report-content report-html-wrapper" v-html="sanitizedReportHtml">
                    </div>
                    <div v-else class="empty-state">
                        <p class="empty-title">리포트가 없습니다</p>
                        <p class="empty-subtitle">선택한 날짜의 리포트를 찾을 수 없습니다</p>
                    </div>
                </Transition>
            </div>


        </section>
    </div>

    <!-- 이미지 모달 -->
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="isModalOpen" class="modal-backdrop" @click="isModalOpen = false">
                <div class="modal-container" @click.stop>
                    <div class="modal-content">
                        <img :src="cardNewsImages[currentIndex]" class="modal-image" />
                    </div>
                    <button @click.stop="prevImage" class="modal-nav-button left">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <button @click.stop="nextImage" class="modal-nav-button right">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>

    <ChatBotFloating />
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { reportsAPI } from "@/api/reports";
import ChatBotFloating from "@/components/ui/ChatBotFloating.vue";

const cardNewsImages = ref([]);

const currentIndex = ref(0);
const isModalOpen = ref(false);
const isLoading = ref(false);
const loadingProgress = ref(0);
const lastUpdateTime = ref('');

const mode = ref("daily");
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const reportHtml = ref("");

// 리포트 HTML에서 스타일 태그를 제거하고 스코프를 제한
const sanitizedReportHtml = computed(() => {
    if (!reportHtml.value) return "";

    let html = reportHtml.value;

    // <style> 태그 제거 (전역 스타일 방지)
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // 인라인 스타일에서 font-family 제거 (리포트 콘텐츠에만 폰트 적용)
    html = html.replace(/style="[^"]*font-family[^"]*"/gi, (match) => {
        return match.replace(/font-family[^;]*;?/gi, '');
    });

    return html;
});

const openImage = (idx) => { currentIndex.value = idx; isModalOpen.value = true; };
const nextImage = () => { currentIndex.value = (currentIndex.value + 1) % cardNewsImages.value.length; };
const prevImage = () => { currentIndex.value = (currentIndex.value - 1 + cardNewsImages.value.length) % cardNewsImages.value.length; };

function updateLastUpdateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    lastUpdateTime.value = `마지막 업데이트: ${hours}:${minutes}`;
}

async function loadDaily() {
    isLoading.value = true;

    try {
        const [reportRes, cardNewsRes] = await Promise.all([
            reportsAPI.getDailyReport(selectedDate.value),
            reportsAPI.getDailyCardnews()
        ]);

        reportHtml.value = reportRes.html_resource ?? "";
        cardNewsImages.value = cardNewsRes.images.map(base64 => {
            const cleanBase64 = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
            return cleanBase64;
        });
        console.log('카드뉴스 이미지:', cardNewsImages.value.length, '개 로드됨');

        if (reportRes.created_at) {
            const date = new Date(reportRes.created_at);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            lastUpdateTime.value = `마지막 업데이트: ${hours}:${minutes}`;
        }
    } catch (error) {
        console.error('데일리 리포트 로드 실패:', error);
        reportHtml.value = "";
        cardNewsImages.value = [];
    } finally {
        isLoading.value = false;
    }
}

async function loadWeekly() {
    isLoading.value = true;

    try {
        const reportRes = await reportsAPI.getWeeklyReport(selectedDate.value);

        if (reportRes && reportRes.html_resource) {
            reportHtml.value = reportRes.html_resource;
            if (reportRes.created_at) {
                const date = new Date(reportRes.created_at);
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                lastUpdateTime.value = `마지막 업데이트: ${hours}:${minutes}`;
            }
        } else {
            reportHtml.value = "";
        }
    } catch (error) {
        console.error('위클리 리포트 로드 실패:', error);
        reportHtml.value = "";
    } finally {
        isLoading.value = false;
    }
}

function switchMode(m) {
    mode.value = m;
}

watch([mode, selectedDate], () => {
    mode.value === "daily" ? loadDaily() : loadWeekly();
});

onMounted(() => {
    updateLastUpdateTime();
    setInterval(updateLastUpdateTime, 60000);
    // 초기 로딩 - 현재 모드에 따라 결정
    mode.value === "daily" ? loadDaily() : loadWeekly();
});
</script>

<style scoped>
/* 기본 애니메이션 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-slide-enter-active {
    transition: all 0.4s ease;
}

.fade-slide-leave-active {
    transition: all 0.3s ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(-20px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-100%);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

/* 리포트 헤더 */
.report-header {
    padding: 32px;
    position: relative;
    overflow: hidden;
    border-bottom: 1px solid #cbd5e1;
}

.report-title {
    font-weight: 700;
    font-size: 24px;
    margin: 0;
    color: #111827;
}

.update-time {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(47, 128, 237, 0.08);
    border-radius: 20px;
    border: 1px solid rgba(47, 128, 237, 0.15);
}

.update-text {
    font-size: 12px;
    color: #334155;
    font-weight: 600;
}

/* 탭바 */
.content-tab-header {
    padding: 16px 32px;
    background: white;
    border-bottom: 1px solid #cbd5e1;
}

/* Daily/Weekly 탭바 스타일 */
.tab-container {
    display: flex;
    justify-content: flex-start;
}

.tab-wrapper {
    position: relative;
    display: flex;
    background: transparent;
    border-bottom: 1px solid #cbd5e1;
    min-width: 200px;
}

.tab-button {
    position: relative;
    padding: 18px 32px;
    font-size: 16px;
    font-weight: 500;
    color: #a0a0a0;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 2;
}

.tab-button:hover {
    color: #6b7280;
}

.tab-button.active {
    color: #f97316;
    font-weight: 600;
}

.tab-underline {
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 50%;
    height: 3px;
    background: #f97316;
    border-radius: 2px 2px 0 0;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
}

.tab-underline.weekly-active {
    transform: translateX(100%);
}

/* 날짜 입력 */
.date-input {
    padding: 10px 16px;
    background: white;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    color: #000000;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.date-input:hover {
    border-color: #ea770c;
}

.date-input:focus {
    outline: none;
    border-color: #ea770c;
}

/* 로딩 바 제거됨 */

/* Daily News 섹션 */
.daily-news-section {
    padding: 32px;
    background: linear-gradient(180deg, #fafbfc 0%, #ffffff 100%);
    border-bottom: 1px solid #cbd5e1;
}

.news-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
}

.news-count-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    color: #ea770c;
    font-size: 12px;
    font-weight: 600;
    border-radius: 20px;
    border: 1px solid #ea770c;
}

/* 카드뉴스 컨테이너 */
.card-news-container {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 280px));
    gap: 16px;
    justify-content: center;
}

.card-news-item {
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    animation: card-appear 0.5s ease both;
}

@keyframes card-appear {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card-news-item:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(51, 65, 85, 0.2);
}

.card-news-wrapper {
    position: relative;
    width: 100%;
    padding-bottom: 100%;
    overflow: hidden;
    background: #334155;
}

.card-news-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: transform 0.4s ease;
}

.card-news-item:hover .card-news-image {
    transform: scale(1.08);
}

.card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 16px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.card-news-item:hover .card-overlay {
    opacity: 1;
}

.overlay-content {
    display: flex;
    justify-content: center;
    align-items: center;
}

.view-text {
    color: white;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 20px;
    border-radius: 20px;
}

/* 리포트 본문 */
.report-body {
    padding: 48px 32px;
    min-height: 400px;
}

/* 로딩 상태 */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
}

.loading-spinner {
    width: 56px;
    height: 56px;
    border: 5px solid #f3f4f6;
    border-top: 5px solid #ea770c;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 24px;
}

.loading-title {
    margin-top: 16px;
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
}

.loading-subtitle {
    font-size: 14px;
    color: #8b7964;
    margin-bottom: 32px;
}

.loading-progress {
    width: 300px;
    height: 8px;
    background: #f1f5f9;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 12px;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #ea770c 0%, #f97316 100%);
    border-radius: 10px;
    transition: width 0.3s ease;
}

.loading-percentage {
    font-size: 14px;
    font-weight: 600;
    color: #ea770c;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Empty 상태 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
}

.empty-title {
    font-size: 18px;
    font-weight: 500;
    color: #000000;
    margin-bottom: 8px;
}

.empty-subtitle {
    font-size: 14px;
    color: #000000;
}

/* 모달 */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.modal-container {
    position: relative;
    display: flex;
    align-items: center;
}

.modal-content {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.modal-image {
    max-width: 700px;
    max-height: 800px;
    width: auto;
    height: auto;
    display: block;
}

.modal-nav-button {
    position: absolute;
    padding: 16px;
    background: rgba(255, 255, 255, 0.95);
    border: none;
    border-radius: 50%;
    color: #1a202c;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-nav-button:hover {
    background: white;
    transform: scale(1.1);
}

.modal-nav-button.left {
    left: -80px;
}

.modal-nav-button.right {
    right: -80px;
}

/* 반응형 */
@media (max-width: 1280px) {
    .card-news-container {
        grid-template-columns: repeat(3, minmax(0, 260px));
    }
}

@media (max-width: 1024px) {
    .card-news-container {
        grid-template-columns: repeat(2, minmax(0, 240px));
    }
}

@media (max-width: 768px) {
    .report-header {
        padding: 24px;
    }

    .content-tab-header {
        flex-direction: column;
        gap: 16px;
        padding: 16px 24px;
    }

    .daily-news-section {
        padding: 24px;
    }

    .card-news-container {
        grid-template-columns: repeat(2, minmax(0, 160px));
        gap: 12px;
    }

    .report-body {
        padding: 32px 24px;
    }

}

@media (max-width: 640px) {
    .header-content .flex {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .update-time {
        align-self: flex-start;
    }

    .tab-wrapper {
        width: 100%;
    }

    .card-news-container {
        grid-template-columns: 1fr;
        max-width: 300px;
        margin: 0 auto;
    }
}

/* ========== 리포트 콘텐츠 스타일 ========== */
.report-content {
    max-width: none;
    line-height: 1.7;
    color: #2d3748;
    font-size: 15px;
    letter-spacing: -0.005em;
}

/* 리포트 HTML 래퍼 - 폰트 격리 */
.report-html-wrapper {
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif !important;
    isolation: isolate;
}

/* 리포트 HTML 내부의 모든 요소에 폰트 강제 적용 */
.report-html-wrapper * {
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif !important;
}

.report-content :deep(h1) {
    font-size: 28px;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 32px 0;
}

.report-content :deep(h2) {
    font-size: 22px;
    font-weight: 600;
    color: #2d3748;
    margin: 32px 0 16px 0;
}

.report-content :deep(h3) {
    font-size: 18px;
    font-weight: 600;
    color: #4a5568;
    margin: 24px 0 12px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid #334155;
}

.report-content :deep(h4) {
    font-size: 16px;
    font-weight: 600;
    color: #4a5568;
    margin: 20px 0 8px 0;
}

.report-content :deep(p) {
    color: #4a5568;
    line-height: 1.8;
    margin-bottom: 16px;
    text-align: justify;
    word-break: keep-all;
}

.report-content :deep(strong) {
    font-weight: 700;
    color: #1a202c;
    background: linear-gradient(120deg, #fef5e7 0%, #fef5e7 100%);
    background-repeat: no-repeat;
    background-size: 100% 40%;
    background-position: 0 85%;
}

.report-content :deep(em) {
    font-style: italic;
    color: #4a5568;
    font-weight: 500;
}

.report-content :deep(ul) {
    margin: 16px 0;
    padding-left: 0;
    list-style: none;
}

.report-content :deep(ul li) {
    position: relative;
    padding-left: 24px;
    margin-bottom: 8px;
    color: #4a5568;
    line-height: 1.6;
}

.report-content :deep(ul li)::before {
    content: '▪';
    position: absolute;
    left: 0;
    color: #f97316;
    font-weight: bold;
}

.report-content :deep(ol) {
    margin: 16px 0;
    padding-left: 24px;
    counter-reset: item;
}

.report-content :deep(ol li) {
    margin-bottom: 8px;
    color: #4a5568;
    line-height: 1.6;
    list-style: none;
    counter-increment: item;
}

.report-content :deep(ol li)::before {
    content: counter(item) ". ";
    font-weight: 600;
    color: #f97316;
}

.report-content :deep(table) {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 24px 0;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.report-content :deep(th) {
    background: linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%);
    color: #334155;
    font-weight: 600;
    font-size: 14px;
    padding: 14px 16px;
    text-align: left;
    border-bottom: 2px solid #334155;
    border-right: 1px solid #cbd5e0;
}

.report-content :deep(th):last-child {
    border-right: none;
}

.report-content :deep(td) {
    padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    color: #4a5568;
    font-size: 14px;
}

.report-content :deep(td):last-child {
    border-right: none;
}

.report-content :deep(tr:nth-child(even) td) {
    background-color: #f8fafc;
}

.report-content :deep(tr:hover td) {
    background-color: #edf2f7;
}

.report-content :deep(blockquote) {
    margin: 24px 0;
    padding: 16px 20px;
    background: #f8fafc;
    border-radius: 6px;
    border-left: 4px solid #334155;
    color: #2d3748;
    font-style: normal;
    position: relative;
}

.report-content :deep(blockquote)::before {
    content: '💡';
    position: absolute;
    top: 16px;
    left: -2px;
    font-size: 16px;
    color: #ea770c;
}

.report-content :deep(pre) {
    background: #f1f5f9;
    border: 1px solid #cbd5e0;
    border-radius: 6px;
    padding: 16px;
    margin: 20px 0;
    overflow-x: auto;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    line-height: 1.5;
}

.report-content :deep(code) {
    background: #f1f5f9;
    color: #1e293b;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    border: 1px solid #e2e8f0;
}

.report-content :deep(a) {
    color: #ea770c;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.2s ease;
}

.report-content :deep(a:hover) {
    color: #ea770c;
    border-bottom-color: #ea770c;
}

.report-content :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    margin: 16px 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.report-content :deep(hr) {
    border: none;
    height: 1px;
    background: linear-gradient(90deg, transparent, #cbd5e0, transparent);
    margin: 32px 0;
}

.report-content :deep(section) {
    margin: 32px 0;
    padding: 20px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
    .report-content :deep(table) {
        font-size: 12px;
    }

    .report-content :deep(th),
    .report-content :deep(td) {
        padding: 8px 10px;
    }

    .report-content :deep(h1) {
        font-size: 24px;
    }

    .report-content :deep(h2) {
        font-size: 20px;
    }

    .report-content :deep(h3) {
        font-size: 16px;
    }
}
</style>