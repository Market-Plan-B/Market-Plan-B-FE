<template>
    <div ref="introContainer" class="intro-container text-white">
        <!-- 배경: 산과 달이 있는 야경 -->
        <div class="background-scene fixed inset-0 z-0">
            <!-- 별들 -->
            <div class="stars">
                <div v-for="i in 50" :key="i" class="star" :style="getStarStyle(i)"></div>
            </div>

            <!-- 달 -->
            <div ref="moon" class="moon"></div>

            <!-- 산들 -->
            <div class="mountains">
                <div class="mountain mountain-1"></div>
                <div class="mountain mountain-2"></div>
                <div class="mountain mountain-3"></div>
            </div>
        </div>

        <section ref="heroSection" class="hero-section h-screen flex items-center justify-center relative z-10">
            <div class="hero-content text-center z-10">
                <h1 ref="heroTitle" class="hero-title text-6xl sm:text-7xl font-bold mb-6 opacity-0">
                    AI Market Intelligence
                </h1>
                <p ref="heroSubtitle" class="hero-subtitle text-xl sm:text-2xl text-gray-300 mb-12 opacity-0">
                    데이터가 아닌, 인사이트를 제공합니다
                </p>
                <button ref="startButton" @click="goToLogin"
                    class="start-button px-12 py-4 bg-white hover:bg-gray-100 text-slate-900 text-xl font-bold rounded-full opacity-0 transition-all duration-300 hover:scale-110 shadow-lg">
                    시작하기
                </button>
            </div>
        </section>

        <section ref="problemSection" class="problem-section min-h-screen flex items-center py-32 px-8 relative z-10">
            <div class="max-w-6xl mx-auto">
                <h2 ref="problemTitle" class="section-title text-4xl sm:text-5xl font-bold mb-16 opacity-0">
                    시장의 불확실성
                </h2>
                <div class="problem-grid grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div ref="problemCard1"
                        class="problem-card p-8 bg-slate-800/80 backdrop-blur-md rounded-3xl opacity-0 border border-slate-700/50">
                        <div class="text-orange-500 text-4xl mb-4">01</div>
                        <h3 class="text-2xl font-bold mb-4">하루에 수천 건의 뉴스</h3>
                        <p class="text-gray-300">
                            어떤 정보가 진짜 영향을 미치는지 사람이 직접 판단하기 어려움
                        </p>
                    </div>
                    <div ref="problemCard2"
                        class="problem-card p-8 bg-slate-800/80 backdrop-blur-md rounded-3xl opacity-0 border border-slate-700/50">
                        <div class="text-orange-500 text-4xl mb-4">02</div>
                        <h3 class="text-2xl font-bold mb-4">통합적인 분석 부재</h3>
                        <p class="text-gray-300">
                            고려해야 할 요소가 너무 많고, 그 요소들의 조합으로 도출되는 경우의 수가 너무 다양
                        </p>
                    </div>
                    <div ref="problemCard3"
                        class="problem-card p-8 bg-slate-800/80 backdrop-blur-md rounded-3xl opacity-0 border border-slate-700/50">
                        <div class="text-orange-500 text-4xl mb-4">03</div>
                        <h3 class="text-2xl font-bold mb-4">의사결정의 지연</h3>
                        <p class="text-gray-300">
                            객관적인 리스크 관리 실패로 전략적 손실 발생
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section ref="solutionSection" class="solution-section min-h-screen flex items-center py-32 px-8 relative z-10">
            <div class="max-w-6xl mx-auto w-full">
                <h2 ref="solutionTitle" class="section-title text-4xl sm:text-5xl font-bold mb-16 opacity-0">
                    우리의 솔루션
                </h2>
                <div class="solution-content grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div ref="solutionText" class="opacity-0">
                        <h3 class="text-2xl sm:text-3xl font-bold mb-6 text-orange-500">
                            AI 기반 실시간 영향도 측정
                        </h3>
                        <p class="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
                            타겟(원유, 반도체 등)과 관련된 뉴스, 리포트, 이벤트를 수집하여
                            실제 영향도를 예측, 측정하는 시스템
                        </p>
                        <ul class="space-y-4 text-gray-300">
                            <li class="flex items-start">
                                <span class="text-orange-500 mr-3">▸</span>
                                <span>실시간 뉴스 수집 및 분류</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-orange-500 mr-3">▸</span>
                                <span>AI 기반 영향도 자동 예측 및 분석</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-orange-500 mr-3">▸</span>
                                <span>멀티소스 통합 분석</span>
                            </li>
                        </ul>
                    </div>
                    <div ref="solutionVisual" class="solution-visual opacity-0">
                        <div
                            class="visual-box bg-slate-800/80 backdrop-blur-md p-12 rounded-3xl border border-orange-500/30">
                            <div class="text-center">
                                <div class="text-5xl sm:text-6xl font-bold text-orange-500 mb-4">10년</div>
                                <p class="text-lg sm:text-xl text-gray-300 mb-8">Look-back 기간 데이터 분석</p>
                                <div class="grid grid-cols-2 gap-4 text-sm">
                                    <div class="bg-slate-900/60 p-4 rounded-xl">
                                        <div class="text-orange-500 font-bold mb-1">정형 데이터</div>
                                        <div class="text-gray-300">Target 가격, 분석 데이터</div>
                                    </div>
                                    <div class="bg-slate-900/60 p-4 rounded-xl">
                                        <div class="text-orange-500 font-bold mb-1">비정형 데이터</div>
                                        <div class="text-gray-300">뉴스, 리포트</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section ref="approachSection" class="approach-section min-h-screen flex items-center py-32 px-8 relative z-10">
            <div class="max-w-6xl mx-auto w-full">
                <h2 ref="approachTitle" class="section-title text-4xl sm:text-5xl font-bold mb-16 opacity-0">
                    Data-driven & Insight-driven
                </h2>
                <div class="approach-grid grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div ref="approachLeft"
                        class="approach-card p-12 bg-slate-800/80 backdrop-blur-md rounded-3xl border border-blue-500/30 opacity-0">
                        <h3 class="text-2xl sm:text-3xl font-bold mb-6">금융 원자재</h3>
                        <p class="text-gray-300 mb-8">실시간 Data-driven 접근</p>
                        <ul class="space-y-4 text-gray-300">
                            <li>일별, 실시간 High Frequency</li>
                            <li>글로벌 거래소 데이터</li>
                            <li>금융지표 실시간 모델링</li>
                            <li>Financial Public 변수 활용</li>
                        </ul>
                    </div>
                    <div ref="approachRight"
                        class="approach-card p-12 bg-slate-800/80 backdrop-blur-md rounded-3xl border border-orange-500/30 opacity-0">
                        <h3 class="text-2xl sm:text-3xl font-bold mb-6">제조</h3>
                        <p class="text-gray-300 mb-8">전방수요 구조적 Insight-driven</p>
                        <ul class="space-y-4 text-gray-300">
                            <li>월, 분기 단위 Low Frequency</li>
                            <li>폐쇄적 공급망 전방 계약</li>
                            <li>분기 재무데이터 등 사후 집계</li>
                            <li>인과상관분석 핵심변수 선별</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section ref="targetSection"
            class="target-section min-h-screen flex items-center justify-center py-32 px-8 relative z-10">
            <div class="max-w-4xl mx-auto text-center">
                <h2 ref="targetTitle" class="section-title text-4xl sm:text-5xl font-bold mb-12 opacity-0">
                    Target 선정
                </h2>
                <div class="target-grid grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div ref="targetCrude"
                        class="target-card p-12 bg-slate-800/80 backdrop-blur-md rounded-3xl opacity-0 hover:scale-105 transition-transform duration-300 border border-slate-700/50">
                        <h3 class="text-3xl sm:text-4xl font-bold mb-4 text-orange-500">Crude Oil</h3>
                        <p class="text-lg sm:text-xl text-gray-300 mb-6">Brent, WTI</p>
                        <p class="text-gray-400">글로벌 에너지 시장의 핵심 지표</p>
                    </div>
                    <div ref="targetSemi"
                        class="target-card p-12 bg-slate-800/80 backdrop-blur-md rounded-3xl opacity-0 hover:scale-105 transition-transform duration-300 border border-slate-700/50">
                        <h3 class="text-3xl sm:text-4xl font-bold mb-4 text-orange-500">Semiconductor</h3>
                        <p class="text-lg sm:text-xl text-gray-300 mb-6">DRAM ASP, DXI</p>
                        <p class="text-gray-400">반도체 시장 가격 동향 분석</p>
                    </div>
                </div>
            </div>
        </section>

        <section ref="ctaSection" class="cta-section h-screen flex items-center justify-center relative z-10">
            <div class="cta-content text-center z-10">
                <h2 ref="ctaTitle" class="text-5xl sm:text-6xl font-bold mb-8 opacity-0">
                    데이터를 인사이트로
                </h2>
                <p ref="ctaSubtitle" class="text-xl sm:text-2xl text-gray-300 mb-12 opacity-0">
                    AI가 시장을 읽고, 당신은 결정합니다
                </p>
                <button ref="ctaButton" @click="goToLogin"
                    class="cta-button px-12 py-4 bg-white hover:bg-gray-100 text-slate-900 text-xl font-bold rounded-full opacity-0 transition-all duration-300 hover:scale-110 shadow-lg">
                    시작하기
                </button>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'

