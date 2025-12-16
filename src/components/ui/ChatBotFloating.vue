<template>
    <div class="chatbot" :class="{ open: isOpen }">
        <!-- 열린 상태: 채팅 패널 -->
        <div v-if="isOpen" class="chat-container">
            <!-- 헤더 -->
            <header class="chat-header">
                <div class="header-left">
                    <div class="bot-logo">
                        <div class="logo-inner">
                            <svg class="message-icon" viewBox="0 0 24 24" fill="none">
                                <!-- 말풍선 -->
                                <path
                                    d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                                    fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <!-- 점 3개 -->
                                <circle cx="8" cy="12" r="1.2" fill="#9ca3af" />
                                <circle cx="12" cy="12" r="1.2" fill="#9ca3af" />
                                <circle cx="16" cy="12" r="1.2" fill="#9ca3af" />
                            </svg>
                        </div>
                    </div>
                    <div class="header-info">
                        <h1>Marimo</h1>
                        <div class="status-row">
                            <span class="status-dot"></span>
                            <span>AI 어시스턴트</span>
                        </div>
                    </div>
                </div>
                <div class="header-actions">
                    <!-- 새로고침/초기화 버튼 -->
                    <button class="action-btn" @click="handleRefresh" :title="messages.length > 0 ? '대화 초기화' : '새로고침'">
                        <svg v-if="messages.length > 0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 4v6h-6M1 20v-6h6" />
                            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                        </svg>
                    </button>
                    <button class="close-btn" @click="closeChat" title="닫기">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </header>

            <!-- 메인 채팅 영역 -->
            <main class="chat-body" ref="chatBody">
                <!-- 웰컴 화면 -->
                <div v-if="messages.length === 0" class="welcome-screen">
                    <div class="welcome-hero">
                        <h2>안녕하세요! 👋</h2>
                        <p>원유 시장 전문 AI 어시스턴트 <strong>Marimo</strong>입니다.<br />실시간 유가, 시장 동향, 리스크 분석까지 무엇이든 물어보세요!</p>
                    </div>

                    <div class="quick-section">
                        <div class="section-header">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span>추천 질문</span>
                        </div>

                        <!-- 추천 질문 로딩 중 -->
                        <div v-if="isLoadingQuestions" class="quick-loading">
                            <div class="loading-spinner-container">
                                <div class="loading-spinner"></div>
                                <span>추천 질문을 불러오는 중...</span>
                            </div>
                        </div>

                        <!-- 추천 질문 목록 -->
                        <div v-else class="quick-grid">
                            <button v-for="(q, i) in quickQuestions" :key="i" class="quick-card"
                                @click="sendMessage(q.query)">
                                <div class="card-icon">
                                    <svg v-if="i === 0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                                    </svg>
                                    <svg v-else-if="i === 1" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="M3 3v18h18" />
                                        <path d="M18 17l-5-5-4 4-3-3" />
                                    </svg>
                                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" />
                                    </svg>
                                </div>
                                <span class="card-text">{{ q.title }}</span>
                                <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="m9 18 6-6-6-6" />
                                </svg>
                            </button>
                        </div>
                    </div>

                </div>

                <!-- 대화 내용 -->
                <template v-else>
                    <div class="date-badge">
                        <span>{{ todayDate }}</span>
                    </div>

                    <TransitionGroup name="message">
                        <div v-for="(msg, i) in messages" :key="i" class="message-block"
                            :style="{ '--delay': i * 0.05 + 's' }">
                            <!-- 사용자 메시지 -->
                            <div class="user-message">
                                <div class="message-content user">
                                    <p>{{ msg.question }}</p>
                                </div>
                                <time>{{ msg.questionTime }}</time>
                            </div>

                            <!-- AI 응답 -->
                            <div class="ai-message">
                                <div class="ai-avatar">
                                    <svg class="message-mini" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                                            fill="#ea580c" stroke="#ea580c" stroke-width="1" />
                                        <circle cx="8" cy="12" r="1" fill="#ffffff" />
                                        <circle cx="12" cy="12" r="1" fill="#ffffff" />
                                        <circle cx="16" cy="12" r="1" fill="#ffffff" />
                                    </svg>
                                </div>
                                <div class="ai-content">
                                    <!-- 생각중 상태 -->
                                    <div v-if="msg.status === 'thinking'" class="thinking-indicator">
                                        <div class="thinking-dots">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                        <span class="thinking-text">생각하는 중...</span>
                                    </div>

                                    <!-- 분석중 상태 -->
                                    <div v-else-if="msg.status === 'tool'" class="analyzing-indicator">
                                        <div class="analyze-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <circle cx="11" cy="11" r="8" />
                                                <path d="m21 21-4.35-4.35" />
                                            </svg>
                                        </div>
                                        <div class="analyze-info">
                                            <span class="analyze-title">{{ msg.toolText }}</span>
                                            <div class="progress-bar">
                                                <div class="progress-fill"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- 완료된 응답 -->
                                    <template v-else>
                                        <div class="message-bubble ai" v-html="msg.answer"></div>

                                        <!-- 차트 -->
                                        <div v-if="msg.chartData" class="chart-wrapper">
                                            <canvas :id="`chart-${i}`"></canvas>
                                        </div>

                                        <!-- 메시지 액션 -->
                                        <div class="message-actions">
                                            <time>{{ msg.answerTime }}</time>
                                            <button class="copy-btn" @click="copyMessage(msg.answer)"
                                                :title="copied ? '복사됨!' : '복사'">
                                                <svg v-if="!copied" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" stroke-width="2">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                                </svg>
                                                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <!-- 추천 질문 -->
                                        <div v-if="msg.suggestions?.length" class="follow-up">
                                            <span class="follow-label">관련 질문</span>
                                            <div class="follow-list">
                                                <button v-for="(s, si) in msg.suggestions" :key="si" class="follow-btn"
                                                    @click="sendMessage(s)">
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
                    </TransitionGroup>
                </template>

            </main>

            <!-- 스크롤 투 바텀 버튼 (푸터 위에 위치) -->
            <Transition name="fade">
                <button v-if="showScrollButton" class="scroll-bottom-btn" @click="scrollToBottom">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                </button>
            </Transition>

            <!-- 입력 영역 -->
            <footer class="chat-footer">
                <div class="input-container">
                    <div class="input-wrapper" :class="{ focused: inputFocused, disabled: isLoading }">
                        <input ref="inputRef" v-model="inputText" @keydown.enter="handleEnter"
                            @compositionstart="isComposing = true" @compositionend="isComposing = false"
                            @focus="inputFocused = true" @blur="inputFocused = false" placeholder="메시지를 입력하세요..."
                            :disabled="isLoading" />
                        <button class="send-button" @click="handleSend" :disabled="!inputText.trim() || isLoading"
                            :class="{ active: inputText.trim() && !isLoading }">
                            <svg v-if="!isLoading" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                            <div v-else class="send-spinner"></div>
                        </button>
                    </div>
                </div>
            </footer>
        </div>

        <!-- 닫힌 상태: 플로팅 버튼 -->
        <button v-else class="fab-button" @click="openChat">
            <div class="fab-content">
                <svg class="fab-icon" viewBox="0 0 24 24" fill="none">
                    <!-- 말풍선 -->
                    <path
                        d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                        fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <!-- 점 3개 -->
                    <circle cx="8" cy="12" r="1.3" fill="#64748b" />
                    <circle cx="12" cy="12" r="1.3" fill="#64748b" />
                    <circle cx="16" cy="12" r="1.3" fill="#64748b" />
                </svg>
            </div>
            <span class="fab-pulse"></span>
            <span class="fab-tooltip">무엇이든 물어보세요</span>
        </button>
    </div>
