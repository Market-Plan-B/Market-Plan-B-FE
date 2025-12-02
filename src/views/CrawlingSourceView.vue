<template>
    <div class="page-container bg-white rounded-md p-6 shadow-md border border-gray-200">
        <!-- Header -->
        <header class="page-header">
            <div>
                <h2 class="font-bold text-2xl mb-2 text-gray-900">크롤링 소스 관리</h2>
                <p v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</p>
            </div>
        </header>

        <!-- Drag & Drop Filter Section - SVG Tanker + Lottie Ocean -->
        <section class="filter-section maritime-theme rounded-md">
            <div class="section-header">
                <div class="header-left">
                    <div class="header-actions">
                        <button @click="activateAll" class="btn-maritime">
                            <span class="btn-icon">&#9650;</span> Load All
                        </button>
                        <button @click="deactivateAll" class="btn-maritime btn-maritime--outline">
                            <span class="btn-icon">&#9660;</span> Unload
                        </button>
                    </div>
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
                <!-- Sky Gradient -->
                <div class="sky-layer"></div>

                <!-- SVG Tanker Ship with Cargo Area -->
                <div class="tanker-container ship-floating">
                    <svg class="tanker-svg" viewBox="40 0 600 192" preserveAspectRatio="xMidYMid meet">

                        <!-- Ship Body (Large Hull) -->
                        <path d="M30 115 H670 L640 175 H60 L30 115Z" fill="#0A2433" />

                        <!-- Upper Hull Layers -->
                        <rect x="40" y="105" width="580" height="18" fill="#123A52" />
                        <rect x="50" y="93" width="560" height="16" fill="#15506B" />

                        <!-- OIL TANKER stencil text -->
                        <text x="250" y="155" fill="rgba(255,255,255,0.13)" font-size="32" font-weight="700"
                            style="letter-spacing: 4px;">
                            OIL TANKER
                        </text>

                        <!-- Tank Segmentation Lines (Oil Tanker characteristic) -->
                        <line x1="120" y1="125" x2="120" y2="170" stroke="#0f2e44" stroke-width="4" opacity="0.7" />
                        <line x1="210" y1="125" x2="210" y2="170" stroke="#0f2e44" stroke-width="4" opacity="0.7" />
                        <line x1="300" y1="125" x2="300" y2="170" stroke="#0f2e44" stroke-width="4" opacity="0.7" />
                        <line x1="390" y1="125" x2="390" y2="170" stroke="#0f2e44" stroke-width="4" opacity="0.7" />
                        <line x1="480" y1="125" x2="480" y2="170" stroke="#0f2e44" stroke-width="4" opacity="0.7" />

                        <!-- Bow -->
                        <path d="M640 115 L670 115 L650 78 L620 78Z" fill="#8E2F2F" />
                        <path d="M620 78 L650 78 L645 68 L625 68Z" fill="#B33B3B" />

                        <!-- Cabins -->
                        <rect x="55" y="53" width="75" height="40" rx="2" fill="#C6D0DB" />
                        <rect x="55" y="42" width="60" height="18" rx="2" fill="#E0E7EB" />
                        <rect x="85" y="25" width="25" height="18" rx="2" fill="#F0F4F7" />

                        <!-- Cabin Windows -->
                        <circle cx="72" cy="68" r="5" fill="#1d3b52" />
                        <circle cx="90" cy="68" r="5" fill="#1d3b52" />
                        <circle cx="108" cy="68" r="5" fill="#1d3b52" />
                        <circle cx="72" cy="86" r="5" fill="#1d3b52" />
                        <circle cx="90" cy="86" r="5" fill="#1d3b52" />
                        <circle cx="108" cy="86" r="5" fill="#1d3b52" />

                        <!-- Bridge Windows -->
                        <rect x="62" y="47" width="10" height="8" rx="1" fill="#162e42" />
                        <rect x="78" y="47" width="10" height="8" rx="1" fill="#162e42" />
                        <rect x="94" y="47" width="10" height="8" rx="1" fill="#162e42" />

                        <!-- Mast -->
                        <rect x="95" y="6" width="6" height="19" fill="#4A4A4A" />
                        <circle cx="98" cy="6" r="4.5" fill="#ff4545" class="mast-light" />

                        <!-- Cranes -->
                        <line x1="180" y1="90" x2="210" y2="40" stroke="#FFB000" stroke-width="5"
                            stroke-linecap="round" />
                        <line x1="210" y1="40" x2="210" y2="62" stroke="#FFB000" stroke-width="2"
                            stroke-dasharray="3,3" />

                        <line x1="320" y1="90" x2="350" y2="40" stroke="#FFB000" stroke-width="5"
                            stroke-linecap="round" />
                        <line x1="350" y1="40" x2="350" y2="62" stroke="#FFB000" stroke-width="2"
                            stroke-dasharray="3,3" />

                        <line x1="460" y1="90" x2="490" y2="40" stroke="#FFB000" stroke-width="5"
                            stroke-linecap="round" />
                        <line x1="490" y1="40" x2="490" y2="62" stroke="#FFB000" stroke-width="2"
                            stroke-dasharray="3,3" />

                        <!-- Smoke Stack -->
                        <rect x="590" y="39" width="16" height="55" rx="2" fill="#707782" />
                        <rect x="587" y="42" width="22" height="10" rx="2" fill="#8a9098" />
                        <ellipse cx="598" cy="42" rx="8" ry="3" fill="#60666c" />

                        <!-- Smoke (darker, thicker for oil tanker) -->
                        <circle class="smoke s1" cx="598" cy="35" r="6" fill="#454545" opacity="0.6" />
                        <circle class="smoke s2" cx="602" cy="25" r="5" fill="#3d3d3d" opacity="0.45" />
                        <circle class="smoke s3" cx="594" cy="16" r="7" fill="#2b2b2b" opacity="0.35" />

                        <!-- Lower Hull Details (rivets + vents) -->
                        <line x1="100" y1="142" x2="600" y2="142" stroke="#0a2a3d" stroke-width="2" opacity="0.4" />
                        <circle cx="75" cy="148" r="10" fill="none" stroke="#0a2a3d" stroke-width="2" opacity="0.4" />
                        <circle cx="625" cy="148" r="10" fill="none" stroke="#0a2a3d" stroke-width="2" opacity="0.4" />

                        <!-- Side ventilation boxes (energy ship feel) -->
                        <rect x="260" y="132" width="30" height="10" fill="rgba(0,0,0,0.15)" rx="2" />
                        <rect x="330" y="132" width="30" height="10" fill="rgba(0,0,0,0.15)" rx="2" />
                        <rect x="400" y="132" width="30" height="10" fill="rgba(0,0,0,0.15)" rx="2" />

                    </svg>


                    <!-- Cargo Drop Zone (positioned over ship) -->
                    <div class="cargo-drop-area" :class="{ 'drop-active': isDragging }">
                        <draggable v-model="activeKeywords" group="keywords" item-key="id" class="cargo-zone"
                            ghost-class="cargo-ghost" drag-class="cargo-drag" @start="isDragging = true"
                            @end="isDragging = false">
                            <template #item="{ element }">
                                <div class="cargo-container" :style="getContainerStyle(element.id)">
                                    <span class="cargo-text">{{ element.name }}</span>
                                </div>
                            </template>
                            <template #footer>
                                <div v-if="!activeKeywords.length" class="cargo-placeholder">
                                    <span>키워드를 드래그해 적재 영역에 올려주세요</span>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>

                <!-- Ocean with Lottie Waves -->
                <div class="ocean-layer">
                    <div ref="waveContainer" class="wave-lottie"></div>

                    <!-- Floating Filters Zone -->
                    <div class="floating-zone-wrapper">
                        <div class="floating-header">
                            <span class="floating-title">키워드 필터</span>
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

        <!-- Summary Cards -->
        <section class="stats-grid">
            <div class="stat-card">
                <span class="stat-value">{{ sources.length }}</span>
                <span class="stat-label">총 크롤링 소스</span>
            </div>
            <div class="stat-card">
                <span class="stat-value stat-value--green">{{ activeSources }}</span>
                <span class="stat-label">활성 소스</span>
            </div>
            <div class="stat-card">
                <span class="stat-value stat-value--red">{{ inactiveSources }}</span>
                <span class="stat-label">비활성 소스</span>
            </div>
        </section>

        <!-- Source Table -->
        <section class="table-section">
            <div v-if="loading" class="text-center py-8 text-gray-500">로딩 중...</div>
            <table v-else class="data-table">
                <thead>
                    <tr>
                        <th>사이트 이름</th>
                        <th>BASE URL</th>
                        <th>키워드</th>
                        <th class="text-center">상태</th>
                        <th class="text-center">활성화</th>
                        <th class="text-center">작업</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="source in sources" :key="source.id">
                        <td>
                            <div class="source-name">
                                <div class="source-avatar">{{ source.name.charAt(0).toUpperCase() }}</div>
                                <span>{{ source.name }}</span>
                            </div>
                        </td>
                        <td>
                            <code class="url-code">{{ source.baseUrl }}</code>
                        </td>
                        <td>
                            <div class="keyword-tags">
                                <span v-for="kw in activeKeywords" :key="kw.id" class="tag">
                                    {{ kw.name }}
                                </span>
                                <span v-if="activeKeywords.length === 0" class="tag tag--empty">
                                    키워드 없음
                                </span>
                            </div>
                        </td>
                        <td class="text-center">
                            <span class="status-badge"
                                :class="source.isActive ? 'status-badge--active' : 'status-badge--inactive'">
                                {{ source.isActive ? '활성' : '비활성' }}
                            </span>
                        </td>
                        <td class="text-center">
                            <button @click="toggleSource(source)" class="toggle"
                                :class="{ 'toggle--on': source.isActive }">
                                <span class="toggle-knob"></span>
                            </button>
                        </td>
                        <td class="text-center">
                            <div class="action-buttons">
                                <button @click="openModal(source)" class="icon-btn icon-btn--edit">
                                    <Pencil :size="16" />
                                </button>
                                <button @click="deleteSource(source.id)" class="icon-btn icon-btn--delete">
                                    <Trash2 :size="16" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>

        <!-- Modal -->
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
                        <div class="field">
                            <span class="field-label">키워드</span>
                            <div class="keyword-info">
                                <span class="info-text">키워드는 상단 드래그 앤 드롭 영역에서 관리됩니다.</span>
                            </div>
                        </div>
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
import { Pencil, Trash2, X } from 'lucide-vue-next';
import { adminAPI, type AdminKeywordItem, type CrawlingSourceItem } from '@/api/admin';

