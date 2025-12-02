<template>
    <div class="wrap">
        <transition name="tip">
            <div v-if="hover" class="tip"> 원유 시장에 대해 궁금한 점을 물어보세요!</div>
        </transition>
        <div class="icon" @click="open = !open" @mouseenter="hover = true" @mouseleave="hover = false">
            <div class="icon-gradient">
                <div class="circle-design">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="6" fill="rgba(255,255,255,0.9)" class="ai-core-svg"/>
                        <circle cx="16" cy="16" r="10" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" fill="none" class="ai-ring-1"/>
                        <circle cx="16" cy="16" r="14" stroke="rgba(255,255,255,0.2)" stroke-width="1" fill="none" class="ai-ring-2"/>
                        <circle cx="16" cy="6" r="1.5" fill="rgba(255,255,255,0.8)" class="ai-dot ai-dot-1"/>
                        <circle cx="26" cy="16" r="1.5" fill="rgba(255,255,255,0.8)" class="ai-dot ai-dot-2"/>
                        <circle cx="16" cy="26" r="1.5" fill="rgba(255,255,255,0.8)" class="ai-dot ai-dot-3"/>
                        <circle cx="6" cy="16" r="1.5" fill="rgba(255,255,255,0.8)" class="ai-dot ai-dot-4"/>
                    </svg>
                </div>
            </div>
        </div>
    </div>
    <transition name="modal">
        <div v-if="open" class="modal-container">
            <div class="modal">
                <header>
                    <div class="header-content">
                        <div class="logo-area">
                            <div class="logo-icon">
                                <div class="ai-indicator">
                                    <div class="pulse-ring"></div>
                                    <div class="ai-core"></div>
                                </div>
                            </div>
                            <div class="logo-text">
                                <span class="title">Oil Market AI</span>
                                <span class="subtitle">어시스턴트 Marimo</span>
                            </div>
                        </div>
                        <button class="close-btn" @click="open = false">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </header>

                <main ref="mainRef">
                    <div class="welcome-section">
                        <div class="welcome-bubble">
                            <div class="welcome-text">
                                <h3> 안녕하세요!  </h3>
                                <p class="sub">원유 시장이 궁금하신가요? 실시간 유가부터 리스크 분석까지, 무엇이든 편하게 물어보세요!</p>
                            </div>
                        </div>
                        
                        <div class="auto-suggestions">
                            <div class="suggestion-header">
                                <div class="auto-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                                    </svg>
                                </div>
                                <span>이런 것들이 궁금하지 않으세요?</span>
                            </div>
                            <div class="daily-questions">
                                <button v-for="(q, i) in dailyQuestions" :key="i" @click="ask(q.text)" class="daily-question">
                                    <div class="question-number">{{ i + 1 }}</div>
                                    <div class="question-content">
                                        <div class="question-title">{{ q.title }}</div>
                                        <div class="question-desc">{{ q.desc }}</div>
                                    </div>
                                    <div class="question-arrow">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="m9 18 6-6-6-6"/>
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-if="msgs.length || loading || showThinking" class="chat-history">
                        <div class="date-separator">
                            <span class="date-text">{{ getCurrentDate() }}</span>
                        </div>
                        <div v-for="(m, i) in msgs" :key="i" class="msg-group">
                            <div class="user-msg-container">
                                <div class="user-bubble">{{ m.q }}</div>
                                <div class="msg-time">{{ m.userTime || m.time }}</div>
                            </div>

                            <div class="bot-msg-container">
                                <div class="bot-avatar">
                                    <div class="ai-avatar">
                                        <div class="avatar-ring"></div>
                                        <div class="avatar-core"></div>
                                    </div>
                                </div>
                                <div class="bot-content">
                                    <div class="bot-bubble" v-html="m.a"></div>
                                    <div class="msg-time">AI 분석 • {{ m.aiTime || m.time }}</div>
                                </div>
                            </div>

                            <div v-if="i === msgs.length - 1 && m.suggestions && !m.isTyping" class="suggestions-area">
                                <div class="suggest-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                                    </svg>
                                    <span>다음 분석 추천</span>
                                </div>
                                <div class="suggest-cards">
                                    <button v-for="(s, si) in m.suggestions" :key="si" @click="ask(s)" class="suggest-card">
                                        <div class="card-indicator"></div>
                                        <span class="card-text">{{ s }}</span>
                                        <div class="card-arrow">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="m9 18 6-6-6-6"/>
                                            </svg>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div v-if="showThinking" class="msg-group thinking-msg">
                            <div class="thinking-container">
                                <div class="thinking-item" :class="{ active: isThinking }">
                                    <div v-if="isThinking" class="loading-bar">
                                        <div class="loading-progress"></div>
                                    </div>
                                    <svg v-else class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="20,6 9,17 4,12"/>
                                    </svg>
                                    <span class="thinking-text">{{ getThinkingText() }}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div v-if="currentTool" class="msg-group tool-msg">
                            <div class="thinking-container">
                                <div class="tool-item">
                                    <component :is="currentTool.icon" class="tool-svg-icon" />
                                    <span class="tool-text">{{ currentTool.text }}</span>
                                    <div class="tool-loading-bar">
                                        <div class="tool-loading-progress"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer>
                    <div class="input-area">
                        <div class="input-container">
                            <div class="input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>
                                </svg>
                            </div>
                            <input 
                                v-model="input" 
                                @keydown.enter="handleEnter"
                                @compositionstart="composing = true"
                                @compositionend="composing = false"
                                placeholder="궁금한 것이 있으시면 언제든 물어보세요!"
                                :disabled="loading" 
                            />
                            <button class="send-btn" @click="submit" :disabled="!input.trim() || loading">
                                <svg v-if="!loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="m22 2-7 20-4-9-9-4z"/>
                                    <path d="M22 2 11 13"/>
                                </svg>
                                <div v-else class="spinner"></div>
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, reactive, nextTick, h } from "vue";

