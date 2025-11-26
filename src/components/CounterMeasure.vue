<template>
    <div class="w-full max-h-[480px] flex flex-col">
        <div class="overflow-y-auto pr-2 text-sm space-y-4">
            <div v-if="strategies.length > 0" class="space-y-4">
                <div v-for="strategy in strategies" :key="strategy.id" @click="openModal(strategy)" class="group border p-4 rounded-xl bg-slate-50 shadow-sm space-y-2 cursor-pointer 
                            hover:bg-slate-100 hover:shadow-md transition-all duration-200">
                    <h3 class="font-semibold text-gray-900 text-base">
                        {{ strategy.name }}
                    </h3>
                    <p class="text-gray-700 line-clamp-3">
                        {{ strategy.objective }}
                    </p>
                    <div
                        class="text-xs font-medium pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-orange-600">
                        자세히 보기 →
                    </div>
                </div>
            </div>

            <div v-else class="text-gray-500 text-sm italic">
                AI 대응책을 불러오는 중...
            </div>
        </div>
    </div>

    <Teleport to="body">
        <transition name="fade-zoom">
            <div v-if="selectedStrategy"
                class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                @click.self="closeModal">
                <div class="relative bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 flex flex-col"
                    style="width: 1000px; height: 650px;">

                    <button @click="closeModal"
                        class="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-lg font-bold cursor-pointer">
                        ✕
                    </button>

                    <div class="flex items-center justify-between mb-3 px-4 gap-4">
                        <h2
                            class="font-extrabold text-2xl text-gray-900 flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-center">
                            {{ selectedStrategy.name }}
                        </h2>
                        <span
                            class="px-3 py-1 bg-orange-100 border-2 border-orange-400 rounded-full text-sm font-semibold text-orange-700 flex-shrink-0">
                            {{ selectedStrategy.horizon }}
                        </span>
                    </div>

                    <div
                        class="flex-1 w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-inner overflow-y-auto">

                        <p class="text-[13px] text-gray-700 leading-snug whitespace-pre-wrap mb-4">
                            <b>전략 목표</b><br />
                            {{ selectedStrategy.objective }}
                        </p>

                        <p class="text-[13px] text-gray-700 leading-snug whitespace-pre-wrap mb-4">
                            <b>핵심 리스크</b><br />
                            {{ selectedStrategy.risk_note }}
                        </p>

                        <p class="text-[13px] text-gray-700 whitespace-pre-wrap mb-4">
                            <b>적용 전제 조건</b><br />
                            {{ selectedStrategy.preconditions }}
                        </p>

                        <p class="text-[13px] text-gray-700 whitespace-pre-wrap mb-4">
                            <b>권장 실행 방안</b><br />
                            <span v-for="(a, i) in selectedStrategy.actions" :key="i">
                                • {{ a }}<br />
                            </span>
                        </p>

                        <p class="text-[13px] text-gray-700 whitespace-pre-wrap">
                            <b>근거 데이터 및 분석</b><br />
                            {{ selectedStrategy.data_evidence }}
                        </p>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { dashboardAPI, Strategies } from "@/api/dashboard";

const strategies = ref<Strategies['strategies']>([]);
const selectedStrategy = ref<Strategies['strategies'][0] | null>(null);

async function loadStrategies() {
    try {
        const response = await dashboardAPI.getStrategies();
        strategies.value = response.data.strategies;
        console.log('AI 대응책 로드 완료:', strategies.value);
    } catch (error) {
        console.error('AI 대응책 로드 실패:', error);
    }
}

function openModal(strategy: Strategies['strategies'][0]) {
    selectedStrategy.value = strategy;
}

function closeModal() {
    selectedStrategy.value = null;
}

onMounted(() => {
    loadStrategies();
});
</script>

<style scoped>
.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.fade-zoom-enter-active,
.fade-zoom-leave-active {
    transition: opacity 0.25s ease;
}

.fade-zoom-enter-from,
.fade-zoom-leave-to {
    opacity: 0;
}

.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>