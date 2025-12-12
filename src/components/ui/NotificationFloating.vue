<template>
    <div class="notification-panel" :class="{ open: isOpen }">
        <!-- 열린 상태: 패널 -->
        <div v-if="isOpen" class="panel-container">
            <header class="panel-header">
                <div class="header-left">
                    <div class="header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </div>
                    <div class="header-text">
                        <h1>알림</h1>
                        <span v-if="unreadCount > 0" class="unread-label">{{ unreadCount }}개의 읽지 않은 알림</span>
                        <span v-else class="all-read-label">모든 알림을 확인했습니다</span>
                    </div>
                </div>
                <button class="close-btn" @click="closePanel" aria-label="닫기">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </header>

            <!-- 필터 탭 -->
            <div class="filter-tabs">
                <button 
                    :class="['tab-btn', { active: activeFilter === 'all' }]"
                    @click="activeFilter = 'all'"
                >
                    전체
                    <span class="tab-count">{{ notifications.length }}</span>
                </button>
                <button 
                    :class="['tab-btn', { active: activeFilter === 'unread' }]"
                    @click="activeFilter = 'unread'"
                >
                    읽지 않음
                    <span v-if="unreadCount > 0" class="tab-count unread">{{ unreadCount }}</span>
                </button>
                <button 
                    :class="['tab-btn', { active: activeFilter === 'read' }]"
                    @click="activeFilter = 'read'"
                >
                    읽음
                </button>
            </div>

            <main class="panel-body" ref="notificationBody">
                <!-- 로딩 상태 -->
                <div v-if="loading" class="state-container">
                    <div class="loading-animation">
                        <div class="pulse-ring"></div>
                        <div class="pulse-ring delay-1"></div>
                        <div class="pulse-ring delay-2"></div>
                        <svg class="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </div>
                    <p class="state-text">알림을 불러오는 중...</p>
                </div>

                <!-- 빈 상태 -->
                <div v-else-if="filteredNotifications.length === 0" class="state-container">
                    <div class="empty-illustration">
                        <svg viewBox="0 0 120 120" fill="none">
                            <circle cx="60" cy="60" r="50" fill="#FFF7ED" />
                            <path d="M60 35a15 15 0 0 1 15 15c0 17.5 7.5 22.5 7.5 22.5H37.5s7.5-5 7.5-22.5a15 15 0 0 1 15-15z" 
                                  stroke="#EA580C" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M55.18 77.5a5 5 0 0 0 9.64 0" stroke="#EA580C" stroke-width="3" stroke-linecap="round"/>
                            <circle cx="60" cy="30" r="3" fill="#EA580C"/>
                        </svg>
                    </div>
                    <p class="state-title">알림이 없습니다</p>
                    <p class="state-desc">새로운 알림이 도착하면 여기에 표시됩니다</p>
                </div>

                <!-- 알림 목록 -->
                <div v-else class="notifications-list">
                    <TransitionGroup name="notification-list">
                        <div 
                            v-for="(notification, index) in filteredNotifications" 
                            :key="notification.notification_id"
                            :class="['notification-card', { 
                                'is-read': notification.is_read,
                                'is-new': !notification.is_read && isRecentlyAdded(notification)
                            }]"
                            :style="{ '--delay': index * 0.05 + 's' }"
                        >
                            <!-- 카드 좌측 액센트 -->
                            <div class="card-accent" :class="{ 'accent-unread': !notification.is_read }"></div>
                            
                            <div class="card-content">
                                <div class="card-header">
                                    <div class="title-row">
                                        <span v-if="!notification.is_read" class="new-badge">NEW</span>
                                        <h3 class="notification-title">{{ notification.title }}</h3>
                                    </div>
                                    <button 
                                        v-if="!notification.is_read"
                                        @click="markAsRead(notification.notification_id)" 
                                        class="mark-read-btn"
                                        :disabled="isMarkingRead === notification.notification_id"
                                        :title="isMarkingRead === notification.notification_id ? '처리 중...' : '읽음으로 표시'"
                                    >
                                        <svg v-if="isMarkingRead !== notification.notification_id" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span v-else class="mini-spinner"></span>
                                    </button>
                                    <span v-else class="read-check">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </span>
                                </div>

                                <div class="card-meta">
                                    <span class="meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        {{ formatDate(notification.created_at) }}
                                    </span>
                                    <span v-if="notification.score !== null" class="meta-item score">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                        점수: {{ notification.score }}
                                    </span>
                                </div>

                                <a 
                                    :href="notification.url" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    class="card-link"
                                    @click.stop
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                    <span class="link-text">{{ truncateUrl(notification.url) }}</span>
                                </a>
                            </div>
                        </div>
                    </TransitionGroup>
                </div>
            </main>

            <!-- 푸터 -->
            <footer v-if="notifications.length > 0" class="panel-footer">
                <button 
                    v-if="unreadCount > 0" 
                    @click="markAllAsRead" 
                    class="mark-all-btn"
                    :disabled="isMarkingAll"
                >
                    <svg v-if="!isMarkingAll" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span v-else class="btn-spinner"></span>
                    {{ isMarkingAll ? "처리 중..." : `모두 읽음 처리 (${unreadCount}개)` }}
                </button>
                <div v-else class="all-read-message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    모든 알림을 확인했습니다
                </div>
            </footer>
        </div>

        <!-- 닫힌 상태: 플로팅 버튼 -->
        <button v-if="!isOpen && showTrigger" class="fab-trigger" @click="openPanel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span v-if="unreadCount > 0" class="fab-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </button>
    </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch, defineExpose } from 'vue';
