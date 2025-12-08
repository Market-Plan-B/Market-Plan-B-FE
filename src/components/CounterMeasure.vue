<template>
    <div class="countermeasure-container">
        <div class="strategies-list">
            <div v-if="strategies.length > 0" class="strategies-grid">
                <div v-for="strategy in strategies" :key="strategy.id" @click="openModal(strategy)"
                    class="strategy-card">
                    <h3 class="strategy-card-title">
                        {{ strategy.name }}
                    </h3>
                    <p class="strategy-card-objective">
                        {{ strategy.objective }}
                    </p>
                    <div class="strategy-card-link">
                        자세히 보기 →
                    </div>
                </div>
            </div>

            <div v-else class="strategies-loading">
                AI 대응책을 불러오는 중...
            </div>
        </div>
    </div>

    <Teleport to="body">
        <transition name="fade-zoom">
            <div v-if="selectedStrategy" class="modal-overlay" @click.self="closeModal">
                <div class="modal-container">
                    <button @click="closeModal" class="modal-close-btn">✕</button>

                    <div class="modal-header">
                        <div class="modal-title-wrapper">
                            <h2 class="modal-title">
                                {{ selectedStrategy.name }}
                            </h2>
                            <span class="modal-horizon-badge">
                                {{ selectedStrategy.horizon }}
                            </span>
                        </div>
                    </div>

                    <div class="modal-content">
                        <div class="modal-detail-section">
                            <h3 class="modal-section-title">전략 목표</h3>
                            <p class="modal-detail-text">
                                {{ selectedStrategy.objective }}
                            </p>
                        </div>

                        <div class="modal-detail-section">
                            <h3 class="modal-section-title">핵심 리스크</h3>
                            <p class="modal-detail-text">
                                {{ selectedStrategy.risk_note }}
                            </p>
                        </div>

                        <div class="modal-detail-section">
                            <h3 class="modal-section-title">적용 전제 조건</h3>
                            <p class="modal-detail-text">
                                {{ selectedStrategy.preconditions }}
                            </p>
                        </div>

                        <div class="modal-detail-section">
                            <h3 class="modal-section-title">권장 실행 방안</h3>
                            <ul class="modal-action-list">
                                <li v-for="(a, i) in selectedStrategy.actions" :key="i" class="modal-action-item">
                                    {{ a }}
                                </li>
                            </ul>
                        </div>

                        <div class="modal-detail-section">
                            <h3 class="modal-section-title">근거 데이터 및 분석</h3>
                            <p class="modal-detail-text">
                                {{ selectedStrategy.data_evidence }}
                            </p>
                        </div>
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
/* Container */
.countermeasure-container {
    width: 100%;
    max-height: 480px;
    display: flex;
    flex-direction: column;
}

/* Strategies List */
.strategies-list {
    overflow-y: auto;
    padding-right: 8px;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.strategies-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.strategies-loading {
    color: #6b7280;
    font-size: 14px;
    font-style: italic;
}

/* Strategy Card */
.strategy-card {
    border: 1px solid #e5e7eb;
    padding: 16px;
    border-radius: 6px;
    background: #f8fafc;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.strategy-card:hover {
    background: #f1f5f9;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.strategy-card-title {
    font-weight: 600;
    color: #111827;
    font-size: 16px;
}

.strategy-card-objective {
    color: #374151;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.strategy-card-link {
    font-size: 12px;
    font-weight: 600;
    padding-top: 4px;
    opacity: 0;
    transition: opacity 0.2s;
    color: #ea580c;
}

.strategy-card:hover .strategy-card-link {
    opacity: 1;
}

/* Modal */
.modal-overlay {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 8px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    width: 900px;
    max-width: 90vw;
    height: 650px;
    max-height: 90vh;
    padding: 24px;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(12px);
    z-index: 50;
    border: 1px solid #e5e7eb;
}

.modal-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.modal-close-btn {
    position: absolute;
    top: 12px;
    right: 16px;
    color: #6b7280;
    font-size: 20px;
    font-weight: 700;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    transition: color 0.2s;
}

.modal-close-btn:hover {
    color: #1f2937;
}

.modal-header {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-title-wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-right: 40px;
}

.modal-title {
    font-weight: 700;
    font-size: 26px;
    color: #111827;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: -0.5px;
    margin: 0;
}

.modal-horizon-badge {
    padding: 4px 12px;
    background: #fff7ed;
    border: 1px solid #fed7aa;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #ea580c;
    flex-shrink: 0;
}

.modal-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    padding: 0;
}

.modal-detail-section {
    margin-bottom: 24px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 3px solid #ea580c;
}

.modal-detail-section:last-child {
    margin-bottom: 0;
}

.modal-section-title {
    font-weight: 600;
    font-size: 14px;
    color: #111827;
    margin: 0 0 12px 0;
    letter-spacing: -0.2px;
}

.modal-detail-text {
    font-size: 15px;
    color: #374151;
    line-height: 1.75;
    white-space: pre-wrap;
    margin: 0;
    font-weight: 400;
}

.modal-action-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.modal-action-item {
    font-size: 15px;
    color: #374151;
    line-height: 1.75;
    padding: 6px 0;
    padding-left: 20px;
    position: relative;
    font-weight: 400;
}

.modal-action-item::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #ea580c;
    font-weight: 700;
    font-size: 16px;
}

/* Scrollbar */
.strategies-list::-webkit-scrollbar,
.modal-content::-webkit-scrollbar {
    width: 6px;
}

.strategies-list::-webkit-scrollbar-track,
.modal-content::-webkit-scrollbar-track {
    background: #f1f5f9;
}

.strategies-list::-webkit-scrollbar-thumb,
.modal-content::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.strategies-list::-webkit-scrollbar-thumb:hover,
.modal-content::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* Transitions */
.fade-zoom-enter-active,
.fade-zoom-leave-active {
    transition: opacity 0.25s ease;
}

.fade-zoom-enter-from,
.fade-zoom-leave-to {
    opacity: 0;
}
</style>