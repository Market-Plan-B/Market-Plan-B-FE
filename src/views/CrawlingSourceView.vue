<template>
    <div class="page-container bg-white rounded-md p-6 shadow-md border border-gray-200 flex-1">
        <header class="page-header">
            <div>
                <h2 class="font-bold text-2xl mb-2 text-gray-900">크롤링 소스 관리</h2>
            </div>
        </header>

        <section class="filter-section maritime-theme rounded-md">
            <div class="section-header">
                <div class="header-left">
                    <div class="header-actions">
                        <button @click="activateAll" class="btn-maritime btn-maritime--outline">
                            <span class="btn-icon">&#9650;</span> 전체 적재
                        </button>
                        <button @click="deactivateAll" class="btn-maritime btn-maritime--outline">
                            <span class="btn-icon">&#9660;</span> 전체 내리기
                        </button>
                    </div>
                </div>
                <div class="header-center">
                    <Transition name="msg-fade">
                        <div v-if="successMessage" class="header-msg header-msg--success">{{ successMessage }}</div>
                        <div v-else-if="errorMessage" class="header-msg header-msg--error">{{ errorMessage }}</div>
                    </Transition>
                </div>
                <div class="header-right">
                    <div class="filter-stats">
                        <div class="stat-item">
                            <span class="stat-num">{{ activeKeywords.length }}</span>
                            <span class="stat-label">Loaded</span>
                        </div>
                        <div class="stat-divider"></div>
                        <div class="stat-item">
                            <span class="stat-num">{{ inactiveKeywords.length }}</span>
                            <span class="stat-label">Floating</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="maritime-scene">
                <div class="sky-layer"></div>

                <!-- 관제탑 + 레버 영역 -->
                <div class="control-tower-area">
                    <div class="control-tower" :class="{ 'tower-active': leverPulled }">
                        <div class="tower-top">
                            <div class="tower-light" :class="{ 'light-blinking': leverPulled }"></div>
                            <div class="tower-antenna"></div>
                        </div>
                        <div class="tower-cabin">
                            <div class="cabin-windows">
                                <div class="cabin-window"></div>
                                <div class="cabin-window"></div>
                                <div class="cabin-window"></div>
                            </div>
                        </div>
                        <div class="tower-body">
                            <div class="tower-panel" :class="{ 'panel-disabled': applyingKeywords }">
                                <div class="panel-header">
                                    <span class="panel-title">출항</span>
                                    <div class="panel-lights">
                                        <div class="mini-light red" :class="{ 'off': leverPulled }"></div>
                                        <div class="mini-light green" :class="{ 'on': leverPulled }"></div>
                                    </div>
                                </div>
                                <div class="lever-track">
                                    <div class="lever-slot-bg"></div>
                                    <div class="lever-handle" :class="{ 'lever-handle--pulled': leverPulled }"
                                        :style="{ top: `${leverPosition}px` }" @mousedown.prevent="onLeverMouseDown"
                                        @touchstart.prevent="onLeverTouchStart">
                                        <div class="handle-ball"></div>
                                        <div class="handle-shaft"></div>
                                    </div>
                                </div>
                                <div class="panel-status">
                                    <span>{{ leverPulled ? 'GO!' : 'READY' }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="tower-base">
                            <div class="base-stripe"></div>
                            <div class="base-stripe"></div>
                            <div class="base-stripe"></div>
                        </div>
                        <div class="tower-foundation"></div>
                    </div>
                </div>

                <div class="tanker-container ship-floating" :class="{ 'ship-departing': isDeparting }">
                    <svg class="tanker-svg" viewBox="40 0 600 192" preserveAspectRatio="xMidYMid meet">
                        <path d="M30 115 H670 L640 175 H60 L30 115Z" fill="#0A2433" />
                        <rect x="40" y="105" width="580" height="18" fill="#123A52" />
                        <rect x="50" y="93" width="560" height="16" fill="#15506B" />
                        <text x="250" y="155" fill="rgba(255,255,255,0.13)" font-size="32" font-weight="700"
                            style="letter-spacing: 4px;">OIL TANKER</text>
                        <line x1="120" y1="125" x2="120" y2="170" stroke="#0f2e44" stroke-width="4" opacity="0.7" />
                        <line x1="210" y1="125" x2="210" y2="170" stroke="#0f2e44" stroke-width="4" opacity="0.7" />
                        <line x1="300" y1="125" x2="300" y2="170" stroke="#0f2e44" stroke-width="4" opacity="0.7" />
                        <line x1="390" y1="125" x2="390" y2="170" stroke="#0f2e44" stroke-width="4" opacity="0.7" />
                        <line x1="480" y1="125" x2="480" y2="170" stroke="#0f2e44" stroke-width="4" opacity="0.7" />
                        <path d="M640 115 L670 115 L650 78 L620 78Z" fill="#8E2F2F" />
                        <path d="M620 78 L650 78 L645 68 L625 68Z" fill="#B33B3B" />
                        <rect x="55" y="53" width="75" height="40" rx="2" fill="#C6D0DB" />
                        <rect x="55" y="42" width="60" height="18" rx="2" fill="#E0E7EB" />
                        <rect x="85" y="25" width="25" height="18" rx="2" fill="#F0F4F7" />
                        <circle cx="72" cy="68" r="5" fill="#1d3b52" />
                        <circle cx="90" cy="68" r="5" fill="#1d3b52" />
                        <circle cx="108" cy="68" r="5" fill="#1d3b52" />
                        <circle cx="72" cy="86" r="5" fill="#1d3b52" />
                        <circle cx="90" cy="86" r="5" fill="#1d3b52" />
                        <circle cx="108" cy="86" r="5" fill="#1d3b52" />
                        <rect x="62" y="47" width="10" height="8" rx="1" fill="#162e42" />
                        <rect x="78" y="47" width="10" height="8" rx="1" fill="#162e42" />
                        <rect x="94" y="47" width="10" height="8" rx="1" fill="#162e42" />
                        <rect x="95" y="6" width="6" height="19" fill="#4A4A4A" />
                        <circle cx="98" cy="6" r="4.5" fill="#ff4545" class="mast-light" />
                        <line x1="180" y1="90" x2="210" y2="20" stroke="#FFB000" stroke-width="6"
                            stroke-linecap="round" />
                        <line x1="212" y1="20" x2="210" y2="62" stroke="#FFB000" stroke-width="2"
                            stroke-dasharray="3,3" />
                        <line x1="320" y1="90" x2="350" y2="20" stroke="#FFB000" stroke-width="5"
                            stroke-linecap="round" />
                        <line x1="352" y1="20" x2="350" y2="62" stroke="#FFB000" stroke-width="2"
                            stroke-dasharray="3,3" />
                        <line x1="460" y1="90" x2="490" y2="20" stroke="#FFB000" stroke-width="5"
                            stroke-linecap="round" />
                        <line x1="492" y1="20" x2="490" y2="62" stroke="#FFB000" stroke-width="2"
                            stroke-dasharray="3,3" />
                        <rect x="590" y="39" width="16" height="55" rx="2" fill="#707782" />
                        <rect x="587" y="42" width="22" height="10" rx="2" fill="#8a9098" />
                        <ellipse cx="598" cy="42" rx="8" ry="3" fill="#60666c" />
                        <circle class="smoke s1" :class="{ 'smoke-active': isDeparting }" cx="598" cy="35" r="6"
                            fill="#454545" opacity="0.6" />
                        <circle class="smoke s2" :class="{ 'smoke-active': isDeparting }" cx="602" cy="25" r="5"
                            fill="#3d3d3d" opacity="0.45" />
                        <circle class="smoke s3" :class="{ 'smoke-active': isDeparting }" cx="594" cy="16" r="7"
                            fill="#2b2b2b" opacity="0.35" />
                        <circle v-if="isDeparting" class="smoke s4 smoke-departing" cx="600" cy="10" r="8"
                            fill="#1a1a1a" opacity="0.5" />
                        <circle v-if="isDeparting" class="smoke s5 smoke-departing" cx="605" cy="0" r="9" fill="#0f0f0f"
                            opacity="0.4" />
                        <line x1="100" y1="142" x2="600" y2="142" stroke="#0a2a3d" stroke-width="2" opacity="0.4" />
                        <circle cx="75" cy="148" r="10" fill="none" stroke="#0a2a3d" stroke-width="2" opacity="0.4" />
                        <circle cx="625" cy="148" r="10" fill="none" stroke="#0a2a3d" stroke-width="2" opacity="0.4" />
                        <rect x="260" y="132" width="30" height="10" fill="rgba(0,0,0,0.15)" rx="2" />
                        <rect x="330" y="132" width="30" height="10" fill="rgba(0,0,0,0.15)" rx="2" />
                        <rect x="400" y="132" width="30" height="10" fill="rgba(0,0,0,0.15)" rx="2" />
                    </svg>

                    <div class="cargo-drop-area" :class="{ 'drop-active': isDragging }">
                        <draggable v-model="activeKeywords" group="keywords" item-key="id" class="cargo-zone"
                            ghost-class="cargo-ghost" @start="isDragging = true" @end="isDragging = false">
                            <template #item="{ element }">
                                <div class="cargo-container" :style="getContainerStyle(element.id)">
                                    <span class="cargo-text">{{ element.name }}</span>
                                </div>
                            </template>
                            <template #footer>
                                <div v-if="!activeKeywords.length" class="cargo-placeholder">
                                    <span>Keyword를 드래그해 적재 영역에 올려주세요</span>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>

                <div class="ocean-layer">
                    <div ref="waveContainer" class="wave-lottie"></div>
                    <div class="floating-zone-wrapper">
                        <div class="floating-header">
                            <span class="floating-title">Keyword</span>
                            <span class="floating-count">{{ inactiveKeywords.length }} items</span>
                        </div>
                        <draggable v-model="inactiveKeywords" group="keywords" item-key="id" class="floating-zone"
                            ghost-class="floating-ghost" @start="isDragging = true" @end="isDragging = false">
                            <template #item="{ element, index }">
                                <div class="floating-item" :style="{ animationDelay: `${index * 0.15}s` }">
                                    <span class="buoy-light"></span>
                                    <span class="floating-text">{{ element.name }}</span>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>
            </div>
        </section>

        <section class="stats-keywords-section">
            <div class="stats-container">
                <div class="stat-card stat-card--compact">
                    <span class="stat-value stat-value--compact">{{ sources.length }}</span>
                    <span class="stat-label">총 크롤링 소스</span>
                </div>
                <div class="stat-card stat-card--compact">
                    <span class="stat-value stat-value--compact stat-value--green">{{ activeSources }}</span>
                    <span class="stat-label">활성 소스</span>
                </div>
                <div class="stat-card stat-card--compact">
                    <span class="stat-value stat-value--compact stat-value--red">{{ inactiveSources }}</span>
                    <span class="stat-label">비활성 소스</span>
                </div>
            </div>
            <div class="keywords-display">
                <div class="keywords-header">
                    <span class="keywords-title">활성 키워드</span>
                    <span class="keywords-count">{{ activeKeywords.length }}개</span>
                </div>
                <div class="keyword-tags-display">
                    <span v-for="kw in activeKeywords" :key="kw.id" class="tag tag--display">{{ kw.name }}</span>
                    <span v-if="activeKeywords.length === 0" class="tag tag--empty tag--display">키워드 없음</span>
                </div>
            </div>
        </section>

        <section class="table-section">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="text-left">사이트 이름</th>
                        <th class="text-left">BASE URL</th>
                        <th class="text-center">상태</th>
                        <th class="text-center">활성화</th>
                        <th class="text-center">작업</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="source in sources" :key="source.id">
                        <td>
                            <div class="source-name">
                                <img :src="getFavicon(source.baseUrl)" class="source-logo" @error="handleImageError" />
                                <span>{{ source.name }}</span>
                            </div>
                        </td>
                        <td><code class="url-code">{{ source.baseUrl }}</code></td>
                        <td class="text-center">
                            <div class="cell-content-center">
                                <span class="status-badge"
                                    :class="source.isActive ? 'status-badge--active' : 'status-badge--inactive'">
                                    {{ source.isActive ? '활성' : '비활성' }}
                                </span>
                            </div>
                        </td>
                        <td class="text-center">
                            <div class="cell-content-center">
                                <button @click="toggleSource(source)" class="toggle"
                                    :class="{ 'toggle--on': source.isActive }">
                                    <span class="toggle-knob"></span>
                                </button>
                            </div>
                        </td>
                        <td class="text-center">
                            <div class="cell-content-center">
                                <button @click="openModal(source)" class="icon-btn icon-btn--edit">
                                    <Pencil :size="16" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>

        <Teleport to="body">
            <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
                <div class="modal">
                    <div class="modal-header">
                        <h2>사이트 수정</h2>
                        <button @click="closeModal" class="icon-btn">
                            <X :size="20" />
                        </button>
                    </div>
                    <div class="modal-body">
                        <label class="field">
                            <span class="field-label">사이트 이름</span>
                            <input v-model="form.name" type="text" class="field-input" placeholder="예: Google News" />
                        </label>
                        <label class="field">
                            <span class="field-label">BASE URL</span>
                            <input v-model="form.baseUrl" type="url" class="field-input field-input--mono"
                                placeholder="https://" />
                        </label>
                    </div>
                    <div class="modal-footer">
                        <button @click="closeModal" class="btn-secondary">취소</button>
                        <button @click="saveSource" class="btn-primary">저장</button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import draggable from 'vuedraggable';
import lottie from 'lottie-web';
import type { AnimationItem } from 'lottie-web';
import { adminAPI, type AdminKeywordItem, type CrawlingSourceItem } from '@/api/admin';

interface Keyword { id: number; name: string; isActive: boolean }
interface Source { id: number; name: string; baseUrl: string; keywords: number[]; isActive: boolean }

const waveContainer = ref<HTMLElement | null>(null);
let waveAnimation: AnimationItem | null = null;
const isDragging = ref(false);
let dataPollingInterval: number | null = null;

const leverPosition = ref(0);
const leverPulled = ref(false);
const LEVER_MAX = 50;
const LEVER_TRIGGER = 40;

const onLeverMouseDown = (e: MouseEvent) => {
    if (applyingKeywords.value) return;
    const startY = e.clientY;
    const startPos = leverPosition.value;
    const onMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientY - startY;
        leverPosition.value = Math.max(0, Math.min(LEVER_MAX, startPos + delta));
    };
    const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        finishLeverDrag();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
};