const open = ref(false);
const hover = ref(false);
const input = ref("");
const msgs = reactive([]);
const loading = ref(false);
const mainRef = ref(null);
const showThinking = ref(false);
const isThinking = ref(false);
const currentTool = ref(null);
const composing = ref(false);

const SearchIcon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '11', cy: '11', r: '8' }),
    h('path', { d: 'm21 21-4.35-4.35' })
]);

const DocumentIcon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' }),
    h('polyline', { points: '14,2 14,8 20,8' })
]);

const ChartIcon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M3 3v18h18' }),
    h('path', { d: 'm19 9-5 5-4-4-3 3' })
]);

const TrendIcon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('polyline', { points: '22,12 18,12 15,21 9,3 6,12 2,12' })
]);

const aiTools = {
    webSearch: { icon: SearchIcon, text: '웹 검색 중...' },
    reportAnalysis: { icon: DocumentIcon, text: '보고서 탐색 중...' },
    dataAnalysis: { icon: ChartIcon, text: '데이터 분석 중...' },
    marketResearch: { icon: TrendIcon, text: '시장 조사 중...' }
};

const getThinkingText = () => {
    if (isThinking.value) return '생각중...';
    if (currentTool.value) return '생각중...';
    return '생각 완료';
};

const webSearchKeywords = ['최신', '실시간', '오늘', '뉴스', '검색', '찾아줘', '알아봐'];

const simulateWebSearch = async (query) => {
    return {
        answer: `🔍 웹 검색 결과: "${query}"

검색된 최신 정보:
- 실시간 데이터 수집 완료
- 관련 뉴스 3건 발견
- 시장 분석 보고서 2건 확인

주요 내용:
- 최신 시장 동향 반영
- 실시간 가격 정보 업데이트
- 전문가 의견 종합 분석

※ 이는 웹 검색 기능 테스트용 시뮬레이션입니다.`,
        suggestions: ["더 자세한 분석", "관련 뉴스 보기", "시장 전망"]
    };
};

const dailyQuestions = [
    { 
        title: "현재 유가 동향은?", 
        desc: "브렌트유, WTI, 두바이유 실시간 가격 및 변동 요인",
        text: "현재 유가 동향"
    },
    { 
        title: "OPEC+ 감산 현황은?", 
        desc: "최신 감산 결정과 회원국별 이행률 분석",
        text: "OPEC+ 감산 현황"
    },
    { 
        title: "미국 셰일 생산량은?", 
        desc: "미국 원유 생산량과 시추 활동 현황",
        text: "미국 셰일 생산량"
    }
];

