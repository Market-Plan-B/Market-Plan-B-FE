<template>
    <Teleport to="body">
        <transition name="modal-fade">
            <div v-if="isOpen" class="modal-backdrop" @click.self="isOpen = false">
                <div class="notification-modal" :class="{ open: isOpen }" :style="modalStyle">
                    <header v-if="isOpen" class="header">
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
                                <span v-if="unreadCount > 0" class="unread-count">{{ unreadCount }}개의 읽지 않은 알림</span>
                                <span v-else>모든 알림을 확인했습니다</span>
                            </div>
                        </div>
                        <button class="close-btn" @click="isOpen = false">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </header>

                    <main v-if="isOpen" class="body" ref="notificationBody">
                        <div v-if="loading" class="loading-state">
                            <div class="loading-spinner"></div>
                            <p>알림을 불러오는 중...</p>
                        </div>

                        <div v-else-if="notifications.length === 0" class="empty-state">
                            <div class="empty-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                            </div>
                            <p>알림이 없습니다.</p>
                        </div>

                        <div v-else class="notifications-list">
                            <div v-for="notification in notifications" :key="notification.notification_id"
                                :class="['notification-item', { 'notification-read': notification.is_read }]">
                                <div class="notification-content">
                                    <div class="notification-header-row">
                                        <h3 class="notification-title">{{ notification.title }}</h3>
                                        <span v-if="!notification.is_read" class="unread-badge"></span>
                                    </div>
                                    <div class="notification-meta">
                                        <span class="notification-date">{{ formatDate(notification.created_at) }}</span>
                                        <span v-if="notification.score !== null" class="notification-score">
                                            점수: {{ notification.score }}
                                        </span>
                                    </div>
                                    <a :href="notification.url" target="_blank" rel="noopener noreferrer"
                                        class="notification-link" @click.stop>
                                        {{ notification.url }}
                                    </a>
                                </div>
                                <div class="notification-actions-item">
                                    <button v-if="!notification.is_read"
                                        @click="markAsRead(notification.notification_id)" class="read-btn"
                                        :disabled="isMarkingRead === notification.notification_id">
                                        {{ isMarkingRead === notification.notification_id ? "처리 중..." : "읽음" }}
                                    </button>
                                    <span v-else class="read-status">읽음</span>
                                </div>
                            </div>
                        </div>
                    </main>

                    <footer v-if="isOpen && notifications.length > 0" class="footer">
                        <button v-if="unreadCount > 0" @click="markAllAsRead" class="mark-all-btn"
                            :disabled="isMarkingAll">
                            {{ isMarkingAll ? "처리 중..." : `모두 읽음 처리 (${unreadCount}개)` }}
                        </button>
                    </footer>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch, defineExpose } from 'vue';
import { Teleport } from 'vue';
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

const modalStyle = computed(() => ({
    '--size': '420px',
    '--height': 'min(720px, calc(100vh - 48px))',
    '--radius': '24px'
}));

const emit = defineEmits(['unread-change']);

const unreadCount = computed(() => {
    return notifications.value.filter((n) => !n.is_read).length;
});

