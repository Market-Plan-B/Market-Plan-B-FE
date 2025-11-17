<template>
    <div class="min-h-[600px] flex items-center justify-center">

        <!-- 카드 없을 때 -->
        <div v-if="cards.length === 0" class="text-center py-20">
            <div
                class="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700/50">
                <svg class="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            </div>
            <p class="text-slate-400 text-lg font-semibold">해당 날짜에 뉴스가 없습니다</p>
            <p class="text-slate-600 text-sm mt-2">다른 날짜를 선택해보세요</p>
        </div>

        <!-- 부채꼴 카드 배치 -->
        <div v-if="cards.length > 0" class="relative w-full h-[600px] perspective-1000">
            <div v-for="(card, index) in displayCards" :key="card.id || index" ref="cardRefs" @click="selectCard(index)"
                @mouseenter="onCardHover(index)" @mouseleave="onCardLeave(index)" class="absolute card-item"
                :style="getCardStyle(index)">
                <!-- 카드 내부 -->
                <div
                    class="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl cursor-pointer group">

                    <!-- 이미지 오버레이 -->
                    <div class="absolute inset-0 overflow-hidden pointer-events-none">
                        <div
                            class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent z-10 pointer-events-none">
                        </div>
                        <img :src="getCardImage(index)"
                            class="w-full h-full object-cover opacity-55 group-hover:opacity-75 group-hover:scale-110 transition-all duration-700 pointer-events-none"
                            alt="Card background" />
                    </div>

                    <!-- 컨텐츠 -->
                    <div class="relative z-20 h-full flex flex-col justify-between p-8">
                        <!-- 하단: 제목 & 설명 -->
                        <div class="space-y-4">
                            <div>
                                <p class="text-slate-300 text-xs font-semibold mb-2 flex items-center gap-2">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    {{ card.date }}
                                </p>
                                <h3
                                    class="text-white text-xl font-extrabold leading-tight mb-3 line-clamp-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                                    {{ card.title }}
                                </h3>
                                <p class="text-white text-m leading-relaxed line-clamp-2">
                                    {{ card.desc }}
                                </p>
                            </div>
                            <!-- 원본 Link 버튼 -->
                            <div
                                class="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <a :href="card.url" target="_blank" @click.stop
                                    class="block w-full py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all duration-300 text-center relative z-30">
                                    원본 Link →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
    cards: {
        type: Array,
        default: () => []
    }
});

const selectedCardIndex = ref(null);
const cardRefs = ref([]);

const displayCards = computed(() => props.cards.slice(0, 5));

function getCardStyle(index) {
    const totalCards = displayCards.value.length;
    const isSelected = selectedCardIndex.value === index;

    if (isSelected) {
        return {
            transform: 'translateX(-50%) translateY(-50%) translateZ(0) scale(1.15)',
            left: '50%',
            top: '50%',
            zIndex: 100,
            width: '340px',
            height: '480px',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
        };
    }

    const center = (totalCards - 1) / 2;
    const offset = index - center;
    const spacing = 280;
    const verticalOffset = Math.abs(offset) * 40;
    const rotation = offset * 8;

    return {
        transform: `translateX(calc(-50% + ${offset * spacing}px)) translateY(calc(-50% + ${verticalOffset}px)) translateZ(0) rotateZ(${rotation}deg) rotateY(${offset * 5}deg)`,
        left: '50%',
        top: '50%',
        zIndex: 50 - Math.abs(offset),
        width: '300px',
        height: '440px',
        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        filter: selectedCardIndex.value !== null && !isSelected ? 'blur(4px) brightness(0.5)' : 'none'
    };
}

function selectCard(index) {
    selectedCardIndex.value = selectedCardIndex.value === index ? null : index;
}

function onCardHover(index) {
}

function onCardLeave(index) {
}

function getCardImage(index) {
    const images = [
        'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800',
        'https://images.unsplash.com/photo-1541873676-a18131494184?w=800',
        'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
        'https://images.unsplash.com/photo-1564939558297-fc396f18e5c7?w=800'
    ];
    return images[index % images.length];
}

watch(() => props.cards, () => {
    selectedCardIndex.value = null;
});
</script>

<style scoped>
/* Perspective */
.perspective-1000 {
    perspective: 1000px;
}

/* 그리드 카드 */
.card-item {
    will-change: transform;
    backface-visibility: hidden;
    transform-style: preserve-3d;
}

/* 텍스트 줄임 */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* 호버 3D 효과 */
.card-item:hover {
    transform-style: preserve-3d;
}

/* 글로우 효과 */
@keyframes glow {

    0%,
    100% {
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    }

    50% {
        box-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
    }
}

.card-item:hover .group {
    animation: glow 2s ease-in-out infinite;
}

/* 모달 애니메이션 */
.modal-card-enter-active,
.modal-card-leave-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-card-enter-from {
    opacity: 0;
    transform: scale(0.8) translateY(30px);
}

.modal-card-leave-to {
    opacity: 0;
    transform: scale(0.8) translateY(-30px);
}

/* 페이드인 애니메이션 */
@keyframes fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.animate-fade-in {
    animation: fade-in 0.3s ease-out;
}

/* 스크롤바 커스텀 */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.3);
}

::-webkit-scrollbar-thumb {
    background: rgba(71, 85, 105, 0.5);
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(71, 85, 105, 0.7);
}
</style>