</template>

<script setup>
import { ref, reactive, nextTick, computed, onMounted, onUnmounted, watch } from 'vue'
import { chatAPI } from '@/api/chat'
import { useAuthStore } from '@/stores/auth'
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js'

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend
)

const authStore = useAuthStore()
const isOpen = ref(false)
const inputText = ref('')
const isLoading = ref(false)
const isComposing = ref(false)
const chatBody = ref(null)
const inputRef = ref(null)
const messages = reactive([])
const currentSessionId = ref(null)
const quickQuestions = ref([])
const isLoadingQuestions = ref(false)
const inputFocused = ref(false)
const showScrollButton = ref(false)
const copied = ref(false)

const getUserId = async () => {
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
        const userId = parseInt(storedUserId)
        if (userId > 0) return userId
    }

    if (authStore.isAuthenticated && authStore.user?.id && authStore.user.id !== 0) {
        return authStore.user.id
    }

    const storedUser = localStorage.getItem('user')
    if (storedUser) {
        try {
            const userObj = JSON.parse(storedUser)
            if (userObj?.id && userObj.id !== 0) return userObj.id
        } catch (error) {
            // 파싱 오류 무시
        }
    }

    const legacyUserId = localStorage.getItem('user_id')
    if (legacyUserId) {
        const userId = parseInt(legacyUserId)
        if (userId > 0) return userId
    }

    throw new Error('로그인이 필요합니다. 다시 로그인해주세요.')
}

