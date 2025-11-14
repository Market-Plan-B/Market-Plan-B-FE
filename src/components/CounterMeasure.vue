<template>
    <div class="w-full max-h-[480px] flex flex-col">
        <div class="flex items-center justify-between mb-3"></div>

        <!-- 전체 간격을 넉넉하게 -->
        <div class="overflow-y-auto pr-2 text-sm leading-relaxed space-y-4">

            <!-- JSON 시나리오 -->
            <div v-if="contentType === 'json'" class="space-y-4">
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
                시나리오 파일이 없습니다. (src/data/*.md 또는 *.json)
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { marked } from "marked";

// /src/data/scenario/* 폴더만 탐색
const files = import.meta.glob("../data/scenario/*", {
    query: "?raw",
    import: "default"
});

const rawText = ref<string | null>(null);

async function loadScenario() {
    console.log("📂 scanning scenario folder...");

    let targetFile: string | null = null;

    for (const path in files) {
        console.log("🔎 found file:", path);
    }

    // 1) JSON 우선
    for (const path in files) {
        if (path.endsWith(".json")) {
            targetFile = path;
            break;
        }
    }

    // 2) JSON 없으면 MD 사용
    if (!targetFile) {
        for (const path in files) {
            if (path.endsWith(".md")) {
                targetFile = path;
                break;
            }
        }
    }

    console.log("🎯 selected scenario file:", targetFile);

    if (!targetFile) {
        console.log("❌ No scenario file found!");
        rawText.value = null;
        return;
    }

    rawText.value = await files[targetFile]();
    console.log("📄 loaded content:", rawText.value);
}

onMounted(() => {
    loadScenario();
});

// 콘텐츠 타입 분류
const contentType = computed(() => {
    if (!rawText.value) return "none";
    try {
        JSON.parse(rawText.value);
        return "json";
    } catch {
        return "markdown";
    }
});

// Markdown 렌더링
const compiledMarkdown = computed(() => {
    if (contentType.value !== "markdown") return "";
    return marked.parse(rawText.value || "");
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