const onLeverTouchStart = (e: TouchEvent) => {
    if (applyingKeywords.value) return;
    const startY = e.touches[0].clientY;
    const startPos = leverPosition.value;
    const onMove = (moveEvent: TouchEvent) => {
        moveEvent.preventDefault();
        const delta = moveEvent.touches[0].clientY - startY;
        leverPosition.value = Math.max(0, Math.min(LEVER_MAX, startPos + delta));
    };
    const onEnd = () => {
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        finishLeverDrag();
    };
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
};

const finishLeverDrag = () => {
    if (leverPosition.value >= LEVER_TRIGGER) {
        leverPulled.value = true;
        leverPosition.value = LEVER_MAX;
        applyKeywords();
        setTimeout(() => {
            leverPulled.value = false;
            leverPosition.value = 0;
        }, 2500);
    } else {
        leverPosition.value = 0;
    }
};

const containerColors = [
    { bg: '#CC0000', border: '#990000' },
    { bg: '#003087', border: '#001F5C' },
    { bg: '#00A651', border: '#007A3D' },
    { bg: '#FF6600', border: '#CC5200' },
    { bg: '#8B4513', border: '#654321' },
    { bg: '#FFD700', border: '#DAA520' },
    { bg: '#00B5E2', border: '#008FB3' },
    { bg: '#8B8B8B', border: '#696969' },
];

