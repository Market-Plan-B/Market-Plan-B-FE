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
            <div v-else class="strategies-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">대응책을 불러오는 중...</div>
            </div>
        </div>
    </div>

    <Teleport to="body">
        <transition name="modal-fade">
            <div v-if="selectedStrategy" class="modal-backdrop" @click.self="closeModal">
                <div class="modal-panel">
                    <header class="modal-header">
                        <h2 class="modal-title">{{ selectedStrategy.name }}</h2>
                        <span class="horizon-tag" :class="getHorizonClass(selectedStrategy.horizon)">{{
                            selectedStrategy.horizon }}</span>
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
                            <div class="analysis-text-block">
                                <p v-for="(value, idx) in parsedEvidenceValues" :key="idx">
                                    {{ value }}
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
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

// horizon에 따른 클래스 반환
function getHorizonClass(horizon: string): string {
    if (!horizon) return '';
    const h = horizon.toLowerCase();
    if (h.includes('단기')) return 'horizon-short';
    if (h.includes('중기')) return 'horizon-mid';
    if (h.includes('장기')) return 'horizon-long';
    return '';
}

// 근거 데이터 파싱 - key 제거하고 value만 리스트로 추출
const parsedEvidenceValues = computed(() => {
    if (!selectedStrategy.value?.data_evidence) return [];

    try {
        const evidence = selectedStrategy.value.data_evidence;
        let parsed;

        if (typeof evidence === 'string') {
            // JSON 문자열인 경우 파싱
            parsed = JSON.parse(evidence);
        } else if (typeof evidence === 'object' && evidence !== null) {
            // 이미 객체인 경우
            parsed = evidence;
        } else {
            // 문자열이지만 JSON이 아닌 경우
            return [String(evidence)];
        }

        // Object.values()로 값만 추출
        return Object.values(parsed).filter((value) => value !== null && value !== undefined);
    } catch (error) {
        // JSON 파싱 실패 시 원본을 문자열로 반환
        return [String(selectedStrategy.value.data_evidence)];
    }
});

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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
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

.strategy-card {
    padding: 16px;
    border-radius: 8px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 100px;
    flex-shrink: 0;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.strategy-card:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.strategy-card-title {
    font-size: 16px;
    font-weight: 600;
    color: #000000;
    margin: 0 0 8px;
}

.strategy-card-objective {
    font-size: 14px;
    font-weight: 500;
    color: #6d7d92;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: -webkit-line-clamp 0.2s;
}

.strategy-card-link {
    position: absolute;
    top: 12px;
    right: 16px;
    font-size: 12px;
    font-weight: 600;
    color: #ea580c;
    background: rgba(234, 88, 12, 0.1);
    padding: 4px 10px;
    border-radius: 4px;
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
    border-radius: 10px;
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
    border-bottom: 2px solid #e2e8f0;
}

.horizon-tag {
    position: absolute;
    right: 80px;
    top: 50%;
    transform: translateY(-50%);
    display: inline-block;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.5px;
    /* 기본 스타일 (회색) */
    background: rgba(107, 114, 128, 0.15);
    border: 1px solid rgba(107, 114, 128, 0.4);
    color: #6b7280;
}

/* 단기 - 주황색 */
.horizon-tag.horizon-short {
    background: rgba(251, 146, 60, 0.15);
    border: 1px solid rgba(251, 146, 60, 0.4);
    color: #ea580c;
}

/* 중기 - 파란색 */
.horizon-tag.horizon-mid {
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.4);
    color: #2563eb;
}

/* 장기 - 보라색 */
.horizon-tag.horizon-long {
    background: rgba(139, 92, 246, 0.15);
    border: 1px solid rgba(139, 92, 246, 0.4);
    color: #7c3aed;
}

.modal-title {
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    margin: 0;
    line-height: 1.3;
    letter-spacing: -0.3px;
    color: #000000;
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

.analysis-text-block {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.analysis-text-block p {
    margin: 0;
    font-size: 14px;
    color: #475569;
    line-height: 1.7;
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