import { notificationsAPI } from '@/api/notifications';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
    showTrigger: {
        type: Boolean,
        default: true,
    },
});

const authStore = useAuthStore();
const isOpen = ref(false);
const notifications = ref([]);
const loading = ref(false);
const isMarkingRead = ref(null);
const isMarkingAll = ref(false);
const notificationBody = ref(null);
const activeFilter = ref('all');
const recentlyAddedIds = ref(new Set());

const emit = defineEmits(['unread-change']);

const unreadCount = computed(() => {
    return notifications.value.filter((n) => !n.is_read).length;
});

const filteredNotifications = computed(() => {
    switch (activeFilter.value) {
        case 'unread':
            return notifications.value.filter(n => !n.is_read);
        case 'read':
            return notifications.value.filter(n => n.is_read);
        default:
            return notifications.value;
    }
});

watch(unreadCount, (val) => {
    emit('unread-change', val);
});

const isRecentlyAdded = (notification) => {
    return recentlyAddedIds.value.has(notification.notification_id);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const truncateUrl = (url) => {
    if (!url) return '';
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        if (path.length > 40) {
            return urlObj.hostname + path.substring(0, 37) + '...';
        }
        return urlObj.hostname + path;
    } catch {
        return url.length > 50 ? url.substring(0, 47) + '...' : url;
    }
};