const getContainerStyle = (id: number) => {
    const hash = id.toString().split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    const color = containerColors[Math.abs(hash) % containerColors.length];
    return { background: `linear-gradient(135deg, ${color.bg} 0%, ${color.border} 100%)`, borderColor: color.border };
};

const convertKeyword = (apiKeyword: AdminKeywordItem): Keyword => ({
    id: apiKeyword.id, name: apiKeyword.category, isActive: apiKeyword.is_active
});

const convertSource = (apiSource: CrawlingSourceItem): Source => ({
    id: apiSource.id, name: apiSource.source_name, baseUrl: apiSource.base_url, keywords: apiSource.categories, isActive: apiSource.is_active
});

const getFavicon = (baseUrl: string) => {
    try { return `https://www.google.com/s2/favicons?sz=128&domain=${new URL(baseUrl).hostname}`; }
    catch { return '/default-logo.png'; }
};

const handleImageError = (e: Event) => { (e.target as HTMLImageElement).src = '/default-logo.png'; };

const loadData = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const [keywordsRes, sourcesRes] = await Promise.all([adminAPI.getKeywords(), adminAPI.getSources()]);
        allKeywords.value = keywordsRes.data.map(convertKeyword);
        sources.value = sourcesRes.data.sources.map(convertSource);
        activeKeywords.value = allKeywords.value.filter((kw: Keyword) => kw.isActive);
        inactiveKeywords.value = allKeywords.value.filter((kw: Keyword) => !kw.isActive);
    } catch (error: any) {
        errorMessage.value = error.response?.data?.detail || '데이터를 불러오는데 실패했습니다.';
    } finally { loading.value = false; }
};