gsap.registerPlugin(ScrollTrigger)

const router = useRouter()

const getStarStyle = (index: number) => {
    const size = Math.random() * 2 + 1;
    const left = Math.random() * 100;
    const top = Math.random() * 50;
    const delay = Math.random() * 2;
    return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        top: `${top}%`,
        animationDelay: `${delay}s`
    };
};

const goToLogin = () => {
    router.push('/login');
};

const introContainer = ref<HTMLElement>()
const heroSection = ref<HTMLElement>()
const heroTitle = ref<HTMLElement>()
const heroSubtitle = ref<HTMLElement>()
const startButton = ref<HTMLElement>()
const moon = ref<HTMLElement>()

const problemSection = ref<HTMLElement>()
const problemTitle = ref<HTMLElement>()
const problemCard1 = ref<HTMLElement>()
const problemCard2 = ref<HTMLElement>()
const problemCard3 = ref<HTMLElement>()

const solutionSection = ref<HTMLElement>()
const solutionTitle = ref<HTMLElement>()
const solutionText = ref<HTMLElement>()
const solutionVisual = ref<HTMLElement>()
const solutionBg = ref<HTMLElement>()

const approachSection = ref<HTMLElement>()
const approachTitle = ref<HTMLElement>()
const approachLeft = ref<HTMLElement>()
const approachRight = ref<HTMLElement>()