// 프론트엔드에서 사용하는 타입
interface Keyword { id: number; name: string }
interface Source { id: number; name: string; baseUrl: string; keywords: number[]; isActive: boolean }

const waveContainer = ref<HTMLElement | null>(null);
let waveAnimation: AnimationItem | null = null;

const isDragging = ref(false);

// 초기 데이터 로드
const loadData = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        // 키워드와 소스 데이터 동시 로드
        const [keywordsRes, sourcesRes] = await Promise.all([
            adminAPI.getKeywords(),
            adminAPI.getSources()
        ]);

        // 키워드 설정
        const keywordsData = keywordsRes.data;
        allKeywords.value = keywordsData.map(convertKeyword);

        // 소스 데이터 변환
        const sourcesData = sourcesRes.data.sources;
        sources.value = sourcesData.map(convertSource);

        // 활성 키워드 초기화 (첫 번째 소스의 categories 사용, 또는 빈 배열)
        const initialActiveIds = sourcesData.length > 0 ? sourcesData[0].categories : [];
        activeKeywords.value = allKeywords.value.filter((k: Keyword) => initialActiveIds.includes(k.id));
        inactiveKeywords.value = allKeywords.value.filter((k: Keyword) => !initialActiveIds.includes(k.id));

        // 통계는 API에서 받아온 값 사용 (total, active, inactive)
    } catch (error: any) {
        console.error('데이터 로드 실패:', error);
        errorMessage.value = error.response?.data?.detail || '데이터를 불러오는데 실패했습니다.';
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    // Lottie 애니메이션 초기화
    if (waveContainer.value) {
        waveAnimation = lottie.loadAnimation({
            container: waveContainer.value,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '/lottie/WaterFlow.json'
        });
    }

    // 데이터 로드
    await loadData();
});