const scrollToTop = () => {
    nextTick(() => {
        notificationBody.value?.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

const openPanel = () => {
    isOpen.value = true;
    if (notifications.value.length === 0) {
        loadNotifications();
    }
    scrollToTop();
};

const closePanel = () => {
    isOpen.value = false;
};

defineExpose({
    open: openPanel,
});

const loadNotifications = async () => {
    if (!authStore.user?.id) {
        return;
    }

    loading.value = true;
    try {
        const response = await notificationsAPI.getNotifications(authStore.user.id);
        const oldIds = new Set(notifications.value.map(n => n.notification_id));
        notifications.value = response.data;
        
        // 새로 추가된 알림 표시
        notifications.value.forEach(n => {
            if (!oldIds.has(n.notification_id) && !n.is_read) {
                recentlyAddedIds.value.add(n.notification_id);
            }
        });
        
        // 3초 후 새 알림 표시 제거
        setTimeout(() => {
            recentlyAddedIds.value.clear();
        }, 3000);
    } catch (error) {
        // 알림 로드 실패 무시
    } finally {
        loading.value = false;
    }
};

const markAsRead = async (notificationId) => {
    isMarkingRead.value = notificationId;
    try {
        await notificationsAPI.markAsRead(notificationId);
        const notification = notifications.value.find((n) => n.notification_id === notificationId);
        if (notification) {
            notification.is_read = true;
            notification.read_at = new Date().toISOString();
        }
    } catch (error) {
        // 읽음 처리 실패 무시
    } finally {
        isMarkingRead.value = null;
    }
};

const markAllAsRead = async () => {
    if (!authStore.user?.id) {
        return;
    }

    isMarkingAll.value = true;
    try {
        const response = await notificationsAPI.markAllAsRead(authStore.user.id);
        notifications.value.forEach((notification) => {
            if (!notification.is_read) {
                notification.is_read = true;
                notification.read_at = new Date().toISOString();
            }
        });
    } catch (error) {
        // 모두 읽음 처리 실패 무시
    } finally {
        isMarkingAll.value = false;
    }
};

onMounted(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 300000);
    onBeforeUnmount(() => {
        clearInterval(interval);
    });
});
</script>

<style scoped>
/* 패널 컨테이너 */
.notification-panel {
    position: fixed;
    left: 24px;
    bottom: 24px;
    z-index: 9999;
    width: 60px;
    height: 60px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-panel.open {
    width: 420px;
    height: min(720px, calc(100vh - 48px));
}

@media (max-width: 480px) {
    .notification-panel {
        left: 12px;
        bottom: 12px;
    }
    
    .notification-panel.open {
        width: calc(100vw - 24px);
        height: calc(100vh - 24px);
    }
}

/* 패널 내부 컨테이너 */
.panel-container {
    width: 100%;
    height: 100%;
    background: #ffffff;
    border-radius: 24px;
    box-shadow: 
        0 0 0 1px rgba(0, 0, 0, 0.03),
        0 8px 40px rgba(0, 0, 0, 0.12),
        0 12px 24px -8px rgba(234, 88, 12, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

/* 헤더 */
.panel-header {
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, #fff 0%, #fefefe 100%);
    border-bottom: 1px solid #f1f5f9;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 14px;
}

.header-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
    border-radius: 14px;
    color: #ea580c;
    flex-shrink: 0;
}

.header-icon svg {
    width: 22px;
    height: 22px;
}

.header-text h1 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
}

.header-text span {
    font-size: 13px;
    display: block;
    margin-top: 2px;
}

.unread-label {
    color: #ea580c;
    font-weight: 600;
}

.all-read-label {
    color: #64748b;
}

.close-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: #f1f5f9;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: #e2e8f0;
    color: #0f172a;
    transform: rotate(90deg);
}

.close-btn svg {
    width: 18px;
    height: 18px;
}

/* 필터 탭 */
.filter-tabs {
    display: flex;
    gap: 4px;
    padding: 12px 24px;
    background: #fafbfc;
    border-bottom: 1px solid #f1f5f9;
}

.tab-btn {
    flex: 1;
    padding: 10px 16px;
    background: transparent;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s ease;
}

.tab-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
}

.tab-btn.active {
    background: #ffffff;
    color: #0f172a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tab-count {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 6px;
    background: #f1f5f9;
    border-radius: 10px;
    color: #64748b;
}

.tab-count.unread {
    background: #ea580c;
    color: white;
}

/* 본문 영역 */
.panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: #f8fafc;
}

.panel-body::-webkit-scrollbar {
    width: 6px;
}

.panel-body::-webkit-scrollbar-track {
    background: transparent;
}

.panel-body::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 3px;
}

.panel-body::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}

/* 상태 컨테이너 (로딩, 빈 상태) */
.state-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    text-align: center;
}

/* 로딩 애니메이션 */
.loading-animation {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}

.pulse-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid #ea580c;
    border-radius: 50%;
    opacity: 0;
    animation: pulse 2s ease-out infinite;
}

.pulse-ring.delay-1 {
    animation-delay: 0.5s;
}

.pulse-ring.delay-2 {
    animation-delay: 1s;
}

@keyframes pulse {
    0% {
        transform: scale(0.5);
        opacity: 0.8;
    }
    100% {
        transform: scale(1.2);
        opacity: 0;
    }
}

.bell-icon {
    width: 32px;
    height: 32px;
    color: #ea580c;
    animation: bellSwing 1s ease-in-out infinite;
}

@keyframes bellSwing {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(8deg); }
    75% { transform: rotate(-8deg); }
}

/* 빈 상태 */
.empty-illustration {
    width: 120px;
    height: 120px;
    margin-bottom: 20px;
}

.empty-illustration svg {
    width: 100%;
    height: 100%;
}

.state-title {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 8px;
}

.state-desc {
    font-size: 14px;
    color: #64748b;
    margin: 0;
}

.state-text {
    font-size: 14px;
    color: #64748b;
}