const initializeChat = async () => {
    isLoadingQuestions.value = true
    try {
        const session = await chatAPI.createSession(await getUserId())
        currentSessionId.value = session.id

        const suggestions = await chatAPI.getSuggestions(session.id)

        quickQuestions.value = suggestions.suggestions.map((text) => ({
            title: text,
            query: text
        }))
    } catch (error) {
        quickQuestions.value = [
            { title: '오늘 브렌트유 가격은?', query: '오늘 브렌트유 가격 알려줘' },
            { title: '최근 유가 동향 분석', query: '최근 유가 동향을 분석해줘' },
            { title: '원유 시장 리스크 요인', query: '현재 원유 시장의 주요 리스크 요인은?' }
        ]
    } finally {
        isLoadingQuestions.value = false
    }
}

const openChat = async () => {
    try {
        await getUserId()
        isOpen.value = true
        if (!currentSessionId.value) {
            await initializeChat()
        }
        nextTick(() => {
            inputRef.value?.focus()
        })
    } catch (error) {
        alert(error.message || '채팅을 사용하려면 로그인이 필요합니다.')
    }
}

const closeChat = () => {
    isOpen.value = false
}

const clearChat = () => {
    if (confirm('대화 내용을 모두 삭제하시겠습니까?')) {
        messages.length = 0
        endSession()
        initializeChat()
    }
}

const handleRefresh = () => {
    if (messages.length > 0) {
        // 메시지가 있으면 초기화
        clearChat()
    } else {
        // 메시지가 없으면 추천 질문 새로고침
        initializeChat()
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
            chatBody.value.scrollTo({
                top: chatBody.value.scrollHeight,
                behavior: 'smooth'
            })
        }
    })
}

const handleScroll = () => {
    if (chatBody.value) {
        const { scrollTop, scrollHeight, clientHeight } = chatBody.value
        showScrollButton.value = scrollHeight - scrollTop - clientHeight > 100
    }
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

const copyMessage = async (html) => {
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
    try {
        await navigator.clipboard.writeText(text)
        copied.value = true
        setTimeout(() => { copied.value = false }, 2000)
    } catch (err) {
        // 복사 실패 무시
    }
}

const delay = (ms) => new Promise(r => setTimeout(r, ms))

const separateTextAndChart = (message) => {
    const decoded = message.replace(/&quot;/g, '"')
    const jsonStart = decoded.indexOf('{"chartType"')

    if (jsonStart === -1) {
        return { text: message, chart: null }
    }

    const text = message.substring(0, jsonStart).trim()
    const jsonStr = decoded.substring(jsonStart)
    let chart = null

    try {
        chart = JSON.parse(jsonStr)
    } catch (error) {
        // JSON 파싱 실패 무시
    }

    return { text, chart }
}

const renderChart = (canvas, chartData) => {
    if (!canvas || !chartData) return

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: chartData.datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: chartData.title },
                legend: { display: true }
            },
            scales: {
                y: {
                    title: {
                        display: !!chartData.yAxisLabel,
                        text: chartData.yAxisLabel || ''
                    }
                }
            }
        }
    })
}

