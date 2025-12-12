<template>
    <div>
        <div v-if="loading" class="chart-loading">
            <div class="loading-spinner"></div>
            <div class="loading-text">데이터를 불러오는 중...</div>
        </div>
        <template v-else>
            <div class="chart-mode-toggle">
                <button v-for="mode in modes" :key="mode.value" @click="viewMode = mode.value" class="mode-toggle-btn"
                    :class="{ 'mode-toggle-btn--active': viewMode === mode.value }">
                    {{ mode.label }}
                </button>
            </div>
            <div ref="chartContainer" class="w-full"></div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue';
import * as d3 from 'd3';

const props = defineProps<{
    apiData: any;
    loading: boolean;
    limit?: number;
}>();

const chartContainer = ref<HTMLElement | null>(null);
const viewMode = ref<'normalized' | 'absolute'>('normalized');
const modes = [
    { value: 'normalized' as const, label: 'Normalized' },
    { value: 'absolute' as const, label: 'Actual Value' }
];

const rawFeatures = computed(() => {
    const data = props.apiData?.features || props.apiData?.variable_scores || props.apiData;
    if (!data || typeof data !== 'object') return [];

    return Object.entries(data).map(([key, value]) => {
        const v = Array.isArray(value) ? Number(value[0]) : Number(value);
        return { name: key, value: v, absValue: Math.abs(v) };
    });
});

const processedData = computed(() => {
    const isNormalized = viewMode.value === 'normalized';
    let features = [...rawFeatures.value];

    // Normalized: 정확히 0인 값만 제외 / Actual: 전체 포함
    if (isNormalized) {
        features = features.filter(d => d.value !== 0);
    }

    // 절대값 기준 정렬
    features = features.sort((a, b) => b.absValue - a.absValue);

    // limit 적용
    if (props.limit && props.limit > 0) {
        features = features.slice(0, props.limit);
    }

    const maxAbs = d3.max(features, d => d.absValue) || 1;
    const count = features.length;

    return features.map((d, i) => {
        // Normalized: 순위 기반 비율 (1위=100%, 꼴찌=10%)
        const rankRatio = count > 1 ? 1 - (i / count) * 0.9 : 1;
        const sign = d.value >= 0 ? 1 : -1;

        return {
            ...d,
            normalized: sign * rankRatio,
            negative: d.value < 0 ? Math.abs(d.value) : 0,
            positive: d.value >= 0 ? d.value : 0,
            negativeNorm: d.value < 0 ? rankRatio : 0,
            positiveNorm: d.value >= 0 ? rankRatio : 0
        };
    });
});

