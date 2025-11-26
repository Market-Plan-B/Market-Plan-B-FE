<template>
    <div class="wrap">
        <transition name="tip">
            <div v-if="hover" class="tip">마리모일세</div>
        </transition>
        <div class="icon" @click="open = !open" @mouseenter="hover = true" @mouseleave="hover = false">
            <svg viewBox="0 0 100 100">
                <defs>
                    <radialGradient id="g" cx="40%" cy="35%" r="60%">
                        <stop offset="0%" stop-color="#7dd87d" />
                        <stop offset="50%" stop-color="#4ade80" />
                        <stop offset="100%" stop-color="#22c55e" />
                    </radialGradient>
                </defs>
                <circle cx="50" cy="55" r="32" fill="url(#g)" />
                <ellipse cx="50" cy="30" rx="28" ry="7" fill="#d4a574" />
                <ellipse cx="50" cy="29" rx="26" ry="5" fill="#e8c49a" />
                <path d="M32 30Q32 12 50 10Q68 12 68 30" fill="#c9956c" />
                <path d="M34 30Q34 14 50 12Q66 14 66 30" fill="#d4a574" />
                <rect x="34" y="24" width="32" height="4" rx="1" fill="#8b6914" />
                <path d="M38 52Q42 48 46 52M54 52Q58 48 62 52" stroke="#1a472a" stroke-width="2.5" fill="none"
                    stroke-linecap="round" />
                <ellipse cx="33" cy="58" rx="4" ry="2.5" fill="#ff9999" opacity=".4" />
                <ellipse cx="67" cy="58" rx="4" ry="2.5" fill="#ff9999" opacity=".4" />
                <path d="M44 64Q50 70 56 64" stroke="#1a472a" stroke-width="2" fill="none" stroke-linecap="round" />
            </svg>
        </div>
    </div>
    <transition name="modal">
        <div v-if="open" class="overlay" @click.self="open = false">
            <div class="modal">
                <header>
                    <div class="header-content">
                        <div class="logo-area">
                            <div class="logo-icon">
                                <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="55" r="32" fill="#4ade80" />
                                    <path d="M38 52Q42 48 46 52M54 52Q58 48 62 52M44 64Q50 70 56 64" stroke="#1a472a"
                                        stroke-width="2.5" fill="none" stroke-linecap="round" />
                                </svg>
                            </div>
                            <span class="logo-text">마리모 AI</span>
                        </div>
                        <button class="close-btn" @click="open = false">✕</button>
                    </div>
                </header>

                <main ref="mainRef">
                    <div v-if="!msgs.length" class="welcome-section">
                        <div class="welcome-bubble">
                            <div class="bot-avatar">
                                <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="55" r="32" fill="#4ade80" />
                                    <path d="M38 52Q42 48 46 52M54 52Q58 48 62 52M44 64Q50 70 56 64" stroke="#1a472a"
                                        stroke-width="2.5" fill="none" stroke-linecap="round" />
                                </svg>
                            </div>
                            <div class="welcome-text">
                                <p>안녕하세요! 원유 시장 분석 AI 마리모입니다.</p>
                                <p class="sub">실시간 유가 정보부터 국가별 리스크 분석까지, 궁금한 것이 있으시면 무엇이든 물어보세요 🌱</p>
                            </div>
                            <div class="time">{{ getCurrentTime() }}</div>
                        </div>
                    </div>

                    <div v-if="msgs.length" class="chat-history">
                        <div v-for="(m, i) in msgs" :key="i" class="msg-group">
                            <div class="user-msg-container">
                                <div class="user-bubble">{{ m.q }}</div>
                                <div class="msg-time">{{ m.time }}</div>
                            </div>

                            <div class="bot-msg-container">
                                <div class="bot-avatar">
                                    <svg viewBox="0 0 100 100">
                                        <circle cx="50" cy="55" r="32" fill="#4ade80" />
                                        <path d="M38 52Q42 48 46 52M54 52Q58 48 62 52M44 64Q50 70 56 64"
                                            stroke="#1a472a" stroke-width="2.5" fill="none" stroke-linecap="round" />
                                    </svg>
                                </div>
                                <div class="bot-content">
                                    <div class="bot-bubble" v-html="formatAnswer(m.a)"></div>
                                    <div class="msg-time">{{ m.time }}</div>
                                </div>
                            </div>

                            <div v-if="i === msgs.length - 1 && m.suggestions" class="suggestions-area">
                                <div class="suggest-label">💡 추천 질문</div>
                                <div class="suggest-cards">
                                    <button v-for="(s, si) in m.suggestions" :key="si" @click="ask(s)"
                                        class="suggest-card">
                                        <span class="card-number">{{ si + 1 }}</span>
                                        <span class="card-text">{{ s }}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer>
                    <div v-if="!msgs.length" class="initial-chips">
                        <button v-for="(s, i) in initialSuggestions" :key="i" @click="ask(s)" class="init-chip">
                            <span class="chip-icon">{{ s.icon }}</span>
                            <span>{{ s.text }}</span>
                        </button>
                    </div>

                    <div class="input-area">
                        <button class="menu-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                        <input v-model="input" @keydown.enter="submit" placeholder="마리모에게 질문하기..."
                            :disabled="loading" />
                        <button class="send-btn" @click="submit" :disabled="!input.trim() || loading">
                            <svg v-if="!loading" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                            </svg>
                            <div v-else class="spinner"></div>
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, nextTick } from "vue";

