<template>
    <div class="w-full max-h-[480px] flex flex-col">
        <div class="flex items-center justify-between mb-3"></div>

        <!-- 전체 간격을 넉넉하게 -->
        <div class="overflow-y-auto pr-2 text-sm leading-relaxed space-y-4">

            <!-- API 데이터 -->
            <div v-if="contentType === 'api'" class="space-y-4">
                <div v-for="(strategy, index) in strategies" :key="strategy.id"
                    class="border p-4 rounded-xl bg-slate-50 shadow-sm space-y-2">

                    <h3 class="font-semibold text-gray-900 text-base">
                        {{ strategy.title }}
                    </h3>

                    <p class="text-gray-700">
                        {{ strategy.description }}
                    </p>
                </div>
            </div>

            <!-- JSON 시나리오 -->
            <div v-else-if="contentType === 'json'" class="space-y-4">
                <div v-for="(item, index) in jsonData" :key="index"
                    class="border p-4 rounded-xl bg-slate-50 shadow-sm space-y-2">

                    <h3 class="font-semibold text-gray-900 text-base">
                        {{ item.title }}
                    </h3>

                    <ul class="list-disc pl-5 text-gray-700 space-y-1">
                        <li v-for="(step, i) in item.steps" :key="i">
                            {{ step }}
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Markdown -->
            <div v-else-if="contentType === 'markdown'" v-html="compiledMarkdown"
                class="prose prose-sm max-w-full text-gray-800"></div>

            <!-- Empty -->
            <div v-else class="text-gray-500 text-sm italic">
                AI 대응책을 불러오는 중...
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { marked } from "marked";
import { dashboardAPI } from "@/router/api";

// /src/data/scenario/* 폴더만 탐색
const files = import.meta.glob("../data/scenario/*", {
    query: "?raw",
    import: "default"
});

const rawText = ref<string | null>(null);
const strategies = ref([]);

async function loadStrategies() {
    try {
        // Router에서 미리 로드된 데이터 사용
        if (window.dashboardData?.strategies) {
            strategies.value = window.dashboardData.strategies.strategies;
            console.log("✅ Router에서 AI 대응책 로드:", strategies.value);
        } else {
            console.log("🚀 직접 API 호출 시작...");
            const response = await dashboardAPI.getStrategies();
            strategies.value = response.data.strategies;
            console.log("📄 직접 AI 대응책 로드 완료:", strategies.value);
        }
    } catch (error) {
        console.error("AI 대응책 로드 실패:", error);
    }
}

async function loadScenario() {
    console.log("📂 scanning scenario folder...");

    let targetFile: string | null = null;

    // 파일 목록 확인
    for (const path in files) {
        console.log("🔎 found file:", path);
    }

    // 🔥 JSON만 선택
    for (const path in files) {
        if (path.endsWith(".json")) {
            targetFile = path;
            break;
        }
    }

    console.log("🎯 selected scenario file:", targetFile);

    // JSON이 아예 없을 때
    if (!targetFile) {
        console.log("❌ No JSON scenario file found!");
        rawText.value = null;
        return;
    }

    // JSON 파일 로드
    rawText.value = await files[targetFile]();
    console.log("📄 loaded JSON content:", rawText.value);
}

onMounted(() => {
    loadStrategies();
});


// 콘텐츠 타입 분류
const contentType = computed(() => {
    if (strategies.value.length > 0) return "api";
    return "none";
});

// JSON 렌더링
const jsonData = computed(() => {
    if (contentType.value !== "json") return [];
    try {
        return JSON.parse(rawText.value || "[]");
    } catch {
        return [];
    }
});
</script>

<style>
.prose h2,
.prose h3,
.prose h4 {
    margin-top: 0.5rem;
    margin-bottom: 0.25rem;
}

.prose ul {
    margin: 0.2rem 0;
}
</style>
