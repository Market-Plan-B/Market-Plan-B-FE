<template>
    <div class="chatbot" :class="{ open: isOpen }" :style="chatStyle">
        <header v-if="isOpen" class="header">
            <div class="header-left">
                <div class="avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="15" rx="4" ry="4" />
                        <path d="M5 18l-2 3v-5h2z" fill="currentColor" />
                        <line x1="8" y1="9" x2="16" y2="9" />
                        <line x1="8" y1="13" x2="14" y2="13" />
                    </svg>
                </div>
                <div class="header-text">
                    <h1>Oil Market AI</h1>
                    <span>Marimo</span>
                </div>
            </div>
            <button class="close-btn" @click="closeChat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
        </header>

        <main v-if="isOpen" class="body" ref="chatBody">
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
                <div class="date-divider"><span>{{ todayDate }}</span></div>
                <div v-for="(msg, i) in messages" :key="i" class="message-group">
                    <div class="user-row">
                        <div class="user-bubble">{{ msg.question }}</div>
                        <time>{{ msg.questionTime }}</time>
                    </div>
                    <div class="bot-row">
                        <div class="bot-avatar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="18" height="15" rx="4" ry="4" />
                                <path d="M5 18l-2 3v-5h2z" fill="currentColor" />
                                <line x1="8" y1="9" x2="16" y2="9" />
                                <line x1="8" y1="13" x2="14" y2="13" />
                            </svg>
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
                                <div v-if="msg.chartData" class="chart-container">
                                    <canvas :id="`chart-${i}`"></canvas>
                                </div>
                                <time>Marimo {{ msg.answerTime }}</time>
                                <div v-if="msg.suggestions?.length" class="suggestions">
                                    <span class="suggest-label">다음 분석 추천</span>
                                    <div class="suggest-list">
                                        <button v-for="(s, si) in msg.suggestions" :key="si" class="suggest-btn"
                                            @click="sendMessage(s)">
                                            <span class="suggest-dot"></span>
                                            <span>{{ s }}</span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

        <footer v-if="isOpen" class="footer">
            <div class="input-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                <input v-model="inputText" @keydown.enter="handleEnter" @compositionstart="isComposing = true"
                    @compositionend="isComposing = false" placeholder="궁금한 것이 있으시면 언제든 물어보세요!" :disabled="isLoading" />
                <button class="send-btn" @click="handleSend" :disabled="!inputText.trim() || isLoading">
                    <svg v-if="!isLoading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m22 2-7 20-4-9-9-4z" />
                        <path d="M22 2 11 13" />
                    </svg>
                    <span v-else class="spinner"></span>
                </button>
            </div>
        </footer>

        <button v-if="!isOpen" class="fab-trigger" @click="openChat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="15" rx="4" ry="4" />
                <path d="M5 18l-2 3v-5h2z" fill="currentColor" />
                <line x1="8" y1="9" x2="16" y2="9" />
                <line x1="8" y1="13" x2="14" y2="13" />
            </svg>
        </button>
    </div>
</template>

<script setup>
import { ref, reactive, nextTick, computed, onMounted } from 'vue'
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
const messages = reactive([])
const currentSessionId = ref(null)
const quickQuestions = ref([])

const getUserId = async () => {
    // 1순위: localStorage userId (백엔드에서 직접 받은 값)
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
        const userId = parseInt(storedUserId)
        if (userId > 0) {
            console.log('[LOG] localStorage userId 사용:', userId)
            return userId
        }
    }
    
    // 2순위: authStore에서 가져오기 (id가 0이 아닌 경우)
    if (authStore.isAuthenticated && authStore.user?.id && authStore.user.id !== 0) {
        console.log('[LOG] authStore.user.id 사용:', authStore.user.id)
        return authStore.user.id
    }
    
    // 3순위: localStorage user 객체에서 가져오기 (id가 0이 아닌 경우)
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
        try {
            const userObj = JSON.parse(storedUser)
            if (userObj?.id && userObj.id !== 0) {
                console.log('[LOG] localStorage user.id 사용:', userObj.id)
                return userObj.id
            }
        } catch (error) {
            console.error('localStorage user 파싱 오류:', error)
        }
    }
    
    // 4순위: localStorage user_id 직접 가져오기 (호환성)
    const legacyUserId = localStorage.getItem('user_id')
    if (legacyUserId) {
        const userId = parseInt(legacyUserId)
        if (userId > 0) {
            console.log('[LOG] localStorage user_id 사용:', userId)
            return userId
        }
    }
    
    console.error('[ERROR] 모든 방법에서 사용자 ID를 찾을 수 없음')
    throw new Error('로그인이 필요합니다. 다시 로그인해주세요.')
}

