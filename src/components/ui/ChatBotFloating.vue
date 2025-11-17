<template>
    <!-- 플로팅 버튼 -->
    <button class="chat-fab" @click="toggleChat" aria-label="AI 리포트 챗봇 열기">
        <div class="chat-fab-icon">AI</div>
        <div class="chat-fab-text">
            <span class="label">마리모</span>
            <span class="sub"></span>
        </div>
    </button>

    <!-- 챗봇 모달 -->
    <transition name="chat-slide">
        <div v-if="isChatOpen"
            class="chat-overlay fixed inset-0 flex items-end justify-center md:items-center bg-black/40">
            <div
                class="chat-panel w-[320px] md:w-[380px] mb-4 md:mb-0 rounded-3xl bg-white shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden">

                <!-- 헤더 -->
                <div
                    class="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/80 backdrop-blur">
                    <div>
                        <p class="text-xs font-semibold text-slate-500">Market Plan B · Agent</p>
                        <p class="text-sm font-bold text-slate-900">원유 리포트 챗봇</p>
                    </div>
                    <button @click="toggleChat"
                        class="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200/60 transition-colors">
                        ✕
                    </button>
                </div>

                <!-- 메시지 영역 -->
                <div class="flex-1 px-4 py-3 space-y-3 overflow-y-auto text-[13px] chat-scroll">
                    <!-- 첫 안내 메시지 -->
                    <div class="flex items-start gap-2">
                        <div
                            class="mt-0.5 w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-[11px] text-white font-semibold shrink-0">
                            AI
                        </div>
                        <div
                            class="px-3 py-2 rounded-2xl bg-emerald-50 text-emerald-900 shadow-sm border border-emerald-100 max-w-[230px] leading-relaxed">
                            안녕하세요!<br />
                            뉴스·리포트·영향도 데이터를 기반으로<br />
                            <span class="font-semibold">요약 / 비교 / 통계 인사이트</span>를 정리해 드릴게요.
                            먼저 한 가지 궁금하신 점을 자유롭게 적어 주세요.
                        </div>
                    </div>

                    <!-- 대화 히스토리 -->
                    <div v-for="(m, idx) in messages" :key="idx">
                        <!-- 사용자 -->
                        <div class="flex justify-end">
                            <div class="px-3 py-2 rounded-2xl bg-emerald-600 text-white shadow max-w-[230px]">
                                {{ m.question }}
                            </div>
                        </div>

                        <!-- AI -->
                        <div class="flex items-start gap-2 mt-1">
                            <div
                                class="mt-0.5 w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-[11px] text-white font-semibold shrink-0">
                                AI
                            </div>
                            <div
                                class="px-3 py-2 rounded-2xl bg-slate-50 text-slate-900 shadow-sm border border-slate-100 max-w-[230px] leading-relaxed whitespace-pre-line">
                                {{ m.answer }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 입력 영역 -->
                <form @submit.prevent="onSubmit" class="border-t border-slate-200 bg-slate-50 px-3 py-2.5 space-y-2">
                    <!-- 추천 질문 -->
                    <div class="flex flex-wrap gap-2 mb-1">
                        <button v-for="(s, idx) in baseSuggestions" :key="idx" @click="onSelectSuggestion(s)"
                            type="button"
                            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-[11px] text-slate-700 shadow-sm hover:bg-emerald-50 hover:border-emerald-200 transition-colors">
                            <span v-if="idx === 0">📊</span>
                            <span v-else-if="idx === 1">⚖️</span>
                            <span v-else>📈</span>
                            <span>{{ s }}</span>
                        </button>
                    </div>

                    <!-- 입력창 -->
                    <div class="flex items-end gap-2">
                        <textarea v-model="inputValue" rows="1" placeholder="처음 한 번만 자연어로 질문을 입력해 주세요."
                            class="flex-1 resize-none text-[13px] px-3 py-2 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-200 bg-white"></textarea>
                        <button type="submit"
                            class="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-sm">
                            ▶
                        </button>
                    </div>

                    <p class="text-[10px] text-slate-400">
                        이후에는 추천 질문을 눌러 빠르게 분석을 이어갈 수 있습니다.
                    </p>
                </form>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref } from "vue";

// 상태
const isChatOpen = ref(false);
const inputValue = ref("");
const messages = ref([]);

// 추천 질문
const baseSuggestions = [
    "오늘 가장 영향도가 높은 이슈만 정리해서 알려줘",
    "사우디·미국·중국 관련 리스크를 비교해서 설명해줘",
    "이번 주 유가 시나리오(상승/하락)를 확률과 함께 정리해줘",
];

// 챗봇 열기/닫기
const toggleChat = () => {
    isChatOpen.value = !isChatOpen.value;
};

// 임시 AI 응답
const pushMockAnswer = (question) => {
    const answer =
        `질문: "${question}" 에 대해 데모 응답입니다.\n\n` +
        "- 실제 서비스 연동 시 뉴스·리포트·영향도 데이터를 기반으로 분석을 생성합니다.\n" +
        "- 핵심 이슈 요약, 국가 비교, 시나리오 분석 등이 자동 제공됩니다.";

    messages.value.push({ question, answer });
};

// 직접 입력 제출
const onSubmit = () => {
    const q = inputValue.value.trim();
    if (!q) return;
    pushMockAnswer(q);
    inputValue.value = "";
};

// 추천 질문 처리
const onSelectSuggestion = (q) => {
    pushMockAnswer(q);
};
</script>

<style scoped>
/* 💬 챗봇 플로팅 버튼 */
.chat-fab {
    position: fixed;
    right: 1.25rem;
    bottom: 1.25rem;
    z-index: 60;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(to right, #0f172a, #1e293b);
    color: #f9fafb;
    padding: 0.45rem 0.9rem;
    border-radius: 9999px;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(148, 163, 184, 0.7);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.chat-fab:hover {
    transform: translateY(-2px);
    box-shadow: 0 22px 50px rgba(15, 23, 42, 0.9);
    background: linear-gradient(to right, #020617, #0f172a);
}

.chat-fab-icon {
    width: 1.9rem;
    height: 1.9rem;
    border-radius: 9999px;
    background: radial-gradient(circle at 30% 0%, #38bdf8, #0f172a);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.05em;
}

.chat-fab-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.chat-fab-text .label {
    font-size: 0.75rem;
    font-weight: 600;
}

.chat-fab-text .sub {
    font-size: 0.65rem;
    color: #cbd5f5;
}

/* 챗봇 패널 스크롤바 숨김 */
.chat-scroll::-webkit-scrollbar {
    display: none;
}

.chat-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* 챗봇 오버레이/패널 z-index */
.chat-overlay {
    z-index: 9998;
}

.chat-panel {
    z-index: 9999;
    /* 오버레이 위 */
}

/* 챗봇 슬라이드 애니메이션 */
.chat-slide-enter-active,
.chat-slide-leave-active {
    transition: all 0.25s ease-out;
}

.chat-slide-enter-from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
}

.chat-slide-leave-to {
    opacity: 0;
    transform: translateY(10px) scale(0.97);
}

@media (max-width: 768px) {
    .chat-fab {
        right: 0.75rem;
        bottom: 0.75rem;
        padding: 0.4rem 0.8rem;
    }

    .chat-panel {
        right: 0.75rem;
        left: 0.75rem;
        width: auto;
        bottom: 3.5rem;
    }
}
</style>
