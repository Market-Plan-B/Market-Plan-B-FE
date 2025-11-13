<template>
    <div class="space-y-8">
        <section class="bg-white rounded-2xl p-6 shadow-sm">
            <h2 class="font-bold text-2xl mb-1 text-gray-800">영향 분석</h2>
            <p class="text-sm text-gray-500 mb-6">AI가 도출한 공급·수요·지정학 요인별 핵심 인사이트입니다.</p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div class="bg-orange-50 rounded-xl p-6">
                    <div class="text-gray-500 text-sm mb-1">오늘의 시장 점수</div>
                    <div class="text-4xl font-bold text-orange-500">7.9</div>
                    <div class="text-xs text-gray-400 mt-1">10점 만점 기준</div>
                </div>

                <div class="bg-green-50 rounded-xl p-6">
                    <div class="text-gray-500 text-sm mb-1">전일 대비 변화</div>
                    <div class="text-3xl font-bold text-green-600">+0.4</div>
                    <div class="text-xs text-gray-400 mt-1">리스크 완화 추세</div>
                </div>

                <div class="bg-blue-50 rounded-xl p-6">
                    <div class="text-gray-500 text-sm mb-1">주간 추세</div>
                    <div class="text-sm font-semibold text-green-600">완만한 상승세</div>
                </div>
            </div>
        </section>

        <section class="bg-white rounded-2xl p-6 shadow-sm">
            <h3 class="font-semibold text-gray-800 mb-4">요인별 영향도</h3>
            <div class="space-y-3">
                <div v-for="item in impacts" :key="item.name" class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 w-44">{{ item.name }}</span>
                    <div class="flex-1 flex items-center mx-2">
                        <div class="bg-blue-400 h-2 rounded-l-full" :style="{ width: item.downside + '%' }"></div>
                        <div class="bg-red-500 h-2 rounded-r-full" :style="{ width: item.upside + '%' }"></div>
                    </div>
                    <span class="text-xs text-gray-400 w-12 text-right">+{{ item.upside }}%</span>
                </div>
            </div>
            <div class="mt-4 text-xs text-gray-400 text-center">
                <span class="text-blue-500">파란색 = 하방 압력</span> / <span class="text-red-500">빨간색 = 상승 모멘텀</span>
            </div>
        </section>

        <section class="bg-white rounded-2xl p-6 shadow-sm">
            <h3 class="font-semibold text-gray-800 mb-3">AI 코멘터리</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
                OPEC+의 감산 준수와 견조한 수요가 거시적 약세 신호를 상쇄하며 상승 모멘텀이 유지되고 있습니다. 브렌트유는
                82~88달러 박스권 상단을 테스트할 것으로 예상되며, 지정학적 프리미엄이 유지되는 한 조정 폭은 제한적일 전망입니다.
            </p>
        </section>
    </div>
</template>

<script setup>
const impacts = [
    { name: '정책·규제 결정', upside: 32, downside: 18 },
    { name: '지정학 리스크', upside: 27, downside: 24 },
    { name: '수요 전망', upside: 21, downside: 9 },
    { name: '공급 차질', upside: 19, downside: 12 },
    { name: '정제 마진', upside: 14, downside: 11 },
]
</script>
