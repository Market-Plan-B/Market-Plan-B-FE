<template>
    <!-- 플로팅 챗봇 버튼 -->
    <div class="chatbot-container">
        <!-- 호버 말풍선 -->
        <transition name="bubble-fade">
            <div v-if="showHoverBubble" class="hover-bubble">
                안녕! 마리모일세 !!
            </div>
        </transition>
        
        <!-- 알림 팝업 -->
        <transition name="bounce">
            <div v-if="showNotification" class="notification-popup">
                챗봇 마리모 등장!
            </div>
        </transition>
        
        <!-- 챗봇 아이콘 -->
        <button 
            class="chatbot-icon" 
            @click="toggleChat" 
            @mouseenter="showHoverBubble = true"
            @mouseleave="showHoverBubble = false"
            aria-label="마리모 챗봇">
            <!-- 러버덕 -->
            <div class="rubber-duck">
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                    <path d="M14 8C16.5 8 18 6.5 18 4.5C18 2.5 16.5 1 14 1C12 1 10.5 2 10 3.5C9.5 2 8 1 6 1C3.5 1 2 2.5 2 4.5C2 6.5 3.5 8 6 8H14Z" fill="#FCD34D" stroke="#1F2937" stroke-width="1.5"/>
                    <path d="M16 6C17 6 17.5 6.5 17.5 7C17.5 7.5 17 8 16 8" fill="#F59E0B" stroke="#1F2937" stroke-width="1"/>
                    <circle cx="15" cy="5" r="1" fill="#1F2937"/>
                </svg>
            </div>
            <!-- 얼굴 -->
            <div class="face">
                <!-- 왼쪽 눈썹 -->
                <div class="eyebrow left"></div>
                <!-- 오른쪽 눈썹 -->
                <div class="eyebrow right"></div>
                <!-- 눈 -->
                <div class="eye left"></div>
                <div class="eye right"></div>
                <!-- 코 -->
                <div class="nose"></div>
            </div>
        </button>
    </div>

    <!-- 챗봇 모달 -->
    <transition name="modal-slide">
        <div v-if="isChatOpen" class="chat-overlay">
            <div class="chat-panel">
                <!-- 헤더 -->
                <div class="chat-header">
                    <div class="header-info">
                        <div class="bot-avatar">
                            <div class="mini-face">
                                <div class="mini-eye"></div>
                                <div class="mini-eye"></div>
                                <div class="mini-nose"></div>
                                <div class="mini-mouth"></div>
                            </div>
                        </div>
                        <div>
                            <p class="bot-name">마리모</p>
                            <p class="bot-subtitle">원유 리포트 챗봇</p>
                        </div>
                    </div>
                    <button @click="toggleChat" class="close-btn">✕</button>
                </div>

                <!-- 메시지 영역 -->
                <div class="messages-area">
                    <!-- 첫 인사 -->
                    <div class="message bot-message">
                        <div class="message-avatar">
                            <div class="mini-face">
                                <div class="mini-eye"></div>
                                <div class="mini-eye"></div>
                                <div class="mini-nose"></div>
                                <div class="mini-mouth"></div>
                            </div>
                        </div>
                        <div class="message-bubble bot-bubble">
                            안녕하세요! 🦆<br/>
                            뉴스·리포트·영향도 데이터를 기반으로<br/>
                            <span class="highlight">요약 / 비교 / 통계 인사이트</span>를 정리해 드릴게요!
                        </div>
                    </div>

                    <!-- 대화 히스토리 -->
                    <div v-for="(m, idx) in messages" :key="idx" class="message-group">
                        <!-- 사용자 메시지 -->
                        <div class="message user-message">
                            <div class="message-bubble user-bubble">
                                {{ m.question }}
                            </div>
                        </div>
                        
                        <!-- 봇 응답 -->
                        <div class="message bot-message">
                            <div class="message-avatar">
                                <div class="mini-face">
                                    <div class="mini-eye"></div>
                                    <div class="mini-eye"></div>
                                    <div class="mini-nose"></div>
                                    <div class="mini-mouth"></div>
                                </div>
                            </div>
                            <div class="message-bubble bot-bubble">
                                {{ m.answer }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 입력 영역 -->
                <div class="input-area">
                    <!-- 추천 질문 -->
                    <div class="suggestions">
                        <button 
                            v-for="(s, idx) in baseSuggestions" 
                            :key="idx" 
                            @click="onSelectSuggestion(s)"
                            class="suggestion-btn">
                            <span class="suggestion-icon">{{ ['📊', '⚖️', '📈'][idx] }}</span>
                            {{ s }}
                        </button>
                    </div>

                    <!-- 입력창 -->
                    <form @submit.prevent="onSubmit" class="input-form">
                        <textarea 
                            v-model="inputValue" 
                            rows="1" 
                            placeholder="궁금한 점을 자유롭게 물어보세요!"
                            class="input-field"></textarea>
                        <button type="submit" class="send-btn">
                            ▶
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, onMounted } from "vue";

