<template>
    <div class="chatbot-wrap">
        <transition name="tooltip">
            <div v-if="showTooltip && !isOpen" class="tooltip">
                원유 시장에 대해 궁금한 점을 물어보세요!
            </div>
        </transition>

        <button class="fab" @click="toggleChat" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
            <div class="fab-inner">
                <svg v-if="!isOpen" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="6" fill="rgba(255,255,255,0.9)" />
                    <circle cx="16" cy="16" r="10" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" fill="none"
                        class="ring" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </div>
        </button>

        <transition name="modal">
            <div v-if="isOpen" class="chat-modal">
                <header class="chat-header">
                    <div class="header-left">
                        <div class="avatar-wrap">
                            <div class="avatar-pulse"></div>
                            <div class="avatar-core"></div>
                        </div>
                        <div class="header-text">
                            <h1>Oil Market AI</h1>
                            <span>Marimo</span>
                        </div>
                    </div>
                    <button class="close-btn" @click="isOpen = false">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <main class="chat-body" ref="chatBody">
                    <div v-if="messages.length === 0" class="welcome">
                        <div class="welcome-card">
                            <h2>안녕하세요!</h2>
                            <p>원유 시장이 궁금하신가요? 실시간 유가부터 리스크 분석까지, 무엇이든 편하게 물어보세요!</p>
                        </div>

                        <div class="quick-actions">
                            <span class="quick-label">이런 것들이 궁금하지 않으세요?</span>
                            <div class="quick-list">
                                <button v-for="(q, i) in quickQuestions" :key="i" class="quick-btn"
                                    @click="sendMessage(q.query)">
                                    <span class="quick-num">{{ i + 1 }}</span>
                                    <div class="quick-content">
                                        <strong>{{ q.title }}</strong>
                                        <span>{{ q.desc }}</span>
                                    </div>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <template v-else>
                        <div class="date-divider">
                            <span>{{ todayDate }}</span>
                        </div>

                        <div v-for="(msg, i) in messages" :key="i" class="message-group">
                            <div class="user-row">
                                <div class="user-bubble">{{ msg.question }}</div>
                                <time>{{ msg.questionTime }}</time>
                            </div>

                            <div class="bot-row">
                                <div class="bot-avatar">
                                    <div class="bot-avatar-ring"></div>
                                    <div class="bot-avatar-core"></div>
                                </div>
                                <div class="bot-content">
                                    <div v-if="msg.status === 'thinking'" class="status-indicator">
                                        <div class="status-bar"></div>
                                        <span>생각중...</span>
                                    </div>

                                    <div v-else-if="msg.status === 'tool'" class="status-indicator tool">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="11" cy="11" r="8" />
                                            <path d="m21 21-4.35-4.35" />
                                        </svg>
                                        <span>{{ msg.toolText }}</span>
                                        <div class="status-bar"></div>
                                    </div>

                                    <template v-else>
                                        <div class="bot-bubble" v-html="msg.answer"></div>
                                        <time>Marimo {{ msg.answerTime }}</time>

                                        <div v-if="msg.suggestions?.length" class="suggestions">
                                            <span class="suggest-label">다음 분석 추천</span>
                                            <div class="suggest-list">
                                                <button v-for="(s, si) in msg.suggestions" :key="si" class="suggest-btn"
                                                    @click="sendMessage(s)">
                                                    <span class="suggest-dot"></span>
                                                    <span>{{ s }}</span>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                        stroke-width="2">
                                                        <path d="m9 18 6-6-6-6" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </template>
                </main>

                <footer class="chat-footer">
                    <div class="input-wrap">
                        <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input v-model="inputText" @keydown.enter="handleEnter" @compositionstart="isComposing = true"
                            @compositionend="isComposing = false" placeholder="궁금한 것이 있으시면 언제든 물어보세요!"
                            :disabled="isLoading" />
                        <button class="send-btn" @click="handleSend" :disabled="!inputText.trim() || isLoading">
                            <svg v-if="!isLoading" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="m22 2-7 20-4-9-9-4z" />
                                <path d="M22 2 11 13" />
                            </svg>
                            <span v-else class="spinner"></span>
                        </button>
                    </div>
                </footer>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, reactive, nextTick, computed } from 'vue'