const initializeChat = async () => {
    try {
        console.log('[LOG] 새 세션 생성')
        const session = await chatAPI.createSession(await getUserId())
        currentSessionId.value = session.id
        
        const suggestions = await chatAPI.getSuggestions(session.id)
        
        quickQuestions.value = suggestions.suggestions.map((text, index) => ({
            title: text,
            desc: '유가 및 원유 시장 분석',
            query: text
        }))
    } catch (error) {
        console.error('채팅 초기화 실패:', error)
        quickQuestions.value = []
    }
}

const openChat = async () => {
    try {
        // 로그인 체크
        await getUserId() // 이 함수가 에러를 던지면 로그인이 안된 것
        
        isOpen.value = true
        if (!currentSessionId.value) {
            await initializeChat()
        }
    } catch (error) {
        console.error('채팅 열기 실패:', error)
        alert(error.message || '채팅을 사용하려면 로그인이 필요합니다.')
    }
}

const chatStyle = computed(() => ({
    '--size': isOpen.value ? '420px' : '60px',
    '--height': isOpen.value ? 'min(720px, calc(100vh - 48px))' : '60px',
    '--radius': isOpen.value ? '24px' : '20px'
}))

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
        chatBody.value?.scrollTo({ top: chatBody.value.scrollHeight, behavior: 'smooth' })
    })
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

const delay = (ms) => new Promise(r => setTimeout(r, ms))

// Chart.js 데이터 파싱
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
    console.error('JSON 파싱 실패:', error)
  }
  
  return { text, chart }
}

// 차트 렌더링 (라인 차트만 지원)
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
        title: {
          display: true,
          text: chartData.title
        },
        legend: {
          display: true
        }
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
    return text
        // 요약 섹션
        .replace(/-요약-\s*/g, '<div class="summary-section"><div class="section-header"><span class="icon">📋</span><h3>요약</h3></div>')
        .replace(/(?<=<\/h3><\/div>)([^<]+?)(?=\s*\d+\.)/g, '<div class="section-content">$1</div></div>')
        
        // 섹션 헤더 (강조된 제목)
        .replace(/\*\*([^주요|최신|현재|분석|전망|영향|요인|상황|현황|정책|결정|수준|동향|전망|전략|전망|전망|전망]+?)\*\*/g, '<div class="section-title"><span class="title-icon">📈</span>$1</div>')
        
        // 표 처리 (| 로 구분된 데이터)
        .replace(/\|([^|\n]+)\|([^|\n]+)\|([^|\n]*)/g, (match, col1, col2, col3) => {
            const cells = [col1, col2, col3].filter(cell => cell && cell.trim())
            if (cells.length >= 2) {
                return `<div class="data-row"><span class="data-label">${col1.trim()}</span><span class="data-value">${col2.trim()}</span>${col3 ? `<span class="data-change">${col3.trim()}</span>` : ''}</div>`
            }
            return match
        })
        
        // 가격 데이터 (숫자: $숫자 형태)
        .replace(/([\w\s가-힣]+):\s*\$([\d,\.]+)\s*\(([+-][\d\.%]+)\)/g, '<div class="price-item"><span class="price-label">$1</span><span class="price-value">$$$2</span><span class="price-change $3">$3</span></div>')
        
        // 번호 목록 (줄바꿈 제거)
        .replace(/(\d+)\s*[\r\n]+\s*([^\r\n]+)/g, '$1. $2')
        .replace(/(\d+)\s*\n+\s*([^\n]+)/g, '$1. $2')
        .replace(/(\d+)\s+([^\d\n][^\n]*)/g, '$1. $2')
        .replace(/(\d+)\. ([^\n]+)/g, '<div class="numbered-item"><span class="number">$1</span><span class="content"><strong>$2</strong></span></div>')
        
        // 불릿 포인트
        .replace(/^[-•]\s+(.+)$/gm, '<div class="bullet-item"><span class="bullet">•</span><span class="bullet-text">$1</span></div>')
        
        // 강조 텍스트
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="highlight">$1</strong>')
        .replace(/__([^_]+)__/g, '<strong class="highlight">$1</strong>')
        
        // 숫자 강조 (단위 포함)
        .replace(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(b\/d|\ub9cc\s*배럴|배럴|%|달러)/g, '<span class="number-highlight">$1 $2</span>')
        
        // 줄바꿈 처리
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        
        // 문단 태그
        .replace(/^(?!<div|<h\d|<span)(.+?)(?=<div|<h\d|$)/gm, '<p>$1</p>')
        
        // 빈 태그 제거
        .replace(/<p>\s*<\/p>/g, '')
        .replace(/<div class="section-content">\s*<\/div>/g, '')
}