// 상태
const isChatOpen = ref(false);
const inputValue = ref("");
const messages = ref([]);
const showHoverBubble = ref(false);
const showNotification = ref(false);

// 추천 질문
const baseSuggestions = [
    "오늘 가장 영향도가 높은 이슈만 정리해서 알려줘",
    "사우디·미국·중국 관련 리스크를 비교해서 설명해줘",
    "이번 주 유가 시나리오(상승/하락)를 확률과 함께 정리해줘",
];

// 챗봇 열기/닫기
const toggleChat = () => {
    isChatOpen.value = !isChatOpen.value;
    showHoverBubble.value = false;
};

// 임시 AI 응답
const pushMockAnswer = (question) => {
    const answer =
        `"${question}" 에 대한 분석 결과입니다! \n\n` +
        "📊 실제 서비스에서는 뉴스·리포트·영향도 데이터를 기반으로 상세 분석을 제공합니다.\n" +
        "📈 핵심 이슈 요약, 국가별 비교, 시나리오 분석 등을 자동으로 생성해드려요!";

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

// 알림 팝업 표시
onMounted(() => {
    // 첫 번째 알림: 페이지 로드 2초 후 10초 동안
    setTimeout(() => {
        showNotification.value = true;
        setTimeout(() => {
            showNotification.value = false;
        }, 5000); // 10초 동안 표시
    }, 2000);
    
    // 주기적 알림: 30초마다 5초 동안 표시
    setInterval(() => {
        if (!isChatOpen.value) { // 챗봇이 열려있지 않을 때만
            showNotification.value = true;
            setTimeout(() => {
                showNotification.value = false;
            }, 5000); // 5초 동안 표시
        }
    }, 300000); 
});
</script>

<style scoped>
/* 챗봇 컨테이너 */
.chatbot-container {
    position: fixed;
    right: 1.5rem;
    bottom: 1.5rem;
    z-index: 1000;
}

/* 챗봇 아이콘 */
.chatbot-icon {
    position: relative;
    width: 68px;
    height: 68px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 50%;
    border: none;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
}

.chatbot-icon:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06);
}

/* 러버덕 */
.rubber-duck {
    position: absolute;
    top: -6px;
    right: 6px;
    z-index: 2;
    transform: rotate(-15deg);
    transition: transform 0.3s ease;
}

.chatbot-icon:hover .rubber-duck {
    transform: rotate(-10deg) scale(1.05);
}

/* 얼굴 */
.face {
    position: relative;
    width: 44px;
    height: 44px;
}

/* 눈썹 */
.eyebrow {
    position: absolute;
    width: 10px;
    height: 5px;
    border-top: 2px solid #1f2937;
    border-radius: 10px 10px 0 0;
    top: 8px;
}

.eyebrow.left {
    left: 9px;
}

.eyebrow.right {
    right: 9px;
}

/* 눈 */
.eye {
    position: absolute;
    width: 3px;
    height: 3px;
    background: #1f2937;
    border-radius: 50%;
    top: 18px;
}

.eye.left {
    left: 12px;
}

.eye.right {
    right: 12px;
}

/* 코 (긴 L자 모양) */
.nose {
    position: absolute;
    top: 22px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
}

.nose::before {
    content: '';
    position: absolute;
    width: 2.5px;
    height: 8px;
    background: #1f2937;
    border-radius: 1px;
    top: 0;
    left: 0;
}

.nose::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 2.5px;
    background: #1f2937;
    border-radius: 1px;
    top: 6px;
    left: -3px;
}



