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

const chart = ref<HTMLElement | null>(null);
const isRendered = ref(false);

const data = [
    { source: "뉴스", positive: 45, negative: -30 },
    { source: "리포트", positive: 60, negative: -20 },
    { source: "PDF", positive: 35, negative: -40 },
    { source: "SNS", positive: 50, negative: -25 },
    { source: "API", positive: 20, negative: -15 },
];

let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
let ro: ResizeObserver | null = null;

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

    const maxVal = Math.max(
        Math.abs(d3.min(data, (d) => d.negative)!),
        d3.max(data, (d) => d.positive)!
    );

    const x = d3.scaleLinear().domain([-maxVal, maxVal]).range([0, width]);
    const y = d3
        .scaleBand()
        .domain(data.map((d) => d.source))
        .range([0, height])
        .padding(0.35);

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

onMounted(() => {
    renderChart();

    ro = new ResizeObserver(() => {
        if (chart.value && document.body.contains(chart.value)) {
            renderChart();
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
