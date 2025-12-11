<template>
    <aside @mouseenter="expand(true)" @mouseleave="expand(false)"
        :class="['sidebar', isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed']">

        <!-- Market Plan B (구분선 유지) -->
        <div class="sidebar-header">
            <div class="logo-container">
                <Droplets class="MarketPlanB-logo" :stroke-width="2" />
            </div>
            <div v-if="isExpanded" class="sidebar-title">
                <p>Market Plan B</p>
            </div>
        </div>


        <!-- nav-->
        <nav class="sidebar-nav">

            <button v-for="item in navItems" :key="item.to" @click="navigate(item.to)" :class="[
                'nav-button',
                isExpanded ? 'nav-button-expanded' : 'nav-button-collapsed',
                isActive(item.to) ? 'nav-button-active' : 'nav-button-inactive'
            ]">
                <div class="nav-icon-wrapper">
                    <component :is="item.icon" :class="[
                        'nav-icon',
                        isActive(item.to) ? 'nav-icon-active' : 'nav-icon-inactive'
                    ]" />
                </div>
                <span v-if="isExpanded" class="nav-label">
                    {{ item.label }}
                </span>
            </button>
        </nav>

        <!-- 하단: SK 팀 정보 및 로그아웃 -->
        <div class="sidebar-footer">
            <!-- SK 팀 정보 -->
            <div :class="['team-info', isExpanded ? 'team-info-expanded' : 'team-info-collapsed']">
                <div class="sk-logo-container">
                    <span class="sk-logo">SK</span>
                </div>
                <div v-if="isExpanded" class="team-details">
                    <p class="team-name">SK E&S</p>
                    <p class="team-label">
                        <span class="team-text">{{ userName }}</span>
                    </p>
                </div>
            </div>

            <!-- 알림 버튼 -->
            <div class="notification-entry">
                <button @click="openNotifications" :class="[
                    'nav-button',
                    isExpanded ? 'nav-button-expanded' : 'nav-button-collapsed',
                    'nav-button-inactive'
                ]">
                    <div class="nav-icon-wrapper">
                        <Bell :class="['nav-icon', 'nav-icon-notification']" />
                        <span v-if="unreadCount > 0" class="notification-badge">
                            {{ unreadCount > 99 ? '99+' : unreadCount }}
                        </span>
                    </div>
                    <span v-if="isExpanded" class="nav-label">
                        알림 설정
                    </span>
                </button>
            </div>

            <!-- 로그아웃 버튼 -->
            <div class="logout-container">
                <button @click="handleLogout" :class="[
                    'logout-button',
                    isExpanded ? 'logout-button-expanded' : 'logout-button-collapsed'
                ]" :title="isExpanded ? '' : '로그아웃'">
                    <LogOut class="logout-icon" />
                    <span v-if="isExpanded" class="logout-text">로그아웃</span>
                </button>
            </div>
        </div>

        <!-- 알림 모달 -->
        <NotificationModal ref="notificationModalRef" :showTrigger="false" @unread-change="handleUnreadChange" />

    </aside>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Droplets, LayoutDashboard, FileText, TrendingUp, LogOut, Globe, Bell } from "lucide-vue-next";
import NotificationModal from "@/components/ui/NotificationModal.vue";
import { isAdmin } from "@/utils/auth";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const emit = defineEmits(["sidebar-hover"]);

const isExpanded = ref(false);
const notificationModalRef = ref();
const unreadCount = ref(0);

const expand = (state: boolean) => {
    isExpanded.value = state;
    emit("sidebar-hover", state);
};

const openNotifications = () => {
    notificationModalRef.value?.open();
};

const handleUnreadChange = (count: number) => {
    unreadCount.value = count;
};

// 일반 메뉴 항목
const commonNavItems = [
    { to: "/dashboard", label: "대시보드", icon: LayoutDashboard },
    { to: "/reports", label: "리포트", icon: FileText },
    { to: "/analysis", label: "영향 분석", icon: TrendingUp },
];

// 관리자 전용 메뉴 항목
const adminNavItems = [
    { to: "/crawling-sources", label: "크롤링 소스 관리", icon: Globe },
];

// 권한에 따라 메뉴 항목 구성 (반응형)
const navItems = computed(() => {
    if (isAdmin()) {
        // 관리자는 크롤링 소스 관리 페이지만 표시
        return adminNavItems;
    }
    // 일반 사용자는 일반 메뉴만
    return commonNavItems;
});

