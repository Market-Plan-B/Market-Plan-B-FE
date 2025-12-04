<template>
    <div class="space-y-8">

        <!-- 📌 통합 리포트 섹션 -->
        <section class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <!-- 헤더 영역 -->
            <div class="report-header">
                <div class="header-content">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="font-bold text-2xl text-gray-900">Market Intelligence Report</h2>
                            <p class="text-gray-600 text-sm mt-2">글로벌 원유 시장 분석 및 전략적 인사이트</p>
                        </div>
                        <div class="update-time">
                            <span class="update-text">{{ lastUpdateTime }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 탭바 -->
            <div class="content-tab-header">
                <div class="flex justify-between items-center">
                    <div class="tab-container">
                        <div class="tab-wrapper">
                            <button @click="switchMode('daily')"
                                class="tab-button"
                                :class="{ 'active': mode === 'daily' }">
                                Daily
                            </button>
                            <button @click="switchMode('weekly')"
                                class="tab-button"
                                :class="{ 'active': mode === 'weekly' }">
                                Weekly
                            </button>
                            <div class="tab-underline" :class="{ 'weekly-active': mode === 'weekly' }"></div>
                            <div class="tab-underline" :class="{ 'weekly-active': mode === 'weekly' }"></div>
                        </div>
                    </div>
                    <div class="flex-shrink-0">
                        <input type="date" v-model="selectedDate"
                            class="date-input" />
                    </div>
                </div>
            </div>

            <!-- 로딩 바 -->
            <Transition name="slide-down">
                <div v-if="isLoading" class="loading-bar-container">
                    <div class="loading-bar"></div>
                </div>
            </Transition>

            <!-- 데일리 뉴스 (Daily 모드에서만) -->
            <Transition name="fade-slide">
                <div v-if="mode === 'daily' && !isLoading" class="daily-news-section">
                    <div class="news-header">
                        <div class="flex items-center gap-3">
                            <h2 class="text-xl font-bold text-gray-900">Daily News</h2>
                            <span class="news-count-badge">
                                {{ dummyImages.length }} 개의 카드뉴스
                            </span>
                        </div>
                    </div>
                    <div class="card-news-container">
                        <div v-for="(img, idx) in dummyImages" :key="idx"
                            class="card-news-item"
                            :style="{ animationDelay: `${idx * 0.1}s` }"
                            @click="openImage(idx)">
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
                </div>
            </Transition>



            <!-- 리포트 내용 -->
            <div class="report-body">
                <Transition name="fade" mode="out-in">
                    <div v-if="isLoading" class="loading-state">
                        <div class="loading-spinner"></div>
                        <p class="loading-title">리포트를 생성하고 있습니다</p>
                        <p class="loading-subtitle">최신 데이터를 분석 중입니다...</p>
                        <div class="loading-progress">
                            <div class="progress-bar" :style="{ width: loadingProgress + '%' }"></div>
                        </div>
                        <p class="loading-percentage">{{ loadingProgress }}%</p>
                    </div>
                    <div v-else-if="reportHtml" class="report-content" v-html="reportHtml"></div>
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
            <div v-if="isModalOpen" class="modal-backdrop"
                @click="isModalOpen = false">
                <div class="modal-container" @click.stop>
                    <div class="modal-content">
                        <img :src="dummyImages[currentIndex]" class="modal-image" />
                        <div class="modal-counter">
                            {{ currentIndex + 1 }} / {{ dummyImages.length }}
                        </div>
                    </div>
                    <button @click.stop="prevImage" class="modal-nav-button left">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                    </button>
                    <button @click.stop="nextImage" class="modal-nav-button right">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </button>
                    <button @click="isModalOpen = false" class="modal-close-button">
                        ✕
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>

    <ChatBotFloating />
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { reportsAPI } from "@/api/reports";
import ChatBotFloating from "@/components/ui/ChatBotFloating.vue";

const dummyImages = [
    "/images/CardNews_Sample01.png",
    "/images/CardNews_Sample02.png",
    "/images/CardNews_Sample03.png",
    "/images/CardNews_Sample01.png"
];

const currentIndex = ref(0);
const isModalOpen = ref(false);
const isLoading = ref(false);
const isRefreshing = ref(false);
const loadingProgress = ref(0);
const lastUpdateTime = ref('');

const mode = ref("daily");
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const reportHtml = ref("");

const openImage = (idx) => { currentIndex.value = idx; isModalOpen.value = true; };
const nextImage = () => { currentIndex.value = (currentIndex.value + 1) % dummyImages.length; };
const prevImage = () => { currentIndex.value = (currentIndex.value - 1 + dummyImages.length) % dummyImages.length; };

function simulateLoading() {
    loadingProgress.value = 0;
    const interval = setInterval(() => {
        if (loadingProgress.value < 90) {
            loadingProgress.value += Math.random() * 15;
        }
        if (loadingProgress.value >= 90) {
            loadingProgress.value = 100;
            clearInterval(interval);
        }
    }, 200);
}

function updateLastUpdateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    lastUpdateTime.value = `마지막 업데이트: ${hours}:${minutes}`;
}