const formatResponse = (text) => {
    let processed = text.replace(/(\d+)\.(\d+)/g, '$1__DECIMAL__$2')

    processed = processed
        .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\|([^|\n]+)\|([^|\n]+)\|([^|\n]*)/g, (match, col1, col2, col3) => {
            const cells = [col1, col2, col3].filter(cell => cell && cell.trim())
            if (cells.length >= 2) {
                return `<div class="data-row"><span class="label">${col1.trim()}</span><span class="value">${col2.trim()}</span>${col3 ? `<span class="change">${col3.trim()}</span>` : ''}</div>`
            }
            return match
        })
        .replace(/([\w\s가-힣]+):\s*\$([\d,\.]+)\s*\(([+-][\d\.%]+)\)/g, '<div class="price-row"><span class="label">$1</span><span class="price">$$$2</span><span class="change $3">$3</span></div>')
        .replace(/^(\d{1,2})\.\s+(.+)$/gm, '<div class="list-item"><span class="num">$1</span><span class="text">$2</span></div>')
        .replace(/^(\d{1,2})\s*\n+([^\d\n].+)$/gm, '<div class="list-item"><span class="num">$1</span><span class="text">$2</span></div>')
        .replace(/^[-•]\s+(.+)$/gm, '<div class="bullet-item"><span class="dot"></span><span>$1</span></div>')
        // 콤마가 포함된 숫자도 처리 (예: 425,691 배럴)
        .replace(/(\d{1,3}(?:,\d{3})*(?:__DECIMAL__\d+)?)\s*(USD|b\/d|만\s*배럴|배럴|%|달러)/g, '<span class="highlight-num">$1 $2</span>')
        .replace(/\n\n+/g, '</p><p>')
        .replace(/\n/g, ' ')
        .replace(/<p>\s*<\/p>/g, '')

    processed = processed.replace(/__DECIMAL__/g, '.')

    return `<p>${processed}</p>`
}

const typeWriter = async (msg, fullText) => {
    const formattedText = formatResponse(fullText)
    msg.answer = ''

    let currentIndex = 0
    const textLength = formattedText.length

    while (currentIndex <= textLength) {
        if (formattedText[currentIndex] === '<') {
            const tagEnd = formattedText.indexOf('>', currentIndex)
            if (tagEnd !== -1) {
                currentIndex = tagEnd + 1
                msg.answer = formattedText.slice(0, currentIndex)
                continue
            }
        }

        msg.answer = formattedText.slice(0, currentIndex)
        currentIndex++

        await delay(8)

        if (currentIndex % 15 === 0) {
            scrollToBottom()
        }
    }

    scrollToBottom()
}

const sendMessage = async (query) => {
    if (isLoading.value) return

    try {
        isLoading.value = true

        const msg = reactive({
            question: query,
            questionTime: getTime(),
            answer: '',
            answerTime: '',
            suggestions: [],
            status: 'thinking'
        })

        messages.push(msg)
        scrollToBottom()

        if (!currentSessionId.value) {
            await initializeChat()
        }

        await delay(800)
        msg.status = 'tool'
        msg.toolText = '시장 데이터 분석 중...'
        scrollToBottom()

        const response = await chatAPI.sendMessage(query, currentSessionId.value, await getUserId())

        msg.status = 'complete'
        msg.answerTime = getTime()

        const { text, chart } = separateTextAndChart(response.message)

        await typeWriter(msg, text)

        if (chart) {
            msg.chartData = chart
            nextTick(() => {
                const canvas = document.querySelector(`#chart-${messages.length - 1}`)
                if (canvas) {
                    renderChart(canvas, chart)
                }
            })
        }

        msg.suggestions = response.suggestions || []

    } catch (error) {
        if (error.message === '로그인이 필요합니다.') {
            alert('로그인이 필요합니다.')
            return
        }

        const msg = messages[messages.length - 1]
        if (msg) {
            msg.status = 'complete'
            msg.answerTime = getTime()
            await typeWriter(msg, '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해 주세요.')
            msg.suggestions = []
        }
    } finally {
        isLoading.value = false
        scrollToBottom()
    }
}

const endSession = async () => {
    if (currentSessionId.value) {
        try {
            await chatAPI.endSession(currentSessionId.value)
        } catch (error) {
            // 세션 종료 실패 무시
        }
        currentSessionId.value = null
    }
}

const preloadChatData = async () => {
    try {
        const session = await chatAPI.createSession(await getUserId())
        currentSessionId.value = session.id

        const suggestions = await chatAPI.getSuggestions(session.id)

        quickQuestions.value = suggestions.suggestions.map((text) => ({
            title: text,
            query: text
        }))
    } catch (error) {
        // 미리 로드 실패 무시
    }
}

