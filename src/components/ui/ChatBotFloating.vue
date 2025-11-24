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
                    <div />
                    <div class="btns">
                        <button
                            v-for="d in ['M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3', 'M3 3h18v18H3z', 'M18 6L6 18M6 6l12 12']"
                            :key="d" @click="d.includes('18 6') && (open = false)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path :d="d" />
                            </svg>
                        </button>
                    </div>
                </header>
                <main>
                    <div class="avatar"><svg viewBox="0 0 100 100">
                            <defs>
                                <radialGradient id="gl" cx="40%" cy="35%" r="60%">
                                    <stop offset="0%" stop-color="#7dd87d" />
                                    <stop offset="50%" stop-color="#4ade80" />
                                    <stop offset="100%" stop-color="#22c55e" />
                                </radialGradient>
                            </defs>
                            <circle cx="50" cy="55" r="32" fill="url(#gl)" />
                            <ellipse cx="50" cy="30" rx="28" ry="7" fill="#d4a574" />
                            <ellipse cx="50" cy="29" rx="26" ry="5" fill="#e8c49a" />
                            <path d="M32 30Q32 12 50 10Q68 12 68 30" fill="#c9956c" />
                            <path d="M34 30Q34 14 50 12Q66 14 66 30" fill="#d4a574" />
                            <rect x="34" y="24" width="32" height="4" rx="1" fill="#8b6914" />
                            <path d="M38 52Q42 48 46 52M54 52Q58 48 62 52" stroke="#1a472a" stroke-width="2.5"
                                fill="none" stroke-linecap="round" />
                            <ellipse cx="33" cy="58" rx="4" ry="2.5" fill="#ff9999" opacity=".4" />
                            <ellipse cx="67" cy="58" rx="4" ry="2.5" fill="#ff9999" opacity=".4" />
                            <path d="M44 64Q50 70 56 64" stroke="#1a472a" stroke-width="2" fill="none"
                                stroke-linecap="round" />
                        </svg></div>
                    <h2>뭐가 궁금해, 형씨?</h2>
                    <div class="menu">
                        <div v-for="m in menu" :key="m.t" @click="ask(m.q)"><span>{{ m.i }}</span><span>{{ m.t }}</span>
                        </div>
                    </div>
                    <div v-if="msgs.length" class="history">
                        <div v-for="(m, i) in msgs" :key="i" class="grp">
                            <div class="msg u">{{ m.q }}</div>
                            <div class="msg a">
                                <div class="sm"><svg viewBox="0 0 100 100">
                                        <circle cx="50" cy="55" r="32" fill="#4ade80" />
                                        <path d="M38 52Q42 48 46 52M54 52Q58 48 62 52M44 64Q50 70 56 64"
                                            stroke="#1a472a" stroke-width="2.5" fill="none" stroke-linecap="round" />
                                    </svg></div>
                                <div class="txt">{{ m.a }}</div>
                            </div>
                        </div>
                    </div>
                </main>
                <footer>
                    <div class="box">
                        <textarea v-model="input" @keydown.enter.prevent="submit" placeholder="무엇이든 물어보세요..."
                            rows="1" />
                        <div class="acts">
                            <button class="act-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path
                                        d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                                </svg></button>
                            <span>자동</span>
                            <button class="act-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path
                                        d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                                </svg></button>
                            <span>모든 출처</span>
                            <button class="send" @click="submit" :disabled="!input.trim()"><svg viewBox="0 0 24 24"
                                    fill="currentColor">
                                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                                </svg></button>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref } from "vue";
const open = ref(false), hover = ref(false), input = ref(""), msgs = ref([]);
const menu = [
    { i: '🔍', t: '무엇이든 검색', q: '오늘의 주요 원유 뉴스 검색' },
    { i: '📊', t: '리포트 요약', q: '이번 주 원유 리포트 요약' },
    { i: '📈', t: '영향도 분석', q: '유가 영향 주요 이슈 분석' },
    { i: '⚖️', t: '리스크 비교', q: '사우디·미국·중국 리스크 비교' }
];
const ask = (q) => msgs.value.push({ q, a: `"${q}"에 대한 마리모 응답입니다.\n실제 API 연동 시 분석 결과가 표시됩니다.` });
const submit = () => { if (input.value.trim()) { ask(input.value.trim()); input.value = ""; } };
</script>

<style scoped>
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
    width: 52px;
    height: 52px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .12);
    cursor: pointer;
    transition: .2s;
    padding: 4px;
}

.icon:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, .16);
}

.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, .3);
    backdrop-filter: blur(2px);
    z-index: 9998;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal {
    width: 480px;
    max-width: 95vw;
    max-height: 85vh;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, .25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.modal-enter-active,
.modal-leave-active {
    transition: .25s;
}

.modal-enter-from {
    opacity: 0;
    transform: scale(.95) translateY(10px);
}

.modal-leave-to {
    opacity: 0;
    transform: scale(.98) translateY(5px);
}

header {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    border-bottom: 1px solid #e8e8e6;
}

.btns {
    display: flex;
    gap: 4px;
}

.btns button {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    color: #9b9a97;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btns button:hover {
    background: #f1f1ef;
    color: #37352f;
}

.btns svg {
    width: 16px;
    height: 16px;
}

main {
    flex: 1;
    overflow-y: auto;
    padding: 32px 24px 16px;
    scrollbar-width: none;
}

main::-webkit-scrollbar {
    display: none;
}

.avatar {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
}

.avatar svg {
    width: 100%;
    height: 100%;
}

h2 {
    font-size: 22px;
    font-weight: 700;
    color: #37352f;
    margin: 0 0 24px;
}

.menu {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 24px;
}

.menu>div {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
}

.menu>div:hover {
    background: #f7f6f3;
}

.menu span:first-child {
    width: 24px;
    text-align: center;
}

.menu span:last-child {
    font-size: 15px;
    color: #37352f;
}

.history {
    border-top: 1px solid #e8e8e6;
    padding-top: 16px;
}

.grp {
    margin-bottom: 16px;
}

.msg {
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.5;
}

.msg.u {
    background: #37352f;
    color: #fff;
    margin-left: 40px;
    margin-bottom: 8px;
}

.msg.a {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    background: transparent;
    padding: 0;
}

.sm {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
}

.sm svg {
    width: 100%;
    height: 100%;
}

.txt {
    background: #f7f6f3;
    padding: 10px 14px;
    border-radius: 12px;
    color: #37352f;
    white-space: pre-line;
    flex: 1;
}

footer {
    padding: 12px 16px 16px;
    border-top: 1px solid #e8e8e6;
}

.box {
    border: 2px solid #2383e2;
    border-radius: 12px;
    padding: 12px;
}

textarea {
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    font-size: 15px;
    color: #37352f;
    background: transparent;
    font-family: inherit;
}

textarea::placeholder {
    color: #9b9a97;
}

.acts {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid #e8e8e6;
}

.acts span {
    font-size: 13px;
    color: #787774;
}

.act-btn {
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    color: #9b9a97;
    display: flex;
    align-items: center;
    justify-content: center;
}

.act-btn:hover {
    background: #f1f1ef;
    color: #37352f;
}

.act-btn svg {
    width: 16px;
    height: 16px;
}

.send {
    margin-left: auto;
    width: 32px;
    height: 32px;
    background: #f1f1ef;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: #9b9a97;
    display: flex;
    align-items: center;
    justify-content: center;
}

.send:hover:not(:disabled) {
    background: #2383e2;
    color: #fff;
}

.send:disabled {
    opacity: .5;
    cursor: not-allowed;
}

.send svg {
    width: 18px;
    height: 18px;
}
</style>