async function loadDaily() {
    isLoading.value = true;
    
    try {
        const reportRes = await reportsAPI.getDailyReport(selectedDate.value);
        reportHtml.value = reportRes.html_resource ?? "";
    } catch (error) {
        console.error('데일리 리포트 로드 실패:', error);
        reportHtml.value = "";
    } finally {
        isLoading.value = false;
        updateLastUpdateTime();
    }
}

const weekRange = ref({ start: '', end: '' });

async function loadWeekly() {
    isLoading.value = true;
    
    try {
        const reportRes = await reportsAPI.getWeeklyReport(selectedDate.value);

        if (reportRes && reportRes.html_resource) {
            reportHtml.value = reportRes.html_resource;
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
    } finally {
        isLoading.value = false;
        updateLastUpdateTime();
    }
}

function switchMode(m) { 
    mode.value = m;
}

async function refreshData() {
    if (mode.value === 'daily') {
        await loadDaily();
    } else {
        await loadWeekly();
    }
}

function formatReportDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function downloadReport() {
    console.log('PDF 다운로드');
}

function shareReport() {
    console.log('리포트 공유');
}

watch([mode, selectedDate], () => {
    mode.value === "daily" ? loadDaily() : loadWeekly();
});

onMounted(() => {
    updateLastUpdateTime();
    setInterval(updateLastUpdateTime, 60000);
});
</script>

<style scoped>
/* 기본 애니메이션 */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
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

.slide-down-enter-active, .slide-down-leave-active {
    transition: all 0.3s ease;
}
.slide-down-enter-from, .slide-down-leave-to {
    opacity: 0;
    transform: translateY(-100%);
}

.modal-fade-enter-active, .modal-fade-leave-active {
    transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
    opacity: 0;
}

/* 리포트 헤더 */
.report-header {
    padding: 32px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
    position: relative;
    overflow: hidden;
    border-bottom: 2px solid #f0f7ff;
}

.report-header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(47, 128, 237, 0.06) 0%, transparent 70%);
    border-radius: 50%;
    animation: float 8s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-20px, -20px); }
}

.header-content {
    position: relative;
    z-index: 1;
}