const answerDatabase = {
    "현재 유가 동향": {
        answer: `2024년 12월 26일 국제 유가 현황

주요 유종별 가격:
- 브렌트유: $73.04 (-0.8%)
- WTI: $69.38 (-1.2%)
- 두바이유: $72.15 (-0.9%)

하락 요인:
- 중국 경제 성장률 둔화 우려 (GDP 4.8%)
- 미국 원유 재고 320만 배럴 증가
- 달러 강세로 인한 원자재 가격 압박
- 겨울철 따뜻한 날씨로 난방유 수요 감소

상승 요인:
- 러시아 정유시설 드론 공격
- 중동 지정학적 긴장 지속
- OPEC+ 감산 연장 가능성

시장 전망:
단기적으로는 중국 수요 둔화와 미국 재고 증가로 하방 압력이 지속될 것으로 예상되나, 지정학적 리스크와 OPEC+ 감산 정책이 가격 하락을 제한할 전망입니다.`,
        suggestions: ["중국 경제가 유가에 미치는 영향은?", "미국 원유 재고 증가 원인은?", "내년 유가 전망은?"]
    },
    "OPEC+ 감산 현황": {
        answer: `OPEC+ 감산 정책 현황

현재 감산 규모:
- 총 감산량: 일 366만 배럴
- 자발적 감산: 일 220만 배럴 (2024년 말까지)
- 기본 감산: 일 146만 배럴

주요 국가별 감산량:
사우디아라비아: 100만 b/d
러시아: 50만 b/d
이라크: 22만 b/d
UAE: 16만 b/d

이행률 현황:
- 전체 이행률: 89%
- 사우디: 100% (완전 이행)
- 러시아: 95%
- 이라크: 78% (미달)

2025년 전망:
- 1분기: 현재 감산 유지 가능성 높음
- 2분기: 점진적 증산 검토
- 목표 유가: 브렌트유 $80-85/배럴`,
        suggestions: ["이행률이 낮은 이유는?", "감산 연장 가능성은?", "비OPEC 국가 영향은?"]
    },
    "미국 셰일 생산량": {
        answer: `미국 원유 생산 현황

생산량 통계:
- 현재 생산량: 일 1,320만 배럴
- 전년 대비: +2.1% 증가
- 셰일 비중: 약 65% (860만 b/d)

주요 셰일 지역별 생산량:
퍼미안 분지: 610만 b/d
이글 포드: 110만 b/d
바켄: 85만 b/d
나이오브라라: 55만 b/d

시추 활동 현황:
- 활성 시추 리그: 622기 (전주 대비 +3)
- 신규 시추 허가: 월 평균 450건
- 완성 대기 유정: 4,200개

2025년 전망:
- 예상 증산량: 일 50-80만 배럴
- 투자 증가율: +12%
- 기술 발전으로 생산 효율성 개선
- 환경 규제 강화로 일부 제약

경제성 분석:
- 손익분기점: WTI $45-55/배럴
- 현재 수익성: 양호 (마진 25-30%)
- 운송비 절감으로 경쟁력 강화`,
        suggestions: ["셰일 기술 발전 현황은?", "환경 규제 영향은?", "수출량 현황은?"]
    }
};

const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const getCurrentDate = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const weekday = weekdays[now.getDay()];
    return `${month}월 ${day}일 ${weekday}`;
};

const formatAnswer = (text) => {
    return text
        .replace(/\n/g, '<br>')
        .replace(/<strong>/g, '<strong class="highlight">')
        .replace(/<small>/g, '<small class="small-text">');
};

const scrollToBottom = () => {
    nextTick(() => {
        if (mainRef.value) {
            mainRef.value.scrollTop = mainRef.value.scrollHeight;
        }
    });
};

const typeWriter = (text, msgIndex, speed = 30) => {
    let currentIndex = 0;
    
    const type = () => {
        if (!msgs[msgIndex]) return;
        
        if (currentIndex <= text.length) {
            const displayText = text.substring(0, currentIndex);
            msgs[msgIndex].a = formatAnswer(displayText);
            scrollToBottom();
            currentIndex++;
            
            if (currentIndex <= text.length) {
                setTimeout(type, speed);
            } else {
                msgs[msgIndex].isTyping = false;
            }
        }
    };
    
    type();
};

const handleEnter = (e) => {
    if (composing.value) {
        return;
    }
    e.preventDefault();
    submit();
};

