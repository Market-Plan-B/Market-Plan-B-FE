<!-- ChartBar.vue - limit 기능 추가 -->
<template>
    <div>
        <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="text-gray-500">데이터를 불러오는 중...</div>
        </div>
        <div v-else ref="chartContainer" class="w-full"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue';
import * as d3 from 'd3';

const props = defineProps<{
    apiData: any;
    loading: boolean;
    compact?: boolean;
    limit?: number; // limit prop 추가
}>();

const chartContainer = ref<HTMLElement | null>(null);

const chartHeight = computed(() => props.compact ? '280px' : '600px');

const featureImportance = computed(() => {
    const data = props.apiData?.features || props.apiData?.variable_scores;
    if (!data) return [];

    let features = Object.entries(data).map(([key, value]) => {
        const v = Number(value);
        return {
            name: key,
            negative: v < 0 ? Math.abs(v) : 0,
            positive: v > 0 ? v : 0,
            absValue: Math.abs(v) // 절대값 추가 (정렬용)
        };
    });

    // limit이 있으면 절대값 기준 상위 N개만 선택
    if (props.limit && props.limit > 0) {
        features = features
            .sort((a, b) => b.absValue - a.absValue)
            .slice(0, props.limit);
    }

    return features;
});

const drawChart = () => {
    if (!chartContainer.value || !featureImportance.value.length) return;
    d3.select(chartContainer.value).selectAll('*').remove();

    const margin = props.compact
        ? { top: 10, right: 10, bottom: 35, left: 40 }
        : { top: 20, right: 20, bottom: 60, left: 80 };

    const fullHeight = props.compact ? 200 : 400;
    const width = chartContainer.value.clientWidth - margin.left - margin.right;
    const height = fullHeight - margin.top - margin.bottom;

    const svg = d3.select(chartContainer.value).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', fullHeight)
        .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([-1, 1]).range([0, width]);

    const yScale = d3.scaleBand()
        .domain(featureImportance.value.map(d => d.name))
        .range([0, height])
        .padding(0.1);

    const tooltip = d3.select("body").append("div")
        .style("position", "absolute").style("visibility", "hidden")
        .style("background", "rgba(0,0,0,0.85)").style("color", "white")
        .style("padding", "8px 12px").style("border-radius", "6px")
        .style("font-size", "11px").style("pointer-events", "none").style("z-index", "9999");

    svg.append('line').attr('x1', xScale(0)).attr('x2', xScale(0))
        .attr('y1', 0).attr('y2', height).attr('stroke', '#64748b')
        .attr('stroke-width', 1.5).attr('stroke-dasharray', '3,3');

    const defs = svg.append('defs');
    ['blue', 'red'].forEach((c, i) => {
        const g = defs.append('linearGradient').attr('id', `gradient-${c}`).attr('x1', '0%').attr('x2', '100%');
        const colors = i === 0 ? ['#3b82f6', '#60a5fa'] : ['#ef4444', '#f87171'];
        g.append('stop').attr('offset', '0%').attr('stop-color', colors[0]);
        g.append('stop').attr('offset', '100%').attr('stop-color', colors[1]);
    });

    const addBars = (cls: string, xFn: (d: any) => number, wFn: (d: any) => number, fill: string, html: (d: any) => string) => {
        svg.selectAll(cls).data(featureImportance.value).enter().append('rect')
            .attr('class', cls.slice(1)).attr('x', xFn).attr('y', d => yScale(d.name)!)
            .attr('width', wFn).attr('height', yScale.bandwidth()).attr('fill', fill).attr('rx', 3)
            .on('mouseover', (e, d) => tooltip.html(html(d)).style('visibility', 'visible'))
            .on('mousemove', e => tooltip.style('top', `${e.pageY - 40}px`).style('left', `${e.pageX + 10}px`))
            .on('mouseout', () => tooltip.style('visibility', 'hidden'));
    };

    addBars('.bar-negative', d => xScale(-d.negative), d => xScale(0) - xScale(-d.negative), 'url(#gradient-blue)',
        d => `<b>${d.name}</b><br/><span style="color:#60a5fa">하방: ${(d.negative * 100).toFixed(2)}%</span>`);
    addBars('.bar-positive', () => xScale(0), d => xScale(d.positive) - xScale(0), 'url(#gradient-red)',
        d => `<b>${d.name}</b><br/><span style="color:#f87171">상승: +${(d.positive * 100).toFixed(2)}%</span>`);

    const fontSize = props.compact ? '9px' : '12px';
    const labelSize = props.compact ? '11px' : '14px';
    const tickCount = props.compact ? 6 : 10;

    svg.append('g').attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d => `${(+d * 100).toFixed(0)}%`).ticks(tickCount))
        .selectAll('text').style('font-size', fontSize).style('fill', '#475569');

    svg.append('g').call(d3.axisLeft(yScale))
        .selectAll('text').style('font-weight', '600').style('font-size', labelSize);
};

watch(() => props.apiData, () => nextTick(drawChart), { deep: true });

onMounted(() => {
    nextTick(drawChart);
    window.addEventListener('resize', drawChart);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', drawChart);
    d3.selectAll("body > div[style*='position: absolute']").remove();
});
</script>

<style scoped>
:deep(.bar-negative),
:deep(.bar-positive) {
    cursor: pointer;
    transition: opacity 0.2s ease;
}

:deep(.bar-negative):hover,
:deep(.bar-positive):hover {
    opacity: 0.8;
}
</style>