defineExpose({ preloadChatData })

onMounted(() => {
    // 스크롤 이벤트 리스너
})

watch(chatBody, (el) => {
    if (el) {
        el.addEventListener('scroll', handleScroll)
    }
}, { immediate: true })

onUnmounted(() => {
    if (chatBody.value) {
        chatBody.value.removeEventListener('scroll', handleScroll)
    }
})
</script>

<style scoped>
/* ===== 기본 컨테이너 ===== */
.chatbot {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 9999;
}

.chatbot.open {
    width: 420px;
    height: min(740px, calc(100vh - 48px));
}

@media (max-width: 480px) {
    .chatbot.open {
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
    }
}

/* ===== 채팅 컨테이너 ===== */
.chat-container {
    width: 100%;
    height: 100%;
    background: #ffffff;
    border-radius: 24px;
    box-shadow:
        0 0 0 1px rgba(0, 0, 0, 0.04),
        0 24px 48px -12px rgba(0, 0, 0, 0.18);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.96);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@media (max-width: 480px) {
    .chat-container {
        border-radius: 0;
    }
}

/* ===== 헤더 ===== */
.chat-header {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.bot-logo {
    position: relative;
    width: 44px;
    height: 44px;
}

.logo-inner {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 8px rgba(234, 88, 12, 0.35);
}

.logo-inner:hover {
    transform: scale(1.05);
}

.message-icon {
    width: 28px;
    height: 28px;
}

.header-info h1 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #000000;
}

.status-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
}

.status-dot {
    width: 6px;
    height: 6px;
    background: #19d328;
    border-radius: 50%;
}

.status-row span {
    font-size: 12px;
    font-weight: 500;
    color: #000000;
}

.header-actions {
    display: flex;
    gap: 8px;
}

.action-btn,
.close-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: #f1f5f9;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    transition: all 0.2s ease;
}

.action-btn:hover,
.close-btn:hover {
    background: #e2e8f0;
    color: #0f172a;
    transform: rotate(90deg);
}


.action-btn svg,
.close-btn svg {
    width: 18px;
    height: 18px;
}

/* ===== 채팅 본문 ===== */
.chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #f8fafc;
    position: relative;
}

.chat-body::-webkit-scrollbar {
    width: 6px;
}

.chat-body::-webkit-scrollbar-track {
    background: transparent;
}

.chat-body::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 3px;
}

/* ===== 웰컴 화면 ===== */
.welcome-screen {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.welcome-hero {
    text-align: center;
    padding: 24px 16px;
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.welcome-hero h2 {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
}

.welcome-hero p {
    margin: 0;
    font-size: 14px;
    color: #64748b;
    line-height: 1.6;
}

.welcome-hero strong {
    color: #ea580c;
}

/* 추천 질문 섹션 */
.quick-section {
    background: #ffffff;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: #64748b;
}

.section-header svg {
    width: 16px;
    height: 16px;
}

.section-header span {
    font-size: 13px;
    font-weight: 600;
}

/* 추천 질문 로딩 */
.quick-loading {
    padding: 40px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loading-spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.loading-spinner-container span {
    font-size: 13px;
    color: #64748b;
}

.loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f1f5f9;
    border-top-color: #ea580c;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.quick-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.quick-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
}

.quick-card:hover {
    background: #fff7ed;
    border-color: #fed7aa;
    transform: translateX(4px);
}

.card-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #ea580c 0%, #ea580c 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
}

.card-icon svg {
    width: 18px;
    height: 18px;
}

.card-text {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
}

.card-arrow {
    width: 16px;
    height: 16px;
    color: #94a3b8;
    flex-shrink: 0;
    transition: transform 0.2s;
}

.quick-card:hover .card-arrow {
    color: #ea580c;
    transform: translateX(4px);
}

/* 기능 목록 */
.capabilities {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
}

.cap-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #64748b;
}

.cap-item svg {
    width: 14px;
    height: 14px;
    color: #ea580c;
}

/* ===== 날짜 배지 ===== */
.date-badge {
    text-align: center;
    margin-bottom: 20px;
}