const typeWriter = async (msg, fullText) => {
    const formattedText = formatResponse(fullText)
    msg.answer = ''
    
    // HTML 태그를 고려한 안전한 타이핑
    let currentIndex = 0
    const textLength = formattedText.length
    
    while (currentIndex <= textLength) {
        // HTML 태그 내부에서는 빠르게 진행
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
        
        // 더 빠른 타이핑
        await delay(15)
        
        // 스크롤을 덜 빈번히 호출
        if (currentIndex % 10 === 0) {
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

        msg.status = 'tool'
        msg.toolText = '시장 데이터 분석 중...'
        await delay(1000)

        const response = await chatAPI.sendMessage(query, currentSessionId.value, await getUserId())
        
        msg.status = 'complete'
        msg.answerTime = getTime()
        
        // 텍스트와 차트 분리
        const { text, chart } = separateTextAndChart(response.message)
        
        await typeWriter(msg, text)
        
        // 차트 렌더링
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
        console.error('메시지 전송 실패:', error)
        
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
            console.error('세션 종료 실패:', error)
        }
        currentSessionId.value = null
    }
}

const closeChat = () => {
    isOpen.value = false
    endSession()
}

// 대시보드에서 미리 세션과 추천 질문 로드
const preloadChatData = async () => {
    try {
        console.log('[LOG] 채팅 데이터 미리 로드 시작')
        const session = await chatAPI.createSession(await getUserId())
        currentSessionId.value = session.id
        
        const suggestions = await chatAPI.getSuggestions(session.id)
        
        quickQuestions.value = suggestions.suggestions.map((text, index) => ({
            title: text,
            desc: '유가 및 원유 시장 분석',
            query: text
        }))
        
        console.log('[LOG] 채팅 데이터 미리 로드 완료')
    } catch (error) {
        console.error('[LOG] 채팅 데이터 미리 로드 실패:', error)
    }
}

// 전역에서 사용할 수 있도록 export
defineExpose({ preloadChatData })

onMounted(() => {
    // 컴포넌트 마운트 시 초기화는 하지 않고, 채팅 열 때만 초기화
})
</script>

<style scoped>
.chatbot {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 9999;
    width: var(--size);
    height: var(--height);
    background: #fff;
    border-radius: var(--radius);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.chatbot:not(.open) {
    background: #ea580c;
    box-shadow: 0 8px 32px rgba(255, 107, 53, 0.4);
    cursor: pointer;
}

.chatbot:not(.open):hover {
    transform: scale(1.05) translateY(-2px);
}

@media (max-width: 480px) {
    .chatbot.open {
        right: 12px;
        bottom: 12px;
        width: calc(100vw - 24px);
        height: calc(100vh - 24px);
        border-radius: 20px;
    }
}

.fab-trigger {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: transform 0.2s ease;
}

.fab-trigger:hover {
    transform: scale(1.1);
}

.fab-trigger svg {
    width: 28px;
    height: 28px;
}

.header {
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

.avatar {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ea580c;
    flex-shrink: 0;
}

.avatar svg {
    width: 100%;
    height: 100%;
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
    transition: all 0.2s;
}

.close-btn:hover {
    background: #e5e7eb;
    color: #1f2937;
}

.close-btn svg {
    width: 18px;
    height: 18px;
}

.body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    background: #fafbfc;
}

.body::-webkit-scrollbar {
    width: 6px;
}

.body::-webkit-scrollbar-thumb {
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
    transition: all 0.2s;
}

.quick-btn:hover {
    background: #f3f4f6;
    transform: translateX(4px);
}

.quick-num {
    width: 28px;
    height: 28px;
    background: #ea580c;
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
    color: #ea580c;
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
    background: #ea580c;
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
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ea580c;
}

.bot-avatar svg {
    width: 100%;
    height: 100%;
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
    transition: all 0.2s;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.suggest-btn:hover {
    background: #f9fafb;
    transform: translateX(4px);
}

.suggest-dot {
    width: 8px;
    height: 8px;
    background: #ea580c;
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
    color: #ea580c
}

.footer {
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
    background: #ea580c;
    border-radius: 50%;
    cursor: pointer;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s;
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