// 사용자 이름 표시 (DB에서 가져온 username 사용)
const userName = computed(() => {
    // username이 있으면 사용
    if (authStore.user?.username) {
        return authStore.user.username;
    }

    // 사용자 이름이 없을 경우 기본값 (이 경우는 로그인 시 username이 제대로 저장되지 않은 경우)
    return isAdmin() ? '관리자' : 'Market Intelligence 1팀';
});

const isActive = (path: string) => route.path === path;
const navigate = (path: string) => {
    if (!isActive(path)) router.push(path);
};

// 로그아웃
const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
        await authStore.logout();
        router.push("/login");
    }
};
</script>

<style scoped>
/* Sidebar Container */
.sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    background: #334155;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    z-index: 50;
    transition: width 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.sidebar-expanded {
    width: 13rem;
}

.sidebar-collapsed {
    width: 4rem;
}

/* Sidebar Header */
.sidebar-header {
    padding: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
}

.sidebar-collapsed .sidebar-header {
    justify-content: center;
}

.logo-container {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sidebar-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.sidebar-title p {
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    white-space: nowrap;
}

.MarketPlanB-logo {
    color: #ea580c;
}

/* Sidebar Navigation */
.sidebar-nav {
    padding: 0.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: all 0.3s;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    overflow-y: auto;
}

/* Nav Button */
.nav-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    border-radius: 6px;
    transition: all 0.2s;
    position: relative;
    border: none;
    background: transparent;
    cursor: pointer;
}

.nav-button-expanded {
    padding-left: 0.75rem;
    justify-content: flex-start;
    color: white;
}

.nav-button-collapsed {
    justify-content: center;
    color: white;
}

.nav-button-active {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    position: relative;
}

.nav-button-active::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #ea580c;
    border-radius: 0;
}

.nav-button-inactive {
    color: white;
}

.nav-button-inactive:hover {
    color: #0f172a;
    background: white;
}

.nav-icon-wrapper {
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.nav-icon {
    width: 1.25rem;
    height: 1.25rem;
    transition: transform 0.3s;
}

.nav-icon-active {
    color: #ffffff;
}

.nav-icon-inactive {
    color: white;
}

.nav-button-inactive:hover .nav-icon {
    transform: scale(1.05);
    color: #0f172a;
}

.nav-label {
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    transition: all 0.2s;
    overflow: hidden;
}

.team-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
}

.team-info-expanded {
    justify-content: flex-start;
}

.team-info-collapsed {
    justify-content: center;
}

.sk-logo-container {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.375rem;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    flex-shrink: 0;
}

.sk-logo {
    color: #E10600;
    font-weight: bold;
    font-size: 1rem;
}

.team-details {
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.team-name {
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
}

.team-label {
    display: inline-block;
    width: 100%;
    color: white;
    font-size: 0.75rem;
    color: #94a3b8;
}

.team-label::before {
    content: 'Market Intelligence 1팀';
    visibility: hidden;
    display: block;
    height: 0;
    overflow: hidden;
    font-size: 0.75rem;
    line-height: 1.5;
    font-weight: 400;
}

.team-text {
    display: block;
    white-space: nowrap;
}

/* Logout Container */
.logout-container {
    padding: 0.75rem;
}

.logout-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    transition: all 0.2s;
    background: rgba(234, 88, 12, 0.15);
    color: #ea580c;
    border: none;
    cursor: pointer;
}

.logout-button:hover {
    background: rgba(234, 88, 12, 0.05);
}

.logout-button-expanded {
    justify-content: flex-start;
}

.logout-button-collapsed {
    justify-content: center;
}

.logout-icon {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
}

.logout-text {
    font-size: 0.875rem;
    font-weight: 500;
    color: white;
    white-space: nowrap;
    overflow: hidden;
}

/* Notification */
.notification-entry {
    padding: 0.75rem;

}

.notification-entry .nav-button {
    position: relative;
}

.nav-icon-notification {
    color: #ea580c;
}

.nav-button-inactive:hover .nav-icon-notification {
    color: #ea580c;
}

.notification-entry .nav-button-inactive:hover .nav-label {
    color: #0f172a;
}

.notification-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #dc2626;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 999px;
    min-width: 18px;
    text-align: center;
    line-height: 1.2;
    z-index: 10;
}
</style>