onMounted(async () => {
    if (waveContainer.value) {
        waveAnimation = lottie.loadAnimation({
            container: waveContainer.value, renderer: 'svg', loop: true, autoplay: true, path: '/lottie/WaterFlow.json'
        });
    }
    await loadData();
    dataPollingInterval = window.setInterval(() => {
        if (!applyingKeywords.value) {
            loadData();
        }
    }, 30000);
});

onUnmounted(() => {
    waveAnimation?.destroy();
    if (dataPollingInterval !== null) clearInterval(dataPollingInterval);
});

const allKeywords = ref<Keyword[]>([]);
const activeKeywords = ref<Keyword[]>([]);
const inactiveKeywords = ref<Keyword[]>([]);
const sources = ref<Source[]>([]);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const applyingKeywords = ref(false);
const isDeparting = ref(false);
const showModal = ref(false);
const editingId = ref<number | null>(null);
const form = ref({ name: '', baseUrl: '' });

const activeSources = computed(() => sources.value.filter((s: Source) => s.isActive).length);
const inactiveSources = computed(() => sources.value.filter((s: Source) => !s.isActive).length);

watch(activeKeywords, (newKeywords: Keyword[]) => {
    const activeIds = newKeywords.map((k: Keyword) => k.id);
    sources.value.forEach((source: Source) => { source.keywords = [...activeIds]; });
}, { deep: true });

const activateAll = () => { activeKeywords.value = [...allKeywords.value]; inactiveKeywords.value = []; };
const deactivateAll = () => { inactiveKeywords.value = [...allKeywords.value]; activeKeywords.value = []; };

