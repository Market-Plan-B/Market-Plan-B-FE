<template>
    <div class="countermeasure-container">
        <div class="strategies-list">
            <div v-if="strategies.length > 0" class="strategies-grid">
                <div v-for="strategy in strategies" :key="strategy.id" @click="openModal(strategy)"
                    class="strategy-card">
                    <h3 class="strategy-card-title">{{ strategy.name }}</h3>
                    <p class="strategy-card-objective">{{ strategy.objective }}</p>
                    <div class="strategy-card-link">자세히 보기</div>
                </div>
            </div>
            <div v-else class="strategies-loading">AI 대응책을 불러오는 중...</div>
        </div>
    </div>

    <Teleport to="body">
        <transition name="modal-fade">
            <div v-if="selectedStrategy" class="modal-backdrop" @click.self="closeModal">
                <div class="modal-panel">
                    <header class="modal-header">
                        <div class="header-content">
                            <span class="horizon-tag">{{ selectedStrategy.horizon }}</span>
                            <h2 class="modal-title">{{ selectedStrategy.name }}</h2>
                        </div>
                        <button @click="closeModal" class="close-btn">X</button>
                    </header>

                    <div class="modal-body">
                        <section class="info-card highlight">
                            <div class="card-header">
                                <h3>전략 목표</h3>
                            </div>
                            <p>{{ selectedStrategy.objective }}</p>
                        </section>

                        <div class="info-grid">
                            <section class="info-card">
                                <div class="card-header">
                                    <h3>핵심 리스크</h3>
                                </div>
                                <p>{{ selectedStrategy.risk_note }}</p>
                            </section>

                            <section class="info-card">
                                <div class="card-header">
                                    <h3>적용 전제 조건</h3>
                                </div>
                                <p>{{ selectedStrategy.preconditions }}</p>
                            </section>
                        </div>

                        <section class="info-card">
                            <div class="card-header">
                                <h3>권장 실행 방안</h3>
                            </div>
                            <ol class="action-list">
                                <li v-for="(a, i) in selectedStrategy.actions" :key="i">
                                    <span class="action-number">{{ i + 1 }}</span>
                                    <span class="action-text">{{ a }}</span>
                                </li>
                            </ol>
                        </section>

                        <section class="info-card evidence-card">
                            <div class="card-header">
                                <h3>근거 데이터 및 분석</h3>
                            </div>
                            <p>{{ selectedStrategy.data_evidence }}</p>
                        </section>
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
    } catch (error) {
        console.error('AI 대응책 로드 실패:', error);
    }
}

const openModal = (strategy: Strategies['strategies'][0]) => selectedStrategy.value = strategy;
const closeModal = () => selectedStrategy.value = null;

onMounted(loadStrategies);
</script>

<style scoped>
.countermeasure-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.strategies-list {
    height: 396px;
    max-height: 396px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 8px;
}

.strategies-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.strategies-loading {
    color: #6b7280;
    font-size: 14px;
    font-style: italic;
}

.strategy-card {
    padding: 16px;
    border-radius: 8px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 100px;
    flex-shrink: 0;
}

.strategy-card:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.strategy-card-title {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 8px;
}

.strategy-card-objective {
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
    margin: 0 0 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.strategy-card-link {
    font-size: 12px;
    font-weight: 600;
    color: #ea580c;
    opacity: 0;
    transition: opacity 0.2s;
}

.strategy-card:hover .strategy-card-link {
    opacity: 1;
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
    overflow-y: auto;
}

.modal-panel {
    width: 100%;
    max-width: 800px;
    max-height: calc(100vh - 48px);
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: auto;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 28px;
    background: #ffffff;
    color: #000000;
    position: relative;
}

.header-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.horizon-tag {
    display: inline-block;
    padding: 4px 10px;
    background: rgba(251, 146, 60, 0.2);
    border: 1px solid rgba(251, 146, 60, 0.4);
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    color: #fb923c;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
}

.modal-title {
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    margin: 0;
    padding-bottom: 16px;
    line-height: 1.3;
    letter-spacing: -0.3px;
    color: #000000;
    width: 100%;
    border-bottom: 2px solid #e2e8f0;
}

.close-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.05);
    border: none;
    border-radius: 8px;
    color: #000000;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
    position: absolute;
    top: 24px;
    right: 28px;
}

.close-btn:hover {
    background: rgba(0, 0, 0, 0.1);
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.info-card {
    background: #f8fafc;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e2e8f0;
}

.info-card.highlight {
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
    border-color: #fed7aa;
}

.card-header {
    margin-bottom: 12px;
}

.card-header h3 {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    letter-spacing: -0.2px;
}

.info-card p {
    font-size: 14px;
    color: #475569;
    line-height: 1.7;
    margin: 0;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.action-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.action-list li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.action-number {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ea580c;
    color: #ffffff;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;
    flex-shrink: 0;
}

.action-text {
    font-size: 14px;
    color: #475569;
    line-height: 1.6;
    padding-top: 2px;
}

.evidence-card {
    background: #f1f5f9;
}

.strategies-list::-webkit-scrollbar,
.modal-body::-webkit-scrollbar {
    width: 5px;
}

.strategies-list::-webkit-scrollbar-track,
.modal-body::-webkit-scrollbar-track {
    background: transparent;
}

.strategies-list::-webkit-scrollbar-thumb,
.modal-body::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.25s ease;
}

.modal-fade-enter-active .modal-panel,
.modal-fade-leave-active .modal-panel {
    transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-from .modal-panel,
.modal-fade-leave-to .modal-panel {
    transform: scale(0.95) translateY(10px);
    opacity: 0;
}

@media (max-width: 640px) {
    .info-grid {
        grid-template-columns: 1fr;
    }

    .modal-header {
        padding: 20px;
    }

    .modal-body {
        padding: 20px;
    }
}
</style>