.date-badge span {
    display: inline-block;
    padding: 6px 14px;
    background: #ffffff;
    border-radius: 20px;
    font-size: 12px;
    color: #64748b;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* ===== 메시지 블록 ===== */
.message-block {
    margin-bottom: 24px;
    animation: fadeInUp 0.3s ease forwards;
    animation-delay: var(--delay);
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 사용자 메시지 */
.user-message {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-bottom: 16px;
}

.message-content.user {
    max-width: 85%;
    padding: 14px 18px;
    background: linear-gradient(135deg, #ea580c 0%, #ea580c 100%);
    color: #ffffff;
    border-radius: 20px 20px 6px 20px;
    font-size: 14px;
    line-height: 1.5;
    box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
}

.message-content.user p {
    margin: 0;
}

.user-message time {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 6px;
}

/* AI 메시지 */
.ai-message {
    display: flex;
    gap: 12px;
}

.ai-avatar {
    width: 36px;
    height: 36px;
    background: transparent;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.message-mini {
    width: 36px;
    height: 36px;
    filter: drop-shadow(0 2px 4px rgba(234, 88, 12, 0.25));
}

.ai-content {
    flex: 1;
    min-width: 0;
}

/* 생각중 인디케이터 */
.thinking-indicator {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    background: #ffffff;
    border-radius: 6px 20px 20px 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.thinking-dots {
    display: flex;
    gap: 4px;
}

.thinking-dots span {
    width: 8px;
    height: 8px;
    background: #ea580c;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
}

.thinking-dots span:nth-child(1) {
    animation-delay: -0.32s;
}

.thinking-dots span:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0.6);
        opacity: 0.5;
    }

    40% {
        transform: scale(1);
        opacity: 1;
    }
}

.thinking-text {
    font-size: 13px;
    color: #64748b;
}

/* 분석중 인디케이터 */
.analyzing-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: #ffffff;
    border-radius: 6px 20px 20px 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.analyze-icon {
    width: 32px;
    height: 32px;
    background: #fff7ed;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ea580c;
    animation: pulse 2s infinite;
}

.analyze-icon svg {
    width: 16px;
    height: 16px;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.analyze-info {
    flex: 1;
}

.analyze-title {
    display: block;
    font-size: 13px;
    color: #0f172a;
    margin-bottom: 6px;
}

.progress-bar {
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    width: 60%;
    background: linear-gradient(90deg, #ea580c, #ea580c);
    border-radius: 2px;
    animation: progress 1.5s ease-in-out infinite;
}

@keyframes progress {
    0% {
        width: 20%;
        margin-left: 0;
    }

    50% {
        width: 60%;
        margin-left: 20%;
    }

    100% {
        width: 20%;
        margin-left: 80%;
    }
}

/* AI 메시지 버블 */
.message-bubble.ai {
    background: #ffffff;
    padding: 16px 18px;
    border-radius: 6px 20px 20px 20px;
    font-size: 14px;
    line-height: 1.7;
    color: #0f172a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.message-bubble.ai :deep(p) {
    margin: 0 0 12px;
}

.message-bubble.ai :deep(p:last-child) {
    margin-bottom: 0;
}

.message-bubble.ai :deep(strong) {
    color: #0f172a;
    font-weight: 600;
}

.message-bubble.ai :deep(.list-item) {
    display: flex;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #f1f5f9;
}

.message-bubble.ai :deep(.list-item:last-child) {
    border-bottom: none;
}

.message-bubble.ai :deep(.list-item .num) {
    width: 24px;
    height: 24px;
    background: #ea580c;
    color: white;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
}

.message-bubble.ai :deep(.list-item .text) {
    flex: 1;
    padding-top: 2px;
}

.message-bubble.ai :deep(.bullet-item) {
    display: flex;
    gap: 10px;
    padding: 6px 0;
}

.message-bubble.ai :deep(.bullet-item .dot) {
    width: 6px;
    height: 6px;
    background: #ea580c;
    border-radius: 50%;
    margin-top: 7px;
    flex-shrink: 0;
}

.message-bubble.ai :deep(.highlight-num) {
    font-weight: 600;
    color: #ea580c;
}

.message-bubble.ai :deep(.data-row),
.message-bubble.ai :deep(.price-row) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8fafc;
    border-radius: 8px;
    margin: 8px 0;
}

.message-bubble.ai :deep(.data-row .label),
.message-bubble.ai :deep(.price-row .label) {
    color: #64748b;
    font-size: 13px;
}

.message-bubble.ai :deep(.data-row .value),
.message-bubble.ai :deep(.price-row .price) {
    font-weight: 600;
    color: #0f172a;
}

/* 차트 래퍼 */
.chart-wrapper {
    margin-top: 12px;
    padding: 16px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

/* 메시지 액션 */
.message-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
}

.message-actions time {
    font-size: 11px;
    color: #94a3b8;
}

.copy-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: #f1f5f9;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    transition: all 0.2s;
}

.copy-btn:hover {
    background: #e2e8f0;
    color: #0f172a;
}

.copy-btn svg {
    width: 14px;
    height: 14px;
}

/* 후속 질문 */
.follow-up {
    margin-top: 14px;
}

.follow-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 8px;
}

.follow-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.follow-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
}

