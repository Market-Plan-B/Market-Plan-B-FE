<template>
    <div class="min-h-screen bg-[#f9fafc] font-['Pretendard'] flex">
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
import { ref } from "vue";
import Sidebar from "@/components/Sidebar.vue";

const isExpanded = ref(false);

function handleSidebarHover(state) {
    isExpanded.value = state;
}
</script>

<style>
body {
    margin: 0;
    background: #f9fafc;
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
