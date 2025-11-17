<template>
    <div class="space-y-8">
        <section class="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <div class="mb-6">
                <h2 class="font-bold text-2xl mb-2 text-gray-900">글로벌 원유 시장 리포트</h2>
                <p class="text-sm text-gray-600">AI가 뉴스의 시장 영향도를 산출하고, 높은 영향도를 가진 핵심 이슈만 선별해 제공합니다.</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-6 justify-between items-center">
                <div class="inline-flex rounded-2xl bg-gray-100 p-1.5 shadow-inner">
                    <button @click="switchMode('daily')"
                        class="relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
                        :class="mode === 'daily'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:text-gray-900'">
                        <span class="relative z-10 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Daily
                        </span>
                    </button>

                    <button @click="switchMode('weekly')"
                        class="relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300"
                        :class="mode === 'weekly'
                            ? 'bg-white text-purple-600 shadow-md'
                            : 'text-gray-600 hover:text-gray-900'">
                        <span class="relative z-10 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Weekly
                        </span>
                    </button>
                </div>

                <div class="relative">
                    <input type="date" v-model="selectedDate"
                        class="px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 bg-white hover:border-blue-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium shadow-sm" />
                </div>
            </div>
        </section>

        <section class="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-900">{{ mode === 'daily' ? 'Daily News' : 'Weekly News' }}</h2>
                <span class="text-sm text-gray-500 font-medium">총 {{ displayCards.length }}개</span>
            </div>

            <Transition name="cards" mode="out-in">
                <ReportCards :key="mode + selectedDate" :cards="displayCards" />
            </Transition>
        </section>

        <section class="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div class="mb-8">
                <h2 class="text-xl font-bold text-gray-900">{{ mode === 'daily' ? 'Daily 상세 리포트' : 'Weekly 상세 리포트' }}
                </h2>
                <p class="text-sm text-slate-600">
                    {{ selectedDate }}
                </p>
            </div>

            <div class="space-y-8">
                <div class="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-blue-600">
                    <div class="flex items-center gap-2 mb-4">
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="font-bold text-xl text-slate-900">Executive Summary</h3>
                    </div>
                    <p class="text-slate-700 leading-relaxed text-base">
                        {{ summaryData.executive_summary }}
                    </p>
                </div>

                <div class="bg-white rounded-2xl p-8 shadow-lg">
                    <div class="flex items-center gap-2 mb-6">
                        <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 class="font-bold text-xl text-slate-900">Key Market Metrics</h3>
                    </div>

                    <div class="overflow-hidden rounded-xl border border-slate-200">
                        <table class="w-full">
                            <thead class="bg-gradient-to-r from-slate-100 to-slate-50">
                                <tr>
                                    <th class="py-4 px-6 text-left font-bold text-slate-700 text-sm">지표</th>
                                    <th class="py-4 px-6 text-left font-bold text-slate-700 text-sm">가격</th>
                                    <th class="py-4 px-6 text-center font-bold text-slate-700 text-sm">D/D</th>
                                    <th class="py-4 px-6 text-center font-bold text-slate-700 text-sm">W/W</th>
                                    <th class="py-4 px-6 text-left font-bold text-slate-700 text-sm">코멘트</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-200">
                                <tr v-for="m in summaryData.metrics" :key="m.label"
                                    class="hover:bg-slate-50 transition-colors">
                                    <td class="py-4 px-6 font-bold text-slate-900">{{ m.label }}</td>
                                    <td class="py-4 px-6 font-bold text-lg text-slate-900">{{ m.price }}</td>
                                    <td class="py-4 px-6 text-center">
                                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
                                            :class="m.dd >= 0
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-blue-100 text-blue-700'">
                                            {{ m.dd >= 0 ? '▲' : '▼' }} {{ Math.abs(m.dd) }}%
                                        </span>
                                    </td>
                                    <td class="py-4 px-6 text-center">
                                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
                                            :class="m.ww >= 0
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-blue-100 text-blue-700'">
                                            {{ m.ww >= 0 ? '▲' : '▼' }} {{ Math.abs(m.ww) }}%
                                        </span>
                                    </td>
                                    <td class="py-4 px-6 text-slate-600 text-sm">{{ m.comment }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-8 shadow-lg">
                    <div class="flex items-center gap-2 mb-6">
                        <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 class="font-bold text-xl text-slate-900">Macro Drivers</h3>
                    </div>

                    <div class="grid md:grid-cols-3 gap-6">
                        <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-l-4 border-red-600">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </div>
                                <h4 class="font-bold text-lg text-red-900">Supply</h4>
                            </div>
                            <p class="text-slate-700 text-sm leading-relaxed">
                                {{ summaryData.macro.supply }}
                            </p>
                        </div>

                        <div
                            class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-l-4 border-yellow-600">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                </div>
                                <h4 class="font-bold text-lg text-yellow-900">Demand</h4>
                            </div>
                            <p class="text-slate-700 text-sm leading-relaxed">
                                {{ summaryData.macro.demand }}
                            </p>
                        </div>

                        <div
                            class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-l-4 border-orange-600">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                    </svg>
                                </div>
                                <h4 class="font-bold text-lg text-orange-900">Policy & Geo</h4>
                            </div>
                            <p class="text-slate-700 text-sm leading-relaxed">
                                {{ summaryData.macro.policy }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-8 shadow-lg">
                    <div class="flex items-center gap-2 mb-6">
                        <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <h3 class="font-bold text-xl text-slate-900">Scenario Outlook</h3>
                    </div>

                    <div class="space-y-4">
                        <div v-for="s in summaryData.scenarios" :key="s.type"
                            class="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-3">
                                    <span class="px-4 py-2 rounded-lg font-bold text-white text-sm" :class="{
                                        'bg-green-600': s.type === 'Base',
                                        'bg-red-600': s.type === 'Bull',
                                        'bg-blue-600': s.type === 'Bear'
                                    }">
                                        {{ s.type }}
                                    </span>
                                    <span class="text-2xl font-bold text-slate-900">${{ s.range }}/bbl</span>
                                </div>
                                <div class="text-right">
                                    <div class="text-3xl font-bold text-slate-900">{{ Math.round(s.prob * 100) }}%</div>
                                    <div class="text-xs text-slate-600 font-medium">확률</div>
                                </div>
                            </div>
                            <p class="text-slate-700 text-sm leading-relaxed">{{ s.desc }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-8 shadow-lg">
                    <div class="flex items-center gap-2 mb-6">
                        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 class="font-bold text-xl text-slate-900">Risk Matrix</h3>
                    </div>

                    <div class="grid md:grid-cols-3 gap-6">
                        <div v-for="risk in summaryData.risk_matrix" :key="risk.risk"
                            class="bg-slate-50 rounded-xl p-6 border-2 transition-all hover:shadow-lg" :class="{
                                'border-red-300 hover:border-red-500': risk.impact === 'high',
                                'border-yellow-300 hover:border-yellow-500': risk.impact === 'medium',
                                'border-green-300 hover:border-green-500': risk.impact === 'low'
                            }">
                            <div class="flex items-start justify-between mb-3">
                                <p class="font-bold text-slate-900 text-lg">{{ risk.risk }}</p>
                                <span class="px-3 py-1 rounded-full text-xs font-bold uppercase" :class="{
                                    'bg-red-100 text-red-700': risk.impact === 'high',
                                    'bg-yellow-100 text-yellow-700': risk.impact === 'medium',
                                    'bg-green-100 text-green-700': risk.impact === 'low'
                                }">
                                    {{ risk.impact }}
                                </span>
                            </div>
                            <p class="text-slate-700 text-sm leading-relaxed">{{ risk.comment }}</p>
                        </div>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-white rounded-2xl p-8 shadow-lg">
                        <div class="flex items-center gap-2 mb-4">
                            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <h3 class="font-bold text-lg text-slate-900">Investment Implications</h3>
                        </div>
                        <ul class="space-y-3">
                            <li v-for="imp in summaryData.implications" :key="imp"
                                class="flex items-start gap-3 text-slate-700 text-sm">
                                <svg class="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                                <span>{{ imp }}</span>
                            </li>
                        </ul>
                    </div>

                    <div class="bg-white rounded-2xl p-8 shadow-lg">
                        <div class="flex items-center gap-2 mb-4">
                            <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <h3 class="font-bold text-lg text-slate-900">Monitoring List</h3>
                        </div>
                        <ul class="space-y-3">
                            <li v-for="m in summaryData.monitoring" :key="m"
                                class="flex items-start gap-3 text-slate-700 text-sm">
                                <svg class="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{{ m }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

        </section>
        <ChatBotFloating />
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import ReportCards from "@/components/ReportCards.vue";
import ChatBotFloating from "@/components/ui/ChatBotFloating.vue";