.follow-btn:hover {
    background: #fff7ed;
    border-color: #fed7aa;
}

.follow-btn span:first-child {
    font-size: 13px;
    color: #0f172a;
}

.follow-btn svg {
    width: 14px;
    height: 14px;
    color: #94a3b8;
    flex-shrink: 0;
}

.follow-btn:hover svg {
    color: #ea580c;
}

/* 스크롤 버튼 */
.scroll-bottom-btn {
    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    width: 40px;
    height: 40px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
}

.scroll-bottom-btn:hover {
    background: #f8fafc;
    color: #0f172a;
}

.scroll-bottom-btn svg {
    width: 18px;
    height: 18px;
}

/* ===== 푸터/입력 ===== */
.chat-footer {
    padding: 16px 20px 20px;
    background: #ffffff;
    border-top: 1px solid #f1f5f9;
}

.input-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.input-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f1f5f9;
    border: 2px solid transparent;
    border-radius: 16px;
    padding: 6px 6px 6px 18px;
    transition: all 0.2s;
}

.input-wrapper.focused {
    background: #ffffff;
    border-color: #ea580c;
    box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.1);
}

.input-wrapper.disabled {
    opacity: 0.7;
}

.input-wrapper input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: #0f172a;
    padding: 10px 0;
}

.input-wrapper input::placeholder {
    color: #94a3b8;
}

.send-button {
    width: 44px;
    height: 44px;
    border: none;
    background: #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s;
}

.send-button.active {
    background: linear-gradient(135deg, #ea580c 0%, #ea580c 100%);
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
}

.send-button.active:hover {
    transform: scale(1.05);
}

.send-button:disabled {
    cursor: not-allowed;
}

.send-button svg {
    width: 18px;
    height: 18px;
}

.send-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

/* ===== FAB 버튼 ===== */
.fab-button {
    width: 64px;
    height: 64px;
    border: none;
    background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
    border-radius: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow:
        0 8px 24px rgba(234, 88, 12, 0.4),
        0 4px 8px rgba(234, 88, 12, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-button:hover {
    transform: scale(1.08) translateY(-2px);
    box-shadow:
        0 12px 32px rgba(234, 88, 12, 0.45),
        0 6px 12px rgba(234, 88, 12, 0.25);
}

.fab-button:hover .fab-tooltip {
    opacity: 1;
    transform: translateX(0);
    visibility: visible;
}

.fab-tooltip {
    position: absolute;
    right: calc(100% + 12px);
    top: 20%;
    transform: translateX(10px) translateY(-50%);
    background: rgb(255, 255, 255, 0.5);
    color: #000000;
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    pointer-events: none;
}


.fab-content {
    display: flex;
    align-items: center;
    justify-content: center;
}

.fab-icon {
    width: 32px;
    height: 32px;
}

.fab-pulse {
    position: absolute;
    inset: 0;
    border-radius: 18px;
    background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
    animation: fabPulse 2s infinite;
    z-index: -1;
}

@keyframes fabPulse {
    0% {
        transform: scale(1);
        opacity: 0.5;
    }

    100% {
        transform: scale(1.4);
        opacity: 0;
    }
}

/* ===== 트랜지션 ===== */
.message-enter-active {
    transition: all 0.3s ease;
}

.message-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