const targetSection = ref<HTMLElement>()
const targetTitle = ref<HTMLElement>()
const targetCrude = ref<HTMLElement>()
const targetSemi = ref<HTMLElement>()

const ctaSection = ref<HTMLElement>()
const ctaTitle = ref<HTMLElement>()
const ctaSubtitle = ref<HTMLElement>()
const ctaButton = ref<HTMLElement>()

let lenis: Lenis

onMounted(() => {
    lenis = new Lenis({
        lerp: 0.1,
    })

    function raf(time: number) {
        lenis.raf(time)
        ScrollTrigger.update()
        requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // 달이 스크롤에 따라 이동하는 애니메이션
    if (moon.value && introContainer.value) {
        gsap.to(moon.value, {
            x: '-60vw', // 오른쪽에서 왼쪽으로 이동
            y: '40vh', // 위에서 아래로 이동
            scrollTrigger: {
                trigger: introContainer.value,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1, // 스크롤과 동기화
            },
        })
    }

    if (heroTitle.value) {
        gsap.to(heroTitle.value, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
        })
    }

    if (heroSubtitle.value) {
        gsap.to(heroSubtitle.value, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            delay: 0.3,
            ease: 'power3.out',
        })
    }

    if (startButton.value) {
        gsap.to(startButton.value, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            delay: 0.6,
            ease: 'power3.out',
        })
    }

    if (problemTitle.value && problemSection.value) {
        gsap.to(problemTitle.value, {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
                trigger: problemSection.value,
                start: 'top 80%',
            },
        })
    }

    if (problemCard1.value && problemCard2.value && problemCard3.value && problemSection.value) {
        gsap.to([problemCard1.value, problemCard2.value, problemCard3.value], {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            duration: 1,
            scrollTrigger: {
                trigger: problemSection.value,
                start: 'top 60%',
            },
        })
    }

    if (solutionTitle.value && solutionSection.value) {
        gsap.to(solutionTitle.value, {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
                trigger: solutionSection.value,
                start: 'top 80%',
            },
        })
    }

    if (solutionText.value && solutionSection.value) {
        gsap.to(solutionText.value, {
            opacity: 1,
            x: 0,
            duration: 1,
            scrollTrigger: {
                trigger: solutionSection.value,
                start: 'top 60%',
            },
        })
    }

    if (solutionVisual.value && solutionSection.value) {
        gsap.to(solutionVisual.value, {
            opacity: 1,
            x: 0,
            duration: 1,
            delay: 0.2,
            scrollTrigger: {
                trigger: solutionSection.value,
                start: 'top 60%',
            },
        })
    }

    if (solutionBg.value && solutionSection.value) {
        gsap.to(solutionBg.value, {
            opacity: 0.05,
            scrollTrigger: {
                trigger: solutionSection.value,
                start: 'top center',
                end: 'bottom center',
                scrub: true,
            },
        })
    }

    if (approachTitle.value && approachSection.value) {
        gsap.to(approachTitle.value, {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
                trigger: approachSection.value,
                start: 'top 80%',
            },
        })
    }

    if (approachLeft.value && approachSection.value) {
        gsap.to(approachLeft.value, {
            opacity: 1,
            x: 0,
            duration: 1,
            scrollTrigger: {
                trigger: approachSection.value,
                start: 'top 60%',
            },
        })
    }

    if (approachRight.value && approachSection.value) {
        gsap.to(approachRight.value, {
            opacity: 1,
            x: 0,
            duration: 1,
            delay: 0.2,
            scrollTrigger: {
                trigger: approachSection.value,
                start: 'top 60%',
            },
        })
    }

    if (targetTitle.value && targetSection.value) {
        gsap.to(targetTitle.value, {
            opacity: 1,
            scale: 1,
            duration: 1,
            scrollTrigger: {
                trigger: targetSection.value,
                start: 'top 80%',
            },
        })
    }

    if (targetCrude.value && targetSemi.value && targetSection.value) {
        gsap.to([targetCrude.value, targetSemi.value], {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            duration: 1,
            scrollTrigger: {
                trigger: targetSection.value,
                start: 'top 60%',
            },
        })
    }

    if (ctaTitle.value && ctaSection.value) {
        gsap.to(ctaTitle.value, {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
                trigger: ctaSection.value,
                start: 'top 80%',
            },
        })
    }

    if (ctaSubtitle.value && ctaSection.value) {
        gsap.to(ctaSubtitle.value, {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.2,
            scrollTrigger: {
                trigger: ctaSection.value,
                start: 'top 80%',
            },
        })
    }

    if (ctaButton.value && ctaSection.value) {
        gsap.to(ctaButton.value, {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.4,
            scrollTrigger: {
                trigger: ctaSection.value,
                start: 'top 80%',
            },
        })
    }
})