const applyKeywords = async () => {
    if (applyingKeywords.value) return;
    const activeIds = activeKeywords.value.map((k: Keyword) => k.id);
    if (activeIds.length === 0) { errorMessage.value = '적용할 키워드가 없습니다.'; return; }
    try {
        applyingKeywords.value = true;
        errorMessage.value = '';
        successMessage.value = '';
        isDeparting.value = true;
        await adminAPI.bulkUpdateKeywords({ category_ids: activeIds });
        successMessage.value = `키워드 ${activeIds.length}개가 모든 소스에 성공적으로 적용되었습니다.`;
        sources.value.forEach((source: Source) => { source.keywords = [...activeIds]; });
        setTimeout(() => { isDeparting.value = false; }, 2500);
        setTimeout(() => { successMessage.value = ''; }, 3000);
    } catch (error: any) {
        errorMessage.value = error.response?.data?.detail || '키워드 적용에 실패했습니다.';
        isDeparting.value = false;
        setTimeout(() => { errorMessage.value = ''; }, 5000);
    } finally { applyingKeywords.value = false; }
};

const openModal = (source: Source) => { editingId.value = source.id; form.value = { name: source.name, baseUrl: source.baseUrl }; showModal.value = true; };
const closeModal = () => { showModal.value = false; };

const saveSource = async () => {
    if (!form.value.name || !form.value.baseUrl) { errorMessage.value = '사이트 이름과 URL을 모두 입력해주세요.'; return; }
    if (editingId.value) {
        try {
            loading.value = true;
            const response = await adminAPI.updateSource(editingId.value, { source_name: form.value.name, base_url: form.value.baseUrl });
            const idx = sources.value.findIndex((s: Source) => s.id === editingId.value);
            if (idx !== -1) { sources.value[idx] = { ...sources.value[idx], name: response.data.source_name, baseUrl: response.data.base_url }; }
            closeModal();
        } catch (error: any) { errorMessage.value = error.response?.data?.detail || '소스 업데이트에 실패했습니다.'; }
        finally { loading.value = false; }
    }
};

const toggleSource = async (source: Source) => {
    try {
        loading.value = true;
        const response = await adminAPI.updateSourceStatus(source.id, { is_active: !source.isActive });
        const idx = sources.value.findIndex((s: Source) => s.id === source.id);
        if (idx !== -1) sources.value[idx].isActive = response.data.is_active;
    } catch (error: any) { errorMessage.value = error.response?.data?.detail || '상태 업데이트에 실패했습니다.'; }
    finally { loading.value = false; }
};
</script>

<style scoped>
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #f97316;
    color: white;
    font-weight: 600;
    font-size: 14px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-primary:hover {
    background: #ea580c;
}

.btn-secondary {
    padding: 10px 16px;
    background: #f3f4f6;
    color: #374151;
    font-weight: 500;
    font-size: 14px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-secondary:hover {
    background: #e5e7eb;
}

.filter-section {
    margin-bottom: 24px;
    overflow: hidden;
}

.filter-section.maritime-theme {
    background: #050d18;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 24px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-wrap: wrap;
    gap: 12px;
    position: relative;
}

.header-center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
}

.header-msg {
    padding: 8px 20px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
}

.header-msg--success {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.header-msg--error {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.msg-fade-enter-active,
.msg-fade-leave-active {
    transition: opacity 0.3s, transform 0.3s;
}

.msg-fade-enter-from,
.msg-fade-leave-to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
}

.header-right {
    display: flex;
    align-items: center;
    gap: 20px;
}

.filter-stats {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.stat-num {
    font-size: 20px;
    font-weight: 700;
    color: #f97316;
}

.stat-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 1);
    text-transform: uppercase;
    letter-spacing: 1px;
}

.stat-divider {
    width: 1px;
    height: 30px;
    background: rgba(255, 255, 255, 0.1);
}

.header-actions {
    display: flex;
    gap: 8px;
}

.btn-maritime {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    background: #ff6a00;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-maritime:hover:not(:disabled) {
    background: #ea580c;
    transform: translateY(-1px);
}

.btn-maritime:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-maritime--outline {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
}

.btn-maritime--outline:hover {
    background: #ff6a00;
    border-color: #ff6a00;
    color: white;
}

.btn-icon {
    font-size: 14px;
}

.maritime-scene {
    position: relative;
    min-height: 420px;
    overflow: hidden;
}

.sky-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    background: linear-gradient(180deg, #0a1628 0%, #0f2744 40%, #1a4a6e 70%, #2a6a8e 100%);
}

/* 관제탑 스타일 */
.control-tower-area {
    position: absolute;
    right: 25px;
    top: 10px;
    z-index: 100;
}

