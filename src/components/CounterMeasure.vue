<template>
    <div class="w-full max-h-[480px] flex flex-col">
        <div class="flex items-center justify-between mb-3"></div>

        <!-- 전체 간격을 넉넉하게 -->
        <div class="overflow-y-auto pr-2 text-sm leading-relaxed space-y-4">

            <div v-if="strategies.length > 0" class="space-y-4">
                <div v-for="strategy in strategies" :key="strategy.id"
                    class="border p-4 rounded-xl bg-slate-50 shadow-sm space-y-2">
                    <h3 class="font-semibold text-gray-900 text-base">
                        {{ strategy.title }}
                    </h3>
                    <p class="text-gray-700">
                        {{ strategy.description }}
                    </p>
                </div>
            </div>
            
            <div v-else class="text-gray-500 text-sm italic">
                AI 대응책을 불러오는 중...
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from "vue";
import { dashboardAPI, Strategies } from "@/api/dashboard";

const strategies = ref<Strategies['strategies']>([]);

async function loadStrategies() {
    try {
        const response = await dashboardAPI.getStrategies();
        strategies.value = response.data.strategies;
        console.log('AI 대응책 로드 완료:', strategies.value);
    } catch (error) {
        console.error('AI 대응책 로드 실패:', error);
    }
}



onMounted(() => {
    loadStrategies();
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
