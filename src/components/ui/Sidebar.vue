<template>
    <aside @mouseenter="expand(true)" @mouseleave="expand(false)" :class="[
        'fixed left-0 top-0 h-screen bg-slate-700 shadow-2xl z-50 transition-all duration-300 ease-in-out flex flex-col',
        isExpanded ? 'w-52' : 'w-16'
    ]">

        <!-- Market Plan B (구분선 유지) -->
        <div class="p-3 flex items-center gap-2 border-b border-slate-200">
            <div class="w-10 h-10 flex items-center justify-center">
                <Droplets class="MarketPlanB-logo" :stroke-width="2" />
            </div>
            <div v-if="isExpanded">
                <p class="text-white text-sm font-semibold">Market Plan B</p>
            </div>
        </div>


        <!-- nav-->
        <nav class="p-2 flex-1 space-y-4 transition-all duration-300 mt-2 pt-2 overflow-y-auto">

            <button v-for="item in navItems" :key="item.to" @click="navigate(item.to)" :class="[
                'text-white w-full flex items-center gap-3 py-2 rounded-lg transition-all duration-200 group relative',
                isExpanded ? 'px-3 justify-start' : 'justify-center',
                isActive(item.to)
                    ? 'bg-gradient-to-r from-orange-600/15 to-orange-600/5 text-slate-900 shadow-md border border-orange-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            ]">
                <div class="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <component :is="item.icon" :class="[
                        'w-5 h-5 transition-transform duration-300',
                        isActive(item.to) ? 'scale-110 text-orange-600' : 'group-hover:scale-105'
                    ]" />
                </div>
                <span v-if="isExpanded" class="text-sm font-medium whitespace-nowrap transition-all duration-200">
                    {{ item.label }}
                </span>
            </button>
        </nav>

        <!-- 하단: SK 팀 정보 및 로그아웃 -->
        <div class="border-t border-slate-600">
            <!-- SK 팀 정보 -->
            <div :class="[
                'flex items-center gap-3 p-3 border-b border-slate-200',
                isExpanded ? 'justify-start' : 'justify-center'
            ]">
                <div
                    class="w-10 h-10 rounded-md bg-white flex items-center justify-center shadow-lg border border-orange-600 flex-shrink-0">
                    <span class="sk-logo">SK</span>
                </div>
                <div v-if="isExpanded" class="flex-1 min-w-0">
                    <p class="text-white text-sm font-semibold">SK E&S</p>
                    <p class="text-white text-xs text-slate-400 team-label">
                        <span class="team-text">{{ userName }}</span>
                    </p>
                </div>
            </div>

            <!-- 로그아웃 버튼 -->
            <div class="p-3">

                <button @click="handleLogout" :class="[
                    'w-full flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200',
                    'bg-orange-600/15 hover:bg-orange-600/5 text-orange-600',
                    isExpanded ? 'justify-start' : 'justify-center'
                ]" :title="isExpanded ? '' : '로그아웃'">
                    <LogOut class="w-4 h-4 flex-shrink-0" />
                    <span v-if="isExpanded" class="text-sm font-medium text-white">로그아웃</span>
                </button>
            </div>
        </div>

    </aside>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Droplets, LayoutDashboard, FileText, TrendingUp, LogOut, Globe } from "lucide-vue-next";
import { isAdmin } from "@/utils/auth";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const emit = defineEmits(["sidebar-hover"]);

const isExpanded = ref(false);

const expand = (state: boolean) => {
    isExpanded.value = state;
    emit("sidebar-hover", state);
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
    // 디버깅: 사용자 정보 확인
    if (import.meta.env.DEV) {
        console.log('User data:', authStore.user);
    }

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
.sk-logo {
    color: #E10600;
    font-weight: bold;
    font-size: 1rem;
}

.MarketPlanB-logo {
    color: #ea580c;
}

.team-label {
    display: inline-block;
    width: 100%;
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
</style>