.beta-badge {
    display: inline-block;
    padding: 4px 10px;
    background: linear-gradient(135deg, #2F80ED 0%, #1e5bb8 100%);
    color: white;
    font-size: 11px;
    font-weight: 700;
    border-radius: 12px;
    letter-spacing: 0.5px;
}

.live-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    font-size: 11px;
    font-weight: 700;
    border-radius: 12px;
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.live-dot {
    width: 6px;
    height: 6px;
    background: #dc2626;
    border-radius: 50%;
    animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
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

.update-icon {
    font-size: 16px;
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
    border-bottom: 1px solid #f1f5f9;
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
    border-bottom: 1px solid #e5e7eb;
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

/* 새로고침 버튼 */
.refresh-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    background: white;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    color: #475569;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.refresh-button:hover {
    background: #f8fafc;
    border-color: #2F80ED;
    color: #2F80ED;
}

.refresh-button.spinning .refresh-icon {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.refresh-icon {
    font-size: 16px;
    display: inline-block;
}

/* 날짜 입력 */
.date-input {
    padding: 10px 16px;
    background: white;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    color: #475569;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.date-input:hover {
    border-color: #2F80ED;
    box-shadow: 0 0 0 3px rgba(47, 128, 237, 0.1);
}

.date-input:focus {
    outline: none;
    border-color: #2F80ED;
    box-shadow: 0 0 0 3px rgba(47, 128, 237, 0.1);
}

/* 로딩 바 */
.loading-bar-container {
    padding: 0;
    background: linear-gradient(90deg, #2F80ED 0%, #60a5fa 50%, #2F80ED 100%);
    background-size: 200% 100%;
    position: relative;
    overflow: hidden;
    height: 3px;
    animation: gradient-move 2s linear infinite;
}

@keyframes gradient-move {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

.loading-bar {
    position: absolute;
    top: 0;
    left: -100%;
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
    animation: loading-slide 1s ease-in-out infinite;
}

@keyframes loading-slide {
    to { left: 100%; }
}

/* Daily News 섹션 */
.daily-news-section {
    padding: 32px;
    background: linear-gradient(180deg, #fafbfc 0%, #ffffff 100%);
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
    background: linear-gradient(135deg, #f0f7ff 0%, #e0f0ff 100%);
    color: #334155;
    font-size: 13px;
    font-weight: 600;
    border-radius: 20px;
    border: 1px solid #d0e7ff;
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

.card-number {
    align-self: flex-start;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.95);
    color: #2F80ED;
    font-size: 14px;
    font-weight: 700;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.overlay-content {
    display: flex;
    justify-content: center;
    align-items: center;
}

.view-text {
    color: white;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 20px;
    background: rgba(51, 65, 85, 0.9);
    border-radius: 20px;
    backdrop-filter: blur(4px);
}

.card-new-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 10px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    font-size: 11px;
    font-weight: 700;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

/* 리포트 헤더 */
.report-date-header {
    padding: 24px 32px;
    background: linear-gradient(135deg, #2F80ED 0%, #1e5bb8 100%);
    color: white;
}

.report-date-text {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 4px;
}

.report-type-text {
    font-size: 12px;
    opacity: 0.9;
}

.report-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    backdrop-filter: blur(8px);
}

.status-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse-status 2s ease-in-out infinite;
}

@keyframes pulse-status {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.status-text {
    color: white;
    font-size: 13px;
    font-weight: 500;
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
    border-top: 5px solid #2F80ED;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 24px;
}

.loading-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 8px;
}

.loading-subtitle {
    font-size: 14px;
    color: #64748b;
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
    background: linear-gradient(90deg, #2F80ED 0%, #60a5fa 100%);
    border-radius: 10px;
    transition: width 0.3s ease;
}

.loading-percentage {
    font-size: 14px;
    font-weight: 600;
    color: #2F80ED;
}

/* Empty 상태 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.6;
}

.empty-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 8px;
}

.empty-subtitle {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 24px;
}

.retry-button {
    padding: 10px 24px;
    background: linear-gradient(135deg, #2F80ED 0%, #1e5bb8 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.retry-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(47, 128, 237, 0.3);
}

/* 푸터 */
.report-footer {
    padding: 24px 32px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    border-top: 1px solid #e2e8f0;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer-text {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #64748b;
    font-size: 13px;
}

.footer-icon {
    font-size: 16px;
}

.footer-right {
    display: flex;
    gap: 12px;
}

.footer-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: #475569;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.footer-button:hover {
    background: #f8fafc;
    border-color: #2F80ED;
    color: #2F80ED;
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

.modal-counter {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 14px;
    font-weight: 600;
    border-radius: 20px;
    backdrop-filter: blur(8px);
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

.modal-close-button {
    position: absolute;
    top: -50px;
    right: -50px;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.95);
    border: none;
    border-radius: 50%;
    color: #1a202c;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.modal-close-button:hover {
    background: white;
    transform: rotate(90deg);
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
    
    .footer-content {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
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
    
    .refresh-button span:last-child {
        display: none;
    }
}

/* ========== 리포트 콘텐츠 스타일 ========== */
.report-content {
    max-width: none;
    line-height: 1.7;
    color: #2d3748;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
    font-size: 15px;
    letter-spacing: -0.005em;
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
    color: #2F80ED;
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
    color: #2563eb;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.2s ease;
}

.report-content :deep(a:hover) {
    color: #1d4ed8;
    border-bottom-color: #1d4ed8;
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