onUnmounted(() => {
    waveAnimation?.destroy();
});

// Container color palette for cargo
const containerColors = [
    { bg: '#CC0000', border: '#990000' },   // COSCO Red
    { bg: '#003087', border: '#001F5C' },   // Maersk Blue
    { bg: '#00A651', border: '#007A3D' },   // Evergreen Green
    { bg: '#FF6600', border: '#CC5200' },   // Hapag-Lloyd Orange
    { bg: '#8B4513', border: '#654321' },   // MSC Brown
    { bg: '#FFD700', border: '#DAA520' },   // ONE Yellow
    { bg: '#00B5E2', border: '#008FB3' },   // CMA CGM Cyan
    { bg: '#8B8B8B', border: '#696969' },   // Standard Gray
];

const getContainerStyle = (id: number) => {
    const hash = id.toString().split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    const color = containerColors[Math.abs(hash) % containerColors.length];
    return {
        background: `linear-gradient(135deg, ${color.bg} 0%, ${color.border} 100%)`,
        borderColor: color.border
    };
};

// API 응답을 프론트엔드 형식으로 변환
const convertKeyword = (apiKeyword: AdminKeywordItem): Keyword => {
    return {
        id: apiKeyword.id,
        name: apiKeyword.category
    };
};

const convertSource = (apiSource: CrawlingSourceItem): Source => {
    return {
        id: apiSource.id,
        name: apiSource.source_name,
        baseUrl: apiSource.base_url,
        keywords: apiSource.categories,
        isActive: apiSource.is_active
    };
};