const isOpen = ref(false)
const showTooltip = ref(false)
const inputText = ref('')
const isLoading = ref(false)
const isComposing = ref(false)
const chatBody = ref(null)
const messages = reactive([])

const quickQuestions = [
    { title: '현재 유가 동향은?', desc: '브렌트유, WTI, 두바이유 실시간 가격 및 변동 요인', query: '현재 유가 동향' },
    { title: 'OPEC+ 감산 현황은?', desc: '최신 감산 결정과 회원국별 이행률 분석', query: 'OPEC+ 감산 현황' },
    { title: '미국 셰일 생산량은?', desc: '미국 원유 생산량과 시추 활동 현황', query: '미국 셰일 생산량' }
]

const responses = {
    '현재 유가 동향': {
        text: `<strong>2024년 12월 26일 국제 유가 현황</strong><br><br>
<strong>주요 유종별 가격</strong><br>
브렌트유: $73.04 (-0.8%)<br>
WTI: $69.38 (-1.2%)<br>
두바이유: $72.15 (-0.9%)<br><br>
<strong>하락 요인</strong><br>
중국 경제 성장률 둔화 우려로 인한 수요 감소 전망, 미국 원유 재고 320만 배럴 증가, 달러 강세가 주요 하락 요인입니다.<br><br>
<strong>상승 요인</strong><br>
러시아 정유시설 드론 공격과 중동 지정학적 긴장이 가격 하락을 제한하고 있습니다.`,
        suggestions: ['중국 경제가 유가에 미치는 영향은?', '미국 원유 재고 증가 원인은?', '내년 유가 전망은?']
    },
    'OPEC+ 감산 현황': {
        text: `<strong>OPEC+ 감산 정책 현황</strong><br><br>
<strong>현재 감산 규모</strong><br>
총 감산량: 일 366만 배럴<br>
자발적 감산: 일 220만 배럴 (2024년 말까지)<br><br>
<strong>주요 국가별 감산량</strong><br>
사우디아라비아: 100만 b/d<br>
러시아: 50만 b/d<br>
이라크: 22만 b/d<br>
UAE: 16만 b/d<br><br>
<strong>이행률 현황</strong><br>
전체 이행률 89%, 사우디 100% 완전 이행, 러시아 95%, 이라크 78% 미달입니다.`,
        suggestions: ['이행률이 낮은 이유는?', '감산 연장 가능성은?', '비OPEC 국가 영향은?']
    },
    '미국 셰일 생산량': {
        text: `<strong>미국 원유 생산 현황</strong><br><br>
<strong>생산량 통계</strong><br>
현재 생산량: 일 1,320만 배럴<br>
전년 대비: +2.1% 증가<br>
셰일 비중: 약 65% (860만 b/d)<br><br>
<strong>주요 셰일 지역별 생산량</strong><br>
퍼미안 분지: 610만 b/d<br>
이글 포드: 110만 b/d<br>
바켄: 85만 b/d<br><br>
<strong>경제성 분석</strong><br>
손익분기점 WTI $45-55/배럴, 현재 수익성 양호 (마진 25-30%)입니다.`,
        suggestions: ['셰일 기술 발전 현황은?', '환경 규제 영향은?', '수출량 현황은?']
    }
}

const todayDate = computed(() => {
    const d = new Date()
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    return `${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}`
})

