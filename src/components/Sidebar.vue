<template>
    <aside @mouseenter="expand(true)" @mouseleave="expand(false)" :class="[
        'fixed left-0 top-0 h-screen bg-white/95 border-r border-slate-200 shadow-xl z-40 backdrop-blur-xl transition-all duration-300 ease-in-out flex flex-col',
        isExpanded ? 'w-52' : 'w-16'
    ]">
        <!-- 사용자 카드 -->
        <div class="p-3 flex items-center gap-2 border-b border-slate-200 transition-all duration-300">
            <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                MPB
            </div>
            <div v-if="isExpanded" class="overflow-hidden transition-all duration-300">
                <p class="text-sm font-semibold text-slate-900 leading-tight">Market Plan B</p>
            </div>
        </div>
        <!-- 상단 로고 -->
        <div class="flex items-center gap-3 p-4 border-b border-slate-200 transition-all duration-300">
            <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                <span class="text-white text-base font-bold tracking-tight">SK</span>
            </div>
            <div v-if="isExpanded" class="overflow-hidden transition-all duration-300">
                <p class="text-sm font-semibold text-slate-900">SK E&S</p>
                <p class="text-xs text-slate-500">Market Intelligence 1팀</p>
            </div>
        </div>

        <!-- 네비게이션 -->
        <nav class="p-2 flex-1 space-y-2 transition-all duration-300">
            <button v-for="item in navItems" :key="item.to" @click="navigate(item.to)" :class="[
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative overflow-hidden',
                isActive(item.to)
                    ? 'bg-gradient-to-r from-orange-500/15 to-orange-500/5 text-slate-900 shadow-md border border-orange-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            ]">
                <component :is="item.icon" :class="[
                    'w-5 h-5 transition-transform duration-300',
                    isActive(item.to) ? 'scale-110 text-orange-600' : 'group-hover:scale-105'
                ]" />
                <span v-if="isExpanded" class="text-sm font-medium whitespace-nowrap transition-all duration-200">
                    {{ item.label }}
                </span>
                <div v-if="isActive(item.to)"
                    class="absolute right-2 w-2 h-2 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50"></div>
            </button>
        </nav>

        <!-- 하단 버튼 영역 -->
        <div class="border-t border-slate-200 p-4 space-y-2 mb-40">
            <!-- 알림 버튼 -->
            <div class="relative">
                <button class="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden text-slate-700 hover:text-slate-900 hover:bg-slate-50">
                    <svg class="w-6 h-6 transition-transform duration-300 group-hover:scale-105" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    <span v-if="isExpanded" class="text-sm font-medium whitespace-nowrap transition-all duration-200">알림</span>
                </button>
            </div>

            
            <!-- 로그아웃 버튼 -->
            <button @click="logout" class="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden text-slate-700 hover:text-slate-900 hover:bg-slate-50">
                <svg class="w-6 h-6 transition-transform duration-300 group-hover:scale-105" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span v-if="isExpanded" class="text-sm font-medium whitespace-nowrap transition-all duration-200">로그아웃</span>
            </button>
        </div>
        
        <div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none"></div>
    </aside>


</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { LayoutDashboard, FileText, TrendingUp } from "lucide-vue-next";

const router = useRouter();
const route = useRoute();

const emit = defineEmits(["sidebar-hover"]);

const isExpanded = ref(false);

const expand = (state: boolean) => {
    isExpanded.value = state;
    emit("sidebar-hover", state);
};

const navItems = [
    { to: "/dashboard", label: "대시보드", icon: LayoutDashboard },
    { to: "/reports", label: "리포트", icon: FileText },
    { to: "/analysis", label: "영향 분석", icon: TrendingUp },
];

const isActive = (path: string) => route.path === path;
const navigate = (path: string) => {
    if (!isActive(path)) router.push(path);
};

const logout = () => {
    // 로그아웃 처리
};
</script>

<style scoped>
</style>