.control-tower {
    display: flex;
    flex-direction: column;
    align-items: center;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

.tower-top {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.tower-antenna {
    width: 3px;
    height: 20px;
    background: linear-gradient(180deg, #666 0%, #444 100%);
    border-radius: 1px;
}

.tower-light {
    width: 10px;
    height: 10px;
    background: #333;
    border-radius: 50%;
    margin-bottom: 2px;
    border: 1px solid #222;
    transition: all 0.3s;
}

.tower-light.light-blinking {
    background: #22c55e;
    box-shadow: 0 0 12px #22c55e, 0 0 24px rgba(34, 197, 94, 0.4);
    animation: towerBlink 0.5s ease-in-out infinite;
}

@keyframes towerBlink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.tower-cabin {
    width: 70px;
    height: 28px;
    background: linear-gradient(180deg, #4a5568 0%, #2d3748 100%);
    border-radius: 4px 4px 0 0;
    border: 1px solid #1a202c;
    border-bottom: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px;
}

.cabin-windows {
    display: flex;
    gap: 4px;
}

.cabin-window {
    width: 14px;
    height: 10px;
    background: linear-gradient(180deg, #1e3a5f 0%, #0f2744 100%);
    border-radius: 2px;
    border: 1px solid #0a1628;
    box-shadow: inset 0 0 4px rgba(100, 200, 255, 0.2);
}

.tower-body {
    width: 80px;
    background: linear-gradient(180deg, #374151 0%, #1f2937 100%);
    border: 1px solid #111827;
    border-radius: 0 0 4px 4px;
    padding: 8px 6px;
}

.tower-panel {
    background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
    border-radius: 4px;
    padding: 8px;
    border: 1px solid #333;
}

.tower-panel.panel-disabled {
    opacity: 0.5;
    pointer-events: none;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.panel-title {
    font-size: 14px;
    font-weight: 700;
    color: #f97316;
    letter-spacing: 1px;
}

.panel-lights {
    display: flex;
    gap: 4px;
}

.mini-light {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.3);
}

.mini-light.red {
    background: #dc2626;
    box-shadow: 0 0 6px rgba(220, 38, 38, 0.6);
}

.mini-light.red.off {
    background: #4a1a1a;
    box-shadow: none;
}

.mini-light.green {
    background: #1a3a1a;
}

.mini-light.green.on {
    background: #22c55e;
    box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
}

.lever-track {
    position: relative;
    width: 36px;
    height: 70px;
    background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
    border-radius: 18px;
    border: 1px solid #222;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
    margin: 0 auto;
}

.lever-slot-bg {
    position: absolute;
    left: 50%;
    top: 10px;
    bottom: 10px;
    width: 4px;
    transform: translateX(-50%);
    background: linear-gradient(180deg, #000 0%, #111 100%);
    border-radius: 2px;
}

.lever-handle {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    cursor: grab;
    transition: top 0.1s ease-out;
    z-index: 10;
    user-select: none;
    touch-action: none;
}

.lever-handle:active {
    cursor: grabbing;
}

.handle-ball {
    width: 28px;
    height: 28px;
    background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.handle-ball::before {
    content: '';
    width: 8px;
    height: 8px;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent);
    border-radius: 50%;
}

.lever-handle--pulled .handle-ball {
    background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.5), 0 3px 8px rgba(0, 0, 0, 0.3);
}

.handle-shaft {
    width: 6px;
    height: 14px;
    background: linear-gradient(90deg, #444 0%, #666 50%, #444 100%);
    margin: -2px auto 0;
    border-radius: 0 0 3px 3px;
}

.panel-status {
    text-align: center;
    margin-top: 6px;
}

.panel-status span {
    font-size: 8px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 1px;
}

.tower-base {
    width: 60px;
    height: 24px;
    background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    padding: 2px 0;
}

.base-stripe {
    height: 3px;
    background: repeating-linear-gradient(90deg, #f97316 0px, #f97316 8px, #1f2937 8px, #1f2937 16px);
}

.tower-foundation {
    width: 76px;
    height: 12px;
    background: linear-gradient(180deg, #374151 0%, #1f2937 100%);
    border-radius: 0 0 4px 4px;
    border: 1px solid #111827;
    border-top: none;
}

.tower-active .tower-cabin {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.tanker-container {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    transition: transform 0.3s ease-out;
}

.tanker-svg {
    width: 100%;
    height: auto;
    max-height: 340px;
    filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.4));
}

.ship-floating {
    animation: shipFloat 5s ease-in-out infinite;
    transform-origin: center bottom;
}

.ship-departing {
    animation: shipDepart 5s ease-out forwards !important;
}

@keyframes shipFloat {

    0%,
    100% {
        transform: translateY(0px) rotate(0deg);
    }

    50% {
        transform: translateY(-6px) rotate(-0.6deg);
    }
}

@keyframes shipDepart {
    0% {
        transform: translateX(0) translateY(0);
    }

    100% {
        transform: translateX(130%) translateY(-3px);
        opacity: 0;
    }
}

.smoke {
    animation: smoke-rise 3s ease-out infinite;
}

.smoke.s1 {
    animation-delay: 0s;
}

.smoke.s2 {
    animation-delay: 1s;
}

.smoke.s3 {
    animation-delay: 2s;
}

.smoke.smoke-active {
    animation: smoke-rise-active 1.5s ease-out infinite;
    opacity: 0.8 !important;
}

.smoke-departing {
    animation: smoke-depart 2.5s ease-out forwards;
}

@keyframes smoke-rise-active {
    0% {
        transform: translateY(0) translateX(0);
        opacity: 0.8;
    }

    50% {
        transform: translateY(-15px) translateX(5px);
        opacity: 0.6;
    }

    100% {
        transform: translateY(-30px) translateX(10px);
        opacity: 0;
    }
}

@keyframes smoke-depart {
    0% {
        transform: translateY(0) translateX(0);
        opacity: 0.6;
    }

    100% {
        transform: translateY(-60px) translateX(30px);
        opacity: 0;
    }
}

@keyframes smoke-rise {
    0% {
        opacity: 0.6;
        transform: translateY(0) scale(1);
    }

    100% {
        opacity: 0;
        transform: translateY(-25px) scale(1.8);
    }
}

.cargo-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.01);
    backdrop-filter: blur(6px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    font-size: 20px;
    font-weight: 700;
    text-align: center;
    text-shadow: 0 0 8px rgba(0, 0, 0, 0.7);
}

.cargo-zone {
    display: flex;
    flex-wrap: wrap-reverse;
    align-content: flex-start;
    justify-content: center;
    gap: 1px;
    width: 100%;
    height: 63%;
    padding: 8px;
}

.cargo-container {
    position: relative;
    width: 145px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 12px;
    font-weight: 700;
    border-radius: 4px;
    border: 2px solid rgba(0, 0, 0, 0.25);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.3);
    cursor: grab;
    user-select: none;
    transition: all 0.15s ease-out;
}

.cargo-container::before {
    content: "";
    position: absolute;
    top: 6px;
    left: 10px;
    right: 10px;
    height: 4px;
    background: repeating-linear-gradient(to right, rgba(255, 255, 255, 0.3) 0 6px, transparent 6px 10px);
    opacity: 0.7;
}

.cargo-container::after {
    content: "";
    position: absolute;
    bottom: 6px;
    left: 10px;
    right: 10px;
    height: 4px;
    background: repeating-linear-gradient(to right, rgba(0, 0, 0, 0.35) 0 6px, transparent 6px 10px);
    opacity: 0.6;
}

.cargo-container:hover {
    transform: translateY(-3px);
}

.cargo-container:active {
    cursor: grabbing;
    transform: scale(0.97);
}

.cargo-text {
    z-index: 10;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.cargo-ghost {
    opacity: 0.5;
    transform: rotate(2deg);
}

.cargo-drop-area {
    z-index: 50;
    position: absolute;
    top: 80px;
    left: 53%;
    transform: translateX(-50%);
    width: 750px;
    max-width: 90%;
    height: 150px;
    border: 2px dashed transparent;
    border-radius: 10px;
}

.drop-active {
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.25);
}

.ocean-layer {
    margin-top: -43px;
}

.wave-lottie {
    filter: brightness(0.6) saturate(0.9);
}

.wave-lottie>svg,
.wave-lottie>div {
    width: 100% !important;
    height: 100% !important;
}

.wave-lottie::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(rgba(10, 50, 90, 0.35), rgba(5, 25, 45, 0.45));
    pointer-events: none;
}

.floating-zone-wrapper {
    position: absolute;
    bottom: 15px;
    left: 0;
    width: 100%;
    z-index: 20;
    padding: 0 24px;
}

.floating-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.floating-title {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 1);
}

.floating-count {
    font-size: 13px;
    color: rgba(255, 255, 255, 1);
    padding: 3px 10px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 10px;
}

.floating-zone {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    min-height: 50px;
    align-content: flex-start;
}

.floating-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2520 50%, #1a1a1a 100%);
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    font-weight: 500;
    border-radius: 24px;
    border: 1px solid rgba(60, 50, 40, 0.6);
    cursor: grab;
    user-select: none;
    transition: all 0.3s ease;
    animation: oil-bubble 4s ease-in-out infinite;
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(80, 70, 50, 0.2), 0 2px 8px rgba(0, 0, 0, 0.3);
}

.floating-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
    animation: oil-sheen 3s ease-in-out infinite;
}

.floating-item:hover {
    background: linear-gradient(135deg, #252520 0%, #3d352a 50%, #252520 100%);
    transform: translateY(-3px) scale(1.02);
}

.floating-item:active {
    cursor: grabbing;
    animation: none;
    transform: scale(0.98);
}

.floating-ghost {
    opacity: 0.4;
}

@keyframes oil-bubble {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-4px);
    }
}

@keyframes oil-sheen {
    0% {
        left: -100%;
    }

    50%,
    100% {
        left: 200%;
    }
}

.buoy-light {
    width: 8px;
    height: 8px;
    background: #f97316;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(239, 108, 68, 0.6);
    animation: buoy-blink 2s ease-in-out infinite;
}

@keyframes buoy-blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.4;
    }
}