const allKeywords = ref<Keyword[]>([]);
const activeKeywords = ref<Keyword[]>([]);
const inactiveKeywords = ref<Keyword[]>([]);
const sources = ref<Source[]>([]);
const loading = ref(false);
const errorMessage = ref('');

const showModal = ref(false);
const editingId = ref<number | null>(null);
const form = ref({ name: '', baseUrl: '' });

const activeSources = computed(() => sources.value.filter((s: Source) => s.isActive).length);
const inactiveSources = computed(() => sources.value.filter((s: Source) => !s.isActive).length);

// activeKeywords가 변경될 때 모든 소스의 keywords를 자동 업데이트 및 API 호출
watch(activeKeywords, async (newKeywords: Keyword[]) => {
    const activeIds = newKeywords.map((k: Keyword) => k.id);

    // 로컬 상태 업데이트
    sources.value.forEach((source: Source) => {
        source.keywords = [...activeIds];
    });

    // API 호출
    try {
        await adminAPI.bulkUpdateKeywords({ category_ids: activeIds });
    } catch (error: any) {
        console.error('키워드 업데이트 실패:', error);
        errorMessage.value = error.response?.data?.detail || '키워드 업데이트에 실패했습니다.';
    }
}, { deep: true });


const activateAll = () => {
    activeKeywords.value = [...allKeywords.value];
    inactiveKeywords.value = [];
};

const deactivateAll = () => {
    inactiveKeywords.value = [...allKeywords.value];
    activeKeywords.value = [];
};

const openModal = (source: Source) => {
    editingId.value = source.id;
    form.value = { name: source.name, baseUrl: source.baseUrl };
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const saveSource = async () => {
    if (!form.value.name || !form.value.baseUrl) {
        errorMessage.value = '사이트 이름과 URL을 모두 입력해주세요.';
        return;
    }

    if (editingId.value) {
        try {
            loading.value = true;
            errorMessage.value = '';

            const updateData = {
                source_name: form.value.name,
                base_url: form.value.baseUrl
            };

            const response = await adminAPI.updateSource(editingId.value, updateData);
            const updatedSource = response.data;

            // 로컬 상태 업데이트
            const idx = sources.value.findIndex((s: Source) => s.id === editingId.value);
            if (idx !== -1) {
                sources.value[idx] = {
                    ...sources.value[idx],
                    name: updatedSource.source_name,
                    baseUrl: updatedSource.base_url
                };
            }

            closeModal();
        } catch (error: any) {
            console.error('소스 업데이트 실패:', error);
            errorMessage.value = error.response?.data?.detail || '소스 업데이트에 실패했습니다.';
        } finally {
            loading.value = false;
        }
    }
};

const toggleSource = async (source: Source) => {
    const newStatus = !source.isActive;

    try {
        loading.value = true;
        errorMessage.value = '';

        const response = await adminAPI.updateSourceStatus(source.id, {
            is_active: newStatus
        });

        // 로컬 상태 업데이트
        const idx = sources.value.findIndex((s: Source) => s.id === source.id);
        if (idx !== -1) {
            sources.value[idx].isActive = response.data.is_active;
        }
    } catch (error: any) {
        console.error('상태 업데이트 실패:', error);
        errorMessage.value = error.response?.data?.detail || '상태 업데이트에 실패했습니다.';
        // 에러 발생 시 원래 상태로 복구
        const idx = sources.value.findIndex((s: Source) => s.id === source.id);
        if (idx !== -1) {
            sources.value[idx].isActive = source.isActive;
        }
    } finally {
        loading.value = false;
    }
};

const deleteSource = (id: number) => {
    // 삭제 기능은 API에 없으므로 로컬에서만 제거 (또는 제거)
    if (confirm('삭제하시겠습니까?')) {
        sources.value = sources.value.filter((s: Source) => s.id !== id);
    }
};
</script>

<style scoped>
/* Base */
.page-container {
    min-height: 100vh;
    background: #f8fafc;
    padding: 32px;
}

/* Header */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}


