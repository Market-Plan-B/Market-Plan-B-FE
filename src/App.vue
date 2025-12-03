<template>
    <!-- 로그인 페이지는 사이드바 없이 전체 화면 -->
    <div v-if="isLoginPage" class="min-h-screen">
        <router-view />
    </div>

    <!-- 일반 페이지는 사이드바 포함 -->
    <div v-else class="min-h-screen bg-[#e5e7eb] font-['Pretendard'] flex">
        <Sidebar @sidebar-hover="handleSidebarHover" />

        <div class="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
            :style="{ marginLeft: isExpanded ? '13rem' : '4rem' }">
            <main class="flex-1 overflow-y-auto p-8">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "@/components/ui/Sidebar.vue";

const route = useRoute();
const isExpanded = ref(false);

const isLoginPage = computed(() => route.path === '/login');

// 디버깅용 (개발 중에만)
if (import.meta.env.DEV) {
    watch(() => route.path, (newPath) => {
        console.log('Current path:', newPath, 'isLoginPage:', isLoginPage.value);
    }, { immediate: true });
}

function handleSidebarHover(state) {
    isExpanded.value = state;
}
</script>

<style>
body {
    margin: 0;
    background: #e6e7e9;
    display: block;
    min-height: 100vh;
    font-family: "SUIT", sans-serif;
}

html {
    height: 100%;
}

#app {
    max-width: none;
    margin: 0;
    padding: 0;
    height: 100%;
}
</style>