const drawChart = () => {
    if (!chartContainer.value || !processedData.value.length) return;
    d3.select(chartContainer.value).selectAll('*').remove();

    const data = processedData.value;
    const isNormalized = viewMode.value === 'normalized';
    const margin = { top: 20, right: 30, bottom: 60, left: 120 };
    const width = chartContainer.value.clientWidth - margin.left - margin.right;
    const height = Math.max(300, data.length * 28) - margin.top - margin.bottom;

    const svg = d3.select(chartContainer.value).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const maxVal = isNormalized ? 1 : d3.max(data, d => d.absValue) || 1;
    const xScale = d3.scaleLinear().domain([-maxVal, maxVal]).range([0, width]);
    const yScale = d3.scaleBand().domain(data.map(d => d.name)).range([0, height]).padding(0.15);

    // Gradient definitions
    const defs = svg.append('defs');
    [['negative', '#3b82f6', '#60a5fa'], ['positive', '#ef4444', '#f87171']].forEach(([id, c1, c2]) => {
        const grad = defs.append('linearGradient').attr('id', `grad-${id}`).attr('x1', '0%').attr('x2', '100%');
        grad.append('stop').attr('offset', '0%').attr('stop-color', c1);
        grad.append('stop').attr('offset', '100%').attr('stop-color', c2);
    });

    // Center line
    svg.append('line')
        .attr('x1', xScale(0)).attr('x2', xScale(0))
        .attr('y1', 0).attr('y2', height)
        .attr('stroke', '#64748b').attr('stroke-width', 1.5).attr('stroke-dasharray', '3,3');

    // Tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'chart-tooltip')
        .style('position', 'absolute').style('visibility', 'hidden')
        .style('background', 'rgba(0,0,0,0.9)').style('color', 'white')
        .style('padding', '10px 14px').style('border-radius', '8px')
        .style('font-size', '12px').style('pointer-events', 'none')
        .style('z-index', '9999').style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)');

    const formatValue = (v: number, isNorm: boolean) => isNorm ? `${(v * 100).toFixed(0)}%` : v.toFixed(4);

    // Draw bars
    svg.selectAll('.bar')
        .data(data).enter().append('rect')
        .attr('class', 'bar')
        .attr('y', d => yScale(d.name)!)
        .attr('height', yScale.bandwidth())
        .attr('rx', 4)
        .attr('fill', d => d.value >= 0 ? 'url(#grad-positive)' : 'url(#grad-negative)')
        .attr('x', d => {
            if (d.value >= 0) return xScale(0);
            const val = isNormalized ? d.negativeNorm : d.negative;
            return xScale(-val);
        })
        .attr('width', 0)
        .on('mouseover', (e, d) => {
            const color = d.value >= 0 ? '#f87171' : '#60a5fa';
            const sign = d.value >= 0 ? '+' : '';
            const rankInfo = isNormalized
                ? `<div style="color:#94a3b8;font-size:11px">Actual: ${sign}${d.value.toFixed(4)}</div>`
                : `<div style="color:#94a3b8;font-size:11px">Rank Score: ${formatValue(Math.abs(d.normalized), true)}</div>`;
            tooltip.html(`
                <div style="font-weight:600;margin-bottom:4px">${d.name}</div>
                <div style="color:${color}">${sign}${isNormalized ? formatValue(Math.abs(d.normalized), true) : d.value.toFixed(4)}</div>
                ${rankInfo}
            `).style('visibility', 'visible');
        })
        .on('mousemove', e => tooltip.style('top', `${e.pageY - 50}px`).style('left', `${e.pageX + 15}px`))
        .on('mouseout', () => tooltip.style('visibility', 'hidden'))
        .transition().duration(600).ease(d3.easeCubicOut)
        .attr('width', d => {
            const val = d.value >= 0
                ? (isNormalized ? d.positiveNorm : d.positive)
                : (isNormalized ? d.negativeNorm : d.negative);
            return Math.abs(xScale(val) - xScale(0));
        });

    // Axes
    const tickFormat = isNormalized
        ? (d: any) => `${(+d * 100).toFixed(0)}%`
        : (d: any) => d3.format('.2f')(d);

    svg.append('g').attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(8).tickFormat(tickFormat))
        .selectAll('text').style('font-size', '11px').style('fill', '#94a3b8');

    svg.append('g').call(d3.axisLeft(yScale))
        .selectAll('text').style('font-size', '12px').style('fill', '#111827').style('font-weight', '500');

    svg.selectAll('.domain, .tick line').attr('stroke', '#475569');
};

watch([() => props.apiData, viewMode], () => nextTick(drawChart), { deep: true });

onMounted(() => {
    nextTick(drawChart);
    window.addEventListener('resize', drawChart);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', drawChart);
    d3.selectAll('.chart-tooltip').remove();
});
</script>

<style scoped>
/* Mode Toggle Buttons */
.chart-mode-toggle {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
    gap: 8px;
}

.mode-toggle-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    background: #ffffff;
    color: #6b7280;
}

.mode-toggle-btn:hover {
    background: #f8fafc;
    border-color: #ea580c;
    color: #ea580c;
}

.mode-toggle-btn--active {
    background: #ea580c;
    color: #ffffff;
    border-color: #ea580c;
    box-shadow: 0 2px 4px rgba(234, 88, 12, 0.2);
}

.mode-toggle-btn--active:hover {
    background: #c2410c;
    border-color: #c2410c;
}

/* Chart Styles */
:deep(rect) {
    cursor: pointer;
    transition: opacity 0.2s;
}

:deep(rect:hover) {
    opacity: 0.85;
}

/* Loading Styles */
.chart-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 256px;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top-color: #ea580c;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-text {
    margin-top: 16px;
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>