const open = ref(false);
const hover = ref(false);
const input = ref("");
const msgs = ref([]);
const loading = ref(false);
const mainRef = ref(null);

const initialSuggestions = [
    { icon: "📊", text: "오늘 국제 유가는?" },
    { icon: "🌍", text: "주요 산유국 리스크" },
    { icon: "📈", text: "이번 주 원유 뉴스" }
];

const answerDatabase = {
    "오늘 국제 유가는?": {
        answer: `<strong>📊 2025년 11월 25일 국제 유가</strong>

<div class="price-card">
<div class="price-item">
  <span class="label">브렌트유</span>
  <span class="value up">$74.85 <small>+1.8%</small></span>
</div>
<div class="price-item">
  <span class="label">WTI</span>
  <span class="value up">$70.23 <small>+1.5%</small></span>
</div>
<div class="price-item">
  <span class="label">두바이유</span>
  <span class="value up">$73.41 <small>+2.1%</small></span>
</div>
</div>

<strong>🔍 상승 요인</strong>
- 미국 원유 재고 485만 배럴 감소
- OPEC+ 감산 연장 결정 (하루 220만 배럴)
- 중동 지정학적 긴장 고조
- 미 달러 약세 (-0.3%)

<strong>⚠️ 하방 리스크</strong>
- 중국 경기 둔화 우려
- 미국 생산량 증가 추세`,
        suggestions: [
            "미국 재고는 왜 감소했어?",
            "OPEC+ 감산 상세 내용",
            "내일 유가 전망은?"
        ]
    },
    "미국 재고는 왜 감소했어?": {
        answer: `<strong>🛢️ 미국 원유 재고 감소 분석</strong>

<strong>📉 주간 재고 변동</strong>
- 원유: -485만 배럴 (예상: -250만)
- 휘발유: -125만 배럴
- 증류유: -88만 배럴

<strong>✅ 주요 원인</strong>
1. 정유소 가동률 급증
   → 92.8% (전주 대비 +2.1%p)
   
2. 수출 확대
   → 일평균 485만 배럴 수출
   → 주요 수출국: 인도, 한국, 일본
   
3. 전략비축유(SPR) 방출 중단
   → 작년 대비 재고 확보 전환

<strong>💡 시장 영향</strong>
재고 감소는 단기 유가 상승 요인이나, 정유소 가동률 상승으로 향후 2-3주 내 재고 증가 전환 예상됩니다.`,
        suggestions: [
            "정유소 가동률이 중요한 이유는?",
            "한국은 얼마나 수입해?",
            "전략비축유란 뭐야?"
        ]
    },
    "OPEC+ 감산 상세 내용": {
        answer: `<strong>🛢️ OPEC+ 감산 결정 내역</strong>

<strong>📋 감산 규모</strong>
- 총 감산량: 일 220만 배럴
- 참여국: 23개국
- 기간: 2025년 12월까지 연장

<strong>🌍 주요 국가별 감산량</strong>
<div class="country-list">
  🇸🇦 사우디: 100만 b/d
  🇷🇺 러시아: 50만 b/d  
  🇦🇪 UAE: 18만 b/d
  🇮🇶 이라크: 15만 b/d
  🇰🇼 쿠웨이트: 12만 b/d
</div>

<strong>🎯 목표 유가대</strong>
- 브렌트유 기준 $80-90/배럴
- 현재 $74.85 (목표 대비 -6.4%)

<strong>⚡ 리스크</strong>
- 비OPEC 국가 생산 증가
  (미국, 캐나다, 브라질)
- 일부 회원국 이행률 저조
  (나이지리아 72%, 이라크 81%)`,
        suggestions: [
            "비OPEC 국가는 누구야?",
            "이행률이 낮으면?",
            "다음 회의 일정은?"
        ]
    },
    "주요 산유국 리스크": {
        answer: `<strong>🌍 주요 산유국 리스크 평가</strong>

<div class="risk-card high">
  <div class="risk-header">
    <span class="country">🇮🇷 이란</span>
    <span class="score">9.2/10</span>
  </div>
  <div class="risk-content">
    • 서방 제재 지속
    • 핵 협상 교착 상태
    • 생산량: 일 310만 배럴 (잠재력의 70%)
  </div>
</div>

<div class="risk-card high">
  <div class="risk-header">
    <span class="country">🇻🇪 베네수엘라</span>
    <span class="score">8.8/10</span>
  </div>
  <div class="risk-content">
    • 경제 위기 지속
    • 인프라 노후화 심각
    • 생산량: 일 75만 배럴 (역대 최저)
  </div>
</div>

<div class="risk-card medium">
  <div class="risk-header">
    <span class="country">🇷🇺 러시아</span>
    <span class="score">7.5/10</span>
  </div>
  <div class="risk-content">
    • G7 가격 상한제 ($60/배럴)
    • 수출 루트 제한
    • 생산량: 일 1,050만 배럴 (안정)
  </div>
</div>

<div class="risk-card medium">
  <div class="risk-header">
    <span class="country">🇸🇦 사우디</span>
    <span class="score">4.2/10</span>
  </div>
  <div class="risk-content">
    • 정치 안정
    • 잉여 생산능력 200만 b/d
    • 생산량: 일 900만 배럴 (자발적 감산)
  </div>
</div>

<div class="risk-card low">
  <div class="risk-header">
    <span class="country">🇺🇸 미국</span>
    <span class="score">3.1/10</span>
  </div>
  <div class="risk-content">
    • 셰일 생산 기술 우위
    • 생산량: 일 1,310만 배럴 (세계 1위)
    • 수출국 전환 완료
  </div>
</div>`,
        suggestions: [
            "이란 제재 해제 가능성은?",
            "러시아 우회 수출 현황",
            "미국 셰일 증산 전망"
        ]
    },
    "이번 주 원유 뉴스": {
        answer: `<strong>📰 주간 원유 시장 뉴스 (11/18~11/25)</strong>

<strong>🔥 TOP 뉴스</strong>

<div class="news-item">
  <div class="news-badge hot">긴급</div>
  <div class="news-text">
    <strong>OPEC+ 감산 연장 확정</strong>
    12월 1일 빈 회의에서 2025년 말까지 일 220만 배럴 감산 연장 결정. 사우디·러시아 주도.
  </div>
</div>

<div class="news-item">
  <div class="news-badge">주요</div>
  <div class="news-text">
    <strong>미국 EIA 재고 급감</strong>
    원유 재고 485만 배럴 감소로 예상치 2배 초과. 정유소 가동률 상승과 수출 증가 영향.
  </div>
</div>

<div class="news-item">
  <div class="news-badge">주요</div>
  <div class="news-text">
    <strong>중국 수입량 8.5% 감소</strong>
    11월 원유 수입 4,180만 톤으로 전월 대비 감소. 경기 둔화 및 재고 조정 영향.
  </div>
</div>

<strong>📊 주요 지표</strong>
- IEA 2024년 수요 전망: 일 102.3만 배럴 (+1.2만↓)
- 베이커휴즈 미국 시추 리그: 479기 (-3)
- 브렌트-WTI 스프레드: $4.62

<strong>📅 다음 주 주목 일정</strong>
- 11/27: 미국 원유 재고 발표
- 11/29: OPEC 월간 보고서 발간
- 12/1: OPEC+ 각료급 회의`,
        suggestions: [
            "중국 수입 감소 영향은?",
            "IEA 전망이 중요한 이유",
            "다음 주 유가 전망"
        ]
    },
    "정유소 가동률이 중요한 이유는?": {
        answer: `<strong>🏭 정유소 가동률의 중요성</strong>

<strong>📊 현재 미국 가동률</strong>
- 92.8% (계절 평균 대비 +3.2%p)
- 지난 5년 평균: 89.5%
- 최대 가동률: 약 95%

<strong>🔄 시장 영향 메커니즘</strong>

<div class="flow-chart">
  가동률 상승 
  ↓
  원유 수요 증가
  ↓
  원유 재고 감소
  ↓
  유가 상승 압력
</div>

<strong>💰 정제마진 현황</strong>
- 걸프만 3-2-1 크랙 스프레드: $28.5/배럴
- 지난 달 대비: +15.2%
- 정유사 수익성 개선

<strong>⚡ 계절성</strong>
- 여름철(드라이빙 시즌): 가동률 최고
- 봄/가을(정기 점검): 가동률 하락
- 겨울철(난방유 수요): 가동률 회복

현재 높은 가동률은 단기 유가 지지 요인이나, 향후 정기 점검 시즌(2-3월)에는 하락 예상됩니다.`,
        suggestions: [
            "크랙 스프레드가 뭐야?",
            "한국 정유사 영향은?",
            "정기 점검 시기는?"
        ]
    }
};