const getTime = () => {
    const d = new Date()
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

const scrollToBottom = () => {
    nextTick(() => {
        if (chatBody.value) {
            chatBody.value.scrollTo({ top: chatBody.value.scrollHeight, behavior: 'smooth' })
        }
    })
}

const toggleChat = () => {
    isOpen.value = !isOpen.value
    showTooltip.value = false
}

const handleEnter = (e) => {
    if (isComposing.value) return
    e.preventDefault()
    handleSend()
}

const handleSend = () => {
    if (!inputText.value.trim() || isLoading.value) return
    sendMessage(inputText.value.trim())
    inputText.value = ''
}

const sendMessage = async (query) => {
    if (isLoading.value) return
    isLoading.value = true

    const msg = reactive({
        question: query,
        questionTime: getTime(),
        answer: '',
        answerTime: '',
        suggestions: [],
        status: 'thinking',
        toolText: ''
    })
    messages.push(msg)
    scrollToBottom()

    await delay(1500)
    msg.status = 'tool'
    msg.toolText = '데이터 분석 중...'
    scrollToBottom()

    await delay(1500)

    const resp = responses[query] || {
        text: '죄송합니다. 해당 질문에 대한 정보가 아직 준비되지 않았습니다.<br><br>다른 질문을 시도해 보시거나, 아래 추천 분석을 선택해 주세요.',
        suggestions: ['현재 유가 동향', 'OPEC+ 감산 현황', '미국 셰일 생산량']
    }

    msg.status = 'done'
    msg.answer = resp.text
    msg.answerTime = getTime()
    msg.suggestions = resp.suggestions
    isLoading.value = false
    scrollToBottom()
}

const delay = (ms) => new Promise(r => setTimeout(r, ms))
</script>

<style scoped>
* {
    box-sizing: border-box;
}

.chatbot-wrap {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 9999;
    display: flex;
    align-items: flex-end;
    gap: 12px;
}

.tooltip {
    padding: 10px 16px;
    background: #fff;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    color: #1f2937;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
}

.tooltip-enter-active,
.tooltip-leave-active {
    transition: all 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
    opacity: 0;
    transform: translateX(8px);
}

.fab {
    width: 60px;
    height: 60px;
    border: none;
    border-radius: 20px;
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    cursor: pointer;
    box-shadow: 0 8px 32px rgba(255, 107, 53, 0.4);
    transition: all 0.3s ease;
}

.fab:hover {
    transform: scale(1.05) translateY(-2px);
}

.fab-inner {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
}

.fab-inner svg {
    width: 28px;
    height: 28px;
}

.ring {
    transform-origin: center;
    animation: rotate 8s linear infinite;
}

@keyframes rotate {
    to {
        transform: rotate(360deg);
    }
}

.chat-modal {
    position: fixed;
    right: 24px;
    top: 24px;
    width: 420px;
    height: calc(100vh - 48px);
    max-height: 720px;
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

@media (max-width: 480px) {
    .chat-modal {
        right: 12px;
        top: 12px;
        width: calc(100vw - 24px);
        height: calc(100vh - 24px);
        max-height: none;
        border-radius: 20px;
    }
}

.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
}

.chat-header {
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #f1f5f9;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.avatar-wrap {
    width: 40px;
    height: 40px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid #ff6b35;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

.avatar-core {
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(255, 107, 53, 0.4);
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
        opacity: 0.6;
    }

    50% {
        transform: scale(1.1);
        opacity: 0.3;
    }
}

.header-text h1 {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: #1f2937;
}

.header-text span {
    font-size: 13px;
    color: #6b7280;
}

.close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: #f3f4f6;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: #e5e7eb;
    color: #1f2937;
}

.close-btn svg {
    width: 18px;
    height: 18px;
}

.chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    background: #fafbfc;
}

.chat-body::-webkit-scrollbar {
    width: 6px;
}

.chat-body::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 3px;
}