/* Buttons */
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


/* Filter Section - Maritime Theme */
.filter-section {
    margin-bottom: 24px;
    overflow: hidden;
}

.filter-section.maritime-theme {
    background: #050d18;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Section Header */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 24px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
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

.btn-maritime:hover {
    background: #ea580c;
    transform: translateY(-1px);
}

.btn-maritime--outline {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
}

.btn-maritime--outline:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
}

.btn-icon {
    font-size: 10px;
}

/* Maritime Scene */
.maritime-scene {
    position: relative;
    min-height: 420px;
    overflow: hidden;
}

/* Sky Layer */
.sky-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    background: linear-gradient(180deg,
            #0a1628 0%,
            #0f2744 40%,
            #1a4a6e 70%,
            #2a6a8e 100%);
}

/* Tanker Container */
.tanker-container {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    /* SVG 중앙 정렬 */
}

.tanker-svg {
    width: 100%;
    height: auto;
    max-height: 340px;
    filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.4));
}

.ship-floating {
    animation: shipFloat 4s ease-in-out infinite;
    transform-origin: center bottom;
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



/* Smoke Animation */
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


/* ISO 컨테이너 스타일 */
.cargo-container {
    position: relative;
    width: 145px;
    /* 컨테이너 가로 */
    height: 50px;
    /* 컨테이너 세로 */
    display: flex;
    justify-content: center;
    /* 글씨 중앙 */
    align-items: center;
    /* 글씨 중앙 */
    text-align: center;

    color: white;
    font-size: 12px;
    font-weight: 700;

    border-radius: 4px;
    border: 2px solid rgba(0, 0, 0, 0.25);

    background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(0, 0, 0, 0.1) 100%);

    backdrop-filter: blur(2px);

    /* 입체감 */
    box-shadow:
        0 3px 6px rgba(0, 0, 0, 0.35),
        inset 0 2px 4px rgba(255, 255, 255, 0.2),
        inset 0 -2px 4px rgba(0, 0, 0, 0.3);

    cursor: grab;
    user-select: none;
    transition: all 0.15s ease-out;
}

/* 컨테이너 상단 리벳 라인 */
.cargo-container::before {
    content: "";
    position: absolute;
    top: 6px;
    left: 10px;
    right: 10px;
    height: 4px;

    background: repeating-linear-gradient(to right,
            rgba(255, 255, 255, 0.3) 0 6px,
            transparent 6px 10px);

    opacity: 0.7;
}

/* 컨테이너 하단 리벳 라인 */
.cargo-container::after {
    content: "";
    position: absolute;
    bottom: 6px;
    left: 10px;
    right: 10px;
    height: 4px;

    background: repeating-linear-gradient(to right,
            rgba(0, 0, 0, 0.35) 0 6px,
            transparent 6px 10px);

    opacity: 0.6;
}

.cargo-container:hover {
    transform: translateY(-3px);
    box-shadow:
        0 6px 12px rgba(0, 0, 0, 0.4),
        inset 0 2px 4px rgba(255, 255, 255, 0.25),
        inset 0 -3px 5px rgba(0, 0, 0, 0.4);
}

.cargo-container:active {
    cursor: grabbing;
    transform: scale(0.97);
}

.cargo-container:active {
    cursor: grabbing;
}

