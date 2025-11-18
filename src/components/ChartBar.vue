<template>
    <div ref="chart" v-once
        class="relative w-full h-[280px] rounded-xl bg-gradient-to-b from-white to-orange-50/10 border border-slate-100 shadow-inner">
        <div v-if="!isRendered" class="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            데이터 렌더링 중...
        </div>
    </div>
</template>

<script setup lang="ts">
import * as d3 from "d3";
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { dashboardAPI } from "@/api/dashboard";

const chart = ref<HTMLElement | null>(null);
const isRendered = ref(false);
const factorData = ref({});

let svg: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
let ro: ResizeObserver | null = null;

const loadFactorData = async () => {
    try {
        // Router에서 미리 로드된 데이터 사용 (아직 없으므로 직접 호출)
        const response = await dashboardAPI.getFactorImpact();
        factorData.value = response.data.variable_scores;
        console.log('요소별 데이터 로드 완료:', factorData.value);
    } catch (error) {
        console.error('요소별 데이터 로드 실패:', error);
    }
};

const getChartData = () => {
    if (Object.keys(factorData.value).length === 0) {
        return [];
    }

    return Object.entries(factorData.value).map(([key, value]) => ({
        source: key,
        positive: Math.max(0, value as number),
        negative: Math.min(0, value as number)
    }));
};

const renderChart = async () => {
    await nextTick();
    if (!chart.value) return;

    if (!document.body.contains(chart.value)) return;

    d3.select(chart.value).selectAll("*").remove();

    const fullWidth = chart.value.clientWidth || 500;
    const fullHeight = chart.value.clientHeight || 280;
    const margin = { top: 20, right: 40, bottom: 20, left: 120 };
    const width = fullWidth - margin.left - margin.right;
    const height = fullHeight - margin.top - margin.bottom;

    svg = d3
        .select(chart.value)
        .append("svg")
        .attr("width", fullWidth)
        .attr("height", fullHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const data = getChartData();

    if (data.length === 0) {
        isRendered.value = true;
        return;
    }

    const maxVal = Math.max(
        Math.abs(d3.min(data, (d) => d.negative) || 0),
        d3.max(data, (d) => d.positive) || 0
    );

    const x = d3.scaleLinear().domain([-maxVal, maxVal]).range([0, width]);
    const y = d3
        .scaleBand()
        .domain(data.map((d) => d.source))
        .range([0, height])
        .padding(0.35);

    if (!svg) return;

    svg
        .append("line")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#cbd5e1")
        .attr("stroke-width", 1.2)
        .attr("stroke-dasharray", "4,3");

    svg
        .append("g")
        .call(d3.axisLeft(y).tickSize(0))
        .selectAll("text")
        .style("font-size", "13px")
        .style("font-weight", "600")
        .style("fill", "#334155");

    svg
        .selectAll(".bar-neg")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.negative))
        .attr("y", (d) => y(d.source)!)
        .attr("width", (d) => x(0) - x(d.negative))
        .attr("height", y.bandwidth())
        .attr("rx", 5)
        .attr("fill", "url(#negGradient)")
        .attr("opacity", 0.9);

    svg
        .selectAll(".bar-pos")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", x(0))
        .attr("y", (d) => y(d.source)!)
        .attr("width", (d) => x(d.positive) - x(0))
        .attr("height", y.bandwidth())
        .attr("rx", 5)
        .attr("fill", "url(#posGradient)")
        .attr("opacity", 0.9);

    svg
        .selectAll(".val-pos")
        .data(data)
        .enter()
        .append("text")
        .attr("x", (d) => x(d.positive) + 5)
        .attr("y", (d) => y(d.source)! + y.bandwidth() / 1.6)
        .attr("fill", "#1e3a8a")
        .attr("font-size", "12px")
        .text((d) => d.positive);

    svg
        .selectAll(".val-neg")
        .data(data)
        .enter()
        .append("text")
        .attr("x", (d) => x(d.negative) - 5)
        .attr("y", (d) => y(d.source)! + y.bandwidth() / 1.6)
        .attr("fill", "#b91c1c")
        .attr("font-size", "12px")
        .attr("text-anchor", "end")
        .text((d) => Math.abs(d.negative));

    const defs = svg.append("defs");
    defs
        .append("linearGradient")
        .attr("id", "posGradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .selectAll("stop")
        .data([
            { offset: "0%", color: "#60a5fa" },
            { offset: "100%", color: "#2563eb" },
        ])
        .enter()
        .append("stop")
        .attr("offset", (d) => d.offset)
        .attr("stop-color", (d) => d.color);

    defs
        .append("linearGradient")
        .attr("id", "negGradient")
        .attr("x1", "100%")
        .attr("x2", "0%")
        .selectAll("stop")
        .data([
            { offset: "0%", color: "#f87171" },
            { offset: "100%", color: "#dc2626" },
        ])
        .enter()
        .append("stop")
        .attr("offset", (d) => d.offset)
        .attr("stop-color", (d) => d.color);

    isRendered.value = true;
};

onMounted(async () => {
    await loadFactorData();
    renderChart();

    ro = new ResizeObserver(async () => {
        if (chart.value && document.body.contains(chart.value)) {
            await renderChart();
        }
    });

    if (chart.value) ro.observe(chart.value);
});

onBeforeUnmount(() => {
    if (ro) ro.disconnect();
    d3.select(chart.value).selectAll("*").remove();
});
</script>

<style scoped>
svg {
    animation: fadeIn 0.4s ease-out both;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
