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
                    <p class="text-white text-xs text-slate-400">Market Intelligence 1팀</p>
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

const router = useRouter();
const route = useRoute();

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
        // 관리자는 일반 메뉴 + 관리자 메뉴
        return [
            commonNavItems[0], // 대시보드
            adminNavItems[0],  // 크롤링 소스 관리
            ...commonNavItems.slice(1) // 리포트, 영향 분석
        ];
    }
    // 일반 사용자는 일반 메뉴만
    return commonNavItems;
});

const isActive = (path: string) => route.path === path;
const navigate = (path: string) => {
    if (!isActive(path)) router.push(path);
};

// 로그아웃
const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
        // 실제 로그아웃 로직 구현
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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
</style>