const ask = async (q) => {
    const question = typeof q === 'string' ? q : q.text;
    if (loading.value) return;

    const userTime = getCurrentTime();
    loading.value = true;
    
    showThinking.value = true;
    isThinking.value = true;
    
    try {
        const needsWebSearch = webSearchKeywords.some(keyword => 
            question.toLowerCase().includes(keyword)
        );
        
        let response;
        
        if (needsWebSearch) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            isThinking.value = false;
            
            currentTool.value = aiTools.webSearch;
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            currentTool.value = null;
            response = await simulateWebSearch(question);
        } else {
            await new Promise(resolve => setTimeout(resolve, 2000));
            isThinking.value = false;
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            response = answerDatabase[question] || {
                answer: `죄송합니다. 해당 질문에 대한 정보가 아직 준비되지 않았습니다.`,
                suggestions: ["현재 유가 동향", "OPEC+ 감산 현황", "미국 셰일 생산량"]
            };
        }
        
        const aiTime = getCurrentTime();
        const newMsg = reactive({
            q: question,
            a: '',
            suggestions: response.suggestions,
            userTime: userTime,
            aiTime: aiTime,
            isTyping: true
        });
        
        msgs.push(newMsg);
        loading.value = false;
        showThinking.value = false;
        
        const msgIndex = msgs.length - 1;
        typeWriter(response.answer, msgIndex, 30);
        
        scrollToBottom();
    } catch (error) {
        console.error('챗봇 응답 오류:', error);
        loading.value = false;
        showThinking.value = false;
        isThinking.value = false;
        currentTool.value = null;
    }
};

const submit = () => {
    const fullQuestion = input.value;
    
    if (!fullQuestion.trim() || loading.value) return;
    
    const question = fullQuestion.trim();
    input.value = "";
    ask(question);
};
</script>

<style scoped>
* {
    box-sizing: border-box;
}

.wrap {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12px;
}

.tip {
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 12px;
    color: #1f2937;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.tip-enter-active,
.tip-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tip-enter-from,
.tip-leave-to {
    opacity: 0;
    transform: translateX(10px) scale(0.95);
}

.icon {
    width: 64px;
    height: 64px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}

.icon-gradient {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(255, 107, 53, 0.4), 0 4px 16px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
}

.icon-gradient::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%);
    border-radius: 24px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.circle-design {
    position: relative;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.circle-design svg {
    filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.3));
}

.ai-core-svg {
    animation: coreGlow 3s ease-in-out infinite;
}

.ai-ring-1 {
    animation: ringRotate 8s linear infinite;
    transform-origin: 16px 16px;
}

.ai-ring-2 {
    animation: ringRotate 12s linear infinite reverse;
    transform-origin: 16px 16px;
}

.ai-dot {
    animation: dotBreathe 2s ease-in-out infinite;
}

.ai-dot-1 { animation-delay: 0s; }
.ai-dot-2 { animation-delay: 0.5s; }
.ai-dot-3 { animation-delay: 1s; }
.ai-dot-4 { animation-delay: 1.5s; }

@keyframes coreGlow {
    0%, 100% { opacity: 0.9; }
    50% { opacity: 1; }
}

@keyframes ringRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes dotBreathe {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.3); }
}

.icon:hover {
    transform: scale(1.08) translateY(-4px);
}

.icon:hover .icon-gradient {
    background: linear-gradient(135deg, #ff8c42 0%, #ffa726 100%);
    box-shadow: 0 20px 60px rgba(255, 107, 53, 0.5), 0 8px 24px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
}

.icon:hover .icon-gradient::before {
    opacity: 1;
}

.icon:hover .ai-core-svg {
    animation-duration: 1.5s;
}

.icon:hover .ai-ring-1 {
    animation-duration: 4s;
    stroke: rgba(255, 255, 255, 0.8);
}

.icon:hover .ai-ring-2 {
    animation-duration: 6s;
    stroke: rgba(255, 255, 255, 0.5);
}

.icon:hover .ai-dot {
    animation-duration: 1s;
}

.icon:hover svg {
    filter: drop-shadow(0 4px 16px rgba(255, 255, 255, 0.6));
}

.modal-container {
    position: fixed;
    right: 100px;
    bottom: 100px;
    z-index: 9998;
}

.modal {
    width: 620px;
    height: 920px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(40px);
    border-radius: 28px;
    box-shadow: 0 32px 120px rgba(0, 0, 0, 0.12), 0 8px 32px rgba(102, 126, 234, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.3);
    position: relative;
}

.modal::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 107, 53, 0.3) 50%, transparent 100%);
    z-index: 1;
}

.modal-enter-active,
.modal-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from {
    opacity: 0;
    transform: scale(0.8) translateY(40px);
}

.modal-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
}

header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 24px 28px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo-area {
    display: flex;
    align-items: center;
    gap: 14px;
    z-index: 1;
}

.logo-icon {
    width: 44px;
    height: 44px;
    position: relative;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(15px);
}

