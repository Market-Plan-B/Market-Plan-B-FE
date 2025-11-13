<template>
    <div class="space-y-8">
        <section class="bg-white rounded-2xl p-6 shadow-sm">
            <h2 class="font-bold text-2xl text-gray-800 mb-1">주간 브리핑</h2>
            <p class="text-sm text-gray-500 mb-6">주요 원유 벤치마크와 거시 동향의 핵심 포인트를 정리했습니다.</p>

            <div class="flex flex-wrap items-center gap-4 mb-6">
                <button v-for="tab in tabs" :key="tab" @click="activeTab = tab" :class="['px-4 py-2 rounded-xl font-medium text-sm transition',
                    activeTab === tab
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                ]">
                    {{ tab }}
                </button>

                <div class="ml-auto flex items-center text-sm text-gray-500">
                    <i class="ri-calendar-line mr-2"></i> {{ today }}
                </div>
            </div>

            <div class="relative w-full overflow-hidden rounded-2xl bg-slate-900">
                <img :src="report.image" alt="Report cover" class="w-full h-72 object-cover opacity-60" />
                <div class="absolute bottom-6 left-6 text-white max-w-lg">
                    <div class="text-sm opacity-80 mb-1">{{ report.date }}</div>
                    <div class="text-2xl font-semibold mb-1">{{ report.title }}</div>
                    <div class="text-sm text-gray-200 leading-relaxed">{{ report.summary }}</div>
                </div>
            </div>
        </section>

        <section class="bg-white rounded-2xl p-6 shadow-sm">
            <h3 class="font-semibold text-gray-800 mb-3">상세 분석</h3>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1 mb-4">
                <li>WTI는 배럴당 84.2달러로 마감하며 주간 1.7% 상승했습니다.</li>
                <li>OPEC+는 현 감산 합의를 연장할 의사를 내비쳤습니다.</li>
                <li>중국 정유사들은 내수 회복에 힘입어 가동률을 추가 확대했습니다.</li>
                <li>EIA 기준 미국 원유 재고는 380만 배럴 감소했습니다.</li>
            </ul>
            <p class="text-sm text-gray-600 leading-relaxed">
                연말까지 브렌트유는 82~88달러 범위 상단을 재차 테스트할 것으로 보입니다. 글로벌 성장 지표와 추가 전략비축유
                방출이 하방 리스크로 남아 있으나, 해상 물류와 지정학 변수로 변동성 프리미엄이 유지되고 있습니다.
            </p>
        </section>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const tabs = ['일간 리포트', '주간 패키지', '시나리오 덱']
const activeTab = ref(tabs[1])
const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

const report = computed(() => ({
    date: '11월 10일 주간',
    title: activeTab.value === '일간 리포트' ? '북미 수급 동향' : '대서양 유역 공급 모니터',
    summary:
        activeTab.value === '시나리오 덱'
            ? '수요 충격, 해상 물류 차질, 대체 공급을 변수로 한 스트레스 테스트 결과입니다.'
            : '견조한 수요가 추가 공급을 상쇄하며 정유 설비 점검에도 수급 타이트함이 유지되고 있습니다.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
}))
</script>