/* 알림 목록 */
.notifications-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* 알림 카드 */
.notification-card {
    background: #ffffff;
    border-radius: 16px;
    display: flex;
    overflow: hidden;
    box-shadow: 
        0 1px 3px rgba(0, 0, 0, 0.04),
        0 1px 2px rgba(0, 0, 0, 0.06);
    transition: all 0.25s ease;
    animation: fadeInUp 0.4s ease forwards;
    animation-delay: var(--delay);
    opacity: 0;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.notification-card:hover {
    box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.08),
        0 2px 4px rgba(0, 0, 0, 0.04);
    transform: translateY(-2px);
}

.notification-card.is-read {
    opacity: 0.7;
}

.notification-card.is-read:hover {
    opacity: 1;
}

.notification-card.is-new {
    animation: highlightNew 0.6s ease;
}

@keyframes highlightNew {
    0%, 100% { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); }
    50% { box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.2); }
}

/* 카드 액센트 */
.card-accent {
    width: 4px;
    background: #e2e8f0;
    flex-shrink: 0;
    transition: background 0.2s ease;
}

.card-accent.accent-unread {
    background: linear-gradient(180deg, #ea580c 0%, #f97316 100%);
}

/* 카드 콘텐츠 */
.card-content {
    flex: 1;
    padding: 16px;
    min-width: 0;
}

.card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
}

.title-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    flex: 1;
    min-width: 0;
}

.new-badge {
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 700;
    color: #ffffff;
    background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
    padding: 3px 6px;
    border-radius: 4px;
    letter-spacing: 0.5px;
}

.notification-title {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* 읽음 표시 버튼 */
.mark-read-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: #f1f5f9;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    flex-shrink: 0;
    transition: all 0.2s ease;
}

.mark-read-btn:hover:not(:disabled) {
    background: #ea580c;
    color: white;
}

.mark-read-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.mark-read-btn svg {
    width: 16px;
    height: 16px;
}

.mini-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(100, 116, 139, 0.3);
    border-top-color: #64748b;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.read-check {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #22c55e;
    flex-shrink: 0;
}

.read-check svg {
    width: 16px;
    height: 16px;
}

/* 메타 정보 */
.card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 10px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #64748b;
}

.meta-item svg {
    width: 14px;
    height: 14px;
}

.meta-item.score {
    color: #ea580c;
    font-weight: 600;
}

/* 링크 */
.card-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 12px;
    background: #f8fafc;
    border-radius: 10px;
    color: #3b82f6;
    font-size: 12px;
    text-decoration: none;
    transition: all 0.2s ease;
    overflow: hidden;
}

.card-link:hover {
    background: #eff6ff;
    color: #2563eb;
}

.card-link svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
}

.link-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 푸터 */
.panel-footer {
    padding: 16px 20px;
    background: #ffffff;
    border-top: 1px solid #f1f5f9;
}

.mark-all-btn {
    width: 100%;
    padding: 14px 20px;
    background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.25s ease;
    box-shadow: 0 4px 14px rgba(234, 88, 12, 0.25);
}

.mark-all-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(234, 88, 12, 0.35);
}

.mark-all-btn:active:not(:disabled) {
    transform: translateY(0);
}

.mark-all-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.mark-all-btn svg {
    width: 18px;
    height: 18px;
}

.btn-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.all-read-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    color: #22c55e;
    font-size: 14px;
    font-weight: 500;
}

.all-read-message svg {
    width: 18px;
    height: 18px;
}

/* 플로팅 버튼 */
.fab-trigger {
    width: 60px;
    height: 60px;
    border: none;
    background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
    border-radius: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 
        0 8px 24px rgba(234, 88, 12, 0.35),
        0 4px 8px rgba(234, 88, 12, 0.2);
    position: relative;
}

.fab-trigger:hover {
    transform: scale(1.08) translateY(-2px);
    box-shadow: 
        0 12px 32px rgba(234, 88, 12, 0.4),
        0 6px 12px rgba(234, 88, 12, 0.25);
}

.fab-trigger:active {
    transform: scale(1.02);
}

.fab-trigger svg {
    width: 26px;
    height: 26px;
}

.fab-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    background: #ef4444;
    color: white;
    font-size: 11px;
    font-weight: 700;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
    animation: badgePop 0.3s ease;
}

@keyframes badgePop {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

/* 트랜지션 그룹 */
.notification-list-enter-active,
.notification-list-leave-active {
    transition: all 0.3s ease;
}

.notification-list-enter-from {
    opacity: 0;
    transform: translateX(-20px);
}

.notification-list-leave-to {
    opacity: 0;
    transform: translateX(20px);
}

.notification-list-move {
    transition: transform 0.3s ease;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