.ai-indicator {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.pulse-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid #ff6b35;
    border-radius: 50%;
    animation: pulse 2s infinite;
    opacity: 0.6;
}

.ai-core {
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    border-radius: 50%;
    position: relative;
    box-shadow: 0 3px 12px rgba(255, 107, 53, 0.4);
}

@keyframes pulse {
    0% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.1); opacity: 0.3; }
    100% { transform: scale(1); opacity: 0.6; }
}

.logo-text {
    display: flex;
    flex-direction: column;
    z-index: 1;
}

.logo-text .title {
    font-size: 19px;
    font-weight: 700;
    color: #1f2937;
    line-height: 1.2;
}

.logo-text .subtitle {
    font-size: 13px;
    font-weight: 500;
    color: #6b7280;
    line-height: 1.2;
}

.close-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    color: #6b7280;
    backdrop-filter: blur(10px);
    z-index: 1;
}

.close-btn:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #1f2937;
    transform: scale(1.08) rotate(90deg);
}

.close-btn svg {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
}

main {
    flex: 1;
    overflow-y: auto;
    padding: 28px;
    scrollbar-width: none;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(248, 250, 252, 0.6) 100%);
    position: relative;
}

main::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(255, 107, 53, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(247, 147, 30, 0.03) 0%, transparent 50%);
    pointer-events: none;
}

main::-webkit-scrollbar {
    display: none;
}

.welcome-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.welcome-bubble {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(25px);
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: hidden;
}

.welcome-text h3 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
    line-height: 1.3;
}

.welcome-text .sub {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.5;
    margin: 0 0 12px;
}