const defaultAnswer = {
    answer: `<strong>😅 죄송합니다</strong>

해당 질문에 대한 정보가 아직 준비되지 않았습니다.

<strong>💡 추천 질문</strong>
아래 질문들로 원유 시장 정보를 확인해보세요!`,
    suggestions: [
        "오늘 국제 유가는?",
        "주요 산유국 리스크",
        "이번 주 원유 뉴스"
    ]
};

const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
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

const ask = async (q) => {
    const question = typeof q === 'string' ? q : q.text;
    if (loading.value) return;

    loading.value = true;
    const response = answerDatabase[question] || defaultAnswer;

    setTimeout(() => {
        msgs.value.push({
            q: question,
            a: response.answer,
            suggestions: response.suggestions,
            time: getCurrentTime()
        });
        loading.value = false;
        scrollToBottom();
    }, 800);
};

const submit = () => {
    if (input.value.trim() && !loading.value) {
        ask(input.value.trim());
        input.value = "";
    }
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
    gap: 8px;
}

.tip {
    padding: 8px 12px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, .15);
    font-size: 14px;
    font-weight: 500;
}

.tip-enter-active,
.tip-leave-active {
    transition: .2s;
}

.tip-enter-from,
.tip-leave-to {
    opacity: 0;
    transform: translateX(10px);
}