.welcome {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.welcome-card {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.welcome-card h2 {
    margin: 0 0 8px;
    font-size: 17px;
    font-weight: 700;
    color: #1f2937;
}

.welcome-card p {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.5;
}

.quick-actions {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.quick-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 12px;
}

.quick-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.quick-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: #f9fafb;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;
}

.quick-btn:hover {
    background: #f3f4f6;
    transform: translateX(4px);
}

.quick-num {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    color: #fff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
}

.quick-content {
    flex: 1;
}

.quick-content strong {
    display: block;
    font-size: 14px;
    color: #1f2937;
    margin-bottom: 2px;
}

.quick-content span {
    font-size: 12px;
    color: #6b7280;
}

.quick-btn svg {
    width: 16px;
    height: 16px;
    color: #9ca3af;
    flex-shrink: 0;
}

.quick-btn:hover svg {
    color: #ff6b35;
}

.date-divider {
    text-align: center;
    margin-bottom: 20px;
}

.date-divider span {
    font-size: 12px;
    color: #9ca3af;
}

.message-group {
    margin-bottom: 24px;
}

.user-row {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-bottom: 16px;
}

.user-bubble {
    max-width: 80%;
    padding: 14px 18px;
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    color: #fff;
    border-radius: 20px 20px 6px 20px;
    font-size: 14px;
    line-height: 1.5;
    box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
}

.user-row time {
    font-size: 11px;
    color: #9ca3af;
    margin-top: 4px;
}

.bot-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
}

.bot-avatar {
    width: 32px;
    height: 32px;
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bot-avatar-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 1.5px solid rgba(255, 107, 53, 0.4);
    border-radius: 50%;
    border-top-color: rgba(247, 147, 30, 0.6);
    animation: rotate 4s linear infinite;
}

.bot-avatar-core {
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    border-radius: 50%;
}

.bot-content {
    flex: 1;
    min-width: 0;
}

.status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.status-indicator span {
    font-size: 13px;
    color: #6b7280;
}

.status-indicator svg {
    width: 14px;
    height: 14px;
    color: #9ca3af;
}

.status-bar {
    width: 24px;
    height: 3px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
}

.status-bar::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background: #9ca3af;
    animation: slide 1.2s ease-in-out infinite;
}

@keyframes slide {
    0% {
        transform: translateX(-100%);
    }

    50% {
        transform: translateX(0);
    }

    100% {
        transform: translateX(100%);
    }
}

.bot-bubble {
    background: #fff;
    padding: 16px 18px;
    border-radius: 6px 20px 20px 20px;
    font-size: 14px;
    line-height: 1.7;
    color: #1f2937;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.bot-bubble :deep(strong) {
    display: block;
    font-weight: 700;
    color: #1f2937;
    margin: 12px 0 6px;
}

.bot-bubble :deep(strong:first-child) {
    margin-top: 0;
}

.bot-content>time {
    display: block;
    font-size: 11px;
    color: #9ca3af;
    margin-top: 6px;
}

.suggestions {
    margin-top: 14px;
}

.suggest-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 8px;
}

.suggest-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.suggest-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: #fff;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.suggest-btn:hover {
    background: #f9fafb;
    transform: translateX(4px);
}

.suggest-dot {
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    border-radius: 50%;
    flex-shrink: 0;
}

.suggest-btn>span:last-of-type {
    flex: 1;
    font-size: 13px;
    color: #374151;
}

.suggest-btn svg {
    width: 14px;
    height: 14px;
    color: #9ca3af;
    flex-shrink: 0;
}

.suggest-btn:hover svg {
    color: #ff6b35;
}

.chat-footer {
    padding: 16px 20px;
    background: #fff;
    border-top: 1px solid #f1f5f9;
}

.input-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f3f4f6;
    border-radius: 24px;
    padding: 10px 16px;
}

.input-icon {
    width: 18px;
    height: 18px;
    color: #9ca3af;
    flex-shrink: 0;
}

.input-wrap input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: #1f2937;
}

.input-wrap input::placeholder {
    color: #9ca3af;
}

.send-btn {
    width: 40px;
    height: 40px;
    border: none;
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    border-radius: 50%;
    cursor: pointer;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.send-btn:hover:not(:disabled) {
    transform: scale(1.05);
}

.send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.send-btn svg {
    width: 16px;
    height: 16px;
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>