.auto-suggestions {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(25px);
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

.suggestion-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.auto-icon {
    width: 22px;
    height: 22px;
    color: #ff6b35;
    filter: drop-shadow(0 1px 2px rgba(255, 107, 53, 0.3));
}

.daily-questions {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.daily-question {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: left;
    border: none;
}

.daily-question:hover {
    background: rgba(255, 255, 255, 0.98);
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.question-number {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    color: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.question-content {
    flex: 1;
}

.question-title {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
}

.question-desc {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.4;
}

.question-arrow {
    width: 20px;
    height: 20px;
    color: #9ca3af;
    flex-shrink: 0;
    transition: all 0.2s;
}

.daily-question:hover .question-arrow {
    color: #ff6b35;
    transform: translateX(3px) scale(1.1);
}

.chat-history {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.date-separator {
    display: flex;
    justify-content: center;
    margin: 16px 0;
}

.date-text {
    color: #9ca3af;
    font-size: 13px;
    font-weight: 500;
}

.thinking-container {
    display: flex;
    justify-content: flex-start;
    padding: 0;
    margin-left: 44px;
}

.thinking-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.thinking-item.active {
    animation: pulse-thinking 2s infinite;
}

.loading-bar {
    width: 16px;
    height: 3px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
}

.loading-progress {
    width: 100%;
    height: 100%;
    background: #9ca3af;
    border-radius: 2px;
    animation: loading-slide 1.5s ease-in-out infinite;
}

.check-icon {
    width: 16px;
    height: 16px;
    color: #9ca3af;
}

@keyframes loading-slide {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(0%); }
    100% { transform: translateX(100%); }
}

.tool-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.tool-svg-icon {
    width: 16px;
    height: 16px;
    color: #9ca3af;
    flex-shrink: 0;
}

.tool-text {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
    white-space: nowrap;
}

.tool-loading-bar {
    width: 20px;
    height: 2px;
    background: #e5e7eb;
    border-radius: 1px;
    overflow: hidden;
    margin-left: auto;
}

.tool-loading-progress {
    width: 100%;
    height: 100%;
    background: #3b82f6;
    border-radius: 1px;
    animation: loading-slide 1.2s ease-in-out infinite;
}

.thinking-text {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
    white-space: nowrap;
}

@keyframes pulse-thinking {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.msg-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.user-msg-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.user-bubble {
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    color: #fff;
    padding: 16px 20px;
    border-radius: 24px 24px 8px 24px;
    font-size: 15px;
    line-height: 1.6;
    max-width: 78%;
    box-shadow: 0 6px 24px rgba(255, 107, 53, 0.35), 0 2px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(15px);
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.bot-msg-container {
    display: flex;
    gap: 8px;
    align-items: flex-start;
}

.bot-msg-container .bot-avatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    margin-top: 4px;
}

.ai-avatar {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid rgba(255, 107, 53, 0.4);
    border-radius: 50%;
    animation: rotate 4s linear infinite;
    border-top-color: rgba(247, 147, 30, 0.6);
}

.avatar-core {
    width: 26px;
    height: 26px;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    border-radius: 50%;
    box-shadow: 0 3px 12px rgba(255, 107, 53, 0.4), 0 1px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.bot-content {
    display: flex;
    flex-direction: column;
    max-width: 95%;
}

.bot-bubble {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(25px);
    padding: 18px 22px;
    border-radius: 8px 24px 24px 24px;
    font-size: 14px;
    line-height: 1.7;
    color: #1f2937;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
    position: relative;
}

.bot-bubble :deep(.highlight) {
    display: block;
    font-weight: 700;
    color: #1f2937;
    margin: 12px 0 8px;
    font-size: 15px;
}

.bot-bubble :deep(.highlight:first-child) {
    margin-top: 0;
}

.bot-bubble :deep(.small-text) {
    font-size: 12px;
    opacity: 0.8;
}

.bot-bubble :deep(.price-card) {
    background: #f9fafb;
    border-radius: 12px;
    padding: 12px;
    margin: 10px 0;
}

.bot-bubble :deep(.price-item) {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
}

.bot-bubble :deep(.price-item:last-child) {
    border-bottom: none;
}

.bot-bubble :deep(.label) {
    font-weight: 600;
    color: #4b5563;
}

.bot-bubble :deep(.value) {
    font-weight: 700;
    font-size: 15px;
}

.bot-bubble :deep(.value.down) {
    color: #dc2626;
}

.bot-bubble :deep(.value.up) {
    color: #059669;
}

.bot-bubble :deep(.country-list) {
    background: #f9fafb;
    border-radius: 12px;
    padding: 12px;
    margin: 10px 0;
    line-height: 1.6;
}

.msg-time {
    font-size: 11px;
    margin-top: 4px;
    padding: 0 4px;
}

.user-msg-container .msg-time {
    text-align: right;
    color: rgba(255, 255, 255, 0.9);
}

.bot-content .msg-time {
    color: #9ca3af;
}

.suggestions-area {
    margin-top: 12px;
    margin-left: 44px;
}

.suggest-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 12px;
    padding-left: 4px;
}

.suggest-label svg {
    width: 18px;
    height: 18px;
    color: #ff6b35;
    filter: drop-shadow(0 1px 2px rgba(255, 107, 53, 0.3));
}

.suggest-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.suggest-card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    border-radius: 14px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: left;
    border: none;
}

.suggest-card:hover {
    background: rgba(255, 255, 255, 0.98);
    transform: translateX(6px) translateY(-2px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

.card-indicator {
    width: 10px;
    height: 10px;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(255, 107, 53, 0.4);
}

.card-text {
    font-size: 14px;
    color: #1f2937;
    flex: 1;
    font-weight: 500;
}

.card-arrow {
    width: 16px;
    height: 16px;
    color: #9ca3af;
    flex-shrink: 0;
    transition: all 0.2s;
}

.suggest-card:hover .card-arrow {
    color: #ff6b35;
    transform: translateX(3px) scale(1.1);
}

footer {
    padding: 24px 28px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(35px);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    position: relative;
}

.input-area {
    display: flex;
    width: 100%;
}

.input-container {
    display: flex;
    align-items: center;
    gap: 14px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(25px);
    border-radius: 32px;
    padding: 14px 22px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
    width: 100%;
    transition: all 0.3s ease;
}

.input-container:focus-within {
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
}

.input-icon {
    width: 20px;
    height: 20px;
    color: #9ca3af;
    flex-shrink: 0;
}

input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 15px;
    color: #1f2937;
    background: transparent;
    font-weight: 500;
}

input::placeholder {
    color: #9ca3af;
    font-weight: 400;
}

.send-btn {
    width: 44px;
    height: 44px;
    border: none;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    border-radius: 50%;
    cursor: pointer;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 6px 20px rgba(255, 107, 53, 0.35), 0 2px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
}

.send-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.send-btn:hover:not(:disabled) {
    transform: scale(1.12) rotate(5deg);
    box-shadow: 0 8px 28px rgba(255, 107, 53, 0.45), 0 4px 12px rgba(0, 0, 0, 0.15);
}

.send-btn:hover:not(:disabled)::before {
    opacity: 1;
}

.send-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.send-btn svg {
    width: 18px;
    height: 18px;
}

.spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>