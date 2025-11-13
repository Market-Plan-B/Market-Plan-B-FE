<template>
    <div class="bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 
           text-white px-6 py-4 rounded-2xl border border-slate-700 shadow-lg shadow-orange-500/10
           backdrop-blur-md hover:scale-[1.02] transition-all duration-500 ease-out">
        <p class="text-xs tracking-wide text-slate-400 mb-1">Daily 영향도</p>
        <p class="text-4xl font-extrabold text-orange-400 drop-shadow-sm">{{ score.toFixed(1) }}</p>
    </div>
</template>

<script setup lang="ts">
defineProps<{ score: number }>()
</script>