watch(unreadCount, (val) => {
    emit('unread-change', val);
});

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const scrollToTop = () => {
    nextTick(() => {
        notificationBody.value?.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

const openModal = () => {
    isOpen.value = true;
    if (notifications.value.length === 0) {
        loadNotifications();
    }
    scrollToTop();
};

defineExpose({
    open: openModal,
});

const loadNotifications = async () => {
    if (!authStore.user?.id) {
        console.error('User ID not found');
        return;
    }

    loading.value = true;
    try {
        const response = await notificationsAPI.getNotifications(authStore.user.id);
        notifications.value = response.data;
    } catch (error) {
        console.error('알림 로드 실패:', error);
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
        console.error('읽음 처리 실패:', error);
    } finally {
        isMarkingRead.value = null;
    }
};

const markAllAsRead = async () => {
    if (!authStore.user?.id) {
        console.error('User ID not found');
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
        console.log(`${response.data.count}개의 알림이 읽음 처리되었습니다.`);
    } catch (error) {
        console.error('모두 읽음 처리 실패:', error);
    } finally {
        isMarkingAll.value = false;
    }
};

onMounted(() => {
    loadNotifications();
    // 주기적으로 알림 새로고침 (5분마다)
    const interval = setInterval(loadNotifications, 300000);
    onBeforeUnmount(() => {
        clearInterval(interval);
    });
});
</script>

<style scoped>
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
}

.notification-modal {
    width: var(--size);
    height: var(--height);
    max-width: 420px;
    max-height: min(720px, calc(100vh - 48px));
    background: #fff;
    border-radius: var(--radius);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

@media (max-width: 480px) {
    .modal-backdrop {
        padding: 12px;
    }

    .notification-modal {
        width: calc(100vw - 24px);
        height: calc(100vh - 24px);
        max-width: none;
        max-height: none;
        border-radius: 20px;
    }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.25s ease;
}

.modal-fade-enter-active .notification-modal,
.modal-fade-leave-active .notification-modal {
    transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-from .notification-modal,
.modal-fade-leave-to .notification-modal {
    transform: scale(0.95) translateY(10px);
    opacity: 0;
}

.header {
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #f1f5f9;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.header-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ea580c;
    flex-shrink: 0;
}

.header-icon svg {
    width: 24px;
    height: 24px;
}

.header-text h1 {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: #1f2937;
}

.header-text span {
    font-size: 13px;
    color: #6b7280;
}

.unread-count {
    color: #ea580c;
    font-weight: 600;
}

.close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: #f3f4f6;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    transition: all 0.2s;
}

.close-btn:hover {
    background: #e5e7eb;
    color: #1f2937;
}

.close-btn svg {
    width: 18px;
    height: 18px;
}

.body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    background: #fafbfc;
}

.body::-webkit-scrollbar {
    width: 6px;
}

.body::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 3px;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    gap: 16px;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top-color: #ea580c;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-state p {
    font-size: 14px;
    color: #6b7280;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    gap: 16px;
}

.empty-icon {
    width: 64px;
    height: 64px;
    color: #d1d5db;
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-icon svg {
    width: 100%;
    height: 100%;
}

.empty-state p {
    font-size: 14px;
    color: #6b7280;
}

.notifications-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.notification-item {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    transition: all 0.2s;
}

.notification-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.notification-item.notification-read {
    background: #f9fafb;
    opacity: 0.8;
}

.notification-content {
    flex: 1;
    min-width: 0;
}

.notification-header-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
}

.notification-title {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin: 0;
    line-height: 1.5;
    flex: 1;
}

.unread-badge {
    width: 8px;
    height: 8px;
    background: #ea580c;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 4px;
}

.notification-meta {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
    font-size: 12px;
    color: #6b7280;
}

.notification-date {
    color: #6b7280;
}

.notification-score {
    color: #ea580c;
    font-weight: 600;
}

.notification-link {
    display: block;
    color: #2563eb;
    font-size: 12px;
    text-decoration: none;
    word-break: break-all;
    margin-top: 4px;
    transition: color 0.2s;
}

.notification-link:hover {
    color: #1d4ed8;
    text-decoration: underline;
}

.notification-actions-item {
    display: flex;
    align-items: flex-start;
    flex-shrink: 0;
}

.read-btn {
    padding: 6px 12px;
    background: #ea580c;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.read-btn:hover:not(:disabled) {
    background: #c2410c;
}

.read-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.read-status {
    padding: 6px 12px;
    color: #6b7280;
    font-size: 12px;
    font-weight: 500;
}

.footer {
    padding: 16px 20px;
    background: #fff;
    border-top: 1px solid #f1f5f9;
}

.mark-all-btn {
    width: 100%;
    padding: 12px;
    background: #ea580c;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.mark-all-btn:hover:not(:disabled) {
    background: #c2410c;
    transform: translateY(-1px);
}

.mark-all-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