/* 호버 말풍선 */
.hover-bubble {
    position: absolute;
    right: 72px;
    top: 50%;
    transform: translateY(-50%);
    background: white;
    padding: 8px 12px;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    font-size: 14px;
    color: #374151;
    font-weight: 500;
    white-space: nowrap;
    z-index: 999;
}

.hover-bubble::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid white;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
}

/* 알림 팝업 */
.notification-popup {
    position: absolute;
    right: 0;
    top: -60px;
    background: #fef3c7;
    color: #92400e;
    padding: 8px 12px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
}

/* 챗봇 모달 */
.chat-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
}

.chat-panel {
    width: 100%;
    max-width: 400px;
    height: 600px;
    background: white;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 헤더 */
.chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #f3f4f6;
    background: #fafafa;
}

.header-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.bot-avatar {
    width: 32px;
    height: 32px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mini-face {
    position: relative;
    width: 20px;
    height: 20px;
}

.mini-eye {
    position: absolute;
    width: 2px;
    height: 2px;
    background: #1f2937;
    border-radius: 50%;
    top: 6px;
}

.mini-eye:first-child {
    left: 5px;
}

.mini-eye:last-child {
    right: 5px;
}

.mini-nose {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
}

.mini-nose::before {
    content: '';
    position: absolute;
    width: 1px;
    height: 3px;
    background: #1f2937;
    top: 0;
    left: 0;
}

.mini-nose::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 1px;
    background: #1f2937;
    top: 2px;
    left: -1px;
}

.mini-mouth {
    position: absolute;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 3px;
    border-bottom: 1px solid #1f2937;
    border-radius: 0 0 3px 3px;
}

.bot-name {
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
}

.bot-subtitle {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
}

.close-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: #f3f4f6;
    border-radius: 50%;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: #e5e7eb;
    color: #374151;
}

/* 메시지 영역 */
.messages-area {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.message {
    display: flex;
    gap: 8px;
}

.user-message {
    justify-content: flex-end;
}

.bot-message {
    justify-content: flex-start;
}

.message-avatar {
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
}

.message-bubble {
    max-width: 280px;
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.4;
}

.bot-bubble {
    background: #f3f4f6;
    color: #374151;
}

.user-bubble {
    background: #3b82f6;
    color: white;
}

.highlight {
    font-weight: 600;
    color: #1f2937;
}

.message-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* 입력 영역 */
.input-area {
    padding: 16px 20px;
    border-top: 1px solid #f3f4f6;
    background: #fafafa;
}

.suggestions {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
}

.suggestion-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 12px;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
}

.suggestion-btn:hover {
    background: #f9fafb;
    border-color: #d1d5db;
}

.suggestion-icon {
    font-size: 14px;
}

.input-form {
    display: flex;
    gap: 8px;
    align-items: flex-end;
}

.input-field {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    font-size: 14px;
    resize: none;
    outline: none;
    transition: border-color 0.2s ease;
}

.input-field:focus {
    border-color: #3b82f6;
}

.send-btn {
    width: 40px;
    height: 40px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
}

.send-btn:hover {
    background: #2563eb;
}

/* 애니메이션 */
.bubble-fade-enter-active,
.bubble-fade-leave-active {
    transition: all 0.3s ease;
}

.bubble-fade-enter-from,
.bubble-fade-leave-to {
    opacity: 0;
    transform: translateY(-50%) translateX(8px);
}

.bounce-enter-active {
    animation: bounce-in 0.6s ease;
}

.bounce-leave-active {
    transition: all 0.3s ease;
}

.bounce-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

@keyframes bounce-in {
    0% {
        opacity: 0;
        transform: translateY(-20px) scale(0.8);
    }
    50% {
        transform: translateY(-30px) scale(1.05);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.modal-slide-enter-active,
.modal-slide-leave-active {
    transition: all 0.3s ease;
}

.modal-slide-enter-from,
.modal-slide-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
}

/* 스크롤바 숨김 */
.messages-area::-webkit-scrollbar {
    display: none;
}

.messages-area {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* 모바일 대응 */
@media (max-width: 768px) {
    .chatbot-container {
        right: 1rem;
        bottom: 1rem;
    }
    
    .chat-panel {
        height: 80vh;
        margin: 0 1rem;
    }
    
    .hover-bubble {
        right: 70px;
        font-size: 12px;
    }
}
</style>