const sampleNewsData = {
    "2025-11-14": [
        { id: 1, date: "2025-11-14", title: "사우디, OPEC+ 감산 연장 전격 발표", desc: "사우디아라비아가 OPEC+ 회원국들과 원유 감산 합의를 2024년 1분기까지 연장한다고 발표했습니다.", level: "긴급", country: "사우디", url: "#" },
        { id: 2, date: "2025-11-14", title: "미국 전략비축유 방출 계획 발표", desc: "바이든 행정부가 유가 안정화를 위해 전략비축유 추가 방출을 검토 중입니다.", level: "높음", country: "미국", url: "#" },
        { id: 3, date: "2025-11-14", title: "중국 원유 수입량 3개월 연속 증가", desc: "중국의 11월 원유 수입량이 경제 회복세에 힘입어 전월 대비 8% 증가했습니다.", level: "중간", country: "중국", url: "#" },
        { id: 4, date: "2025-11-14", title: "이란-이스라엘 긴장 고조, 호르무즈 해협 우려", desc: "중동 정세 불안으로 호르무즈 해협 통행 리스크가 높아지고 있습니다.", level: "긴급", country: "이란", url: "#" },
        { id: 5, date: "2025-11-14", title: "독일, 재생에너지 전환 가속화 선언", desc: "독일 정부가 2030년까지 화석연료 의존도를 50% 줄이는 정책을 발표했습니다.", level: "낮음", country: "독일", url: "#" }
    ],
    "2025-11-13": [
        { id: 6, date: "2025-11-13", title: "WTI 유가 $85 돌파, 3개월 만에 최고치", desc: "공급 감소 우려로 서부텍사스산 원유 가격이 급등했습니다.", level: "높음", country: "미국", url: "#" },
        { id: 7, date: "2025-11-13", title: "러시아, 원유 수출 물량 감축 시사", desc: "러시아가 OPEC+ 합의에 따라 추가 감산을 검토 중입니다.", level: "중간", country: "러시아", url: "#" }
    ],
    "2025-11-15": [
        { id: 8, date: "2025-11-15", title: "미국 셰일 생산량 예상보다 감소", desc: "미 에너지정보청(EIA)은 12월 셰일 생산량이 시장 예상보다 낮을 것이라 전망했습니다.", level: "높음", country: "미국", url: "#" },
        { id: 9, date: "2025-11-15", title: "사우디 국영 아람코, 설비 점검 계획 발표", desc: "아람코는 일부 정유시설의 정기 점검을 앞당긴다고 밝혀 공급 감소 우려가 커지고 있습니다.", level: "긴급", country: "사우디", url: "#" },
        { id: 10, date: "2025-11-15", title: "중국 산업생산 반등, 에너지 수요 증가 전망", desc: "중국의 산업생산 지표가 반등해 에너지 소비 증가가 예상됩니다.", level: "중간", country: "중국", url: "#" },
        { id: 11, date: "2025-11-15", title: "이란, 호르무즈 해협 군사 훈련 확대", desc: "이란 혁명수비대가 해협 일대 군사 훈련을 확대하며 원유 운송 위험이 재차 부각되고 있습니다.", level: "긴급", country: "이란", url: "#" }
    ],
    "2025-11-16": [
        { id: 12, date: "2025-11-16", title: "미국 원유 재고 예상 밖 증가", desc: "EIA 주간 보고서에서 미국 원유 재고가 시장 예상과 달리 증가한 것으로 나타났습니다.", level: "중간", country: "미국", url: "#" },
        { id: 13, date: "2025-11-16", title: "러시아, 원유 수출 경로 다변화 발표", desc: "러시아 정부는 수출 리스크를 줄이기 위해 아시아권 국가와의 새로운 원유 수송 계약을 추진 중입니다.", level: "중간", country: "러시아", url: "#" },
        { id: 14, date: "2025-11-16", title: "중국, 정제 석유제품 수출 확대 검토", desc: "내수 공급 안정화 이후 잉여 제품의 해외 수출 확대 방안을 논의하고 있습니다.", level: "낮음", country: "중국", url: "#" },
        { id: 15, date: "2025-11-16", title: "사우디·UAE, 중동 정세 안정 위한 공동성명", desc: "양국은 최근 긴장된 지역 갈등 완화를 위해 공동 외교활동을 강화하기로 했습니다.", level: "높음", country: "사우디", url: "#" }
    ],
    "2025-11-17": [
        { id: 20, date: "2025-11-17", title: "사우디, OPEC+ 감산 연장 전격 발표", desc: "사우디아라비아가 OPEC+ 회원국들과 원유 감산 합의를 2024년 1분기까지 연장한다고 발표했습니다.", level: "긴급", country: "사우디", url: "#" },
        { id: 16, date: "2025-11-17", title: "국제 유가, 지정학적 리스크로 2% 상승", desc: "중동 지역 긴장 고조로 인해 국제 유가가 일제히 상승세를 보였습니다.", level: "높음", country: "미국", url: "#" },
        { id: 17, date: "2025-11-17", title: "이란-이라크 국경지역 충돌 발생", desc: "이란과 이라크 국경 인근에서 군사적 충돌이 발생하며 원유 수송 차질이 우려됩니다.", level: "긴급", country: "이란", url: "#" },
        { id: 18, date: "2025-11-17", title: "중국, 국가비축유 비상 방출 검토", desc: "중국 정부가 산업 안정화를 위해 비축유 추가 방출 시나리오를 검토 중입니다.", level: "중간", country: "중국", url: "#" },
        { id: 19, date: "2025-11-17", title: "유럽연합(EU), 러시아산 원유 제재 강화 논의", desc: "EU는 러시아산 원유 가격상한제를 강화하는 새로운 조치를 논의했습니다.", level: "높음", country: "독일", url: "#" }
    ]
};