onUnmounted(() => {
    lenis?.destroy()
    ScrollTrigger.getAll().forEach((trigger: ScrollTrigger) => trigger.kill())
})
</script>

<style scoped>
.intro-container {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%);
    position: relative;
    min-height: 100vh;
    width: 100%;
    z-index: 9999;
    overflow-x: hidden;
}

/* 배경 씬 */
.background-scene {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
}

/* 별들 */
.stars {
    position: absolute;
    inset: 0;
}

.star {
    position: absolute;
    background: white;
    border-radius: 50%;
    animation: twinkle 3s infinite;
}

@keyframes twinkle {

    0%,
    100% {
        opacity: 0.3;
    }

    50% {
        opacity: 1;
    }
}

/* 달 */
.moon {
    position: absolute;
    top: 15%;
    right: 15%;
    width: 120px;
    height: 120px;
    background: linear-gradient(135deg, #475569 0%, #64748b 100%);
    border-radius: 50%;
    box-shadow:
        0 0 40px rgba(148, 163, 184, 0.3),
        inset -20px -20px 0 rgba(15, 23, 42, 0.3);
}

.moon::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 30px;
    width: 25px;
    height: 25px;
    background: rgba(15, 23, 42, 0.4);
    border-radius: 50%;
}

.moon::after {
    content: '';
    position: absolute;
    top: 45px;
    left: 50px;
    width: 15px;
    height: 15px;
    background: rgba(15, 23, 42, 0.3);
    border-radius: 50%;
}

/* 산들 */
.mountains {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
}

.mountain {
    position: absolute;
    bottom: 0;
    background: linear-gradient(to top, #1e293b 0%, #334155 100%);
    clip-path: polygon(0 100%, 100% 100%, 50% 0);
}

.mountain-1 {
    left: -5%;
    width: 40%;
    height: 100%;
    background: linear-gradient(to top, #0f172a 0%, #1e293b 100%);
}

.mountain-2 {
    left: 25%;
    width: 50%;
    height: 80%;
    background: linear-gradient(to top, #1e293b 0%, #334155 100%);
}

.mountain-3 {
    right: -5%;
    width: 35%;
    height: 70%;
    background: linear-gradient(to top, #334155 0%, #475569 100%);
}

.hero-title {
    transform: translateY(40px);
}

.hero-subtitle {
    transform: translateY(40px);
}

.start-button {
    transform: translateY(20px);
}

.section-title {
    transform: translateY(40px);
}

.problem-card {
    transform: translateY(40px);
    transition: transform 0.3s ease;
}

.problem-card:hover {
    transform: translateY(-8px);
}

.solution-bg {
    background: radial-gradient(circle at 30% 50%, rgba(249, 115, 22, 0.15), transparent 60%);
}

.approach-card {
    transform: translateX(-40px);
}

.approach-card:nth-child(2) {
    transform: translateX(40px);
}

.target-card {
    transform: translateY(40px);
}

.cta-gradient {
    background: radial-gradient(circle at center, rgba(249, 115, 22, 0.4), transparent 60%);
}

.cta-button {
    transform: translateY(20px);
}

/* 반응형 */
@media (max-width: 640px) {
    .moon {
        width: 80px;
        height: 80px;
        top: 10%;
        right: 10%;
    }
}
</style>