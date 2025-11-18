<template>
    <div class="space-y-8">
        <section class="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 class="font-bold text-2xl mb-2 text-gray-900">영향도 분석</h2>
                    <p class="text-sm text-gray-600">AI가 도출한 공급·수요·지정학 요인별 핵심 인사이트입니다.</p>
                </div>

                <div class="relative">
                    <input type="date" v-model="selectedDate"
                        class="px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 bg-white hover:border-blue-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium shadow-sm" />
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-l-4 border-orange-600 shadow-md hover:shadow-lg transition-all duration-300">
                    <div class="flex items-center justify-between mb-3">
                        <div class="text-gray-700 text-sm font-semibold">오늘의 시장 점수</div>
                        <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div class="text-5xl font-bold text-orange-600 mb-2">{{ apiData?.impact_score || '0.0' }}</div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-600 font-medium">10점 만점 기준</span>
                        <div class="flex-1 bg-orange-200 rounded-full h-2">
                            <div class="bg-orange-600 h-2 rounded-full transition-all duration-500"
                                :style="{ width: (parseFloat(apiData?.impact_score || '0') * 10) + '%' }"></div>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-l-4 border-green-600 shadow-md hover:shadow-lg transition-all duration-300">
                    <div class="flex items-center justify-between mb-3">
                        <div class="text-gray-700 text-sm font-semibold">전일 대비 변화</div>
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div class="text-5xl font-bold text-green-600 mb-2">{{ parseFloat(apiData?.change_score || '0') >= 0 ? '+' : '' }}{{ apiData?.change_score || '0.0' }}</div>
                    <div class="inline-flex items-center px-3 py-1 rounded-full bg-green-200">
                        <span class="text-xs text-green-800 font-bold">{{ parseFloat(apiData?.change_score || '0') >= 0 ? '상승 추세' : '하락 추세' }}</span>
                    </div>
                </div>

                <div
                    class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-l-4 border-blue-600 shadow-md hover:shadow-lg transition-all duration-300">
                    <div class="flex items-center justify-between mb-3">
                        <div class="text-gray-700 text-sm font-semibold">주간 추세</div>
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                    </div>
                    <div class="text-2xl font-bold text-blue-600 mb-2">{{ currentScore.weeklyTrend }}</div>
                    <div class="flex items-center gap-1">
                        <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                                clip-rule="evenodd" />
                        </svg>
                        <span class="text-xs text-blue-800 font-medium">지속적 모멘텀</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div class="flex items-center gap-2 mb-6">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <h3 class="font-bold text-xl text-gray-900">요인별 영향도 분석</h3>
            </div>

            <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button v-for="tab in impactTabs" :key="tab.id" @click="activeTab = tab.id"
                    class="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap"
                    :class="activeTab === tab.id
                        ? 'bg-indigo-600 text-black shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
                    {{ tab.label }}
                </button>
            </div>

            <div class="space-y-5">
                <div v-for="item in currentImpacts" :key="item.name" class="group">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-semibold text-gray-700">{{ item.name }}</span>
                        <div class="flex items-center gap-3">
                            <span class="text-xs text-blue-600 font-bold">↓ {{ item.downside }}%</span>
                            <span class="text-xs text-red-600 font-bold">↑ {{ item.upside }}%</span>
                        </div>
                    </div>

                    <!-- 프로그레스 바 -->
                    <div class="flex items-center gap-2">
                        <div class="flex-1 flex h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div class="bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500 group-hover:from-blue-500 group-hover:to-blue-600"
                                :style="{ width: item.downside + '%' }">
                            </div>
                            <div class="bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500 group-hover:from-red-500 group-hover:to-red-600"
                                :style="{ width: item.upside + '%' }">
                            </div>
                        </div>
                        <span class="text-sm font-bold text-gray-700 w-16 text-right">
                            {{ item.upside + item.downside }}%
                        </span>
                    </div>
                </div>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-200">
                <div class="flex items-center justify-center gap-6 text-sm">
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded"></div>
                        <span class="text-gray-600 font-medium">하방 압력 (Downside)</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-gradient-to-r from-red-400 to-red-500 rounded"></div>
                        <span class="text-gray-600 font-medium">상승 모멘텀 (Upside)</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div class="flex items-center gap-2 mb-6">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <h3 class="font-bold text-xl text-gray-900">피처 중요도 분석</h3>
                <span class="text-xs text-gray-500 ml-2">(AI 모델이 영향도 평가 시 활용한 주요 지표)</span>
            </div>

            <div v-if="loading" class="flex justify-center items-center h-96">
                <div class="text-gray-500">데이터를 불러오는 중...</div>
            </div>
            <div v-else ref="chartContainer" class="w-full" style="min-height: 600px;"></div>

            <div class="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-sm text-gray-700 leading-relaxed">
                        막대 그래프는 각 피처가 가격 <span class="font-bold text-red-600">상승(오른쪽)</span> 또는 <span
                            class="font-bold text-blue-600">하락(왼쪽)</span>에 기여한 정도를 나타냅니다.
                        막대 위에 마우스를 올리면 상세 정보를 확인할 수 있습니다.
                    </p>
                </div>
            </div>
        </section>

        <section class="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-3xl p-8 shadow-lg border border-slate-200">
            <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                    <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828
                            9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4
                            0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <div class="flex-1">
                    <h3 class="font-bold text-xl text-gray-900">AI 인사이트</h3>
                    <div class="bg-white rounded-2xl p-6 shadow-md">
                        <p class="text-sm text-gray-700 leading-relaxed">
                            {{ currentScore.commentary }}
                        </p>

                        <div class="mt-4 pt-4 border-t border-gray-200">
                            <div class="text-xs font-semibold text-gray-500 mb-2">핵심 포인트</div>
                            <div class="flex flex-wrap gap-2">
                                <span v-for="tag in currentScore.tags" :key="tag"
                                    class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                                    {{ tag }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <ChatBotFloating />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import * as d3 from 'd3';
import ChatBotFloating from "@/components/ui/ChatBotFloating.vue";
import { getImpactAnalysis } from '@/api/analysisApi';

const selectedDate = ref(new Date().toISOString().split('T')[0]);
const activeTab = ref('overall');
const apiData = ref(null);
const loading = ref(false);

const impactTabs = [
    { id: 'overall', label: '전체 요인' },
    { id: 'supply', label: '공급 요인' },
    { id: 'demand', label: '수요 요인' },
    { id: 'geopolitical', label: '지정학 요인' },
    { id: 'policy', label: '정책 요인' }
];

const scoreData = {
    '2025-11-17': {
        score: 7.9,
        change: 0.4,
        trend: '리스크 완화 추세',
        weeklyTrend: '완만한 상승세',
        commentary: 'OPEC+의 감산 준수와 견조한 수요가 거시적 약세 신호를 상쇄하며 상승 모멘텀이 유지되고 있습니다. 브렌트유는 $82-88 박스권 상단을 테스트할 것으로 예상되며, 지정학적 프리미엄이 유지되는 한 조정 폭은 제한적일 전망입니다.',
        tags: ['OPEC+ 감산', '$82-88 박스권', '제한적 조정', '지정학 프리미엄']
    },
    '2025-11-16': {
        score: 7.5,
        change: -0.2,
        trend: '변동성 증가',
        weeklyTrend: '횡보 구간',
        commentary: '미국 원유 재고 증가와 중국 경제 지표 부진이 단기 약세 압력으로 작용하고 있으나, OPEC+ 감산 이행과 중동 리스크가 하방을 제한하고 있습니다.',
        tags: ['재고 증가', '중국 경제', 'OPEC+ 이행']
    }
};

const impactData = {
    overall: [
        { name: '정책·규제 결정', upside: 32, downside: 18 },
        { name: '지정학 리스크', upside: 27, downside: 24 },
        { name: '수요 전망', upside: 21, downside: 9 },
        { name: '공급 차질', upside: 19, downside: 12 },
        { name: '정제 마진', upside: 14, downside: 11 }
    ],
    supply: [
        { name: 'OPEC+ 생산량', upside: 35, downside: 15 },
        { name: '미국 셰일 생산', upside: 28, downside: 22 },
        { name: '비축유 방출', upside: 12, downside: 30 },
        { name: '정제시설 가동률', upside: 18, downside: 16 }
    ],
    demand: [
        { name: '중국 경제 성장', upside: 38, downside: 12 },
        { name: '미국 소비 지표', upside: 25, downside: 18 },
        { name: '항공 수요', upside: 22, downside: 15 },
        { name: '산업 활동', upside: 20, downside: 14 }
    ],
    geopolitical: [
        { name: '중동 정세', upside: 42, downside: 8 },
        { name: '러시아-우크라이나', upside: 28, downside: 20 },
        { name: '호르무즈 해협', upside: 35, downside: 12 },
        { name: '이란 핵협상', upside: 24, downside: 18 }
    ],
    policy: [
        { name: 'Fed 통화정책', upside: 15, downside: 32 },
        { name: '환경 규제', upside: 12, downside: 28 },
        { name: '무역 정책', upside: 20, downside: 22 },
        { name: 'SPR 정책', upside: 18, downside: 25 }
    ]
};

const featureImportance = computed(() => {
    if (!apiData.value?.features) return [];
    
    return Object.entries(apiData.value.features).map(([key, values]) => ({
        name: key,
        negative: values[0] / 100,
        positive: values[1] / 100,
        description: `${key} 영향도 분석`
    }));
});

const currentScore = computed(() => {
    return scoreData[selectedDate.value] || scoreData['2025-11-17'];
});

const currentImpacts = computed(() => {
    return impactData[activeTab.value] || impactData.overall;
});

const chartContainer = ref(null);

const drawChart = () => {
    if (!chartContainer.value || !featureImportance.value.length) return;

    d3.select(chartContainer.value).selectAll('*').remove();

    const margin = { top: 20, right: 60, bottom: 60, left: 200 };
    const width = chartContainer.value.clientWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select(chartContainer.value)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([-0.5, 0.5])
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(featureImportance.value.map(d => d.name))
        .range([0, height])
        .padding(0.2);

    const tooltip = d3.select(chartContainer.value)
        .append('div')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', 'rgba(0, 0, 0, 0.9)')
        .style('color', 'white')
        .style('padding', '12px')
        .style('border-radius', '8px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .style('box-shadow', '0 4px 6px rgba(0,0,0,0.3)');

    // 중앙선
    svg.append('line')
        .attr('x1', xScale(0))
        .attr('x2', xScale(0))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#64748b')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4');

    svg.selectAll('.bar-negative')
        .data(featureImportance.value)
        .enter()
        .append('rect')
        .attr('class', 'bar-negative')
        .attr('x', d => xScale(d.negative))
        .attr('y', d => yScale(d.name))
        .attr('width', 0)
        .attr('height', yScale.bandwidth())
        .attr('fill', 'url(#gradient-blue)')
        .attr('rx', 4)
        .on('mouseover', function (event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('opacity', 0.8);

            tooltip
                .html(`
                    <div style="font-weight: bold; margin-bottom: 8px;">${d.name}</div>
                    <div style="color: #60a5fa; margin-bottom: 4px;">하방 기여도: ${(d.negative * 100).toFixed(1)}%</div>
                    <div style="color: #94a3b8; font-size: 11px;">${d.description}</div>
                `)
                .style('visibility', 'visible');
        })
        .on('mousemove', function (event) {
            tooltip
                .style('top', (event.pageY - 60) + 'px')
                .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function () {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('opacity', 1);

            tooltip.style('visibility', 'hidden');
        })
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .attr('width', d => xScale(0) - xScale(d.negative));

    svg.selectAll('.bar-positive')
        .data(featureImportance.value)
        .enter()
        .append('rect')
        .attr('class', 'bar-positive')
        .attr('x', xScale(0))
        .attr('y', d => yScale(d.name))
        .attr('width', 0)
        .attr('height', yScale.bandwidth())
        .attr('fill', 'url(#gradient-red)')
        .attr('rx', 4)
        .on('mouseover', function (event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('opacity', 0.8);

            tooltip
                .html(`
                    <div style="font-weight: bold; margin-bottom: 8px;">${d.name}</div>
                    <div style="color: #f87171; margin-bottom: 4px;">상방 기여도: +${(d.positive * 100).toFixed(1)}%</div>
                    <div style="color: #94a3b8; font-size: 11px;">${d.description}</div>
                `)
                .style('visibility', 'visible');
        })
        .on('mousemove', function (event) {
            tooltip
                .style('top', (event.pageY - 60) + 'px')
                .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function () {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('opacity', 1);

            tooltip.style('visibility', 'hidden');
        })
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .attr('width', d => xScale(d.positive) - xScale(0));

    const defs = svg.append('defs');

    const gradientBlue = defs.append('linearGradient')
        .attr('id', 'gradient-blue')
        .attr('x1', '0%')
        .attr('x2', '100%');
    gradientBlue.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#3b82f6');
    gradientBlue.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#60a5fa');

    const gradientRed = defs.append('linearGradient')
        .attr('id', 'gradient-red')
        .attr('x1', '0%')
        .attr('x2', '100%');
    gradientRed.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ef4444');
    gradientRed.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#f87171');

    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => `${(d * 100).toFixed(0)}%`)
        .ticks(10);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('font-size', '12px')
        .style('fill', '#64748b');

    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
        .call(yAxis)
        .selectAll('text')
        .style('font-size', '13px')
        .style('font-weight', '600')
        .style('fill', '#1e293b');

    svg.append('text')
        .attr('x', xScale(-0.25))
        .attr('y', -5)
        .style('font-size', '12px')
        .style('fill', '#3b82f6')
        .style('font-weight', 'bold')
        .text('← 하방 압력');

    svg.append('text')
        .attr('x', xScale(0.18))
        .attr('y', -5)
        .style('font-size', '12px')
        .style('fill', '#ef4444')
        .style('font-weight', 'bold')
        .text('상승 모멘텀 →');
};

const fetchData = async () => {
    loading.value = true;
    try {
        apiData.value = await getImpactAnalysis(selectedDate.value);
    } catch (error) {
        console.error('Failed to fetch impact analysis:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchData();
    window.addEventListener('resize', drawChart);
});

watch(selectedDate, () => {
    fetchData();
});

watch(apiData, () => {
    nextTick(() => {
        drawChart();
    });
});
</script>

<style scoped>
/* D3 차트 스타일 */
:deep(svg) {
    font-family: inherit;
}

:deep(.bar-negative),
:deep(.bar-positive) {
    cursor: pointer;
    transition: opacity 0.2s ease;
}
</style>