const levelPriority = { 긴급: 3, 높음: 2, 중간: 1, 낮음: 0 };

const mode = ref("daily");
const selectedDate = ref("2025-11-17");

function switchMode(m) {
    mode.value = m;
}

function getWeekKey(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() + 4 - day);
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    return `${date.getFullYear()}-W${week}`;
}

const mergedNews = computed(() => Object.values(sampleNewsData).flat());

const filteredNews = computed(() => {
    const selected = selectedDate.value;
    let result = [];

    if (mode.value === "daily") {
        result = mergedNews.value.filter(n => n.date === selected);
    } else {
        const weekKey = getWeekKey(selected);
        result = mergedNews.value.filter(n => getWeekKey(n.date) === weekKey);
    }

    return result.sort((a, b) => levelPriority[b.level] - levelPriority[a.level]);
});

const displayCards = computed(() => filteredNews.value);

const summaryDummyData = {
    "2025-11-17": {
        executive_summary:
            "중동 지정학적 리스크의 급격한 확대와 OPEC+ 감산 연장 이슈가 동시 발생하면서 단기 유가는 강한 상승 압력을 받았습니다. 특히 이란-이라크 접경 충돌은 리스크 프리미엄을 평균 3~5$/bbl 상승시키는 구조적 요인으로 작용하며, 단기적 변동성 확대가 불가피한 상황입니다.",

        metrics: [
            { label: "WTI", price: "$87.50", dd: 2.3, ww: 4.7, comment: "지정학 리스크 반영" },
            { label: "Brent", price: "$91.20", dd: 2.1, ww: 4.2, comment: "구조적 타이트닝" },
            { label: "Dubai", price: "$89.80", dd: 2.0, ww: 3.9, comment: "아시아 프리미엄 확대" },
            { label: "정제마진", price: "$15.30", dd: 1.8, ww: 2.5, comment: "정제마진 강세 유지" }
        ],

        macro: {
            supply:
                "사우디가 주도한 OPEC+ 감산 연장은 2024년 1분기까지의 공급 제한을 의미하며, 글로벌 공급 부족폭은 80~120kb/d 수준으로 확대될 전망입니다. 이란-이라크 충돌은 호르무즈 해협 리스크를 재부각시키며 단기 공급 차질 위험을 높이고 있습니다.",
            demand:
                "중국 제조업 PMI 반등으로 산업용 석유 수요 회복세가 유지되고 있습니다. NDRC는 산업 안정화를 위해 전략비축유 방출을 검토하고 있어 단기 수급 미스매치 완화 효과가 예상됩니다.",
            policy:
                "EU는 러시아산 원유 가격상한제 강화를 검토 중이며, 러시아의 우회 수출 확대가 장기적으로 가격 변동성을 지속시킬 가능성이 높습니다. 미국의 SPR 추가 방출은 제한적일 것으로 보입니다."
        },

        scenarios: [
            { type: "Base", range: "88-92", prob: 0.6, desc: "감산 연장 + 지정학 리스크 부분 반영" },
            { type: "Bull", range: "95+", prob: 0.25, desc: "충돌 확전 및 리스크 프리미엄 확대" },
            { type: "Bear", range: "82-85", prob: 0.15, desc: "중국 수요 둔화 및 SPR 방출" }
        ],

        risk_matrix: [
            { risk: "중동 지정학", impact: "high", comment: "충돌 확전 시 공급 차질 심화" },
            { risk: "정책 리스크", impact: "medium", comment: "EU 제재 강화 영향" },
            { risk: "수요 둔화", impact: "low", comment: "중국 재개 효과로 단기 둔화 가능성 낮음" }
        ],

        implications: [
            "단기 Long Bias 유지 권고",
            "WTI $85 이탈 시 포지션 축소",
            "콜옵션 기반 Tactical Hedge 전략",
            "정제마진 강세 구간에서 정유 섹터 비중 확대"
        ],

        monitoring: [
            "11/30 OPEC+ 회의",
            "12/13 FOMC 금리 결정",
            "12월 중국 PMI 발표"
        ]
    }
};

const summaryData = computed(() => {
    return summaryDummyData[selectedDate.value] || {
        executive_summary: "",
        metrics: [],
        macro: {},
        scenarios: [],
        risk_matrix: [],
        implications: [],
        monitoring: []
    };
});

</script>

<style scoped>
/* 카드 전환 애니메이션 */
.cards-enter-active,
.cards-leave-active {
    transition: all 0.4s ease;
}

.cards-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.cards-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>