.icon {
    width: 60px;
    height: 60px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, .15);
    cursor: pointer;
    transition: .2s;
    padding: 6px;
}

.icon:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, .2);
}

.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, .4);
    backdrop-filter: blur(4px);
    z-index: 9998;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.modal {
    width: 420px;
    max-width: 100%;
    height: 680px;
    max-height: 90vh;
    background: linear-gradient(135deg, #b8d4f1 0%, #a8c5e4 100%);
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, .3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.modal-enter-active,
.modal-leave-active {
    transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from {
    opacity: 0;
    transform: scale(.9) translateY(20px);
}

.modal-leave-to {
    opacity: 0;
    transform: scale(.95) translateY(10px);
}

header {
    background: #fff;
    padding: 14px 16px;
    border-bottom: 1px solid #e5e7eb;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo-area {
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo-icon {
    width: 32px;
    height: 32px;
}

.logo-text {
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
}

.close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: #f3f4f6;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:hover {
    background: #e5e7eb;
    color: #1f2937;
}

main {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px;
    scrollbar-width: none;
}

main::-webkit-scrollbar {
    display: none;
}

.welcome-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.welcome-bubble {
    background: #fff;
    border-radius: 18px 18px 18px 4px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
    max-width: 85%;
}

.bot-avatar {
    width: 36px;
    height: 36px;
    margin-bottom: 10px;
}

.welcome-text p {
    margin: 0 0 8px;
    font-size: 15px;
    color: #1f2937;
    line-height: 1.5;
}

.welcome-text .sub {
    font-size: 14px;
    color: #6b7280;
}

.time {
    font-size: 11px;
    color: #9ca3af;
    margin-top: 8px;
}

.chat-history {
    display: flex;
    flex-direction: column;
    gap: 20px;
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
    background: #2563eb;
    color: #fff;
    padding: 12px 16px;
    border-radius: 18px 18px 4px 18px;
    font-size: 15px;
    line-height: 1.5;
    max-width: 75%;
    box-shadow: 0 2px 8px rgba(37, 99, 235, .2);
}

.bot-msg-container {
    display: flex;
    gap: 8px;
    align-items: flex-start;
}

.bot-msg-container .bot-avatar {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    margin-top: 4px;
}

.bot-content {
    display: flex;
    flex-direction: column;
    max-width: 85%;
}

.bot-bubble {
    background: #fff;
    padding: 14px 16px;
    border-radius: 4px 18px 18px 18px;
    font-size: 14px;
    line-height: 1.7;
    color: #1f2937;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
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

.bot-bubble :deep(.value.up) {
    color: #ef4444;
}

.bot-bubble :deep(.country-list) {
    background: #f9fafb;
    border-radius: 8px;
    padding: 10px;
    margin: 8px 0;
    line-height: 1.8;
}

.bot-bubble :deep(.risk-card) {
    border-radius: 12px;
    padding: 12px;
    margin: 10px 0;
    border-left: 4px solid;
}

.bot-bubble :deep(.risk-card.high) {
    background: #fef2f2;
    border-left-color: #ef4444;
}

.bot-bubble :deep(.risk-card.medium) {
    background: #fffbeb;
    border-left-color: #f59e0b;
}

.bot-bubble :deep(.risk-card.low) {
    background: #f0fdf4;
    border-left-color: #22c55e;
}

.bot-bubble :deep(.risk-header) {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-weight: 700;
}

.bot-bubble :deep(.country) {
    font-size: 15px;
}

.bot-bubble :deep(.score) {
    color: #ef4444;
}

.bot-bubble :deep(.risk-content) {
    font-size: 13px;
    color: #4b5563;
    line-height: 1.6;
}

.bot-bubble :deep(.news-item) {
    display: flex;
    gap: 10px;
    padding: 10px;
    background: #f9fafb;
    border-radius: 10px;
    margin: 8px 0;
}

.bot-bubble :deep(.news-badge) {
    background: #e5e7eb;
    color: #4b5563;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    height: fit-content;
    white-space: nowrap;
}

.bot-bubble :deep(.news-badge.hot) {
    background: #fee2e2;
    color: #dc2626;
}

.bot-bubble :deep(.news-text) {
    flex: 1;
    font-size: 13px;
    line-height: 1.6;
}

.bot-bubble :deep(.flow-chart) {
    background: #eff6ff;
    border-left: 3px solid #2563eb;
    padding: 12px;
    margin: 10px 0;
    border-radius: 8px;
    text-align: center;
    line-height: 2;
    font-weight: 500;
}

.msg-time {
    font-size: 11px;
    color: rgba(255, 255, 255, .7);
    margin-top: 4px;
    padding: 0 4px;
}

.user-msg-container .msg-time {
    text-align: right;
}

.bot-content .msg-time {
    color: #9ca3af;
}

.suggestions-area {
    margin-top: 8px;
    margin-left: 40px;
}

.suggest-label {
    font-size: 12px;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 8px;
    padding-left: 4px;
}

.suggest-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.suggest-card {
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all .2s;
    text-align: left;
}

.suggest-card:hover {
    border-color: #2563eb;
    background: #eff6ff;
    transform: translateX(4px);
}

.card-number {
    background: #2563eb;
    color: #fff;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
}

.card-text {
    font-size: 14px;
    color: #1f2937;
    flex: 1;
}

footer {
    padding: 12px;
    background: rgba(255, 255, 255, .95);
    backdrop-filter: blur(10px);
    border-top: 1px solid #e5e7eb;
}

.initial-chips {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;
}

.init-chip {
    background: #f3f4f6;
    border: none;
    border-radius: 12px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all .2s;
}

.init-chip:hover {
    background: #e5e7eb;
    transform: translateX(4px);
}

.chip-icon {
    font-size: 16px;
}

.init-chip span:last-child {
    font-size: 14px;
    color: #374151;
}

.input-area {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border-radius: 24px;
    padding: 8px 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.menu-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.menu-btn:hover {
    background: #f3f4f6;
}

.menu-btn svg {
    width: 20px;
    height: 20px;
}

input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 15px;
    color: #1f2937;
    background: transparent;
}

input::placeholder {
    color: #9ca3af;
}

.send-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: #2563eb;
    border-radius: 50%;
    cursor: pointer;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all .2s;
}

.send-btn:hover:not(:disabled) {
    background: #1d4ed8;
    transform: scale(1.05);
}

.send-btn:disabled {
    opacity: .5;
    cursor: not-allowed;
}

.send-btn svg {
    width: 20px;
    height: 20px;
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, .3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>