.stats-keywords-section {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    align-items: stretch;
}

.stats-container {
    display: flex;
    gap: 16px;
    flex: 0 0 50%;
}

.stat-card--compact {
    background: white;
    padding: 16px 20px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.stat-value--compact {
    font-size: 26px !important;
    font-weight: 700;
    color: #000;
}

.stat-card--compact .stat-label {
    font-size: 14px !important;
    color: #000 !important;
    font-weight: 600;
    margin-top: 4px;
}

.stat-value--compact.stat-value--green {
    color: #18af4f;
}

.stat-value--compact.stat-value--red {
    color: #dc2626;
}

.keywords-display {
    flex: 1;
    background: white;
    padding: 16px 20px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
}

.keywords-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.keywords-title {
    font-size: 16px;
    font-weight: 600;
    color: #000;
}

.keywords-count {
    font-size: 14px;
    background: #f3f4f6;
    color: #5a5f6b;
    padding: 4px 8px;
    border-radius: 4px;
}

.keyword-tags-display {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.tag--display {
    padding: 6px 12px;
    background: #fff7ed;
    color: #c2410c;
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px;
    border: 1px solid #fed7aa;
}

.table-section {
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    overflow-x: auto;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.data-table {
    width: 100%;
    min-width: 800px;
    border-collapse: collapse;
}

.data-table thead {
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
}

.data-table th {
    padding: 14px 28px;
    font-size: 14px;
    font-weight: 600;
    color: #000;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.data-table td {
    padding: 16px 20px;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
}

.cell-content-center {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.data-table tbody tr:hover {
    background: #fafafa;
}

.data-table tbody tr:last-child td {
    border-bottom: none;
}

.text-left {
    text-align: left;
}

.text-center {
    text-align: center;
}

.source-name {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
    color: #111827;
}

.url-code {
    font-size: 14px;
    color: #000;
    background: #f3f4f6da;
    padding: 4px 8px;
    border-radius: 4px;
}

.tag {
    padding: 4px 10px;
    background: #fff7ed;
    color: #c2410c;
    font-size: 13px;
    font-weight: 500;
    border-radius: 4px;
}

.tag--empty {
    background: #f3f4f6;
    color: #5a5f6b;
    font-style: italic;
    border: 1px solid #f3f4f6;
}

.status-badge {
    display: inline-block;
    padding: 4px 12px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 20px;
}

.status-badge--active {
    background: #dffae8;
    color: #11572b;
}

.status-badge--inactive {
    background: #fff7ed;
    color: #c2410c;
}

.toggle {
    position: relative;
    width: 44px;
    height: 24px;
    background: #e5e7eb;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.2s;
}

.toggle--on {
    background: #f97316;
}

.toggle-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
}

.toggle--on .toggle-knob {
    transform: translateX(20px);
}

.icon-btn {
    padding: 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
    color: #000;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.icon-btn--edit:hover {
    background: #eff6ff;
    color: #3b82f6;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: white;
    border-radius: 16px;
    width: 100%;
    max-width: 480px;
    margin: 16px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    overflow: hidden;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #f3f4f6;
}

.modal-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0;
}

.modal-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    background: #f9fafb;
}

.field-label {
    display: block;
    font-size: 15px;
    font-weight: 500;
    color: #000;
    margin-bottom: 18px;
}

.field-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;
    box-sizing: border-box;
}

.field-input:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.source-logo {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    object-fit: contain;
    background: #fff;
    border: 1px solid #e5e7eb;
    padding: 4px;
}

@media (max-width: 1024px) {
    .stats-keywords-section {
        flex-direction: column;
        gap: 16px;
    }

    .stats-container {
        flex: 1;
    }
}

@media (max-width: 768px) {
    .section-header {
        flex-direction: column;
        align-items: stretch;
        padding: 12px 16px;
    }

    .header-left,
    .header-right {
        width: 100%;
    }

    .header-actions {
        flex-wrap: wrap;
    }

    .data-table {
        min-width: 600px;
    }

    .cargo-drop-area {
        width: 100%;
        max-width: 95%;
        left: 50%;
        height: 120px;
        top: 60px;
    }

    .control-tower-area {
        right: 10px;
        top: 5px;
        transform: scale(0.85);
        transform-origin: top right;
    }
}

@media (max-width: 640px) {
    .stats-container {
        flex-direction: column;
    }
}
</style>