/* 글씨에 약간 시인성 보정 */
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
    height: 150px;
    background: transparent !important;
    backdrop-filter: none !important;
    border: 2px dashed transparent;
    border-radius: 10px;
}

/* 드래그 중일 때만 보임 */
.drop-active {
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.25);
}

.cargo-placeholder svg {
    opacity: 0.5;
}

/* Ocean Layer */
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
    background: linear-gradient(rgba(10, 50, 90, 0.35),
            rgba(5, 25, 45, 0.45));
    pointer-events: none;
}



/* Floating Zone */
.floating-zone-wrapper {
    position: absolute;
    bottom: 15px;
    /* waves 안으로 위치 조정 */
    left: 0;
    width: 100%;
    z-index: 20;
    /* 파도보다 앞 */
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
    box-shadow:
        inset 0 -2px 4px rgba(0, 0, 0, 0.4),
        inset 0 2px 4px rgba(80, 70, 50, 0.2),
        0 2px 8px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
}

.floating-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.08),
            transparent);
    animation: oil-sheen 3s ease-in-out infinite;
}

.floating-item::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    background: radial-gradient(circle, rgba(100, 80, 50, 0.6) 0%, transparent 70%);
    border-radius: 50%;
    top: 20%;
    left: 15%;
    animation: bubble-rise 2.5s ease-in-out infinite;
    opacity: 0;
}

.floating-item:hover {
    background: linear-gradient(135deg, #252520 0%, #3d352a 50%, #252520 100%);
    border-color: rgba(100, 80, 50, 0.5);
    transform: translateY(-3px) scale(1.02);
    box-shadow:
        inset 0 -2px 4px rgba(0, 0, 0, 0.4),
        inset 0 2px 4px rgba(100, 80, 50, 0.3),
        0 4px 16px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(60, 50, 30, 0.2);
}

.floating-item:active {
    cursor: grabbing;
    animation: none;
    transform: scale(0.98);
}

.floating-ghost {
    opacity: 0.4;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1510 50%, #0a0a0a 100%);
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

@keyframes bubble-rise {
    0% {
        opacity: 0;
        transform: translateY(0) scale(0.5);
    }

    20% {
        opacity: 0.6;
    }

    80% {
        opacity: 0.3;
    }

    100% {
        opacity: 0;
        transform: translateY(-15px) scale(1);
    }
}

.buoy-light {
    width: 8px;
    height: 8px;
    background: #ef4444;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
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


/* Stats */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-bottom: 24px;
}

.stat-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-value {
    display: block;
    font-size: 32px;
    font-weight: 700;
    color: #111827;
}

.stat-value--green {
    color: #16a34a;
}

.stat-value--red {
    color: #dc2626;
}

.stat-label {
    display: block;
    font-size: 14px;
    color: #6b7280;
    margin-top: 4px;
}

/* Table */
.table-section {
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table thead {
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
}

.data-table th {
    padding: 14px 20px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.data-table td {
    padding: 16px 20px;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
}

.data-table tbody tr:hover {
    background: #fafafa;
}

.data-table tbody tr:last-child td {
    border-bottom: none;
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

.source-avatar {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: #f97316;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
}

.url-code {
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 12px;
    color: #6b7280;
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 4px;
}

.keyword-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.tag {
    padding: 4px 10px;
    background: #fff7ed;
    color: #c2410c;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;
}

.tag--empty {
    background: #f3f4f6;
    color: #9ca3af;
    font-style: italic;
}

/* Status Badge */
.status-badge {
    display: inline-block;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 20px;
}

.status-badge--active {
    background: #dcfce7;
    color: #15803d;
}

.status-badge--inactive {
    background: #f3f4f6;
    color: #6b7280;
}

/* Toggle */
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

/* Action Buttons */
.action-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.icon-btn {
    padding: 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
    color: #9ca3af;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.icon-btn--edit:hover {
    background: #eff6ff;
    color: #3b82f6;
}

.icon-btn--delete:hover {
    background: #fef2f2;
    color: #ef4444;
}

/* Modal */
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

/* Form Fields */
.field {
    display: block;
}

.field-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
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

.field-input--mono {
    font-family: 'SF Mono', Monaco, monospace;
}

.field-input--disabled {
    background-color: #f3f4f6;
    color: #6b7280;
    cursor: not-allowed;
}

.keyword-info {
    padding: 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.info-text {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.5;
}
</style>